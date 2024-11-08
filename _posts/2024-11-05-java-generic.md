---
layout: post
title: "Java의 Generic 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# 제네릭(Generics)이란?

<hr>

자바에서 제네릭(Generics)은 클래스 내부에서 사용할 데이터 타입을 외부에서 지정할 수 있는 기법을 의미한다. 
제네릭을 통해 각 객체가 서로 다른 타입의 데이터를 다룰 수 있게 되어, 객체 지향 프로그래밍의 다형성을 더욱 유연하게 활용할 수 있다.

예를 들어, 자주 사용되는 `List`와 같은 컬렉션 클래스에서 `<String>`과 같은 꺾쇠 괄호(`<>`)를 보았을 것이다.

```java
ArrayList<String> list = new ArrayList<>();
```

위 코드에서 `<String>`이 바로 제네릭 타입이다. 
`ArrayList`가 `String` 타입으로 지정되면, 이 리스트는 오직 문자열만을 저장할 수 있게 된다. 
배열과 리스트의 선언문 형태를 비교해 보면, 배열처럼 컬렉션 자료형의 타입을 외부에서 지정해주는 방식이라고 생각할 수 있다.

이처럼 제네릭은 컬렉션 클래스나 메서드에서 사용할 내부 데이터 타입을 파라미터처럼 외부에서 지정하여, 유연한 타입 변수를 사용하는 기능이라고 볼 수 있다.

> 제네릭을 통해 객체에 타입을 지정하는 것은 변수를 선언할 때 타입을 지정하는 것과 비슷한 개념이다.

## 제네릭 타입 매개변수

제네릭은 `<>` 꺾쇠 괄호를 사용해 타입을 지정한다. 
이 괄호는 다이아몬드 연산자라고 불리며, 괄호 안의 기호는 타입 매개변수(type parameter)를 의미한다.

### 타입 파라미터 정의

제네릭 타입은 주로 클래스나 메서드를 설계할 때 사용된다.
다음은 제네릭을 사용하여 정의된 클래스 예제이다.

```java
class FruitBox<T> {
    List<T> fruits = new ArrayList<>();

    public void add(T fruit) {
        fruits.add(fruit);
    }
}
```

위에서 `<T>` 기호를 통해 `FruitBox` 클래스가 제네릭 타입을 사용함을 볼 수 있다. 
인스턴스를 생성할 때 타입을 명시하면, 해당 타입이 `T`로 지정되어 클래스 내부에서 사용된다.

```java
// 정수 타입
FruitBox<Integer> intBox = new FruitBox<>();

// 실수 타입
FruitBox<Double> doubleBox = new FruitBox<>();

// 문자열 타입
FruitBox<String> strBox = new FruitBox<>();

// 클래스 타입 (예: Apple 클래스)
FruitBox<Apple> appleBox = new FruitBox<>();
```

이처럼 실행 시 지정한 타입이 `T`로 전파되어 타입이 구체화되는 과정을 구체화(Specialization)라 한다.

### 타입 파라미터 생략

JDK 1.7 이후부터는 생성자 부분의 제네릭 타입은 생략할 수 있다. 컴파일러가 타입을 자동으로 추론하기 때문이다.

```java
FruitBox<Apple> appleBox = new FruitBox<>();
```

## 제네릭 타입 제한

제네릭 타입으로 원시 타입(Primitive Type)은 사용할 수 없다. 
즉, `int`, `double`과 같은 기본 타입을 제네릭 타입 파라미터로 사용할 수 없고, 대신 `Integer`, `Double`과 같은 Wrapper 클래스를 사용해야 한다.

```java
// 기본 타입 int 사용 불가
List<int> intList = new ArrayList<>(); // 오류 발생

// Wrapper 클래스 사용
List<Integer> integerList = new ArrayList<>();
```

제네릭을 통해 클래스 간 상속 관계를 활용한 다형성도 적용할 수 있다.

```java
class Fruit { }
class Apple extends Fruit { }
class Banana extends Fruit { }

class FruitBox<T> {
    List<T> fruits = new ArrayList<>();

    public void add(T fruit) {
        fruits.add(fruit);
    }
}

public class Main {
    public static void main(String[] args) {
        FruitBox<Fruit> box = new FruitBox<>();

        box.add(new Fruit());
        box.add(new Apple()); // 업캐스팅 적용
        box.add(new Banana()); // 업캐스팅 적용
    }
}
```

## 복수 타입 파라미터

제네릭 타입은 하나 이상 지정할 수 있다.
여러 타입이 필요할 경우 `<T, U>`와 같이 쉼표로 구분해 여러 타입 파라미터를 지정할 수 있다.

```java
class Apple {}
class Banana {}

class FruitBox<T, U> {
    List<T> apples = new ArrayList<>();
    List<U> bananas = new ArrayList<>();

    public void add(T apple, U banana) {
        apples.add(apple);
        bananas.add(banana);
    }
}

public class Main {
    public static void main(String[] args) {
        FruitBox<Apple, Banana> box = new FruitBox<>();
        box.add(new Apple(), new Banana());
    }
}
```

## 중첩 타입 파라미터

제네릭 객체를 제네릭 타입 파라미터로 사용하는 중첩 형식도 가능하다.

```java
public static void main(String[] args) {
    // LinkedList<String>을 원소로 가지는 ArrayList
    ArrayList<LinkedList<String>> list = new ArrayList<>();

    LinkedList<String> node1 = new LinkedList<>();
    node1.add("apple");
    node1.add("banana");

    LinkedList<String> node2 = new LinkedList<>();
    node2.add("cherry");
    node2.add("date");

    list.add(node1);
    list.add(node2);
    System.out.println(list);
}
```

## 타입 파라미터 네이밍 규칙

제네릭 기호는 보통 `<T>`와 같이 표현되지만, 통상적인 명명 규칙이 존재한다. 
이러한 관례는 가독성을 높이고 코드 이해를 돕는다.

- `<T>`: 타입(Type)                      
- `<E>`: 요소(Element), 주로 `List`에서 사용
- `<K>`: 키(Key), 주로 `Map<K, V>`에서 사용
- `<V>`: 값(Value), 매핑된 값
- `<N>`: 숫자(Number)
- `<S, U, V>`: 2번째, 3번째, 4번째 타입

## 제네릭 사용 이유와 이점

### 컴파일 타임에 타입 검사 가능

제네릭은 컴파일 타임에 타입을 검사하여 타입 안전성을 보장한다. 
예를 들어, JDK 1.5 이전에는 `Object` 타입을 인수나 반환값으로 사용했지만, 타입 변환 시 런타임 오류가 발생할 위험이 있었다.

```java
class Apple {}
class Banana {}

class FruitBox {
    private Object[] fruits;

    public FruitBox(Object[] fruits) {
        this.fruits = fruits;
    }

    public Object getFruit(int index) {
        return fruits[index];
    }
}
```

위와 같은 코드에서는 `FruitBox`가 `Object` 타입을 사용해 모든 타입을 저장할 수 있지만, 형변환 오류를 컴파일 시점에 감지하지 못해 런타임 에러가 발생할 수 있다. 
제네릭을 사용하면 이 문제를 해결할 수 있다.

```java
class FruitBox<T> {
    private T[] fruits;

    public FruitBox(T[] fruits) {
        this.fruits = fruits;
    }

    public T getFruit(int index) {
        return fruits[index];
    }
}

public static void main(String[] args) {
    Apple[] apples = { new Apple(), new Apple() };
    FruitBox<Apple> box = new FruitBox<>(apples);

    Apple apple = box.getFruit(0); // 안전한 형변환
}
```

### 불필요한 형변환 제거로 성능 향상

제네릭을 사용하면 형변환이 필요 없어 성능이 향상된다.

```java
// 형변환이 필요 없음
FruitBox<Apple> box = new FruitBox<>(apples);

Apple apple1 = box.getFruit(0);
Apple apple2 = box.getFruit(1);
```

형변환이 없어짐에 따라 코드의 가독성이 높아지고, 형변환으로 인한 오버헤드가 줄어들어 성능이 개선된다.

## 제네릭 사용 시 주의사항

### 제네릭 타입의 객체 생성 불가

제네릭 타입 자체로 객체를 생성할 수 없다. 
즉, `new` 연산자 뒤에 제네릭 타입 파라미터를 사용할 수 없다.

```java
class Sample<T> {
    public void someMethod() {
        T t = new T(); // 컴파일 오류
    }
}
```

### static 멤버에 제네릭 타입 사용 불가

`static` 변수나 메서드에서는 제네릭 타입 파라미터를 사용할 수 없다. 
`static` 멤버는 클래스가 공통으로 사용하는 변수이기 때문에, 제네릭 객체 생성 전에 타입이 결정되어야 하기 때문이다.

```java
class Student<T> {
    private String name;

    // static 메서드의 반환 타입

에 제네릭 타입 사용 불가
    public static T getInstance() {  // 오류 발생
        return new T();
    }
}
```

### 제네릭으로 배열 선언 주의점

제네릭 타입의 배열은 만들 수 없지만, 제네릭 배열 선언은 허용된다.

```java
class Sample<T> {}

public class Main {
    public static void main(String[] args) {
        // 제네릭 배열 선언 허용
        Sample<Integer>[] arr = new Sample[10];
        
        // 제네릭 타입을 생략해도 위에서 Integer로 지정된 제네릭 타입을 추론
        arr[0] = new Sample<>();
    }
}
```