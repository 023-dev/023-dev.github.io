---
layout: post
title: "자바의 Collection Framework 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

자바에서는 컬렉션 프레임워크(Java Collection Framework)을 제공한다. 이는 자바 프로그래밍을 하면서 없어서는 안되는 필수적인 요소이다.
이 글에서는 자바의 컬렉션 프레임워크에 대해 알아본다.

# 자바 컬렉션 프레임워크

<hr>

자바 컬렉션 프레임워크에서 컬렉션(`Collection`)이란 무엇인지 부터 알아보자.
컬렉션은 다수의 요소를 하나의 그룹으로 묶어 효율적으로 저장하고 관리할 수 있는 기능을 제공하는 일종의 **컨테이너(`Container`)**라고 이해할 수 있다.
그렇다면 컬렉션 프레임워크를 사용하면 어떤 이점이 있는지 살펴보자.

## 컬렉션 프레임워크의 장점

컬렉션 프레임워크는 아래와 같은 장점을 제공한다.


- 가변적인 저장 공간을 제공하여 고정된 크기의 배열보다 유연하다.
- 컬렉션 프레임워크는 인터페이스와 다형성을 이용한 객체지향적 설계를 기반으로 다양한 클래스에서 일관된 방식으로 데이터를 다룰 수 있다.
- 다양한 자료구조와 최적화된 효율적인 알고리즘이 구현된 채로 제공되어 직접 작성할 필요가 없다.

> 자바의 컬렉션 프레임워크는 객체(`Object`)만 저장할 수 있다.
> 원시 타입(`int`, `double`, etc.)은 컬렉션에 직접 저장할 수 없으며, 이를 **래퍼 클래스(`Wrapper Class`)로 변환하는 박싱(Boxing) 과정**을 거쳐야 한다.
> 컬렉션은 객체의 참조값(주소값)을 저장하므로, 특별한 값인 `null`도 저장이 가능하다.
> `null`을 저장한다는 것은 아무 객체도 참조하지 않는다는 의미이다.

# 컬렉션 프레임워크의 계층구조

<hr>

<div class="mermaid"> 
    graph TD;
    Iterable --> Collection
    Collection --> List
    Collection --> Queue
    Collection --> Set
    List --> ArrayList
    List --> LinkedList
    List --> Vector
    List --> Stack
    Queue --> PriorityQueue
    Queue --> Deque
    Deque --> LinkedList
    Deque --> ArrayDeque
    Set --> HashSet
    Set --> LinkedHashSet
    Set --> SortedSet
    SortedSet --> TreeSet
    Map --> HashMap
    Map --> HashTable
    Map --> SortedMap
    SortedMap --> TreeMap
</div>

컬렉션 프레임 워크는 크게 `Collection` 인터페이스와 `Map` 인터페이스로 나뉜다.
- `Collection` 인터페이스는 `List`, `Set`, `Queue`의 공통 부분을 정의하고 있다.
- `Map` 인터페이스는 키(`Key`)-값(`Value`) 쌍을 다루며, `Collection` 인터페이스와는 별도로 설계되었다.


> 대부분의 컬렉션 클래스는 List, Set, Map 중 하나의 인터페이스를 구현하며, 구현한 인터페이스의 이름이 클래스 이름에 포함된다. 
> (e.g., ArrayList, HashSet, HashMap, etc.)<br>
> 하지만 Vector, Stack, Hashtable과 같은 클래스는 컬렉션 프레임워크가 도입되기 이전에 만들어진 클래스들로, 컬렉션 프레임워크의 명명 규칙을 따르지 않는다.
> 이들 클래스는 호환성을 위해 남아 있는 것으로, 가급적 사용하지 않는 것이 권장된다.

## Iterable 인터페이스

<div class="mermaid"> 
    graph TD;
    Iterable --> Collection
</div>

`Iterable` 인터페이스는 자바 컬렉션 인터페이스 계층 구조에서 가장 최상위에 위치한 인터페이스이다.
컬렉션을 다룰 때 자료를 순회하기 위해 사용하는 이터레이터(`iterator`) 객체를 관리하는 역할을 한다고 볼 수 있다.

- 컬렉션의 최상위 인터페이스로 모든 컬렉션 클래스가 Iterable 인터페이스를 상속받아 구현된다.
- 컬렉션을 순회하는 데 필요한 이터레이터 객체를 반환하는 메서드를 제공한다

### 메서드

- `default void forEach(Consumer<? super T> action)`: 함수형 프로그래밍을 지원하는 메서드로, 주어진 람다식을 사용해 컬렉션 요소를 순회할 수 있다.
- `Iterator<T> iterator()`: 컬렉션에 저장된 요소들을 순회할 수 있는 이터레이터 객체를 반환한다.
- `default Spliterator<T> spliterator()`: 병렬 처리를 위한 파이프라이닝 관련 메서드로, 데이터를 분할하여 처리하는 데 사용된다.

> `Map`은 `Iterable` 인터페이스를 상속받지 않으므로 `iterator()`와 `spliterator()` 메서드가 구현되어 있지 않다. 
> 따라서 `Map` 컬렉션을 직접 순회할 수 없으며, 다음과 같은 간접적인 방법을 사용해야 한다
> - 키(`key`) 또는 값(`value`)를 별도의 컬렉션으로 변환하여 순회하는 방법
>   - e.g., `map.keySet()`, `map.values()`
> - `Stream` API를 사용해 순회하는 방법
>   - e.g., `map.entrySet().stream()`

## Collection 인터페이스

<div class="mermaid"> 
    graph TD;
    Iterable --> Collection
    Collection --> List
    Collection --> Queue
    Collection --> Set
</div>

Collection 인터페이스는 `List`, `Set`, `Queue` 인터페이스의 공통된 기능을 정의한 최상위 컬렉션 타입이다.

- 다형성을 지원하여 업캐스팅을 사용해 여러 컬렉션 타입(`List`, `Set`, `Queue`)을 동일한 방식으로 처리할 수 있다.
- 공통 작업(삽입, 탐색, 삭제, 변환, etc.) 을 수행하는 데 필요한 메서드를 정의한다.

### 메소드

- `boolean add(Object o)`: 지정된 객체를 컬렉션에 추가한다.
- `boolean addAll(Collection c)`: 지정된 컬렉션에 포함된 객체들을 컬렉션에 추가한다.
- `boolean contains(Object o)`: 지정된 객체가 컬렉션에 포함되어 있는지 확인한다.
- `boolean containsAll(Collection c)`: 지정된 컬렉션의 모든 객체가 현재 컬렉션에 포함되어 있는지 확인한다.
- `boolean remove(Object o)`: 지정된 객체를 컬렉션에서 삭제한다.
- `boolean removeAll(Collection c)`: 지정된 컬렉션에 포함된 객체들을 모두 삭제한다.
- `boolean retainAll(Collection c)`: 지정된 컬렉션에 포함된 객체만 남기고 나머지는 삭제한다. (교집합 연산과 유사)
- `void clear()`: 컬렉션의 모든 객체를 삭제한다.
- `boolean isEmpty()`: 컬렉션이 비어 있는지 확인한다.
- `int size()`: 컬렉션에 저장된 객체의 개수를 반환한다.
- `boolean equals(Object o)`: 두 컬렉션이 동일한지 비교한다.
- `int hashCode()`: 컬렉션의 해시 코드를 반환한다.
- `Iterator iterator()`: 컬렉션을 순회할 수 있는 이터레이터를 반환한다.
- `Object[] toArray()`: 컬렉션의 객체를 객체 배열(`Object[]`)로 반환한다.
- `<T> T[] toArray(T[] a)`: 지정된 배열에 컬렉션의 객체를 저장하여 반환한다.
- `default Stream stream()`: 컬렉션 데이터를 스트림으로 반환한다.
- `default Stream parallelStream()`: 병렬 스트림 반환한다.
- `default boolean removeIf(Predicate<? super E> filter)`: 조건에 맞는 요소를 컬렉션에서 제거한다.
- `default void forEach(Consumer<? super T> action)`: 람다식을 이용한 요소 순회한다.

```java
Collection<Number> col1 = new ArrayList<>();
col1.add(1);

Collection<Number> col2 = new HashSet<>();
col1.add(1);

Collection<Number> col3 = new LinkedList<>();
col1.add(1);
```

> `Collection` 인터페이스를 보면 요소(객체)에 대한 추가, 삭제, 탐색은 가능하지만, 데이터를 직접 **조회(get)**하는 메서드는 포함되어 있지 않다.
> 이는 각 컬렉션이 사용하는 자료 구조가 다르기 때문에, 최상위 타입에서 통일된 방식으로 데이터를 조회하기가 어렵기 때문이다.

## List 인터페이스

<div class="mermaid"> 
    graph TD;
    List --> ArrayList
    List --> LinkedList
    List --> Vector
    List --> Stack
</div>

- 요소가 추가된 순서대로 저장된다.
- 동일한 값을 가진 요소를 여러 번 저장할 수 있다.
- 배열과 달리 크기가 고정되지 않으며 데이터 양에 따라 동적으로 늘어나거나 줄어든다.
- 요소 간 빈 공간을 허용하지 않으므로 삽입/삭제 시 배열 이동이 발생한다.
- 요소 사이에 빈공간을 허용하지 않아 삽입/삭제 할때마다 배열 이동이 일어난다

### 메서드

- `void add(int index, Object element)`: 지정된 위치(`index`)에 객체(`element`)를 추가한다.
- `boolean addAll(int index, Collection c)`: 지정된 위치에 컬렉션의 모든 객체를 추가한다.
- `Object remove(int index)`: 지정된 위치의 객체를 삭제하고 반환한다.
- `Object get(int index)`: 지정된 위치의 객체를 반환한다.
- `Object set(int index, Object element)`: 지정된 위치의 객체를 새로운 객체로 대체한다.
- `int indexOf(Object o)`: 지정된 객체의 첫 번째 위치(`index`)를 반환한다.
- `int lastIndexOf(Object o)`: 지정된 객체의 마지막 위치를 반환한다.
- `List subList(int fromIndex, int toIndex)`: 지정된 범위의 객체들을 포함하는 서브 리스트를 반환한다.
- `void sort(Comparator c)`: 지정된 비교자를 사용하여 리스트를 정렬한다.
- `ListIterator listIterator()`: 리스트를 순회할 수 있는 `ListIterator` 객체를 반환한다.
- `ListIterator listIterator(int index)`: 지정된 위치부터 순회할 수 있는 `ListIterator`를 반환한다.

### ArrayList

- 배열 기반 리스트 
  - 내부적으로 배열을 사용하여 데이터를 저장한다.
- 장점
  - 저장 순서가 유지된다.
  - 중복 요소를 허용한다. 
  - 데이터 양에 따라 용량(`capacity`)이 동적으로 조정된다. 
  - **순차적 데이터 접근에 강점이 있어 조회 속도가 빠르다.**
- 단점
  - 삽입/삭제 속도가 느리다. (단, 맨 끝에 추가하거나 삭제하는 경우는 빠르다.)

```java
List<String> arrayList = new ArrayList<>();

arrayList.add("a");
arrayList.add("b");
arrayList.add("c");

arrayList.get(0);// "a"
```

### LinkedList

- 노드 기반 리스트
  - 배열이 아닌 노드를 연결하여 데이터를 저장한다.
- 장점
  - **중간 위치에 데이터를 삽입하거나 삭제할 때 성능이 우수하다.**
  - `LinkedList`는 양방향 연결 리스트(`Doubly LinkedList`)로 구성되어 있어 양쪽에서 접근이 가능하다.
- 단점
  - 임의 위치의 요소에 대한 접근 속도가 느리다.
- 다목적 활용 가능
  - `LinkedList`는 리스트 외에도 자료구조(스택, 큐, 덱, 트리, etc.)를 구현하는 데 사용된다.

```java
List<String> linkedList = new LinkedList<>();

linkedList.add("a");
linkedList.add("b");
linkedList.add("c");

linkedList.get(0); // "a"
```

### Vector 클래스

- `ArrayList`의 레거시 버전으로 내부 구현이 거의 동일하다.
- 차이점
  - 모든 메서드가 `synchronized`로 처리되어 `Thread-Safe`하다.
- 현재는 사용하지 않는 것을 권장
  - 구버전 자바와의 호환성을 위해 남겨두었으나, 잘 사용되지 않는다.

> 동기화가 필요하면 `Collections.synchronizedList()`를 사용해 `ArrayList`를 동기화 처리하는 것이 좋다.

```java
List<String> vector = new Vector<>();

vector.add("a");
vector.add("b");
vector.add("c");

vector.get(0); // "a"
```

### Stack 클래스

- 후입선출 (`LIFO`) 자료구조로, 마지막에 추가된 요소가 가장 먼저 제거된다.
- 기본 연산
  - `push`: 데이터를 추가.
  - `pop`: 데이터를 제거하고 반환.
- 문제점
  - `Stack`은 `Vector`를 상속하고 있어 레거시 문제점이 많아 사용이 권장되지 않는다. 
  <br> 대신 **ArrayDeque**를 사용하는 것이 좋다.

```java
Stack<String> stack = new Stack<>();

stack.push("a");
stack.push("b");

stack.pop(); // "a"
stack.pop(); // "b"
```

## Queue 인터페이스

<div class="mermaid"> 
    graph TD;
    Queue --> LinkedList
    Queue --> PriorityQueue
    Queue --> ArrayDeque
</div>

`Queue` 인터페이스는 선입선출(`FIFO`: `First-In-First-Out`) 구조를 기반으로 한 자료구조를 구현하는 데 사용된다.
첫 번째로 들어온 데이터가 가장 먼저 나가는 방식으로 동작하며, 자바에서는 `Queue`가 인터페이스로 제공되므로 구현체를 필요에 따라 선택해 사용할 수 있다.

- 선입선출 `FIFO(First-In-First-Out)` 구조
- 처음 들어온 원소가 가장 먼저 나간다
- 자바에서는 `Queue` 는 인터페이스이고 필요에 따라 큐 컬렉션을 골라 사용할 수 있다.

### 메서드

- `boolean add(Object o)`: 지정된 객체를 큐에 추가. 저장 공간 부족 시 `IllegalStateException`을 발생시킨다.
- `boolean offer(Object o)`: 지정된 객체를 큐에 추가. 저장 공간 부족 시 `false`를 반환한다.
- `Object remove()`: 큐의 첫 번째 객체를 삭제 후 반환. 비어 있을 경우 `NoSuchElementException`을 발생시킨다.
- `Object poll()`: 큐의 첫 번째 객체를 삭제 후 반환. 비어 있을 경우 `null`를 반환.
- `Object element()`: 큐의 첫 번째 객체를 삭제 없이 반환. 비어 있을 경우 `NoSuchElementException`을 발생시킨다.
- `Object peek()`: 큐의 첫 번째 객체를 삭제 없이 반환. 비어 있을 경우 `null`를 반환한다.

### PriorityQueue 클래스

우선순위 큐는 일반적인 큐와 달리 원소의 우선순위에 따라 정렬되고 처리되는 큐다.

- 우선순위 기반 동작
  - 원소는 우선순위(`priority`)가 높은 순으로 처리된다.
  <br> e.g., 우선순위가 중요한 작업(네트워크 제어, 작업 스케줄링, etc.)에서 사용.
- 정렬 기준
  - 저장할 객체는 반드시 `Comparable` 인터페이스를 구현하거나, `Comparator`를 사용해 정렬 기준을 명시해야 한다.
- 내부 구현
  <br> 배열을 사용하며, 각 요소는 힙(`heap`) 자료구조로 관리된다.
  - 힙은 이진 트리의 한 형태로, 루트 노드에 가장 우선순위가 높은 값이 위치한다.
  - 이를 통해 최댓값이나 최솟값을 빠르게 찾을 수 있다.
- 제약사항
  - `null` 값은 저장할 수 없다.

> 힙은 이진 트리의 한 종류로 우선순위가 가장 높은 자료를 루트 노드로 갱신한다는 점으로, 가장 큰 값이나 가장 작은 값을 빠르게 찾을 수 있다는 특징이 있다.

```java
import java.util.Queue;

// 우선순위 큐에 저장할 객체는 필수적으로 Comparable를 구현
class Person implements Comparable<Student> {
  String name; // 원소 값
  int priority; // 우선순위 값

  public Person(String name, int priority) {
    this.name = name;
    this.priority = priority;
  }

  @Override
  public int compareTo(Person other) {
    // Student의 priority 필드값을 비교하여 우선순위를 결정하여 정렬
    return Integer.compare(this.priority, other.priority);
  }

  @Override
  public String toString() {
    return "Person{name='" + name + "', priority=" + priority + '}';
  }
}

public static void main(String[] args) {
    Queue<Person> priorityQueue = new PriorityQueue<>();

    priorityQueue.add(new Person("John", 1));
    priorityQueue.add(new Person("Daniel", 2));
    priorityQueue.add(new Person("Alex", 5));
    priorityQueue.add(new Person("Adam", 9));
  
    System.out.println(priorityQueue.peek()); // 가장 낮은 우선순위: John
    while (!priorityQueue.isEmpty()) {
      System.out.println(priorityQueue.poll()); // 우선순위 순으로 출력
    }
}
```

### Deque 인터페이스

Deque (Double-Ended Queue)**는 양쪽에서 삽입과 삭제가 가능한 큐다

- 스택 및 큐 동작 지원
  - 큐처럼 사용: FIFO(선입선출) 방식.
  - 스택처럼 사용: LIFO(후입선출) 방식.
- 구현체
  - ArrayDeque
  - LinkedList

### ArrayDeque 클래스

`ArrayDeque`는 `Deque` 인터페이스의 구현체로, 다음과 같은 특징이 있다

- 빠른 성능
  - 스택으로 사용할 때 `Stack` 클래스보다 빠르다.
  - 큐로 사용할 때 `LinkedList` 보다 빠르다.
- 제약사항
  - `null` 요소는 저장할 수 없다.
  - 크기는 동적으로 조정되며, 제한이 없다.

```java
Deque<String> deque = new ArrayDeque<>();

deque.offerLast("a"); // ["a"]
deque.offerFirst("b"); // ["b", "a"]
deque.offerFirst("c"); // ["c", "b", "a"]

deque.pollFirst(); // "c" <- ["b", "a"]
deque.pollLast(); // ["b"] -> "a" 
deque.pollLast(); // [] -> "b"
```

### LinkedList 클래스

`LinkedList`는 `List`와 `Queue` 인터페이스를 동시에 구현하며, 다음과 같은 특징이 있다

- 다목적 활용
  - 리스트, 스택, 큐로 모두 사용할 수 있다.
- 큐 관련 메서드 지원
  - 큐의 기본 동작(`offer`, `poll`, `peek`, etc.)을 제공한다.

```java
Queue<String> linkedList = new LinkedList<>(); // Queue 타입으로 받음

linkedList.offer("a");
linkedList.offer("b");
linkedList.offer("c");

linkedList.poll(); // "a" - 선입선출

System.out.println(linkedList); // [b, c]
```

> 큐(`queue`)는 큐는 데이터를 꺼낼 때 항상 첫 번째 요소를 삭제하므로 배열 기반의 `ArrayList`를 사용하면 요소 이동/복사가 발생해 비효율적이다.
> <br> 따라서 LinkedList를 사용하여 큐를 구현하는 것이 적합하다.

## Set 인터페이스

<div class="mermaid"> 
    graph TD;
    Set --> HashSet
    Set --> LinkedSet
    Set --> TreeSet
</div>

`Set` 인터페이스는 데이터의 중복을 허용하지 않으며, 저장된 데이터의 순서를 유지하지 않는 집합 구조를 구현한다.

- 중복 저장 불가
  <br> 동일한 객체는 한 번만 저장되며, null 값도 최대 하나만 저장 가능하다.
- 순서 없음
  <br> 데이터가 저장된 순서를 보장하지 않으므로, 인덱스를 이용한 객체 검색(get(index))은 지원되지 않는다.



### 메서드

- `boolean add(E e)`: 지정된 객체를 저장. 성공 시 `true`, 중복 객체일 경우 `false`를 반환한다.
- `boolean contains(Object o)`: 지정된 객체가 저장되어 있는지 확인한다.
- `Iterator<E> iterator()`: 저장된 객체를 순회할 수 있는 반복자를 반환한다.
- `boolean isEmpty()`: 컬렉션이 비어 있는지 확인한다.
- `int size()`: 저장된 객체의 개수를 반환한다.
- `void clear()`: 모든 객체를 삭제한다.
- `boolean remove(Object o)`: 지정된 객체를 삭제한다.

### HashSet 클래스

`HashSet`은 배열과 연결 노드의 결합 구조를 사용하는 `Set` 구현체다.

- 빠른 데이터 접근
  <br> 추가, 삭제, 검색, 접근 속도가 빠르다. 
- 순서 보장 없음
  <br> 저장된 데이터의 순서는 예측할 수 없다.

```java
Set<String> hashSet = new HashSet<>();

hashSet.add("a");
hashSet.add("b");
hashSet.add("c");
hashSet.add("a"); // 중복된 요소는 저장되지 않음

System.out.println(hashSet.size()); // 3
System.out.println(hashSet); // 출력 순서는 예측할 수 없음 (e.g., ["b", "a", "c"])
```

### LinkedHashSet 클래스

`LinkedHashSet`은 추가된 순서를 유지하는 `HashSet`이다.

- 순서 유지
  <br> 데이터가 추가된 순서 또는 가장 최근에 접근된 순서대로 데이터 접근이 가능하다.
- 중복 제거와 순서 유지
  <br> 중복을 제거하면서도 데이터의 저장 순서를 유지하고 싶을 때 적합하다.

```java
Set<String> linkedHashSet = new LinkedHashSet<>();

linkedHashSet.add("a");
linkedHashSet.add("b");
linkedHashSet.add("c");
linkedHashSet.add("a"); // 중복된 요소는 저장되지 않음

System.out.println(linkedHashSet.size()); // 3
System.out.println(linkedHashSet); // ["a", "b", "c"]
```

### TreeSet 클래스

`TreeSet`은 이진 검색 트리(`Binary Search Tree`) 기반의 `Set` 구현체다.

- 정렬된 데이터 저장
  <br> 데이터를 저장할 때 자동으로 정렬한다. (기본적으로 오름차순)

- 중복 제거와 정렬
  <br> 중복 없는 정렬된 데이터가 필요할 때 적합하다.

- 높은 검색 성능
  <br> 정렬된 구조로 인해 검색 및 범위 검색에서 높은 성능을 제공한다.

```java
Set<String> treeSet = new TreeSet<>();

treeSet.add("a");
treeSet.add("d");
treeSet.add("b");
treeSet.add("c");
treeSet.add("e");

System.out.println(treeSet); // [a, b, c, d, e]
```

### EnumSet 추상 클래스

`EnumSet`은 `Enum` 타입과 함께 사용되는 `Set` 구현체다.

- 효율성
  <br> 산술 비트 연산을 기반으로 구현되어 `HashSet` 보다 빠르고 적은 메모리를 사용한다.
- 제약사항
  - `Enum` 타입의 값만 저장이 가능하다.
  - 모든 요소는 동일한 `Enum` 타입에 소속되어야 한다.
- 내부 구현
  - 요소가 64개 이하인 경우 `RegularEnumSet`을 사용한다.
  - 64개 초과 시 `JumboEnumSet`을 사용한다.

```java
enum Alphabet {
  A, B, C, D, E, F
}

public class Main {
  public static void main(String[] args) {
    EnumSet<Alphabet> enumSet = EnumSet.allOf(Alphabet.class);

    System.out.println(enumSet.size()); // 6
    System.out.println(enumSet); // [A, B, C, D, E, F]
  }
}
```

## Map 인터페이스

<div class="mermaid"> 
    graph TD;
    Map --> HashMap
    Map --> LinkedHashMap
    Map --> HashTable
    HashTable --> Properties
    Map --> SortedMap
    SortedMap --> TreeMap
</div>

Map 인터페이스는 데이터를 `Key`와 `Value`의 쌍으로 저장하는 자료구조를 구현한다.

- 키와 값의 유일성
  - ``Key``는 중복될 수 없으며, 고유해야 한다. 
  - Value는 중복 저장이 가능하다. 
- 키-값 덮어쓰기 
  <br> 동일한 `Key`로 새로운 값을 저장하면, 기존 값은 덮어쓰여 사라진다. 
- 순서 없음 
  <br> 대부분의 `Map` 구현체는 저장 순서를 보장하지 않는다. (예외: `LinkedHashMap`)

### 메서드

- `Object put(Object key, Object value)`: 지정된 `Key`와 `Value`를 맵에 저장. 기존에 동일한 `Key`가 있으면 덮어쓴다.
- `void putAll(Map t)`: 지정된 `Map`의 모든 데이터를 추가.
- `Object get(Object key)`: 지정된 `Key`에 해당하는 `Value`를 반환.
- `boolean containsKey(Object key)`: 지정된 `Key`가 존재하는지 확인.
- `boolean containsValue(Object value)`: 지정된 `Value`가 존재하는지 확인.
- `Object remove(Object key)`: 지정된 `Key`에 해당하는 데이터를 삭제.
- `void clear()`: 모든 데이터를 삭제.
- `boolean isEmpty()`: 맵이 비어 있는지 확인.
- `int size()`: 맵에 저장된 `Key-Value` 쌍의 개수를 반환.
- `Set keySet()`: 맵에 저장된 모든 `Key`를 `Set` 형태로 반환.
- `Collection values()`: 맵에 저장된 모든 `Value`를 `Collection` 형태로 반환.
- `Set<Map.Entry<K, V>> entrySet()`: 모든 `Key-Value` 쌍을 `Map.Entry` 객체 형태로 반환.

> `Key`는 중복을 허용하지 않으므로 `Set` 타입으로 반환되고, `Value`는 중복을 허용하므로 `Collection` 타입으로 반환된다.

### Map.Entry 인터페이스

`Map.Entry`는 `Map` 인터페이스 내부의 내부 인터페이스로, `Key-Value` 쌍을 표현한다.
이 인터페이스를 통해 맵의 각 데이터를 객체지향적으로 관리할 수 있다.

```java
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);

Set<Map.Entry<String, Integer>> entrySet = map.entrySet();

for (Map.Entry<String, Integer> entry : entrySet) {
    System.out.printf("{ %s : %d }\n", entry.getKey(), entry.getValue());
}
// 출력:
// { a : 1 }
// { b : 2 }
// { c : 3 }
```

### HashMap 클래스

- 핵심 특징
  - `HashTable`을 개선한 비동기 `Map`의 구현체다.
  - 배열과 연결 노드를 결합한 `Hashing` 자료구조로 동작한다.
  - 순서를 보장하지 않으며, 키와 값 모두 `null` 저장 가능하다.
- 장점
  - 빠른 추가, 삭제, 검색 성능을 가지고 있다.
- 단점
  - 멀티스레드 환경에서는 동기화가 지원되지 않으므로 `ConcurrentHashMap`의 사용을 권장한다.

```java
Map<Integer, String> hashMap = new HashMap<>();

hashMap.put(1, "a");
hashMap.put(2, "b");
hashMap.put(3, "c");

for (Integer key : hashMap.keySet()) {
    System.out.println(key + " => " + hashMap.get(key));
}
// 출력:
// 1 => a
// 3 => c
// 2 => b
```

### LinkedHashMap 클래스

- 순서 보장
  - `HashMap`과 달리, 데이터 입력 순서를 유지한다.
- 활용 사례
  - 입력 순서가 중요한 경우 사용한다.

```java
Map<Integer, String> linkedHashMap = new LinkedHashMap<>();
linkedHashMap.put(1, "a");
linkedHashMap.put(2, "b");
linkedHashMap.put(3, "c");

for (Integer key : linkedHashMap.keySet()) {
        System.out.println(key + " => " + linkedHashMap.get(key));
        }
// 출력:
// 1 => a
// 2 => b
// 3 => c
```

### TreeMap 클래스

- 이진 검색 트리 기반
  - 데이터를 자동으로 정렬하여 저장한다.
  - `Key`를 기준으로 오름차순으로 정렬한다.
- 장점
  - 빠른 검색 및 범위 검색이 가능하다.
- 단점
  - 삽입 시 정렬 비용으로 인해 성능이 다소 낮다.

```java
Map<Integer, String> treeMap = new TreeMap<>();
treeMap.put(3, "c");
treeMap.put(1, "a");
treeMap.put(2, "b");

for (Integer key : treeMap.keySet()) {
        System.out.println(key + " => " + treeMap.get(key));
        }
// 출력:
// 1 => a
// 2 => b
// 3 => c
```

### HashTable 클래스

- 레거시 클래스
  - 동기화가 기본 지원되지만, `HashMap`에 비해 느리다.
  - `Key`와 `Value` 모두 `null` 저장이 불가하다.

### Properties 클래스

- 주요 특징
  - `Key`와 `Value`가 모두 String 타입이다.
  - 애플리케이션 설정 파일(`.properties`) 관리에 사용한다.

```java
Properties properties = new Properties();
properties.setProperty("AppVersion", "1.0.0");
properties.setProperty("Theme", "Github");

System.out.println(properties.getProperty("AppVersion")); // 1.0.0
```


# 컬렉션 프레임워크 선택 시점

<hr>

graph LR
A[Square Rect] -- Link text --> B((Circle))
A --> C(Round Rect)
B --> D{Rhombus}
C --> D
</div>


<div class="mermaid"> 
graph LR
    A[ArrayList<br>Vector] -- 추가,삭제기능향상 --> B[LinkedList]
    A -- 검색 기능 향상 --> C[HaspMap<br>HashTable]
    A --> D[Stack]
    B --> E[Queue]
    B --> C
    B -- 검색, 정렬 기능 향상 --> F[TreeMap]
    F --> G[TreeSet]
    C --> H[Properties]
    C -- 순서 유지 기능 향상 --> I[LinkedHashMap]
    C --> J[HashSet]
    I -- 순서 유지 기능 향상 --> K[LinkedHashSet]
</div>

아래는 상황별로 적합한 컬렉션 구현체를 정리한 내용이다.

## ArrayList

- 기본 선택
  - 리스트 자료구조를 사용하는 경우 가장 일반적인 선택이다.
- 장점
  - 임의 요소에 대한 빠른 접근성 제공한다.
  - 순차적인 데이터 추가/삭제가 가장 빠르다.
- 단점
  - 중간 요소의 삽입/삭제 성능이 떨어진다.

## LinkedList

- 장점
  - 중간 요소의 삽입/삭제이 강점이다.
- 단점
  - 임의 요소에 대한 접근 성능이 낮다.
  - 순차 접근이 필요할 때 적합하다.

## HashMap / HashSet

- 장점
  - 해싱을 이용한 빠른 추가/삭제/검색/접근성이 좋다.
  - get 메서드의 시간 복잡도는 `O(1)`이다.
  - 데이터 순서에 상관없는 작업에 적합하다.
- 단점
  - 데이터 정렬이 필요할 경우 부적합하다.

## TreeMap / TreeSet

- 사용 시점
  - 요소를 정렬해야 하는 경우에 사용한다.
  - 범위 검색이 필요한 경우에 사용한다.
- 장점
  - 자동으로 정렬된 상태로 데이터를 저장한다.
  - 범위 검색에 높은 성능을 제공한다.
- 단점
  - 검색 성능이 `HashMap`/`HashSet`보다 낮다.

## LinkedHashMap / LinkedHashSet

- 사용 시점
  - 저장된 순서를 유지해야 하는 경우에 사용한다.
- 특징
  - `HashMap`/`HashSet`과 동일한 성능에 순서 유지 기능이 추가된거다.

## Queue

- 사용 시점
  - 스택(`LIFO`) 또는 큐(`FIFO`) 자료구조가 필요한 경우에 사용한다.
- 추천 구현체
  - ArrayDeque: 빠르고 유연한 동작을 지원한다.

## Stack, Hashtable
- 사용 지양
  - 레거시 컬렉션으로, 현재는 `deprecated` 상태이다.
  - 스택의 경우 `ArrayDeque`를 대체 구현체로 사용하는 것이 권장된다.