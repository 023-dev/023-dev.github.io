---
layout: post
title: "Vector와 Hashtable 그리고 Collections.SynchronizedXXX"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

# Vector와 Hashtable 그리고 Collections.SynchronizedXXX

synchronized의 오해와 사실에 대해 설명하는 글이다.

<hr>

## Vector와 Hashtable의 문제점

---

`Vector`와 `Hashtable`은 Java 1.0부터 제공된 **Thread-Safe 클래스**로, 모든 메서드에 동기화(`synchronized`)가 적용되어 있습니다. 하지만 이로 인해 다음과 같은 문제가 발생합니다:

### 과도한 동기화로 인한 성능 저하
- 모든 메서드에 동기화가 적용되므로 불필요한 락 경합이 발생.
- 단일 작업이 동기화 필요가 없더라도 무조건 동기화를 수행.

```java
Vector<Integer> vector = new Vector<>();
vector.add(1); // 동기화 불필요한 상황에서도 동기화 적용
```

### 스레드 안전하지만 반복 작업에서 문제 발생

---

- 반복문(`for` 또는 `Iterator`)에서 동기화가 적용되지 않아 **ConcurrentModificationException** 발생 가능.

```java
Vector<Integer> vector = new Vector<>();
vector.add(1);
vector.add(2);

for (Integer num : vector) {
    if (num == 1) {
        vector.remove(num); // ConcurrentModificationException 가능
    }
}
```

### 해결 방법

---

반복 작업 시 외부 동기화 필요:

```java
synchronized (vector) {
    Iterator<Integer> iterator = vector.iterator();
    while (iterator.hasNext()) {
        Integer num = iterator.next();
        if (num == 1) {
            iterator.remove();
        }
    }
}
```

### 스레드 간 비효율적 공유

---

- `Vector`와 `Hashtable`은 전체 객체에 대해 락을 걸어, 병렬 처리 성능 저하.
- 특히 읽기 작업과 쓰기 작업이 동시에 발생할 때 성능 문제가 심각.

**대안**:
- `CopyOnWriteArrayList` 또는 `ConcurrentHashMap` 사용.


## Collections.synchronizedXXX의 문제점

---

`Collections.synchronizedList`, `Collections.synchronizedMap` 등은 비동기화된 컬렉션을 감싸 동기화된 컬렉션을 제공합니다. 하지만 아래와 같은 한계가 있습니다:

### 반복 작업에서 동기화 미적용

---

- 동기화된 컬렉션이라도 반복 작업에서 동기화를 추가적으로 적용하지 않으면 **ConcurrentModificationException** 발생 가능.

```java
List<Integer> synchronizedList = Collections.synchronizedList(new ArrayList<>());
synchronizedList.add(1);
synchronizedList.add(2);

// 반복 작업 중 다른 스레드가 수정 시 ConcurrentModificationException 발생 가능
for (Integer num : synchronizedList) {
    if (num == 1) {
        synchronizedList.remove(num); // 문제 발생 가능
    }
}
```

### 해결 방법

---

반복 작업 시 동기화 추가 필요:

```java
synchronized (synchronizedList) {
    Iterator<Integer> iterator = synchronizedList.iterator();
    while (iterator.hasNext()) {
        Integer num = iterator.next();
        if (num == 1) {
            iterator.remove();
        }
    }
}
```

### 성능 저하

---

- 동기화가 컬렉션 전체에 적용되어, 읽기와 쓰기 작업 모두 불필요한 락 경합이 발생.
- 대량의 읽기 작업이 필요한 경우 성능 심각.

#### 대안

- **읽기 작업이 많은 경우**: `CopyOnWriteArrayList`, `CopyOnWriteArraySet`.
- **읽기와 쓰기가 혼재**: `ConcurrentHashMap`.


## Vector, Hashtable, Collections.synchronizedXXX의 공통 문제점

---

### 모든 메서드에 동기화 적용

---

- 개별 메서드가 동기화되지만, 메서드 간 조합 작업은 안전하지 않음.

```java
Vector<Integer> vector = new Vector<>();
if (!vector.isEmpty()) { // 이 시점에서 다른 스레드가 vector를 변경할 가능성 있음
    vector.remove(0); // Thread-Safe 보장 안 됨
}
```

**해결 방법**:
- 동기화 블록으로 감싸야 안전:
```java
synchronized (vector) {
    if (!vector.isEmpty()) {
        vector.remove(0);
    }
}
```

### 대규모 동시성 작업에서 비효율**

---

- 동기화된 컬렉션은 단일 락으로 모든 작업을 제어.
- 멀티코어 환경에서 병렬성을 활용하지 못해 성능이 제한.

### 대안: Modern Concurrent Collections

---

| **문제**                               | **대안**                            | **설명**                                                                 |
|----------------------------------------|-------------------------------------|--------------------------------------------------------------------------|
| 과도한 락으로 인한 성능 저하            | **ConcurrentHashMap**               | 세그먼트 또는 버킷 단위의 락으로 병렬 처리 가능.                          |
| 반복 작업에서의 동기화 문제             | **CopyOnWriteArrayList**            | 반복 중에는 읽기 전용, 수정 시 전체 복사.                                 |
| 메서드 간 조합 작업의 비안전성          | **Lock-Free 데이터 구조**            | `Atomic` 클래스 또는 고수준 동기화 컬렉션 활용.                           |

## 마치며

---

1. `Vector`, `Hashtable`, `Collections.synchronizedXXX`는 **초기 Java 버전**의 동기화된 컬렉션으로, 모든 메서드에 동기화를 적용해 간단한 동시성을 제공하지만, 성능 저하 및 병렬 처리 비효율 문제를 가짐.
2. 반복 작업에서는 외부 동기화가 필요하므로, Thread-Safe 특성을 완전히 보장하지 못함.
3. 현대적인 대안인 `ConcurrentHashMap`, `CopyOnWriteArrayList`, `Atomic` 클래스를 사용하면 높은 성능과 안전성을 모두 확보 가능.