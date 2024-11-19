---
title: "멀티 스레드 환경에서 동시성 프로그래밍"
date: 2024-11-17 00:00:00
tags: 
  - Java
---

# 자바의 멀티 스레딩

<hr>

이 글에서는 자바에서의 멀티 스레딩을 이해하는 과정에서 필요한 개념을 정리한다.

## 동시성과 병렬성의 차이점
동시성(`Concurrency`)과 병렬성(`Parallelism`)은 다중 작업을 처리하는 방식에서 차이가 있다.
- 동시성(`Concurrency`): 여러 작업이 동시에 실행되는 것처럼 보이지만, 실제로는 CPU가 시분할 방식으로 실행한다.
- 병렬성(`Parallelism`): 여러 작업이 물리적으로 동시에 실행됩니다. 멀티코어 CPU에서 서로 다른 코어가 각각의 작업을 실행한다.

## Thread-Safe하다는 것의 의미
`Thread-Safe`는 다중 스레드 환경에서 동시 접근이 발생해도 데이터의 일관성을 유지하고 예측 가능한 결과를 보장하는 것을 의미한다.

## Thread-Safe를 구현하는 방법

다음은 자바에서 `Thread-Safe`를 구현하는 방법들을 정리한다.
### Mutual Exclusion (상호 배제)

`synchronized` 키워드를 사용하여 한 번에 하나의 스레드만 특정 코드 블록에 접근하도록 하여 제한하는 방식이다.

```java
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}

```

### 불변 객체 사용

객체의 상태를 변경하지 않음으로써 스레드 간의 충돌을 방지하여 동기화가 필요성을 소거하는 방식이다.

```java
public class ImmutableCounter {
    private final int count;

    public ImmutableCounter(int count) {
        this.count = count;
    }

    public ImmutableCounter increment() {
        return new ImmutableCounter(this.count + 1);
    }

    public int getCount() {
        return count;
    }
}
```

### Thread-Local Storage

`ThreadLocal` 클래스 사용해서 각 스레드가 고유한 메모리를 할당하여 독립적인 데이터를 가질 수 있도록 설정하는 방식이다.

```java
public class ThreadLocalExample {
    private static ThreadLocal<Integer> threadLocalCount = ThreadLocal.withInitial(() -> 0);

    public void increment() {
        threadLocalCount.set(threadLocalCount.get() + 1);
    }

    public int getCount() {
        return threadLocalCount.get();
    }
}

```

### Concurrent 패키지 사용
`java.util.concurrent` 패키지에서 제공하는 `Thread-Safe` 자료구조와 API 사용하는 방식으로 `ConcurrentHashMap`와 `CopyOnWriteArrayList`가 주로 사용된다.

### Lock-Free Programming

`AtomicInteger` 같은 CAS(Compare-And-Swap) 알고리즘을 사용하여 스레드 경합을 줄이고 성능을 개선하는 방식이다.

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
    private AtomicInteger count = new AtomicInteger();

    public void increment() {
        count.incrementAndGet();
    }

    public int getCount() {
        return count.get();
    }
}
```

### Thread-Safe 구현에서의 고려 사항

- 성능 문제
  - `Thread-Safe`를 보장하는 방식은 대개 비용이 든다. 예를들어, `synchronized` 블록은 락을 사용하는데 이때 경합(Contension) 발생 시 성능 저하를 초래한다.
- 데드락(`Deadlock`)
  - 두 개 이상의 스레드가 서로의 락을 기다리면서 무한 대기 상태에 빠질 위험이 있다.
- 락 경합 문제
  - 여러 스레드가 동시에 동일한 리소스에 접근하려고 시도하면 경합으로 인해 처리 속도 저하의 원인이 된다.
- 비효율적 동기화
  - 불필요하게 동기화가 과도하게 사용되면 작업 처리 속도가 크게 떨어질 수 있다.

### Thread-Safe하지 않은 경우 야기되는 문제
두 개 이상의 스레드가 동시에 동일한 데이터에 접근 및 수정하여 일관되지 않은 결과를 초래하는 데이터 레이스(Data Race)현상을 야기한다.

```java
public class NotThreadSafeCounter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}

// 여러 스레드에서 increment() 호출 시
// count 값이 의도한 값보다 작게 나올 가능성.
```

### Thread-Safe를 구현하는 가장 성능이 좋은 방법
동기화 비용을 줄이기 위해 CAS 알고리즘 기반의 Atomic 클래스를 사용하는 것이 일반적으로 더 효율적이다. 읽기 작업이 많은 경우, CopyOnWriteArrayList와 같은 데이터 구조 사용하면 된다.

## 가시성 문제와 원자성 문제

### 가시성 문제
가시성 문제는 한 스레드에서 변경한 값이 다른 스레드에서 즉시 보이지 않는 현상을 의미한다.
보통 가시성 문제의 원인은 다음과 같다.
- 각 스레드는 메인 메모리 대신 CPU 캐시에 데이터를 저장하고 읽음으로 인해 메모리 불일치 발생한다.
- 코드 실행 순서가 재배열되어 예상과 다른 동작한다.
- 데이터의 일관성을 보장하는 메모리 배리어가 없어 업데이트가 다른 스레드에 전파되지 않음로 인해 발생한다.

예를들면 아래 코드에서 `stop = true`로 값을 변경해도, 다른 스레드에서 `stop`의 변경 사항을 보지 못해 무한 루프가 발생할 수 있다.
```java
public class VisibilityExample {
    private static boolean stop = false;

    public static void main(String[] args) {
        Thread thread = new Thread(() -> {
            while (!stop) {
                // 작업 수행
            }
            System.out.println("Stopped!");
        });
        thread.start();

        // stop 값을 변경
        stop = true;
    }
}
```

#### 원자성 문제
원자성 문제는 작업이 중간에 끼어들기 없이 완료되지 않는 현상을 의미한다.
주로 특정 작업 단위가 나뉘어 실행될 경우, 다른 스레드가 작업 중간에 간섭하여 데이터 불일치 발생하게 된다.

아래 코드는 count++는 Read, Modify, Write 세 단계로 나뉘어 실행되는데 이때 다른 스레드가 중간에 간섭 가능해서 count 값이 예상보다 작을 수 있다.

```java
public class AtomicityExample {
    private static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> increment());
        Thread t2 = new Thread(() -> increment());

        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("Count: " + count); // 기대값: 2000, 실제값: 불확실
    }

    public static void increment() {
        for (int i = 0; i < 1000; i++) {
            count++; // Read-Modify-Write
        }
    }
}
```

### 자바의 동시성 이슈 해결 방법
이러한 자바의 동시성 이슈를 해결하기 위해 다음과 같은 방법이 있다.
- 변수의 변경 사항을 메인 메모리에 즉시 반영시켜 가시성을 보장하는 `volatile` 키워드를 사용한다.
- 메모리의 일관성(원자성)을 보장하는 `synchronized` 키워드를 사용한다
- `AtomicInteger` 클래스를 사용해 `CAS(Compare-And-Swap)` 알고리즘 기반으로 원자성 보장하는 방식이 주가된다.
- Lock 객체를 사용하여 `ReentrantLock` 사용한다.


### volatile 키워드
CPU 캐시가 아닌 메인 메모리에서 값을 읽고 씀으로 변수의 값을 모든 스레드에서 즉시 읽을 수 있도록하여 컴파일러와 CPU의 재정렬 방지를 보장한다. 대신 원자성을 보장하지 않는다는 단점이 있다.

```java
public class VolatileExample {
    private volatile boolean running = true;

    public void stop() {
        running = false; // 다른 스레드에서도 즉시 반영
    }

    public void doWork() {
        while (running) {
            // 작업 실행
        }
    }
}
```

## synchronized 키워드

synchronized는 동기화를 통해 한 번에 하나의 스레드만 특정 코드 블록 또는 메서드에 접근할 수 있도록 제한하여 스레드 간 상호 배제(Mutual Exclusion)와 가시성(Visibility)을 보장하는 키워드다.

```java
public class SynchronizedExample {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
```

### synchronized의 내부 동작 원리
`synchronized`는 JVM의 모니터 락(Monitor Lock)을 기반으로 바이트코드 레벨에서 동작한다.
`monitorenter`로 락을 획득하거나 `monitorexit`으로 락을 해제 할 수 있고, 이때 객체 헤더(Object Header)에 있는 Monitor 필드에 락 상태가 기록된다.


```java
public void synchronizedBlockExample() {
    synchronized (this) {
        count++;
    }
}

//0: aload_0
//1: dup
//2: monitorenter // 락 획득
//3: aload_0
//4: dup
//5: getfield 
// #2 // count 읽기
//8: iconst_1
//9: iadd
//10: putfield 
//#2 // count 쓰기 
//13: monitorexit // 락 해제 
//14: return
```

### synchronized의 단점
물론 이렇게 synchronized을 사용함으로써 단점도 존재한다.
- 성능 저하
  - 락 경쟁이 발생할 경우 스레드가 대기 상태에 머물러 성능 저하 발생한다.
- 데드락(Deadlock)
  - 여러 스레드가 서로의 락을 기다리며 무한 대기 상태가 발생한다.
- Fine-Grained Locking 부족
  - 동기화 범위가 크면, 불필요한 락 경쟁이 발생한다.

 ```java
 public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void method1() {
        synchronized (lock1) {
            synchronized (lock2) {
                System.out.println("Method1");
            }
        }
    }

    public void method2() {
        synchronized (lock2) {
            synchronized (lock1) {
                System.out.println("Method2");
            }
        }
    }
}
```


## Atomic
Atomic은 작업 중간에 다른 스레드가 개입할 수 없고, 작업이 완전히 수행되거나 아예 수행되지 않는 상태를 보장되어 분할되지 않는 작업 단위를 의미한다.
이 개념의 핵심은 원자성을 보장하여 작업이 중간에 끼어든다거나 일관성이 침해되는 것을 방지하는 것이다.
- **Atomic 타입**: `AtomicInteger`, `AtomicLong`, `AtomicReference` 등이 있음.
```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
    private AtomicInteger count = new AtomicInteger();

    public void increment() {
        count.incrementAndGet(); // 원자적 연산
    }

    public int getCount() {
        return count.get();
    }
}
```

### Java에서 원자성을 보장하는 방법

#### synchronized 키워드: 동기화 블록을 사용하여 작업 단위를 원자적으로 처리.
```java
public class SynchronizedExample {
    private int count = 0;

    public synchronized void increment() {
        count++; // synchronized로 원자성 보장
    }

    public synchronized int getCount() {
        return count;
    }
}
```

#### Atomic 클래스 사용해 CAS(Compare-And-Swap) 알고리즘을 기반으로 성능과 원자성을 모두 보장하는 방법.

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
    private AtomicInteger count = new AtomicInteger();

    public void increment() {
        count.incrementAndGet(); // 원자적 증가
    }

    public int getCount() {
        return count.get();
    }
}

```

#### 불변 객체(Immutable Object)

String, Integer 같은 클래스는 불변 객체로 설계되어 Thread-Safe하다.

#### Lock-Free 알고리즘
CAS 알고리즘을 직접 구현하거나, Atomic 클래스를 통해 활용하여 중복 계산이나 경합 없이 작업을 처리하는 방식이다.

## CAS(Compare-And-Swap) 알고리즘

CAS(비교 및 교환)는 Lock-Free 동기화 기법으로, 데이터를 직접 락 없이 원자적으로 작업을 수행한다.
동작 원리는 현재 메모리 값을 읽어서 예상 값과 현재 메모리 값을 비교하고 예상 값과 일치하면 새로운 값으로 변경, 그렇지 않으면 재시도하는 방식으로 동작하는 알고리즘이다.
이로 인해 락을 사용하지 않아 스레드 경합이 줄어들어 성능이 향상되는 효과를 얻을 수 있다.

하지만 단점도 존재한다.
예상 값이 변경되었다가 다시 원래 값으로 돌아온 경우, CAS는 이를 감지하지 못하는 ABA문제가 발생할 수 있다.
이를 해결하기 위해 AtomicStampedReference와 같은 스탬프(버전) 기반의 데이터 구조를 사용하면 된다.

```java
import java.util.concurrent.atomic.AtomicInteger;

public class CASExample {
    private AtomicInteger count = new AtomicInteger();

    public void increment() {
        while (true) {
            int current = count.get();
            int next = current + 1;
            if (count.compareAndSet(current, next)) {
                break;
            }
        }
    }

    public int getCount() {
        return count.get();
    }
}
```

### ABA 문제
ABA 문제는 CAS(Compare-And-Swap) 알고리즘에서 발생하는 문제로, 메모리의 값이 변경되었다가 다시 원래 값으로 돌아왔을 때, CAS는 이를 감지하지 못해 값이 변경되지 않은 것으로 잘못 판단하는 현상이다.
예를 들어, 값이 A → B → A로 변경되었더라도 CAS는 단순히 값이 A인지 여부만 확인하므로 중간 변경을 인식하지 못한다.

### ABA 문제 해결 방법
그럼 CAS가 더 효율적이라 사용하고 싶은데 ABA 문제가 발생한다고 하면 도대체 어떻게 사용을 하라는 걸까?
당연히 그런 해결책도 존재했다.

#### AtomicStampedReference
`AtomicStampedReference`와 같은 버전 성질의 데이터 구조를 사용하는 것이다.
`AtomicStampedReference`는 값과 함께 버전 정보(Stamp)를 저장하여 값이 중간에 변경되었는지 확인한다.
내부 동작 과정은 값과 스탬프(버전)를 함께 저장하고, CAS 비교 시, 값뿐만 아니라 스탬프도 비교해서 값은 동일하더라도 스탬프가 다르면 중간 변경이 있었음을 탐지하는 방법으로 ABA문제를 해결할 수 있다.

```java
import java.util.concurrent.atomic.AtomicStampedReference;

public class ABAExample {
private static AtomicStampedReference<Integer> atomicStampedRef =
new AtomicStampedReference<>(100, 0); // 초기 값 100, 초기 스탬프 0

    public static void main(String[] args) {
        int initialStamp = atomicStampedRef.getStamp(); // 현재 스탬프
        Integer initialValue = atomicStampedRef.getReference(); // 현재 값

        // 스레드 1: 값 변경 (100 -> 200 -> 100)
        new Thread(() -> {
            atomicStampedRef.compareAndSet(100, 200, initialStamp, initialStamp + 1); // 스탬프 증가
            atomicStampedRef.compareAndSet(200, 100, initialStamp + 1, initialStamp + 2); // 다시 100으로 변경
        }).start();

        // 스레드 2: 값과 스탬프 확인 후 CAS 시도
        new Thread(() -> {
            try {
                Thread.sleep(500); // 스레드 1이 변경하는 동안 대기
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            boolean success = atomicStampedRef.compareAndSet(
                100, 300, initialStamp, initialStamp + 1 // 초기 스탬프를 사용
            );

            System.out.println("Update Success: " + success); // false: 스탬프가 변경됨
        }).start();
    }
}
```
