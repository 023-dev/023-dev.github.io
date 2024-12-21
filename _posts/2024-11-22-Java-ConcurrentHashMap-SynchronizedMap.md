---
layout: post
title: "ConcurrentHashMap과 SynchronizedMap"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

### ConcurrentHashMap vs SynchronizedMap
### ConcurrentHashMap의 동작 과정과 SynchronizedMap의 비교

---

####  SynchronizedMap
`Collections.synchronizedMap()`을 사용해 기존 `HashMap`을 동기화된 형태로 래핑한 Map 구현체다.
- **특징**:
    - 모든 메서드가 동기화(`synchronized`)되어 Thread-Safe 보장.
    - 메서드 호출마다 락이 걸리므로 **쓰기 작업**이 많거나 **병렬 접근이 빈번**한 경우 성능 저하 발생.

**SynchronizedMap의 문제점**:
1. **단일 락 기반**:
    - Map 전체를 하나의 락으로 보호.
    - 쓰기 작업 중 다른 모든 스레드는 대기 상태로 전환되어 **병렬성 부족**.

2. **반복(iteration) 시 비효율성**:
    - `Iterator`는 동기화되지 않아 **ConcurrentModificationException**이 발생 가능.
    - 반복 작업 시 명시적으로 동기화를 추가해야 함:
      ```java
      Map<String, String> map = Collections.synchronizedMap(new HashMap<>());
 
      synchronized (map) {
          for (Map.Entry<String, String> entry : map.entrySet()) {
              System.out.println(entry.getKey() + ": " + entry.getValue());
          }
      }
      ```

#### ConcurrentHashMap
`java.util.concurrent` 패키지에서 제공하는 동기화된 Map 구현체로, 락 효율성을 높이고 병렬성을 개선한 구조다.
- **특징**:
    - **부분 락(Segment 또는 Bucket-based Locking)**을 사용하여 성능과 병렬성을 모두 보장.
    - Java 7과 Java 8 이후 동작 방식이 다름.

#### ConcurrentHashMap의 동작 과정

##### **Java 7 이전: 세그먼트 락(Segment Locking)**
- Map을 여러 개의 **세그먼트(Segment)**로 나눔.
- 각 세그먼트는 별도의 락을 사용하여 동기화.
- **읽기 작업**은 락 없이 처리하며, **쓰기 작업**은 세그먼트 단위로 락을 걸어 처리.
- 장점:
    - 여러 세그먼트에서 병렬로 읽기/쓰기 작업 가능.
    - 성능과 병렬성이 크게 향상.

##### **Java 8 이후: 버킷 락(Bucket-based Locking)**
- **배열 + 연결 리스트 + 트리 구조**로 동작:
    - 해시 충돌이 적으면 배열과 연결 리스트.
    - 해시 충돌이 많으면 **Red-Black Tree**로 변환.
- 단일 락이 아닌, **버킷 단위로 락을 사용**하여 더 세밀한 동기화 구현.
- **CAS(Compare-And-Swap)** 기반으로 락 경합을 줄임.


#### ConcurrentHashMap과 SynchronizedMap의 비교

| 특성                        | **SynchronizedMap**                        | **ConcurrentHashMap**                     |
|-----------------------------|--------------------------------------------|--------------------------------------------|
| **락 방식**                  | 단일 락 기반 (Map 전체에 락 적용)           | 세그먼트 락(Java 7) 또는 버킷 락(Java 8)    |
| **읽기 작업**                | 읽기 작업에도 락이 필요                     | 읽기 작업은 락 없이 처리                    |
| **쓰기 작업**                | 모든 쓰기 작업이 순차적으로 실행             | 병렬로 쓰기 가능 (락이 나뉘어 있음)         |
| **반복 작업**                | 명시적 동기화 필요                         | 안전하게 병렬 반복 가능                     |
| **성능**                     | 쓰기 작업이나 경합이 많으면 성능 저하 심각    | 병렬성이 뛰어나고, 성능이 우수              |
| **적합한 환경**              | 단순 동기화 요구                            | 고성능, 다중 스레드 환경                    |

#### 코드 비교

##### **SynchronizedMap 예제**
```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class SynchronizedMapExample {
    public static void main(String[] args) {
        Map<String, String> map = Collections.synchronizedMap(new HashMap<>());

        synchronized (map) { // 반복 작업 시 동기화 필요
            for (Map.Entry<String, String> entry : map.entrySet()) {
                System.out.println(entry.getKey() + ": " + entry.getValue());
            }
        }
    }
}
```

##### ConcurrentHashMap 예제
```java
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();

        // 동기화 필요 없음
        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```