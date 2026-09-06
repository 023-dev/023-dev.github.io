---
visible: false
title: "Java 동시성: volatile과 synchronized는 무엇을 다르게 보장할까?"
date: 2026-05-22 00:00:00
tags:
  - Java
  - Concurrency
---

# Java 동시성: volatile과 synchronized는 무엇을 다르게 보장할까?

<hr>

Java 동시성을 공부하다 보면 `volatile`과 `synchronized`를 거의 같은 자리에서 만나게 된다.

- `volatile`을 붙이면 다른 스레드가 바꾼 값을 볼 수 있다.
- `synchronized`를 붙이면 한 번에 하나의 스레드만 실행할 수 있다.

여기까지만 보면 둘의 차이는 단순해 보인다.
실제 코드를 작성할 때는 더 까다로운 질문이 생긴다.

> `volatile`로 최신 값을 볼 수 있다면, 공유 변수 문제는 해결되는 것 아닌가?

이 글은 은행 계좌 예제 하나로 이 질문을 끝까지 따라가 본다.
계좌에는 1000원이 있고, 두 스레드가 동시에 800원씩 출금하려고 한다.
정상적인 계좌라면 한 스레드만 출금에 성공하고, 최종 잔액은 200원이 되어야 한다.

그런데 동기화가 없으면 최종 잔액이 -600원이 되거나, 두 스레드 모두 출금에 성공했다고 찍힐 수 있다.
이 문제를 따라가며 `volatile`이 해결하는 문제와 `synchronized`가 해결하는 문제를 나눠 보자.

## 먼저 문제 상황을 만든다

계좌를 표현하는 인터페이스는 단순하다.

```java
public interface BankAccount {
    boolean withdraw(int amount);

    int getBalance();
}
```

두 스레드는 같은 계좌 인스턴스에서 각각 800원씩 출금한다.

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

첫 번째 구현은 아무 동기화도 하지 않는다.

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

`sleep(1000)`은 출금 처리 중간에 다른 스레드가 끼어들기 쉽게 넣어 둔 장치다.
실제 서비스에서는 DB I/O, 네트워크 I/O, 복잡한 계산, 컨텍스트 스위칭 등이 비슷한 틈을 만든다.

실행 결과는 환경마다 달라진다. 다음 흐름도 충분히 가능하다.

```text
[t1] validate: amount=800, balance=1000
[t2] validate: amount=800, balance=1000
[t1] withdraw success: balance=200
[t2] withdraw success: balance=-600
final balance = -600
```

두 스레드가 모두 잔액 1000원을 보고 검증을 통과했다.
그 뒤 각각 800원을 차감했기 때문에 최종 잔액이 -600원이 되었다.

은행 계좌가 지켜야 할 규칙은 단순하다.

> 잔액이 출금액보다 작으면 출금하면 안 된다.

그런데 이 규칙은 `if (balance < amount)` 한 줄만으로 지켜지지 않는다.
검증할 때 본 잔액이 차감할 때도 그대로라는 보장이 있어야 한다.

## 문제를 둘로 나눠 보자

멀티스레드 환경에서 공유 자원을 다룰 때 자주 만나는 문제는 크게 둘이다.

첫 번째는 가시성(visibility) 문제다.
한 스레드가 바꾼 값을 다른 스레드가 언제 보느냐의 문제다.

두 번째는 원자성(atomicity) 문제다.
여러 단계로 이루어진 작업이 중간에 끼어들기 없이 하나의 작업처럼 실행되느냐의 문제다.

은행 계좌 예제에서 출금은 다음 두 단계로 이루어진다.

```java
if (balance < amount) {
    return false;
}

balance = balance - amount;
```

첫 번째 줄은 잔액을 확인한다.
두 번째 줄은 잔액을 변경한다.

두 줄은 코드상으로 붙어 있지만, 멀티스레드 관점에서는 하나의 원자적 작업이 아니다.
`t1`이 잔액을 확인한 뒤 차감하기 전에 `t2`가 같은 잔액을 확인할 수 있다.
이것이 은행 계좌 예제의 핵심 문제다.

## volatile balance로 바꾸면 해결될까?

그러면 `balance`에 `volatile`을 붙이면 어떨까?

```java
public class BankAccountV1 implements BankAccount {
    private volatile int balance;

    // 나머지 코드는 동일
}
```

`volatile` 필드는 Java Memory Model에서 특별한 메모리 의미를 가진다.
JLS는 `volatile` 필드에 대한 write가 이후 같은 필드에 대한 read와 `happens-before` 관계를 만든다고 설명한다.
한 스레드가 `volatile balance`에 쓴 값은, 이후 다른 스레드가 같은 `volatile balance`를 읽을 때 보이도록 정해진다.

이 보장은 중요하다.
공유 상태를 다룰 때 한 스레드의 변경이 다른 스레드에 보이지 않으면 프로그램은 예상과 전혀 다르게 움직일 수 있다.
CPU 캐시를 예로 들면, 한 코어가 자신의 캐시에 있는 값을 계속 읽느라 다른 코어가 바꾼 값을 보지 못하는 상황을 떠올릴 수 있다.
다만 Java 프로그램에서 최종 근거로 삼아야 하는 것은 특정 CPU 캐시 동작이 아니라 JMM의 `happens-before` 규칙이다.

문제는 `volatile`이 출금 로직 전체를 하나의 작업으로 묶어주지는 않는다는 데 있다.

```java
if (balance < amount) {
    return false;
}

balance = balance - amount;
```

`volatile`은 `balance`를 읽고 쓰는 각각의 동작에 가시성을 보장한다.
다만 위 두 동작 사이에 다른 스레드가 들어오는 것을 막지 않는다.

가능한 흐름은 여전히 다음과 같다.

```text
t1: volatile balance 읽음 -> 1000
t1: 1000 >= 800 이므로 검증 통과
t2: volatile balance 읽음 -> 1000
t2: 1000 >= 800 이므로 검증 통과
t1: balance = 1000 - 800
t2: balance = 200 - 800 또는 1000 - 800
```

마지막 결과는 실행 타이밍에 따라 달라진다.
핵심은 `volatile`을 붙여도 두 스레드가 모두 검증을 통과할 수 있다는 사실이다.

은행 계좌 문제는 단순히 최신 값을 보느냐에서 끝나지 않는다.
`잔액 확인 -> 잔액 차감`이라는 복합 작업 자체를 보호해야 한다.

## volatile이 보장하는 것

`volatile`은 가볍지만 좁은 도구다.

`volatile` 필드에 write하면 그 write는 이후 같은 필드에 대한 read와 `happens-before` 관계를 만든다.
또 `volatile` 접근은 일반 필드 접근과 달리 특정 재정렬을 제한한다.
그래서 다른 스레드에 상태 변경을 알려야 하는 단순 신호에는 잘 맞는다.

예를 들어 다음과 같은 상태 신호는 `volatile`의 대표적인 사용처다.

```java
private volatile boolean closed;
```

한 스레드만 `closed = true`로 바꾸고, 다른 스레드들은 그 값을 읽어 작업을 멈추는 구조라면 `volatile`이 좋은 선택이다.
여기서는 여러 연산을 하나의 임계 영역으로 묶어야 하는 요구가 없기 때문이다.

은행 계좌의 출금은 다르다.
출금은 `balance` 하나만 다루는 것처럼 보여도 다음 조건을 함께 만족해야 한다.

- 검증할 때 본 잔액을 기준으로 차감해야 한다.
- 검증과 차감 사이에 다른 출금이 끼어들면 안 된다.
- 출금이 끝난 뒤 다른 스레드는 바뀐 잔액을 볼 수 있어야 한다.

첫 번째와 두 번째는 원자성 또는 상호 배제의 문제다.
세 번째는 가시성의 문제다.

`volatile`은 세 번째에 강하다. 첫 번째와 두 번째는 해결하지 못한다.

## check-then-act와 read-modify-write

은행 계좌 예제에는 동시성에서 자주 등장하는 두 가지 패턴이 들어 있다.

첫 번째는 check-then-act다.

```java
if (balance < amount) {
    return false;
}
```

현재 상태를 확인한 뒤 그 결과에 따라 행동한다.
확인 직후 상태가 바뀔 수 있다는 점이 문제다.
`balance`가 1000인지 확인하고 통과했더라도, 실제 차감 직전에는 다른 스레드가 이미 잔액을 200으로 바꿨을 수 있다.

두 번째는 read-modify-write다.

```java
balance = balance - amount;
```

이 코드는 한 줄이지만 내부적으로는 다음 흐름이다.

```text
1. balance를 읽는다.
2. amount를 뺀다.
3. 계산 결과를 balance에 다시 쓴다.
```

`volatile int balance`라고 해도 이 세 단계 전체가 원자적으로 실행되지는 않는다.
`volatile` read와 `volatile` write 각각의 가시성은 보장되지만, read-modify-write 전체가 하나의 불가분 연산으로 바뀌지는 않는다.

그래서 `volatile`은 은행 계좌 출금 문제의 답이 아니다.
필요한 것은 임계 영역(critical section)이다.

## 임계 영역으로 생각하기

임계 영역은 여러 스레드가 동시에 실행하면 데이터 일관성이 깨지는 코드 구간이다.

은행 계좌에서 임계 영역은 어디일까?
출금 메서드 전체가 아니라도, 적어도 다음 구간은 반드시 하나로 보호해야 한다.

```java
if (balance < amount) {
    return false;
}

balance = balance - amount;
```

검증과 차감 사이에 다른 스레드가 들어오면 안 된다.
두 코드는 계좌의 불변식을 지키는 하나의 작업 단위다.

이제 `synchronized`를 사용할 차례다.

## synchronized 메서드로 보호하기

두 번째 구현은 `withdraw()`와 `getBalance()`에 `synchronized`를 붙인다.

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

이제 같은 인스턴스의 `withdraw()`에는 한 번에 하나의 스레드만 들어간다.

`t1`이 먼저 `withdraw()`에 들어가면 `t1`은 해당 계좌 인스턴스의 모니터 락을 획득한다.
`t2`가 같은 인스턴스의 `withdraw()`에 들어가려 하면 이미 락이 있으므로 기다린다.
이때 `t2`의 스레드 상태는 `BLOCKED`가 될 수 있다.

가능한 실행 흐름은 다음과 같다.

```text
[t1] validate: amount=800, balance=1000
[t1] withdraw success: balance=200
[t2] validate: amount=800, balance=200
[t2] withdraw failed: balance=200
final balance = 200
```

이제 두 스레드가 동시에 1000원을 보고 검증을 통과하지 못한다.
한 스레드가 검증과 차감을 끝내고 락을 반납한 뒤에야 다음 스레드가 들어온다.

`synchronized`는 여기서 두 가지를 제공한다.

- 상호 배제(mutual exclusion): 같은 모니터 락을 기준으로 한 번에 하나의 스레드만 임계 영역에 들어간다.
- 가시성(visibility): 락을 반납하기 전의 변경은 이후 같은 락을 획득한 스레드에게 보인다.

이 때문에 `synchronized`를 사용하면 `balance`에 별도로 `volatile`을 붙이지 않아도 된다.
같은 락으로 읽기와 쓰기를 보호한다면, `synchronized`가 필요한 가시성까지 함께 제공한다.

## synchronized가 만드는 happens-before

JMM 관점에서 `synchronized`의 핵심은 unlock-lock 관계다.

어떤 스레드가 모니터 락을 해제하면, 이후 다른 스레드가 같은 모니터 락을 획득하는 동작과 `happens-before` 관계가 생긴다.

은행 계좌 예제로 보면 다음과 같다.

```text
t1: synchronized withdraw() 진입
t1: balance = 200
t1: synchronized withdraw() 종료, lock 해제
t2: 같은 계좌 인스턴스의 synchronized withdraw() 진입, lock 획득
t2: balance 읽음 -> 200
```

`t1`이 락을 해제하기 전에 수행한 변경은, `t2`가 같은 락을 획득한 뒤 볼 수 있어야 한다.
그래서 `synchronized`는 단순히 한 번에 하나만 실행시키는 장치가 아니라 메모리 가시성 장치이기도 하다.

JVM 명령어 수준에서는 `synchronized` 블록이 `monitorenter`, `monitorexit`와 연결된다.
메서드에 붙은 `synchronized`도 같은 모니터 개념을 사용한다.
인스턴스 메서드라면 해당 인스턴스가 락의 기준이 되고, 정적 메서드라면 해당 `Class` 객체가 락의 기준이 된다.

## synchronized 블록으로 필요한 구간만 보호하기

`BankAccountV2`처럼 메서드 전체에 `synchronized`를 붙이면 구현은 간단하다.
다만 메서드 안에 공유 자원과 상관없는 코드가 많다면 락을 오래 잡게 된다.

세 번째 구현은 필요한 구간만 `synchronized` 블록으로 감싼다.

```java
public class BankAccountV3 implements BankAccount {
    private int balance;

    public BankAccountV3(int initialBalance) {
        this.balance = initialBalance;
    }

    @Override
    public boolean withdraw(int amount) {
        System.out.printf("[%s] withdraw requested: amount=%d%n",
                Thread.currentThread().getName(), amount);

        synchronized (this) {
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
    }

    @Override
    public int getBalance() {
        synchronized (this) {
            return balance;
        }
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

`synchronized (this)`는 현재 계좌 인스턴스의 모니터 락을 사용한다.
`public synchronized boolean withdraw(...)`와 같은 락을 기준으로 동작하는 셈이다.

차이는 락을 잡는 범위다.

- `synchronized` 메서드: 메서드에 들어오는 순간부터 나갈 때까지 락을 잡는다.
- `synchronized` 블록: 지정한 블록 안에서만 락을 잡는다.

락의 범위를 너무 작게 잡아도 문제가 된다.
예를 들어 다음처럼 검증과 차감을 서로 다른 `synchronized` 블록으로 나누면 다시 문제가 생길 수 있다.

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

첫 번째 블록에서 검증을 끝내고 락을 놓는 순간, 다른 스레드가 들어와 잔액을 바꿀 수 있다.
임계 영역은 문법적으로 가까운 코드가 아니라, 깨지면 안 되는 불변식의 단위로 정해야 한다.

은행 계좌에서는 검증과 차감이 하나의 임계 영역이다.

## 재진입성도 알아두자

Java의 `synchronized`는 재진입을 허용한다.
어떤 스레드가 특정 객체의 모니터 락을 이미 가지고 있다면, 같은 락이 필요한 다른 `synchronized` 코드에도 다시 들어갈 수 있다.

예를 들어 다음 코드는 데드락에 빠지지 않는다.

```java
public class BankAccount {
    private int balance;

    public synchronized boolean withdraw(int amount) {
        if (!canWithdraw(amount)) {
            return false;
        }

        balance -= amount;
        return true;
    }

    private synchronized boolean canWithdraw(int amount) {
        return balance >= amount;
    }
}
```

`withdraw()`에 들어온 스레드는 이미 `this`의 락을 가지고 있다.
그 상태에서 `canWithdraw()`를 호출하면 같은 `this` 락을 다시 요청하게 된다.
Java의 모니터 락은 재진입을 허용하므로 같은 스레드는 다시 진입한다.

재진입성 덕분에 객체 내부의 동기화된 메서드들이 서로를 호출할 수 있다.
다만 재진입이 가능하다고 해서 임계 영역을 무작정 넓혀도 된다는 뜻은 아니다.
락을 오래 잡을수록 다른 스레드가 기다릴 가능성이 커진다.

## volatile과 synchronized를 나란히 비교하기

은행 계좌 예제를 기준으로 둘을 비교하면 차이가 선명해진다.

| 구분 | `volatile` | `synchronized` |
| --- | --- | --- |
| 주된 목적 | 가시성, 일부 순서 보장 | 상호 배제, 가시성 |
| 락 사용 | 사용하지 않음 | 모니터 락 사용 |
| 다른 스레드 차단 | 차단하지 않음 | 같은 락을 원하는 스레드는 대기 |
| 복합 연산 보호 | 불가능 | 가능 |
| 은행 계좌 출금 | 해결 불가 | 해결 가능 |

`volatile`은 한 스레드의 write를 다른 스레드의 read가 볼 수 있게 만드는 데 강하다.
여러 줄의 코드를 하나의 작업으로 묶지는 못한다.

`synchronized`는 같은 락을 기준으로 임계 영역에 한 번에 하나의 스레드만 들어오게 한다.
락 해제와 락 획득 사이의 `happens-before` 관계로 메모리 가시성도 제공한다.

이렇게 정리할 수 있다.

- 단순한 상태 신호라면 `volatile`을 고려한다.
- 검증 후 실행(check-then-act)이 필요하면 `synchronized`를 고려한다.
- 읽고 수정하고 쓰는(read-modify-write) 복합 연산이면 `synchronized` 또는 `Atomic*`을 고려한다.
- 여러 필드가 함께 만족해야 하는 불변식이 있다면 `synchronized` 또는 명시적 `Lock`을 고려한다.

## Atomic은 어디에 들어갈까?

단일 값의 원자적 갱신만 필요하다면 `AtomicInteger`, `AtomicLong`, `AtomicReference` 같은 클래스를 쓰면 된다.

예를 들어 단순 카운터라면 다음 코드가 자연스럽다.

```java
private final AtomicInteger count = new AtomicInteger();

public int increment() {
    return count.incrementAndGet();
}
```

은행 계좌 출금은 단순 증가보다 의미가 넓다.
`balance` 하나만 보면 `AtomicInteger`의 `compareAndSet()`으로 구현할 수도 있다.
그러나 계좌 상태가 잔액 외의 필드와 함께 움직이거나, 출금 이력 저장, 한도 검증, 수수료 계산 같은 불변식까지 묶이면 단일 atomic 변수만으로는 표현이 복잡해진다.

`Atomic*`이 나쁘다는 말이 아니다.
도구를 고를 때 기준은 "공유 변수를 쓰는가"보다 "어떤 불변식을 어떤 단위로 보호해야 하는가"에 가깝다.

## 결론

`volatile`과 `synchronized`는 모두 Java 동시성에서 메모리 가시성과 관련된다.
둘은 같은 도구가 아니다.

`volatile`은 공유 변수의 변경을 다른 스레드가 보게 만드는 가벼운 장치다.
락을 사용하지 않기 때문에 다른 스레드를 막지 않는다.
그래서 단순 상태 신호처럼 "최신 값을 보는 것"이 핵심인 상황에 어울린다.

`synchronized`는 임계 영역을 보호하는 장치다.
같은 모니터 락을 기준으로 한 번에 하나의 스레드만 들어오게 하고, 락을 해제한 스레드의 변경을 이후 같은 락을 획득한 스레드가 볼 수 있게 한다.
그래서 은행 계좌 출금처럼 "확인한 상태를 기준으로 변경해야 하는" 복합 작업에 어울린다.

은행 계좌 예제의 답은 `volatile balance`가 아니다.
문제는 최신 잔액을 못 봐서만 생기지 않는다.
잔액 확인과 차감 사이에 다른 스레드가 끼어들 수 있기 때문에 생긴다.

질문은 이렇게 바뀐다.

> 이 변수의 최신 값만 보면 되는가, 아니면 여러 동작을 하나의 임계 영역으로 보호해야 하는가?

전자라면 `volatile`이 답이 될 수 있다.
후자라면 `synchronized`나 그에 준하는 동기화 도구가 필요하다.

## 참고 자료

- [JLS 17.4 Memory Model](https://docs.oracle.com/javase/specs/jls/se26/html/jls-17.html#jls-17.4)
- [JLS 17.4.5 Happens-before Order](https://docs.oracle.com/javase/specs/jls/se26/html/jls-17.html#jls-17.4.5)
- [JLS 8.3.1.4 volatile Fields](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.3.1.4)
- [JLS 14.19 synchronized Statement](https://docs.oracle.com/javase/specs/jls/se26/html/jls-14.html#jls-14.19)
- [JVMS monitorenter](https://docs.oracle.com/javase/specs/jvms/se26/html/jvms-6.html#jvms-6.5.monitorenter), [monitorexit](https://docs.oracle.com/javase/specs/jvms/se26/html/jvms-6.html#jvms-6.5.monitorexit)
- 강의 자료: `5. 메모리 가시성.pdf`
- 강의 자료: `6. 동기화 - synchronized.pdf`
- [MangKyu: Java volatile이란?](https://mangkyu.tistory.com/415)
- [MangKyu: Java synchronized란?](https://mangkyu.tistory.com/458)
- [10분 테코톡: 멀티스레드와 동기화 In Java](https://www.youtube.com/watch?v=ktWcieiNzKs&t=879s)
