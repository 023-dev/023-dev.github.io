---
layout: post
title: "CAS와 ABA"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

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
