---
layout: post
title: "자바의 HashMap 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# HashMap 컬렉션 

<hr>

## HashMap의 동작 원리

**`HashMap`**은 키-값(`Key-Value`) 쌍을 저장하는 데 사용되는 자바의 컬렉션으로, 내부적으로 **해시 테이블(Hash Table)** 자료구조를 사용합니다. 데이터를 저장, 검색, 삭제하는 데 효율적이며, 다음과 같은 방식으로 동작합니다.

### 저장 구조

`HashMap`은 내부적으로 배열과 연결 리스트(또는 트리)를 조합하여 데이터를 저장합니다.

- **배열**  
  해시 테이블의 주요 저장 공간으로, 각 요소는 **버킷(Bucket)** 역할을 합니다.

- **버킷**  
  동일한 해시 값을 가진 키들이 저장되는 공간으로, 연결 리스트(또는 트리)로 구현됩니다.

### 데이터 저장 (`put` 메서드)

- **해시 함수 계산**
  - 키(`Key`) 객체의 `hashCode()` 메서드를 호출하여 해시 값을 계산합니다.
  - 계산된 해시 값은 배열 인덱스로 변환됩니다.
- **버킷에 데이터 저장**
  - 계산된 인덱스를 기준으로 해당 버킷에 데이터를 저장합니다.
  - 동일한 인덱스에 여러 키가 저장될 경우, 연결 리스트 또는 트리 구조로 관리됩니다.

```java
Map<String, Integer> hashMap = new HashMap<>();
hashMap.put("apple", 1); // "apple"의 해시값을 계산해 저장
hashMap.put("banana", 2); // "banana"의 해시값을 계산해 저장
```

### 데이터 검색 (`get` 메서드)

1. **해시 함수 계산**
  - 검색하려는 키의 `hashCode()`를 계산하여 배열의 인덱스를 얻습니다.

2. **버킷 탐색**
  - 해당 버킷의 연결 리스트(또는 트리)에서 키를 비교(`equals`)하여 값을 찾습니다.

```java
int value = hashMap.get("apple"); // "apple"의 해시값을 계산해 값 검색
System.out.println(value); // 출력: 1
```

### 해시 충돌

**해시 충돌**은 서로 다른 키가 동일한 해시 값을 가지는 경우 발생합니다.  
이 문제를 해결하기 위해 `HashMap`은 **체이닝(Chaining)**과 **트리화(Treeification)**를 사용합니다.

- **체이닝**  
  동일한 해시 값을 가진 데이터를 연결 리스트로 저장.

- **트리화**  
  연결 리스트의 크기가 일정 수준을 초과하면, **이진 검색 트리**로 변환하여 성능을 개선.

**JDK 8 이후 HashMap 내부 동작**

```java
if (bucketSize >= TREEIFY_THRESHOLD) {
    // 연결 리스트를 트리로 변환
    bucket = treeify(bucket);
}
```

### 최악의 시간 복잡도

**최적의 경우**
- 해시 함수가 균등하게 동작하여 충돌이 발생하지 않을 경우,  
  데이터 접근, 삽입, 삭제 모두 **O(1)**.

**최악의 경우**
- 모든 키가 동일한 해시 값을 가지는 경우(심각한 해시 충돌),  
  연결 리스트 전체를 순회해야 하므로 **O(n)**.
- JDK 8 이후에는 연결 리스트가 트리로 변환되므로, 최악의 시간 복잡도는 **O(log n)**로 개선.

#### 시간 복잡도

| **작업**         | **최적 시간 복잡도** | **최악 시간 복잡도**       |
|------------------|----------------------|---------------------------|
| **삽입 (`put`)** | O(1)                | O(log n) (JDK 8 이후)     |
| **검색 (`get`)** | O(1)                | O(log n) (JDK 8 이후)     |
| **삭제 (`remove`)** | O(1)              | O(log n) (JDK 8 이후)     |


```java
import java.util.HashMap;

public class HashMapCollisionTest {
    public static void main(String[] args) {
        // 해시 충돌을 유발하는 키 생성
        HashMap<Key, Integer> hashMap = new HashMap<>();
        for (int i = 0; i < 10000; i++) {
            hashMap.put(new Key("key" + i), i);
        }

        long startTime = System.nanoTime();
        System.out.println(hashMap.get(new Key("key9999"))); // 값 검색
        long endTime = System.nanoTime();

        System.out.println("검색 시간: " + (endTime - startTime) + "ns");
    }

    static class Key {
        String key;

        Key(String key) {
            this.key = key;
        }

        @Override
        public int hashCode() {
            return 42; // 모든 키가 동일한 해시 값을 가지도록 설정
        }

        @Override
        public boolean equals(Object obj) {
            return obj instanceof Key && this.key.equals(((Key) obj).key);
        }
    }
}
```
