---
title: "SynchronizedList와 CopyOnWriteArrayList의 차이"
date: 2024-11-22 00:00:00
tags: 
  - Java
---

## SynchronizedList와 CopyOnWriteArrayList의 차이

### **SynchronizedList**
`Collections.synchronizedList`를 사용해 기존 리스트를 동기화된 형태로 래핑한 클래스다.
- **특징**:
    1. 내부적으로 **모든 메서드가 동기화**(`synchronized`)되어 다중 스레드에서 안전하게 사용 가능.
    2. 읽기 및 쓰기 작업 모두 락을 사용하여 성능이 저하될 수 있음.
    3. 반복(iteration) 작업은 추가로 동기화가 필요.
       ```java
       List<String> list = Collections.synchronizedList(new ArrayList<>());
  
       synchronized (list) { // 반복 작업 시 동기화 필요
           for (String item : list) {
               System.out.println(item);
            }
       }
       ```

- **장점**:
    - 간단한 동기화 구현.
    - 기존 `ArrayList` 또는 `LinkedList`를 동기화된 형태로 변환 가능.

- **단점**:
    - 읽기 작업과 쓰기 작업 간의 **불필요한 락 경쟁**으로 인해 성능 저하.
    - 반복 작업 시 동기화 코드를 추가해야 함.

---

### CopyOnWriteArrayList
Java Concurrency API(`java.util.concurrent`)에서 제공하는 동기화 리스트 구현체다.
- **특징**:
    1. 쓰기 작업 시, 내부 배열을 **복사(Copy)**하여 새로 작성.
    2. **읽기 작업은 락 없이** 수행 가능.
    3. 반복 작업 중에도 쓰기 작업이 가능하며, **ConcurrentModificationException**이 발생하지 않음.

- **장점**:
    - 읽기 작업이 많고 쓰기 작업이 적은 환경에서 성능이 우수.
    - 반복 작업 중에도 안정적이며 동기화 필요 없음.

- **단점**:
    - 쓰기 작업 시 배열을 복사하므로 **메모리 사용량** 증가.
    - 쓰기 작업이 많으면 성능 저하.

**예제 코드**:
```java
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteExample {
    public static void main(String[] args) {
        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
        list.add("A");
        list.add("B");

        for (String item : list) {
            list.add("C"); // 반복 중 추가 가능
            System.out.println(item);
        }
    }
}
```

### **사용 시 선택 기준**
- **SynchronizedList**:
    - 간단히 동기화를 구현해야 할 때.
    - 읽기와 쓰기 작업이 균등하게 발생하는 환경.

- **CopyOnWriteArrayList**:
    - 읽기 작업이 대부분이고, 쓰기 작업이 드문 환경.
    - 반복 작업 중에도 안전한 동기화가 필요한 경우.
