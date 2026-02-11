---
visible: false
title: "CAS(Compare-And-Swap)와 ABA 문제"
date: 2024-11-21 00:00:00
tags: 
  - Java
---

# CAS와 ABA
CAS(Compare-And-Swap)와 ABA 문제에 대해 알아보기에 앞서 동기화와 Lock-Based 알고리즘, Lock-Free 알고리즘에 대해 알아보자.

## 동시성(Concurrency)과 병렬성(Parallelism)
동시성과 병렬성은 비슷한 개념이지만, 다르다.
동시성은 여러 작업을 동시에 처리하는 것이고, 병렬성은 여러 작업을 동시에 처리하는 것이다.
동시성은 하나의 코어에서 여러 작업을 번갈아가며 처리하는 것이고, 병렬성은 여러 코어에서 여러 작업을 동시에 처리하는 것이다.

## 동기화(Synchronization)
동기화는 동시성 프로그래밍에서 여러 스레드가 공유 자원에 접근할 때, 데이터 일관성을 유지하기 위해 사용하는 기법이다.
이를 통해 스레드 간의 경합을 방지하고, 데이터 일관성을 유지할 수 있다.
Lock-Based 알고리즘과 Lock-Free 알고리즘이 동기화를 위한 방법에 속한다.

## Lock-Based 알고리즘
Lock-Based 알고리즘은 락을 사용하여 동기화하는 방식으로, 락을 획득한 스레드만 작업을 수행하고, 다른 스레드는 대기하게 된다.
하지만 락을 사용하면 경합이 발생하여 성능이 저하되는 문제가 발생한다.

## Lock-Free 알고리즘
Lock-Free 알고리즘은 락을 사용하지 않고 동기화하는 방식으로, CAS 알고리즘을 직접 구현하거나, Atomic 클래스를 통해 활용하여 중복 계산이나 경합 없이 작업을 처리하는 방식이다.
Lock-Based 알고리즘과 달리 락을 사용하지 않아 경합이 발생하지 않아 성능이 향상되는 장점이 있다.

## CAS(Compare-And-Swap) 알고리즘
CAS(Compare-And-Swap) 알고리즘은 락을 사용하지 않고 동기화하는 방식이다.
값을 읽고, 비교하고, 교체하는 연산을 원자적으로 수행하는 방식으로 락을 사용하지 않아 경합이 발생하지 않아 성능이 향상된다.
하지만 단점 또한 존재하는데, ABA 문제가 발생할 수 있다.

## ABA 문제
ABA 문제는 CAS 알고리즘에서 발생하는 문제로, 스레드 A가 값을 읽고, 스레드 B가 값을 변경하고, 스레드 A가 다시 값을 변경할 때, 스레드 A는 값이 변경되지 않았다고 판단하여 문제가 발생한다.
이를 해결하기 위해 AtomicStampedReference, AtomicMarkableReference 클래스들과 같은 스탬프 기반의 클래스를 사용하여 해결할 수 있다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicReference<Integer> atomicReference = new AtomicReference<>(100);

        Thread thread1 = new Thread(() -> {
            atomicReference.compareAndSet(100, 200);
            atomicReference.compareAndSet(200, 100);
        });

        Thread thread2 = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            boolean result = atomicReference.compareAndSet(100, 300);
            System.out.println(result); // true
        });

        thread1.start();
        thread2.start();
    }
}
```

위 코드에서 스레드 1은 100을 200으로 변경하고, 200을 100으로 변경한다.
스레드 2는 1초를 대기한 후 100을 300으로 변경한다.
하지만 스레드 2는 100을 200으로 변경한 후 200을 100으로 변경한 것을 알지 못하기 때문에 100을 300으로 변경할 수 있다.

이러한 ABA 문제를 해결하기 위해 AtomicStampedReference, AtomicMarkableReference 클래스들을 사용하여 해결할 수 있다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<>(100, 0);

        Thread thread1 = new Thread(() -> {
            int stamp = atomicStampedReference.getStamp();
            atomicStampedReference.compareAndSet(100, 200, stamp, stamp + 1);
            stamp = atomicStampedReference.getStamp();
            atomicStampedReference.compareAndSet(200, 100, stamp, stamp + 1);
        });

        Thread thread2 = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            int stamp = atomicStampedReference.getStamp();
            boolean result = atomicStampedReference.compareAndSet(100, 300, stamp, stamp + 1);
            System.out.println(result); // false
        });

        thread1.start();
        thread2.start();
    }
}
```

위 코드에서 AtomicStampedReference 클래스를 사용하여 스탬프를 사용하여 ABA 문제를 해결할 수 있다.
스레드 1은 100을 200으로 변경하고, 200을 100으로 변경한다.
스레드 2는 1초를 대기한 후 100을 300으로 변경한다.
하지만 스레드 2는 100을 200으로 변경한 후 200을 100으로 변경한 것을 알기 때문에 100을 300으로 변경할 수 없다.

이러한 방식으로 ABA 문제를 해결할 수 있다.
