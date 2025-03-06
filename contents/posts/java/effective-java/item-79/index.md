---
title: "과도한 동기화는 피하라"
date: 2025-03-06 20:00:00
tags: 
  - Java
  - Effective Java
series: "Effective Java"
---

이번 아이템에서는 동기화를 과도하게 했을 때의 피해에 대해 알아본다.

## 외계인 메서드

동기화된 영역 안에서는 재정의할 수 있는 메서드를 호출하거나 클라이언트가 넘겨준 함수 객체를 호출하는 경우,
클래스 관점에서는 이런 메서드는 모두 바깥 세상에서 온 외계인 메서드로 그 메서드가 무슨 일을 할 지 알지 못하며 통제할 수 없게 된다.

이러한 외계인 메서드가 하는 일에 따라 동기화된 영역은 예외를 일으키거나, 교착상태에 빠지거나, 데이터를 훼손할 수도 있다.

다음을 예로 들면, 어떤 집합(Set)을 감싼 래퍼 클래스이고,
이 클래스의 클라이언트는 집합에 원소가 추가되면 알림을 받을 수 있다.

```java
@FunctionalInterface
public interface SetObserver<E> {
    // ObservableSet에 원소가 추가되면 호출된다.
    void added(ObservableSet<E> set, E element);
}
```

```java
 public class ObservableSet<E> extends ForwardingSet<E> {
    public ObservableSet(Set<E> set) {
        super(set);
    }

    private final List<SetObserver<E>> observers 
            = new ArrayList<>();

    public void addObserver(SetObserver<E> observer) {
        synchronized(observers) {
            observers.add(observer);
        }
    }

    public boolean removeObserver(SetObserver<E> observer) {
        synchronized(observers) {
            return observers.remove(observer);
        }
    }

    private void notifyElementAdded(E element) {
        synchronized(observers) {
            for (SetObserver<E> observer : observers)
                observer.added(this, element);
        }
    }

    @Override
    public boolean add(E element) {
        boolean added = super.add(element);

        if (added)
            notifyElementAdded(element);
        
        return added;
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        boolean result = false;

        for (E element : c)
            result |= add(element);

        return result;
    }
}
```

## 외계인 메서드 예외 발생

위의 예시는 눈으로 보기에 잘 작동할 것 같다.
그럼 한 번 테스트를 해보도록 하자.

```java
public static void main(String[] args) {
    ObservableSet<Integer> set = new ObservableSet<>(new HashSet<>());

    set.addObserver(new SetObserver<>() {
        public void added(ObservableSet<Integer> s, Integer e) {
            System.out.println(e);
            
            if (e == 23)
                s.removeObserver(this);
        }
    });

    for (int i=0; i<100; i++)
        set.add(i);
}
```

0 부터 99까지의 수를 집합에 추가하면서 출력하다가, 그 값이 23이면 자기 자신을 제거하는 관찰자에 대한 코드이다.
예상대로라면 0부터 23까지 출력한 후 관찰자 자신을 구독해지한 다음 프로그램이 종료되어야 한다.
하지만 이 프로그램은 23까지 출력한 다음 `ConcurrentModificationException`을 던지며 종료된다.

그 이유는 `added` 메서드가 `ObservableSet`의 `removeObserve` 메서드를 호출하고,
이 메서드는 다시 `observers.remove` 메서드를 호출하는데,
`notifyElementAdded`가 관찰자들의 리스트를 순회하는 도중이기 때문이다.

즉, 리스트에서 원소를 제거하려는데 현재 이 리스트를 순회하고 있어 허용되지 않은 동작이므로 예외가 발생한 것이다.

## 외계인 메서드 교착상태 발생

이번에는 구독해지를 하는 관찰자를 작성하는데 `removeOberserver`를 직접 호출하지 않고,
실행자 서비스(`ExecutorService`)를 이용하여 다른 스레드한테 위임하여 호출할 것이다.

```java
set.addObserver(new SetObserver<>() {
    public void added(ObservableSet<Integer> s, Integer e) {
        System.out.println(e);

        if (e == 23) {
            ExecutorService exec = Executors.newSingleThreadExecutor();

            try {
                exec.submit(() -> s.removeObserver(this)).get(); // Deadlock 발생
            } catch (ExecutionException | InterruptedException ex) {
                throw new AssertionError(ex);
            } finally {
                exec.shutdown();
            }
        }
    }
})
```

이 프로그램을 실행하면 예외는 나지 않지만 교착상태에 빠진다.

이유는 백그라운드 스레드가 `s.removeObserver`를 호출하면 `synchronized` 키워드에 의해 관찰자를 잠그려 시도하지만,
이미 메인 스레드가 락을 쥐고 있기 때문에 락을 얻을 수 없다.

그와 동시에 메인 스레드는 `get()`으로 백그라운드 스레드가 관찰자를 제거하지만을 기다리는 중이다.

따라서 해당 부분에서 프로그램은 교착상태(Deadlock)이 발생하게 된다.

## 예외 발생과 교착상태 해결

그럼 어떻게 이러한 문제를 해결할 수 있을까?
위의 두 예시에서 발생한 예외와 교착 상태를 해결하기 위해서는 외계인 메서드 호출을 동기화 블록 바깥은 옮기면 된다.

```java
private void notifyElementAdded(E element) {
    List<SetObserver<E>> snapshot = null;
    synchronized(observers) {
        snapshot = new ArrayList<>(observers);
    }
    for (SetObserver<E> observer : snapshot)
        observer.added(this, element);
}
```

외계인 메서드는 얼마나 오래 실행할 지 알 수가 없는데,
거기에 동기화 영역 안에서 호출된다면 다른 스레드는 자원을 사용하지 못하고 대기해야 한다.

하지만 위와 같이 동기화 영역 밖에서 호출하는 방식을 통해 동시성 효율을 크게 개선할 수 있다.

이러한 방식을 열린 호출이라고 한다.

그리고 이것보다 더 나은 방법도 존재한다.
자바의 동시정 컬렉션 라이브러리인 `CopyOnWriteArrayList`를 사용하는 것이다.
이름이 말해주듯 `ArrayList`를 구현한 클래스로, 내부를 변경하는 작업은 항상 깨끗한 복사본을 만들어 수행하도록 구현했다.
이러한 이유로 다른 용도로 쓰인다면 끔찍이 느리겠지만, 수정한 일은 드물고 순회만 빈번히 일어나는 관찰자 리스트 용도로는 최적이다.

`ObservableSet`을 `CopyOnWriteArrayList`를 사용해 다시 구현하면 다음과 같이 바꿀 수 있다.

```java
private final List<SetObserver<E>> observers = new CopyOnWriteArrayList<>();

public void addObserver(SetObserver<E> observer) {
    observers.add(observer);
}

public boolean removeObserver(SetObserver) {
    return observers.remove(observer);
}

private void notifyElementAdded(E element) {
    for (SetObserver<E> observer : observers)
        observer.added(this, element);
}
```

## 성능 측면에서의 동기화 문제점

자바의 동기화 비용은 빠르게 낮아져 왔지만, 과도한 동기화를 피하는 일은 오히려 과거 어느 때보다 중요해졌다.

과도한 동기화가 초래하는 진짜 비용은 락을 얻는데 드는 CPU 시간이 아니다.
경쟁하느라 낭비하는 시간, 즉 병렬로 실행할 기회를 일고 모든 코어가 메모리를 일관되게 보기 위한 지연 시간이 진짜 비용이다.

또한, 가상머신의 코드 최적화를 제한한다는 점도 과도한 동기화의 또 다른 숨은 비용이다.

## 가변 클래스를 작성하는 방법

가변 클래스를 작성하기 위해서는 다음 두 선택지 중 하나를 따른다.

첫 번째, 동기화를 전혀 하지 말고, 그 클래스를 동시에 사용해야 하는 클래스가 외부에서 알아서 동기화하게 하자.
- ex. java.util (Vector, Hashtable 제외), StringBuilder

두 번째, 동기화를 내부에서 수행해 스레드 안전한 클래스로 만들자.
- ex. java.util.concurrent, StringBuffer
  이 경우처럼 클래스를 내부에서 동기화하기로 했다면,
  락 분할(lock splitting), 락 스트라이핑(lock striping), 비차단 동시성 제어(nonblocking concurrency control) 등 다양한 기법을 동원해 동시성을 높여줄 수 있다.

여러 스레드가 호출할 가능성이 있는 메서드가 정적 필드를 수정한다면 그 필드를 사용하기 전에 반드시 동기화해야 한다.

이 정적필드가 `private`이라도 서로 관련 없는 스레드들이 동시에 읽고 수정할 수 있게 된다.

사실상 전역 변수와 같아진다.
전에 예로 들었던 `generateSerialNumber` 메서드에서 쓰인 `nextSerialNumber` 필드가 바로 이러한 예시이다.

```java
private static int nextSerialNumber = 0;

public static synchronized int generateSerialNumber() {
     return nextSerialNumber++; 
}
```

## 정리

교착상태와 데이터 훼손을 피하려면 동기화 영역 안에서 외계인 메서드를 절대 호출하지 말자.
일반화해 이야기하면, 동기화 영역 안에서의 작업은 최소한으로 줄이자.
또한 가변 클래스를 설계할 때는 스스로 동기화해야 할지 고민하자.
멀티코어 세상인 지금은 과도한 동기화를 피하는 게 과거 어느 때보다 중요하다.
합당한 이유가 있을 때만 내부에서 동기화하고, 동기화했는지 여부를 문서에 명확히 밝히자.