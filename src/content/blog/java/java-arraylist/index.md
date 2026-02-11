---
visible: false
title: "ArrayList 컬렉션"
date: 2024-11-17 00:00:00
tags: 
  - Java
---

# ArrayList 컬렉션

<hr>

`ArrayList`는 자바의 컬렉션 프레임워크에서 배열 기반으로 동작하는 `List` 인터페이스의 구현체 중 하나로 가장 많이 사용되는 컬렉션에 속한다.
이 글에서는 자바의 `ArrayList` 컬렉션에 대해 다른 컬렉션들과 비교를 하며 알아보겠다.

## ArrayList 특징

먼저 `ArrayList`의 특징에 대해서 알아보자.

- 연속적인 데이터 저장
    - 데이터는 연속적으로 저장되며, 리스트 중간에 빈 공간이 생기지 않는다.
- 내부 구조
    - 내부적으로 `Object[]` 배열을 사용하여 데이터를 저장한다.
- 빠른 접근성
    - 배열 기반이기 때문에 인덱스를 이용해 요소에 빠르게 접근할 수 있다.
- 가변적인 크기
    - 배열과 달리, `ArrayList`는 데이터 적재량에 따라 크기를 동적으로 늘리거나 줄일 수 있다.
    - 단, 배열 공간이 꽉 찰 때마다 새로운 배열을 생성하고 기존 데이터를 **복사(`copy`)**하는 방식으로 크기를 확장하므로,
    - 이 과정에서 성능 지연이 발생할 수 있다.
- 삽입/삭제 성능
    - 리스트 중간에 데이터를 삽입/삭제할 경우, 중간의 빈 공간을 방지하기 위해 요소들을 자동으로 이동시킨다.
    - 이로 인해 삽입/삭제 성능이 낮다.

이러한 특징으로 `ArrayList`는 데이터 조회가 빈번한 경우에 사용하기 적합하다.

# 다른 컬렉션과 비교를 통해 이해하기

<hr>

## ArrayList vs 배열 비교

위에서 `ArrayList`는 배열을 기반으로 설계되었다고 나왔는데 그러면 배열과 어떠한 차이점이 있어 사용되는지 알아보도록하자.

### 선언 및 초기화

- 배열: 크기를 명시적으로 지정하며, 크기가 고정된다.

```java
// 배열 선언 및 초기화
int[] arr = new int[5]; // 크기 고정
arr[0] = 10; // 데이터 추가
System.out.println(arr[0]); // 출력: 10
```

- `ArrayList`: 크기를 초기화하지 않아도 사용 가능하며, 데이터가 추가되면 크기가 동적으로 조정된다.

```java
// ArrayList 선언 및 초기화
ArrayList<Integer> arrayList = new ArrayList<>();
arrayList.add(10); // 데이터 추가
System.out.println(arrayList.get(0)); // 출력: 10
```

### 용량 가변성

- **배열**:
    - 크기가 고정되어 생성 후 변경할 수 없다.
    - 크기를 변경하려면 새로운 배열을 생성하고 데이터를 복사해야 한다.

```java
int[] arr = {1, 2, 3};
int[] newArr = new int[5]; // 새로운 배열 생성
System.arraycopy(arr, 0, newArr, 0, arr.length); // 데이터 복사
newArr[3] = 4; // 추가 데이터
System.out.println(Arrays.toString(newArr)); // 출력: [1, 2, 3, 4, 0]
```

- **`ArrayList`**:
    - 크기가 동적으로 조정된다.
    - 내부적으로 배열을 사용하며, 배열 공간이 부족하면 새로운 배열을 생성하고 데이터를 복사한다.

```java
ArrayList<Integer> arrayList = new ArrayList<>();
arrayList.add(1);
arrayList.add(2);
arrayList.add(3);
// 동적 크기 조정
arrayList.add(4);
System.out.println(arrayList); // 출력: [1, 2, 3, 4]
```

### 데이터 접근

- **배열**:
    - 인덱스를 통해 데이터를 직접 접근할 수 있다.
    - 접근 속도는 **O(1)**.

```java
int[] arr = {10, 20, 30};
System.out.println(arr[1]); // 출력: 20
```

- **`ArrayList`**:
    - 배열과 동일하게 인덱스를 통해 데이터를 접근할 수 있다.
    - 내부적으로 배열을 사용하므로 접근 속도는 **O(1)**.

```java
ArrayList<Integer> arrayList = new ArrayList<>(Arrays.asList(10, 20, 30));
System.out.println(arrayList.get(1)); // 출력: 20
```

### 데이터 삽입/삭제

- **배열**:
    - 특정 위치에 데이터를 삽입하거나 삭제할 때 모든 요소를 이동해야 한다.
    - 삽입/삭제 속도는 **O(n)**.

```java
int[] arr = {1, 2, 4, 5};
int[] newArr = new int[5]; // 새로운 배열 생성
System.arraycopy(arr, 0, newArr, 0, 2); // 기존 데이터 복사
newArr[2] = 3; // 삽입
System.arraycopy(arr, 2, newArr, 3, 2); // 나머지 데이터 복사
System.out.println(Arrays.toString(newArr)); // 출력: [1, 2, 3, 4, 5]
```

- **`ArrayList`**:
    - 배열과 마찬가지로 삽입/삭제 시 요소를 이동시켜야 하지만, 추가 메서드(`add`, `remove`)로 쉽게 처리할 수 있다.
    - 삽입/삭제 속도는 **`O(n)`**.

```java
ArrayList<Integer> arrayList = new ArrayList<>(Arrays.asList(1, 2, 4, 5));
arrayList.add(2, 3); // 2번 인덱스에 삽입
System.out.println(arrayList); // 출력: [1, 2, 3, 4, 5]
arrayList.remove(2); // 2번 인덱스 삭제
System.out.println(arrayList); // 출력: [1, 2, 4, 5]
```

### 메모리 사용 및 성능

- **배열**:
    - 고정 크기이므로 메모리를 미리 할당한다.
    - 메모리 사용 효율이 높고, 복사 비용이 없다.

- **`ArrayList`**:
    - 크기가 동적으로 변경되므로 내부적으로 더 많은 메모리를 할당한다.
    - 크기가 부족할 때 새로운 배열을 생성하고 기존 데이터를 복사하는 비용이 발생한다.
    - 디폴트로 1.5배 크기로 확장된다.

**`ArrayList` 내부 동작 코드 예시** (JDK 8):

```java
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 기존 크기의 1.5배
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

## ArrayList vs LinkedList 비교

`ArrayList`와 `LinkedList`는 모두 **리스트** 인터페이스를 구현한 컬렉션으로, 데이터 저장 및 관리에 사용된다.  
그러나 내부 구조와 동작 방식에서 큰 차이가 있어, 사용 목적과 상황에 따라 선택해야 한다.

### 내부 구조

- **`ArrayList`**
    - 내부적으로 **배열**을 사용하여 데이터를 저장한다.
    - 요소들은 배열의 인덱스로 접근하며, 연속적인 메모리 공간에 저장된다.

```java
// ArrayList 내부 구조 예제
ArrayList<Integer> arrayList = new ArrayList<>();
arrayList.add(10); // 배열의 끝에 추가
System.out.println(arrayList.get(0)); // 인덱스를 통해 접근
```

- **`LinkedList`**
    - **이중 연결 리스트**(`Doubly Linked List`)로 구현된다.
    - 각 요소는 데이터와 함께 다음 요소 및 이전 요소를 가리키는 포인터를 가진 노드로 구성된다.

```java
// LinkedList 내부 구조 예제
LinkedList<Integer> linkedList = new LinkedList<>();
linkedList.add(10); // 노드로 데이터 추가
System.out.println(linkedList.get(0)); // 순차적으로 접근
```

### 데이터 접근

- **`ArrayList`**
    - 배열 기반이므로 **임의 요소 접근**이 빠르다.
    - 시간 복잡도: **`O(1)`**.

```java
ArrayList<Integer> arrayList = new ArrayList<>(Arrays.asList(10, 20, 30));
System.out.println(arrayList.get(1)); // 출력: 20
```

- **`LinkedList`**
    - 노드를 따라가며 순차적으로 접근해야 하므로, **임의 요소 접근**이 느리다.
    - 시간 복잡도: **`O(n)`**.

```java
LinkedList<Integer> linkedList = new LinkedList<>(Arrays.asList(10, 20, 30));
System.out.println(linkedList.get(1)); // 출력: 20 (노드를 순차적으로 탐색)
```

### 데이터 삽입/삭제

- **`ArrayList`**
    - 중간 삽입/삭제 시, 나머지 요소들을 **이동**해야 하므로 속도가 느리다.
    - 시간 복잡도: **O(n)** (중간 삽입/삭제), **O(1)** (끝에 추가).

```java
ArrayList<Integer> arrayList = new ArrayList<>(Arrays.asList(10, 20, 30));
arrayList.add(1, 15); // 1번 인덱스에 삽입
System.out.println(arrayList); // 출력: [10, 15, 20, 30]
```

- **`LinkedList`**
    - 연결 리스트 구조 덕분에 중간 삽입/삭제 시 노드 포인터만 변경하면 되므로 속도가 빠르다.
    - 시간 복잡도: **O(1)** (노드 참조 후 삽입/삭제).

```java
LinkedList<Integer> linkedList = new LinkedList<>(Arrays.asList(10, 20, 30));
linkedList.add(1, 15); // 1번 인덱스에 삽입
System.out.println(linkedList); // 출력: [10, 15, 20, 30]
```

### 메모리 사용

- **`ArrayList`**
    - 연속적인 메모리 공간을 사용하며, 크기가 부족할 경우 기존 데이터를 새로운 배열로 복사해야 한다.
    - 배열의 크기는 기본적으로 1.5배씩 증가한다.

```java
// ArrayList 동적 크기 증가 코드 (JDK 8 내부 구현)
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 기존 크기의 1.5배
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

- **`LinkedList`**
    - 각 노드가 데이터와 함께 두 개의 포인터(다음 및 이전 노드 참조)를 저장하므로, 메모리 사용량이 더 많다.


## 성능 비교 요약

| **기능**             | **ArrayList**                           | **LinkedList**                         |
|---------------------|----------------------------------------|---------------------------------------|
| **임의 요소 접근**    | 빠름 (**O(1)**)                         | 느림 (**O(n)**)                        |
| **중간 삽입/삭제**    | 느림 (**O(n)**, 데이터 이동 필요)          | 빠름 (**O(1)**, 포인터 변경만 필요)      |
| **순차 접근**         | 빠름 (**O(n)**)                         | 빠름 (**O(n)**)                        |
| **메모리 사용**       | 적음 (배열만 저장)                        | 많음 (노드와 포인터 저장)                |
| **크기 조정**         | 동적 크기 조정 (복사 비용 발생)             | 필요 없음                               |

---

### 사용 사례

| **상황**                                 | **ArrayList** 추천                           | **LinkedList** 추천                     |
|-----------------------------------------|--------------------------------------------|----------------------------------------|
| **조회 작업이 많은 경우**                 | 빠른 접근 속도로 적합                         | 적합하지 않음                           |
| **삽입/삭제 작업이 많은 경우**             | 삽입/삭제가 적은 경우 적합                    | 삽입/삭제가 많은 경우 적합               |
| **데이터 크기가 자주 변경되는 경우**        | 동적 크기 조정이 자동으로 이루어짐             | 데이터 크기 변경 시 적합하지 않음          |
| **메모리 효율성이 중요한 경우**            | 적합 (메모리 사용량이 낮음)                   | 비적합 (메모리 사용량이 높음)             |

---

- **ArrayList**는 데이터 조회가 많고 삽입/삭제가 적은 작업에 적합하다.
- **LinkedList**는 데이터 삽입/삭제가 빈번한 작업에 적합하다.

### 조회와 삽입/삭제 비교

```java
import java.util.*;

public class ListComparison {
    public static void main(String[] args) {
        int n = 100000; // 데이터 개수

        // ArrayList 테스트
        List<Integer> arrayList = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            arrayList.add(i); // 데이터 추가
        }
        long start = System.nanoTime();
        arrayList.get(n / 2); // 중간 요소 접근
        long end = System.nanoTime();
        System.out.println("ArrayList 조회 시간: " + (end - start) + "ns");

        start = System.nanoTime();
        arrayList.add(n / 2, -1); // 중간에 삽입
        end = System.nanoTime();
        System.out.println("ArrayList 삽입 시간: " + (end - start) + "ns");

        // LinkedList 테스트
        List<Integer> linkedList = new LinkedList<>();
        for (int i = 0; i < n; i++) {
            linkedList.add(i); // 데이터 추가
        }
        start = System.nanoTime();
        linkedList.get(n / 2); // 중간 요소 접근
        end = System.nanoTime();
        System.out.println("LinkedList 조회 시간: " + (end - start) + "ns");

        start = System.nanoTime();
        linkedList.add(n / 2, -1); // 중간에 삽입
        end = System.nanoTime();
        System.out.println("LinkedList 삽입 시간: " + (end - start) + "ns");
    }
}
```


## ArrayList vs Vector 비교

`ArrayList`와 `Vector`는 모두 **리스트 인터페이스**를 구현한 컬렉션으로, 내부적으로 배열을 기반으로 데이터를 관리합니다.  
하지만, 동작 방식과 사용 목적에서 몇 가지 차이점이 있습니다.


### 내부 구조 및 동작

- **`ArrayList`**
    - 내부적으로 **비동기적**으로 동작합니다.
    - 멀티스레드 환경에서 동기화가 지원되지 않으므로 동시성 문제를 처리하려면 별도의 동기화 작업이 필요합니다.

```java
ArrayList<Integer> arrayList = new ArrayList<>();
arrayList.add(10);
arrayList.add(20);
System.out.println(arrayList); // 출력: [10, 20]
```

- **`Vector`**
    - 내부적으로 **동기화**된 메서드가 사용되므로 `Thread-Safe`합니다.
    - 멀티스레드 환경에서 안전하게 사용할 수 있지만, 단일 스레드 환경에서는 불필요한 성능 오버헤드가 발생합니다.

```java
Vector<Integer> vector = new Vector<>();
vector.add(10);
vector.add(20);
System.out.println(vector); // 출력: [10, 20]
```

### 동기화 (Thread-Safety)

- **`ArrayList`**
    - 동기화를 지원하지 않으므로 단일 스레드 환경에서 사용이 적합합니다.
    - 멀티스레드 환경에서 동기화를 적용하려면 `Collections.synchronizedList()`를 사용해야 합니다.

```java
List<Integer> synchronizedArrayList = Collections.synchronizedList(new ArrayList<>());
synchronizedArrayList.add(10);
synchronizedArrayList.add(20);
System.out.println(synchronizedArrayList); // 출력: [10, 20]
```

- **`Vector`**
    - 메서드 자체에 동기화가 적용되어 있으므로 멀티스레드 환경에서 안전하게 사용할 수 있습니다.
    - 하지만 동기화로 인해 단일 스레드 환경에서는 성능이 떨어집니다.

```java
Vector<Integer> vector = new Vector<>();
vector.add(10);
vector.add(20);
System.out.println(vector); // 출력: [10, 20]
```

### 크기 조정

- **`ArrayList`**
    - 배열의 크기가 부족할 때 **기본적으로 1.5배**로 크기를 늘립니다.
    - 동적 크기 조정이 효율적이며 메모리 사용을 최적화합니다.

```java
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 1.5배 크기 증가
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

- **`Vector`**
- 배열의 크기가 부족할 때 **기본적으로 2배**로 크기를 늘립니다.
- 메모리 낭비가 발생할 가능성이 높습니다.

```java
private void ensureCapacityHelper(int minCapacity) {
    if (elementData.length - minCapacity < 0)
        grow(minCapacity);
}

private void grow(int minCapacity) {
    int newCapacity = elementData.length * 2; // 2배 크기 증가
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

### 성능 비교

| **기능**                | **ArrayList**                      | **Vector**                         |
|------------------------|----------------------------------|-----------------------------------|
| **Thread-Safe 여부**    | 비동기적 (Thread-Safe 아님)          | 동기적 (Thread-Safe 지원)           |
| **멀티스레드 환경**      | 추가 동기화가 필요 (`synchronizedList`) | 멀티스레드 환경에 적합               |
| **단일 스레드 환경**      | 적합 (불필요한 동기화 없음)            | 부적합 (불필요한 동기화로 성능 저하)   |
| **동적 크기 조정**        | 1.5배씩 크기 증가                    | 2배씩 크기 증가                     |
| **삽입/삭제 성능**        | 빠름 (단일 스레드 환경)               | 느림 (동기화 오버헤드)                |
| **메모리 효율성**         | 메모리 사용 효율적                    | 메모리 낭비 가능성 있음                |


### 사용 사례

| **상황**                                   | **ArrayList** 추천                           | **Vector** 추천                           |
|-------------------------------------------|--------------------------------------------|------------------------------------------|
| **단일 스레드 환경**                       | 적합                                       | 부적합                                   |
| **멀티스레드 환경**                         | `Collections.synchronizedList`로 동기화 필요 | 기본적으로 `Thread-Safe`라 적합            |
| **메모리 효율성이 중요한 경우**              | 효율적 (1.5배 동적 증가)                     | 비효율적 (2배 동적 증가)                   |
| **성능이 중요한 경우**                      | 성능에 민감한 작업에서 적합                  | 성능 저하가 발생하므로 비적합               |

### ArrayList와 Vector의 성능 비교

```java
import java.util.ArrayList;
import java.util.Vector;

public class ListPerformanceComparison {
    public static void main(String[] args) {
        int n = 100000; // 데이터 개수

        // ArrayList 테스트
        ArrayList<Integer> arrayList = new ArrayList<>();
        long start = System.nanoTime();
        for (int i = 0; i < n; i++) {
            arrayList.add(i);
        }
        long end = System.nanoTime();
        System.out.println("ArrayList 데이터 추가 시간: " + (end - start) + "ns");

        // Vector 테스트
        Vector<Integer> vector = new Vector<>();
        start = System.nanoTime();
        for (int i = 0; i < n; i++) {
            vector.add(i);
        }
        end = System.nanoTime();
        System.out.println("Vector 데이터 추가 시간: " + (end - start) + "ns");
    }
}
```