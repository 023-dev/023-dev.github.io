---
layout: post
title: "Vector와 Hashtable 그리고 Collections.SynchronizedXXX"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

# Vector와 Hashtable 그리고 Collections.SynchronizedXXX
`Vector`와 `Hashtable` 그리고 `Collections.synchronizedXXX()` 메서드의 공통점은 모두 `Thread-Safe`한 컬렉션으로 동기화된 메서드로 구성되어 있다는 것이다.
`Thread-Safe`한 컬렉션이면 보통 멀티 스레드 환경에서 안전하게 사용할 수 있다고 생각할 수 있지만, 실제로는 성능이 저하되는 문제가 발생할 수 있다.
그럼 `Vector`와 `Hashtable` 그리고 `Collections.synchronizedXXX()` 메서드의 문제점에 대해 알아보자.

## Vector와 Hashtable 문제점
`Vector`와 `Hashtable`은 모두 레거시한 자바 클래스로, 데이터를 저장하고 관리하는 컬렉션 클래스이다. 
근데 왜 레거시한 자바 컬렉션인지 궁금할 수 있다. 이는 `Vector`와 `Hashtable`이 `Thread-Safe`한 컬렉션으로 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있다.
이로 인해 두 클래스 모두 메서드 단위에서 동기화를 제공하지만, 이로 인해 앞서 언급했듯이 성능이 저하되는 문제가 발생한다.
이는 필요한 부분만 동기화를 제공하지 않고, 모든 메서드에 대해 동기화를 제공하기 때문에 과도한 락이 발생하는 문제이다.

내부 구현이 어떻게 되어있는지 그리고 어떠한 상황에서 이러한 문제가 발생하는지 알아보겠다.

```java
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}
```

위 코드 `Vector` 클래스의 `add()` 메서드는 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있는 것을 볼 수 있다.
`Vector` 클래스의 `add()` 메서드는 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있기 때문에 두 스레드가 동시에 `add()` 메서드를 호출하면 한 스레드는 대기하게 된다.
이로 인해 race condition이 발생하여 성능이 저하되는 문제가 발생한다.

이러한 문제로 현재의 자바에서는 `Vector`와 `Hashtable` 대신 `ArrayList`와 `HashMap`을 사용하는 것을 권장하고 있다.
`ArrayList` 클래스의 `add()` 메서드는 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있지 않기에 두 스레드가 동시에 `add()` 메서드를 호출해도 서로 영향을 주지 않는다.
그럼 동기화 메서드로 구성된 컬렉션을 사용하고 싶다면 어떻게 해야할까?

## Collections.synchronizedXXX() 메서드
`Collections.synchronizedXXX()` 메서드는 `Vector`와 `Hashtable`과 같이 동기화된 메서드로 구성된 컬렉션을 반환한다.
이 메서드는 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성된 컬렉션을 반환하기 때문에 `Thread-Safe`한 컬렉션을 사용할 수 있다.

내부 구현이 어떻게 되어있는지 알아보겠다.

```java
public static <T> List<T> synchronizedList(List<T> list) {
    return (list instanceof RandomAccess ?
            new SynchronizedRandomAccessList<>(list) :
            new SynchronizedList<>(list));
}
```

위 코드는 `Collections.synchronizedList()` 메서드의 내부 구현이다.
이 메서드는 `List` 인터페이스를 구현한 컬렉션을 매개변수로 받아 `SynchronizedList` 클래스를 반환한다.
이로 인해 `ArrayList`의 모든 메서드에 대해 동기화를 제공받게 된다.
그러면 이 메서드를 사용하면 안전할까?
그렇지는 않다. `Collections.synchronizedXXX()` 메서드는 모든 메서드에 대해 동기화를 제공하기 때문에 과도한 락이 발생하는 문제가 발생한다.
이 문제 또한 `Vector`와 `Hashtable`의 문제와 같은 문제이다.
그럼 이러한 문제를 해결하기 위해 어떻게 해야할까?
이러한 문제로 현재의 자바에서는 `Collections.synchronizedXXX()` 메서드 대신 `ConcurrentHashMap`과 같은 `Concurrent` 패키지의 컬렉션을 사용하는 것을 권장하고 있다.

## Concurrent
`Concurrent` 패키지는 멀티 스레드 환경에서 안전하게 사용할 수 있는 컬렉션을 제공한다.
`ConcurrentHashMap`은 `Hashtable`과 같이 `Thread-Safe`한 컬렉션으로 동기화된 메서드로 구성되어 있지만, `ConcurrentHashMap`은 필요한 부분만 동기화를 제공하기 때문에 성능이 향상된다.

내부 구현이 어떻게 되어있는지 알아보겠다.

```java
public class ConcurrentHashMap<K, V> {
    public V put(K key, V value) {
        return putVal(key, value, false);
    }

    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) {
            throw new NullPointerException();
        }
        int hash = spread(key.hashCode());
        return null;
    }
}
```

위 코드는 `ConcurrentHashMap` 클래스의 `put()` 메서드의 일부분이다.
이 메서드는 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있지만, 필요한 부분만 동기화를 제공하기 때문에 `Thread-Safe`한 컬렉션을 사용하면서 성능이 향상된다.
자세한 내용은 [ConcurrentHashMap vs SynchronizedMap](https://023-dev.github.io/2024-11-22/Java-ConcurrentHashMap-SynchronizedMap)을 참고하자.

이렇게 주저리주저리 써봤는데 정리하자면 기존 레거시 자바 버전에서는 `Vector`와 `Hashtable`을 사용했지만 해당 컬레션들의 모든 메서드들이 `synchronized` 키워드를 사용하여 동기화된 메서드로 구성되어 있어 과도한 락이 발생하여 성능이 저하되는 문제가 발생한다.
그래서 `Vector`와 `Hashtable` 대신 `ArrayList`와 `HashMap`을 사용하는 것을 권장하고 있다.
근데 이 부분에서 동기화 메서드가 필요로 해져서 `Collections.synchronizedXXX()` 메서드를 사용해 해당 컬렉션을 동기화된 형태로 래핑할 수 있게 되었다.
하지만 이 부분에서도 `Vector`와 `Hashtable`과 같은 문제가 발생하여 성능이 저하되는 문제가 발생한다.
그래서 결과적으로 현재의 자바에서는 `ArrayList`와 `HashMap`을 `Thread-Safe`하게 사용하기 위한 방법으로 `Concurrent` 패키지의 컬렉션을 사용하는 것을 권장하고 있다.