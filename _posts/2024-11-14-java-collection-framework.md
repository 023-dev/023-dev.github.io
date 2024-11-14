---
layout: post
title: "자바의 Collection Framework 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

자바에서는 컬렉션 프레임워크(Java Collection Framework)을 제공한다. 이는 자바 프로그래밍을 하면서 없어서는 안되는 필수적인 요소이다.
이 글에서는 자바의 컬, 렉션 프레임워크에 대해 알아본다.

# 자바 컬렉션 프레임워크

<hr>

자바 컬렉션 프레임워크에서 컬렉션이이란 무엇인지 부터 알아보자. 
컬렉션이라함은 다수의 요소를 하나의 그룹으로 묶어 효율적으로 저장하고, 관리할 수 있는 기능을 제공하는 일종의 컨테이너라고 보면 된다. 
그럼 이것을 사용함으로써 어떠한 이점이 있는지 알아보도록 하자.

## 컬렉션 프레임워크의 장점

컬렉션 프레임워크는 아래와 같은 장점을 쥐어준다.

- 가변적인 저장 공간을 제공한다.
- 인터페이스와 다형성을 이용해 구현한 객체지향적 클래스를 제공한다.
- 최적화된 자료구조 및 알고리즘이 구현되어 제공한다.

> 자바의 컬렉션 프레임워크는 객체(Object)만 저장할 수 있다.
> 원시 타입(primitive type)인 int, double 등은 컬렉션에 바로 저장할 수 없고, 이를 객체 타입으로 변환하여 저장해야 한다. 
> 이 변환 과정을 박싱(Boxing)이라고 하며, int는 Integer, double은 Double 등의 래퍼 클래스(Wrapper Class)를 사용하여 수행된다.
> 또한, 자바의 컬렉션은 객체의 참조값(주소값)을 저장하므로, 특별한 경우인 `null` 값도 저장이 가능하다. 
> `null`을 컬렉션에 저장한다는 것은 아무 객체도 참조하지 않는다는 것을 의미한다.

## 컬렉션 프레임워크의 계층구조

<div class="mermaid"> 
  graph TD; A-->B; A-->C; B-->D; C-->D; 
</div>

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

<div class="mermaid"> 
    graph TD;
    Collection <-- Iterable
    List <-- Collection
    Queue <-- Collection
    Set <-- Collection
    ArrayList <-- List
    LinkedList <-- List
    Vector <-- List
    Stack <-- List
    PriorityQueue <-- Queue
    Deque <-- Queue
    LinkedList <-- Deque
    ArrayDeque <-- Deque
    HashSet <-- Set
    LinkedHashSet <-- Set
    SortedSet <-- Set
    TreeSet <-- SortedSet
    HashMap <-- Map
    HashTable <-- Map
    SortedMap <-- Map
    TreeMap <-- SortedMap
</div>

컬렉션 프레임 워크는 크게 Collection 인터페이스와 Map 인터페이스로 나뉜다.
List와 Set 인터페이스를 구현한 컬렉션 클래스들은 공통부분이 많기 때문에, 공통된 붑분을 모은 Collection 인터페이스로 상속 되어있다.
Map 인터페이스 컬렉션들은 두 개의 데이터를묶어 한쌍으로 다루기 때문에 Collection 인터페이스와 따로 분리되어 있다.


> 대부분의 컬렉션 클래스들은 List, Set , Map 중의 하나를 구현하고 있으며, 구현한 인터페이스의 이름이 클래스 이름에 포함되는 특징이 있다. 
> (ArrayList, HashSet, HashMap ... 등) 그러나 Vector, Stack, Hashtable, Properties 와 같은 클래스들은 컬렉션 프레임워크가 만들어지기 이전부터 존재하던 것이기 때문에 컬렉션 프레임워크의 명명법을 따르지 않는다. 
> 또한 Vector 나 Hashtable 과 같은 기존의 컬렉션 클래스들은 호환을 위해 남겨진 것이므로 가급적 사용하지 않는 것이 좋다.

### Iterable 인터페이스

<div class="mermaid"> 
    graph TD;
    Iterable <-- Collection
</div>

- 컬렉션 인터페이스들의 가장 최상위 인터페이스
- 컬랙션들을ㅇㄹ 배우다 보면 자료들을 순회할때 이터레이터 객체를 다뤄보게 될텐데, 이 이터레이터 객체를 관리하는 인터페이스로 보면 된다

#### 메서드

- `default void forEach(Consumer<? super T> action)`: 함수형 프로그래밍 전용 루프
- `Iterator<T> iterator()`: 컬렉션에서 이터레이터를 구현
- `default Spliterator<T> splierator()`: 파이프라이닝 관련 메소드

> 참고로 Map은 iterable 인터페이스를 상속받지 않기 때문이 iterator()와 spliterator()는 Map 컬렉션에 구현이 되어 있지 않다. 
> 따라서 직접적으로 Map 컬렉션을 순회할수는 없고 스트림(Stream)을 사용하거나 간접적으로 키를 Collection으로 반환하여 루프문으로 순회하는 식을 이용한다.

### Collection 인터페이스

<div class="mermaid"> 
    graph DT;
    Collection --> Iterable
</div>