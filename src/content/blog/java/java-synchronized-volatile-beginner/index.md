---
visible: false
title: "Java 동시성 입문: volatile과 synchronized를 은행 계좌 예제로 이해하기"
date: 2026-05-22 00:00:00
tags:
  - Java
  - Concurrency
---

# Java 동시성 입문: volatile과 synchronized를 은행 계좌 예제로 이해하기

<hr>

Java에서 멀티스레드 코드를 처음 다루면 `volatile`과 `synchronized`가 비슷해 보일 수 있다.

- `volatile`을 붙이면 다른 스레드가 바꾼 값이 보인다.
- `synchronized`를 붙이면 한 번에 하나의 스레드만 들어온다.

둘 다 공유 데이터를 다룰 때 쓰이니, 처음에는 이런 생각이 든다.

> 최신 값을 보게 해 주는 `volatile`만으로도 충분한 것 아닐까?

결론부터 말하면, 은행 계좌 출금 같은 로직은 `volatile`만으로 해결되지 않는다.
은행 계좌 문제는 단순히 "값이 보이느냐"가 아니라 "잔액 확인과 차감이 한 덩어리로 보호되느냐"의 문제이기 때문이다.

이 글에서는 은행 계좌 예제 하나로 `volatile`과 `synchronized`의 차이를 천천히 정리해 본다.
핵심 질문은 하나다.

> `volatile`은 왜 가시성 문제는 해결하지만, 계좌 출금 문제는 해결하지 못할까?

## 예제: 1000원 계좌에서 두 스레드가 800원씩 출금한다

은행 계좌에 1000원이 있다고 해 보자.
두 스레드가 거의 동시에 800원씩 출금하려고 한다.

정상적인 결과는 하나뿐이다.

- 첫 번째 스레드는 800원 출금에 성공한다.
- 두 번째 스레드는 잔액이 200원뿐이므로 실패한다.
- 최종 잔액은 200원이다.

계좌 인터페이스는 단순하게 만든다.

```java
public interface BankAccount {
    boolean withdraw(int amount);

    int getBalance();
}
```

테스트 코드는 같은 계좌 인스턴스를 두 스레드가 함께 사용하게 만든다.

```java
public class BankMain {
    public static void main(String[] args) throws InterruptedException {
        BankAccount account = new BankAccountV1(1000);

        Thread t1 = new Thread(() -> account.withdraw(800), "t1");
        Thread t2 = new Thread(() -> account.withdraw(800), "t2");

        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("final balance = " + account.getBalance());
    }
}
```

이제 첫 번째 계좌 구현을 보자.

## 동기화가 없는 계좌

```java
public class BankAccountV1 implements BankAccount {
    private int balance;

    public BankAccountV1(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        System.out.printf("[%s] validate: amount=%d, balance=%d%n",
                Thread.currentThread().getName(), amount, balance);

        if (balance < amount) {
            System.out.printf("[%s] withdraw failed: balance=%d%n",
                    Thread.currentThread().getName(), balance);
            return false;
        }

        sleep(1000);

        balance = balance - amount;
        System.out.printf("[%s] withdraw success: balance=%d%n",
                Thread.currentThread().getName(), balance);
        return true;
    }

    @Override
    public int getBalance() {
        return balance;
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
```

`sleep(1000)`은 문제를 눈에 잘 보이게 하려고 넣은 코드다.
실제 서비스에서는 DB 조회, 외부 API 호출, 파일 I/O, 컨텍스트 스위칭 같은 일이 비슷한 틈을 만든다.

실행하면 이런 결과가 나올 수 있다.

```text
[t1] validate: amount=800, balance=1000
[t2] validate: amount=800, balance=1000
[t1] withdraw success: balance=200
[t2] withdraw success: balance=-600
final balance = -600
```

두 스레드가 모두 잔액 1000원을 보고 검증을 통과했다.
그 뒤 각각 800원씩 차감했으니 최종 잔액이 -600원이 되었다.

계좌가 지켜야 할 규칙은 간단하다.

> 잔액이 출금액보다 작으면 출금하면 안 된다.

그런데 이 규칙은 `if (balance < amount)` 한 줄만으로 지켜지지 않는다.
검증할 때 본 잔액이 차감할 때도 그대로라는 보장이 필요하다.

## 문제를 두 가지로 나누기

공유 변수를 다룰 때 자주 헷갈리는 문제가 두 가지 있다.

첫 번째는 가시성 문제다.
한 스레드가 바꾼 값을 다른 스레드가 볼 수 있느냐의 문제다.

두 번째는 원자성 문제다.
여러 단계로 이루어진 작업이 중간에 끼어들기 없이 하나의 작업처럼 실행되느냐의 문제다.

은행 계좌 출금은 다음 두 단계로 이루어진다.

```java
if (balance < amount) {
    return false;
}

balance = balance - amount;
```

첫 번째 단계는 잔액 확인이다.
두 번째 단계는 잔액 차감이다.

코드로는 바로 붙어 있지만, 멀티스레드 관점에서는 하나의 작업이 아니다.
`t1`이 잔액을 확인한 뒤 차감하기 전에 `t2`가 끼어들 수 있다.

이제 `volatile`을 붙이면 무엇이 바뀌는지 보자.

## volatile balance로 바꾸면?

`balance`에 `volatile`을 붙여 보자.

```java
public class BankAccountV1 implements BankAccount {
    private volatile int balance;

    // 나머지 코드는 동일
}
```

`volatile`은 가시성 문제를 다룰 때 쓰는 키워드다.
한 스레드가 `volatile` 필드에 값을 쓰면, 이후 다른 스레드가 같은 `volatile` 필드를 읽을 때 그 변경을 볼 수 있도록 Java Memory Model이 규칙을 정해 둔다.

조금 더 공식적으로 말하면, JLS는 `volatile` 필드에 대한 write가 이후 같은 필드에 대한 read와 `happens-before` 관계를 만든다고 설명한다.
`happens-before`는 "앞의 작업 결과가 뒤의 작업에서 보인다"는 식으로 이해하면 된다.

CPU 캐시 비유도 자주 등장한다.
한 스레드가 값을 바꿨는데 다른 스레드가 자기 캐시에 있는 예전 값을 계속 읽는 상황을 떠올리면 직관적으로 이해하기 쉽다.
다만 Java 코드에서 최종 근거로 삼아야 하는 것은 특정 CPU의 동작이 아니라 JMM의 `happens-before` 규칙이다.

여기까지 보면 `volatile balance`로 문제가 해결될 것 같지만, 그렇지 않다.

```java
if (balance < amount) {
    return false;
}

balance = balance - amount;
```

`volatile`은 `balance`를 읽는 동작과 쓰는 동작 각각의 가시성을 보장한다.
하지만 `잔액 확인 -> 잔액 차감` 전체를 하나의 작업으로 묶어 주지는 않는다.

가능한 흐름은 여전히 이렇다.

```text
t1: balance를 읽음 -> 1000
t1: 1000 >= 800 이므로 검증 통과
t2: balance를 읽음 -> 1000
t2: 1000 >= 800 이므로 검증 통과
t1: 800원 차감
t2: 800원 차감
```

둘 다 최신 값을 읽었더라도, 둘 다 같은 시점의 1000원을 보고 검증을 통과할 수 있다.
이것이 `volatile`의 한계다.

## volatile이 보장하는 것과 보장하지 않는 것

`volatile`은 좁고 선명한 도구다.
다른 스레드에게 상태 변경을 알려야 할 때 유용하다.

예를 들어 서버가 닫혔는지 표시하는 플래그는 `volatile`과 잘 맞는다.

```java
public class BankServer {
    private volatile boolean closed;

    public void close() {
        closed = true;
    }

    public boolean isClosed() {
        return closed;
    }
}
```

여기서 중요한 작업은 단순하다.
한 스레드가 `closed = true`로 바꾸고, 다른 스레드가 그 값을 읽으면 된다.
이런 단순 상태 신호에는 `volatile`이 잘 맞는다.

반면 계좌 출금은 단순 신호가 아니다.
잔액을 읽고, 조건을 확인하고, 다시 잔액을 쓰는 복합 작업이다.

다음 코드는 한 줄처럼 보이지만 실제로는 여러 단계다.

```java
balance = balance - amount;
```

풀어 쓰면 대략 이런 흐름이다.

```text
1. balance를 읽는다.
2. amount를 뺀다.
3. 계산 결과를 balance에 쓴다.
```

`volatile`은 이 세 단계를 하나로 합쳐 주지 않는다.
그래서 다음 종류의 작업에는 `volatile`만으로 부족하다.

- `check-then-act`: 확인한 뒤 행동하는 작업
- `read-modify-write`: 읽고 수정한 뒤 다시 쓰는 작업
- 여러 필드가 함께 지켜야 하는 불변식

은행 계좌 출금은 `check-then-act`이면서 `read-modify-write`다.
따라서 `volatile balance`만으로는 안전한 출금 로직이 되지 않는다.

## synchronized 메서드로 출금 전체를 잠그기

은행 계좌 문제를 해결하려면 출금 로직 전체를 임계 영역으로 만들어야 한다.
임계 영역은 여러 스레드가 동시에 들어오면 안 되는 코드 구간을 말한다.

가장 간단한 방법은 메서드에 `synchronized`를 붙이는 것이다.

```java
public class BankAccountV2 implements BankAccount {
    private int balance;

    public BankAccountV2(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public synchronized boolean withdraw(int amount) {
        System.out.printf("[%s] validate: amount=%d, balance=%d%n",
                Thread.currentThread().getName(), amount, balance);

        if (balance < amount) {
            System.out.printf("[%s] withdraw failed: balance=%d%n",
                    Thread.currentThread().getName(), balance);
            return false;
        }

        sleep(1000);

        balance = balance - amount;
        System.out.printf("[%s] withdraw success: balance=%d%n",
                Thread.currentThread().getName(), balance);
        return true;
    }

    @Override
    public synchronized int getBalance() {
        return balance;
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
```

이제 `withdraw()`에는 한 번에 하나의 스레드만 들어올 수 있다.
`t1`이 `withdraw()`를 실행 중이면 `t2`는 같은 계좌 객체의 락을 얻을 때까지 기다린다.

흐름은 이렇게 바뀐다.

```text
t1: withdraw() 진입
t1: balance=1000 확인
t1: 800원 차감, balance=200
t1: withdraw() 종료
t2: withdraw() 진입
t2: balance=200 확인
t2: 잔액 부족으로 실패
final balance = 200
```

`synchronized`는 두 가지를 함께 제공한다.

- 상호 배제: 같은 락을 사용하는 임계 영역에는 한 번에 하나의 스레드만 들어온다.
- 가시성: 락을 해제한 스레드의 변경은 이후 같은 락을 획득한 스레드에게 보인다.

그래서 계좌 출금처럼 "확인하고 변경하는 작업"에는 `synchronized`가 맞다.

## synchronized 블록으로 필요한 구간만 잠그기

메서드 전체를 잠그는 방식이 항상 최선은 아니다.
락을 잡고 있는 시간이 길수록 다른 스레드가 기다리는 시간도 길어진다.

이럴 때는 `synchronized` 블록으로 필요한 구간만 잠글 수 있다.

```java
public class BankAccountV3 implements BankAccount {
    private int balance;

    public BankAccountV3(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        synchronized (this) {
            System.out.printf("[%s] validate: amount=%d, balance=%d%n",
                    Thread.currentThread().getName(), amount, balance);

            if (balance < amount) {
                System.out.printf("[%s] withdraw failed: balance=%d%n",
                        Thread.currentThread().getName(), balance);
                return false;
            }

            balance = balance - amount;
            System.out.printf("[%s] withdraw success: balance=%d%n",
                    Thread.currentThread().getName(), balance);
            return true;
        }
    }

    @Override
    public int getBalance() {
        synchronized (this) {
            return balance;
        }
    }
}
```

여기서는 잔액 확인과 차감을 같은 `synchronized (this)` 블록 안에 넣었다.
핵심은 잠그는 범위가 "계좌의 규칙을 지키는 데 필요한 전체 구간"을 포함해야 한다는 점이다.

다음처럼 잠그면 안전하지 않다.

```java
public boolean withdraw(int amount) {
    synchronized (this) {
        if (balance < amount) {
            return false;
        }
    }

    synchronized (this) {
        balance = balance - amount;
        return true;
    }
}
```

잔액 확인과 차감 사이에 락이 풀린다.
그 틈에 다른 스레드가 들어와 잔액을 바꿀 수 있다.
그러면 다시 같은 문제가 생긴다.

임계 영역은 무조건 작게 만드는 것이 아니라, 지켜야 할 규칙이 깨지지 않을 만큼 충분히 크게 잡아야 한다.

## synchronized 안에서 실제로 일어나는 일

Java 객체는 모니터 락과 연결될 수 있다.
`synchronized` 인스턴스 메서드는 현재 객체, 즉 `this`의 모니터 락을 사용한다.
`synchronized (lock)` 블록은 괄호 안 객체의 모니터 락을 사용한다.

한 스레드가 락을 가지고 있으면 다른 스레드는 같은 락을 얻을 수 없다.
이때 기다리는 스레드는 `BLOCKED` 상태가 될 수 있다.

또 하나 중요한 특징은 재진입성이다.
이미 어떤 락을 가진 스레드는 같은 락을 다시 얻을 수 있다.

```java
public class BankAccountV4 {
    private int balance;

    public synchronized void withdrawAndPrint(int amount) {
        withdraw(amount);
        printBalance();
    }

    public synchronized void withdraw(int amount) {
        balance -= amount;
    }

    public synchronized void printBalance() {
        System.out.println(balance);
    }
}
```

`withdrawAndPrint()`가 `this` 락을 얻은 상태에서 `withdraw()`와 `printBalance()`를 호출해도 같은 스레드라면 다시 진입할 수 있다.
이 성질 때문에 `synchronized` 메서드끼리 내부 호출을 하더라도 바로 데드락이 나지는 않는다.

물론 재진입성이 있다고 해서 긴 임계 영역이 항상 좋은 것은 아니다.
락 안에서 오래 걸리는 작업을 많이 하면 다른 스레드가 그만큼 오래 기다린다.

## 한눈에 비교하기

| 구분 | volatile | synchronized |
| --- | --- | --- |
| 주요 목적 | 가시성 보장 | 상호 배제와 가시성 보장 |
| 동시에 여러 스레드 진입 가능? | 가능 | 같은 락 기준으로 불가능 |
| 복합 연산 보호 | 불가능 | 가능 |
| 계좌 출금 예제에 적합? | 부적합 | 적합 |
| 대표 사용처 | 종료 플래그, 단순 상태 신호 | 잔액 출금, 재고 차감, 여러 필드 불변식 보호 |

정리하면 이렇다.

`volatile`은 "바뀐 값을 보이게 하는 도구"다.
`synchronized`는 "동시에 들어오지 못하게 하면서, 바뀐 값도 보이게 하는 도구"다.

## 사용 시 주의사항

`volatile`을 사용할 때는 작업이 정말 단순한지 먼저 봐야 한다.
값을 쓰고 읽는 정도라면 적합할 수 있다.
하지만 값을 읽은 뒤 판단하고 다시 쓰는 작업이라면 `volatile`만으로는 부족하다.

특히 다음 코드는 `volatile int balance`여도 안전하지 않다.

```java
balance++;
balance = balance - amount;
if (balance >= amount) {
    balance -= amount;
}
```

모두 읽기, 계산, 쓰기가 섞인 복합 작업이기 때문이다.

`synchronized`를 사용할 때는 같은 데이터를 보호하는 모든 코드가 같은 락을 사용해야 한다.
`withdraw()`만 잠그고 `getBalance()`는 잠그지 않거나, 어떤 곳은 `this`를 잠그고 다른 곳은 별도 객체를 잠그면 보호가 깨질 수 있다.

또 락 범위도 조심해야 한다.
잔액 확인과 차감은 같은 임계 영역 안에 있어야 한다.
반대로 외부 API 호출이나 오래 걸리는 I/O를 락 안에 넣으면 대기 시간이 길어질 수 있다.

예제에서는 설명을 쉽게 하려고 `synchronized (this)`를 사용했다.
실제 코드에서는 외부 코드가 같은 객체로 동기화할 가능성을 줄이기 위해 private lock 객체를 따로 두는 방식도 자주 쓴다.

```java
public class BankAccount {
    private final Object lock = new Object();
    private int balance;

    public boolean withdraw(int amount) {
        synchronized (lock) {
            if (balance < amount) {
                return false;
            }

            balance -= amount;
            return true;
        }
    }
}
```

마지막으로 `AtomicInteger` 같은 원자 클래스도 선택지가 될 수 있다.
다만 원자 클래스는 "단일 값의 원자적 갱신"에 특히 잘 맞는다.
계좌처럼 여러 조건과 규칙이 함께 움직이는 도메인에서는 `synchronized`나 명시적 락이 더 읽기 쉬운 선택일 때가 많다.

## 언제 무엇을 선택할까?

판단 기준은 생각보다 단순하다.

- 단순한 상태 신호라면 `volatile`을 고려한다.
- 계좌 출금처럼 확인과 변경이 함께 있어야 한다면 `synchronized`를 고려한다.
- 단일 변수의 증가, 감소, 교체 같은 연산이라면 `AtomicInteger`, `AtomicLong` 같은 원자 클래스를 고려한다.

은행 계좌 예제로 다시 정리해 보자.

`volatile balance`는 다른 스레드가 바꾼 잔액을 보이게 할 수 있다.
하지만 두 스레드가 동시에 출금 로직에 들어오는 것을 막지 못한다.
그래서 두 스레드가 모두 1000원을 보고 출금에 성공하는 상황을 막을 수 없다.

`synchronized withdraw()`는 출금 전체를 한 번에 하나의 스레드만 실행하게 만든다.
한 스레드가 잔액을 확인하고 차감하는 동안 다른 스레드는 기다린다.
그래서 계좌의 규칙, 즉 "잔액보다 많이 출금할 수 없다"를 지킬 수 있다.

## 마무리

`volatile`과 `synchronized`는 둘 다 멀티스레드 환경에서 공유 데이터를 다룰 때 쓰인다.
하지만 해결하는 문제의 범위가 다르다.

`volatile`은 가시성에 초점이 있다.
한 스레드의 변경을 다른 스레드가 볼 수 있게 한다.

`synchronized`는 가시성에 더해 원자성까지 다룬다.
정확히는 같은 락을 기준으로 임계 영역에 대한 상호 배제를 제공하기 때문에, 여러 단계로 이루어진 작업을 안전하게 보호할 수 있다.

은행 계좌 출금 문제의 핵심은 최신 잔액을 보는 것만이 아니다.
잔액 확인과 차감 사이에 다른 스레드가 끼어들지 못하게 하는 것이다.

그래서 이 예제의 답은 `volatile`이 아니라 `synchronized`다.

## 참고 자료

- [JLS 17.4 Memory Model](https://docs.oracle.com/javase/specs/jls/se26/html/jls-17.html#jls-17.4)
- [JLS 17.4.5 Happens-before Order](https://docs.oracle.com/javase/specs/jls/se26/html/jls-17.html#jls-17.4.5)
- [JLS 8.3.1.4 volatile Fields](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.3.1.4)
- [JLS 14.19 synchronized Statement](https://docs.oracle.com/javase/specs/jls/se26/html/jls-14.html#jls-14.19)
- [JVMS monitorenter / monitorexit](https://docs.oracle.com/javase/specs/jvms/se26/html/jvms-6.html#jvms-6.5.monitorenter)
- 김영한 Java 고급편 참고 자료: 메모리 가시성, 동기화 - synchronized
- [MangKyu - Java volatile이란?](https://mangkyu.tistory.com/415)
- [MangKyu - Java synchronized란?](https://mangkyu.tistory.com/458)
- [10분 테코톡: 멀티스레드와 동기화 In Java](https://www.youtube.com/watch?v=ktWcieiNzKs&t=879s)
