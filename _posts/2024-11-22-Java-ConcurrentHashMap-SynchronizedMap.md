---
layout: post
title: "SynchronizedMap vs ConcurrentHashMap"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

# SynchronizedMap와 ConcurrentHashMap 
`SynchronizedMap`과 `ConcurrentHashMap`은 둘 다 멀티 스레드 환경에서 사용할 수 있는 Map 구현체이다. 
하지만 두 클래스는 서로 다른 방식으로 동기화를 제공한다. 
이 글에서는 두 클래스의 차이점을 알아보고, 어떤 상황에서 어떤 클래스를 사용해야 하는지 알아보겠다.

## SynchronizedMap
`SynchronizedMap`은 `Collections.synchronizedMap()` 메소드를 통해 생성할 수 있다.
이 클래스는 내부적으로 `synchronized` 키워드를 사용하여 동기화를 제공한다.
`Collections.synchronizedxxx`의 초기화 코드는 다음과 같다.

```java
Map<String, String> map = Collections.synchronizedMap(new HashMap<>());
```

앞서 생성한 `HashMap`을 `Collections.synchronizedMap()` 메소드에 넘겨주면, 래핑 된 `SynchronizedMap`이 생성된다.
하지만 이렇게 생성한 `SynchronizedMap`은 단순히 `synchronized` 키워드를 사용하여 객체 레벨의 잠금을 제공하여 동기화를 제공하기 때문에,
put 및 get 메소드 호출 시 동일한 작업을 수행하기 위해 락을 선점해야 한다.
이처럼 컬렉션 전체에 대한 락을 사용하면 오버 헤드가 발생하며, 한 스레드가 맵을 수정하는 동안 다른 스레드는 대기해야 하는 과도한 락 문제가 발생할 수 있다.
또한 이는 성능 저하를 야기할 수 있으며, `ConcurrentModificationException`이 발생할 수 있다.


## ConcurrentHashMap
`ConcurrentHashMap`은 `SynchronizedMap`과 달리 락을 사용하여 동기화를 제공하지 않는다.
이 클래스는 `synchronized` 키워드를 사용하지 않고, 내부적으로 락을 사용하여 동기화를 제공한다.

`ConcurrentHashMap`은 다음과 같이 생성할 수 있다.

```java
Map<String, String> map = new ConcurrentHashMap<>();
```

`ConcurrentHashMap`은 `SynchronizedMap`과 달리 `synchronized` 키워드를 사용하지 않기 때문에, 객체 레벨의 락이 아닌 좀 더 세분화된 
버킷 레벨의 락을 사용하여 동기화를 제공한다. 
이를 통해 여러 스레드가 동시에 맵을 수정할 수 있으며, 더 많은 확정성을 지니게 된다.
기본적으로 `ConcurrentHashMap`은 16개의 버킷을 가지고 있으며, 각 버킷은 독립적으로 락을 가지고 있다.
이론적으로 봤을 때 16개의 버킷이 있기 때문에 16개의 스레드가 동시에 맵을 수정할 수 있다.
필요하다면 `ConcurrentHashMap`의 크기를 늘릴 수 있으며, 이는 생성자에 전달할 수 있는 초기 용량을 조정하여 가능하다.

## null 허용 여부
`SynchronizedMap`과 `ConcurrentHashMap`은 null 키와 null 값을 다른 방식으로 처리한다.
기본적으로 `SynchronizedMap`은 null 키와 null 값을 모두 허용한다.

```java
Map<String, String> synchronizedMap = Collections.synchronizedMap(new HashMap<>());
synchronizedMap.put(null, "value"); // null 키 허용
synchronizedMap.put("key", null); // null 값 허용
```

하지만, `ConcurrentHashMap`은 null 키와 null 값을 모두 허용하지 않는다.
따라서 `ConcurrentHashMap`을 사용할 때는 null 키와 null 값을 사용하지 않도록 주의해야 한다.

```java
Map<String, String> concurrentHashMap = new ConcurrentHashMap<>();
concurrentHashMap.put(null, "value"); // null 키 불허
concurrentHashMap.put("key", null); // null 값 불허
```

```java
Exception in thread "main" java.lang.NullPointerException
    at java.base/java.util.concurrent.ConcurrentHashMap.putVal(ConcurrentHashMap.java:1011)
    at java.base/java.util.concurrent.ConcurrentHashMap.put(ConcurrentHashMap.java:1006)
    at com.example.demo.DemoApplication.main(DemoApplication.java:13)
```

그래도 `ConcurrentHashMap`을 사용하고 싶은데 null 키와 null 값을 사용해야 하는 경우에는,
`ConcurrentHashMap` 대신 `ConcurrentHashMap`을 상속받아 null 키와 null 값을 허용하는 클래스를 만들어 사용할 수 있다.

```java
public class MyConcurrentHashMap<K, V> extends ConcurrentHashMap<K, V> {
    @Override
    public V put(K key, V value) {
        if (key == null) {
            throw new NullPointerException("null key");
        }
        if (value == null) {
            throw new NullPointerException("null value");
        }
        return super.put(key, value);
    }
}
```

`SynchronizedMap`과 `ConcurrentHashMap`은 멀티 스레드 환경에서 사용할 수 있는 Map 구현체이다.
하지만 두 클래스는 서로 다른 방식으로 동기화를 제공한다.
`SynchronizedMap`은 `synchronized` 키워드를 사용하여 객체 레벨의 락을 제공하며, `ConcurrentHashMap`은 버킷 레벨의 락을 사용하여 동기화를 제공한다.
따라서 `ConcurrentHashMap`이 `SynchronizedMap`보다 더 좋은 성능을 제공한다.
또한 `ConcurrentHashMap`은 null 키와 null 값을 허용하지 않는다.
따라서 null 키와 null 값을 사용해야 하는 경우에는 `ConcurrentHashMap`을 사용할 수 없다.
이러한 경우에는 `ConcurrentHashMap`을 상속받아 null 키와 null 값을 허용하는 클래스를 만들어 사용할 수 있다.
