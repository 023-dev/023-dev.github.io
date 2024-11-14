---
layout: post
title: "자바의 Thread 이해하기"
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
~~~ mermaid
---
  config:
    class:
      hideEmptyMembersBox: true
---
classDiagram
    Iterable <|-- Collection
    
    Collection <|-- List
    Collection <|-- Queue
    Collection <|-- Set
    
    List <|-- ArrayList
    List <|-- LinkedList
    List <|-- Vector
    List <|-- Stack
    
    Queue <|-- PriorityQueue
    Queue <|-- Deque
    
    Deque <|-- LinkedList
    Deque <|-- ArrayDeque
    
    Set <|-- HashSet
    Set <|-- LinkedHashSet
    Set <|-- SortedSet
    
    SortedSet <|-- TreeSet

    Map <|-- HashMap
    Map <|-- HashTable
    Map <|-- SortedMap
    SortedMap <|-- TreeMap
~~~

컬렉션 프레임 워크는 다양한

<hr>

프로그래밍을 하다 보면 단순한 오타부터 해서 파일이 존재하지 않는 문제, 또는 메모리 누수와 같은 오류까지 다양한 종류의 오류를 경험하게 된다. 
이러한 오류는 발생 시점에 따라 크게 세 가지로 구분할 수 있다.

- 논리적 에러(Logical Error): 코드가 실행은 되지만, 의도한 대로 동작하지 않는 오류로, 프로그램이 예상과 다른 결과를 반환할 때 발생한다.
- 컴파일 에러(Compile-time Error): 코드가 컴파일될 때 발생하는 오류로, 주로 문법 오류나 잘못된 타입 사용 등이 원인이다.
- 런타임 에러(Runtime Error): 프로그램이 실행되는 도중 발생하는 오류로, 주로 NullPointerException이나 ArrayIndexOutOfBoundsException과 같은 예외가 이에 해당한다. 

## 논리적 에러

논리적 에러(Logical Error)는 흔히 버그로 알려져 있으며, 프로그램이 정상적으로 실행되고 있는 것처럼 보여도 예상한 결과가 나오지 않음으로써 문제를 일으킬 수 있다. 
이러한 오류는 사용자가 의도한 작업이 제대로 수행되지 않게 하여 서비스 이용에 지장이 될 수 있다.

논리적 오류는 프로그램 입장에서는 아무런 문제 없이 실행되기 때문에 에러 메시지를 출력하지 않는다. 따라서 개발자가 직접 프로그램의 전반적인 로직과 알고리즘을 검토해야 한다.

## 컴파일 에러

컴파일 에러(Compilation Error)는 프로그램을 컴파일하는 과정에서 발생하는 오류로, 대표적인 원인으로는 문법 오류(syntax error)가 있다.

컴파일에러는 IDE(Integrated Development Environment)에서 일정 주기로 소스를 자동으로 컴파일하여 오류를 미리 표시함으로써 즉시 알려주는 경우가 많아, 비교적 해결하기 쉬운 오류다.
컴파일에 성공하지 않으면 프로그램이 생성되지 않아 실행 자체가 불가능하므로, 개발자는 컴파일러가 표시하는 오류를 수정하여 해결하면 된다.

## 런타임 에러

런타임 에러(Runtime Error)는 컴파일 과정에서 문제없이 통과해 프로그램이 실행되더라도 실행 중에 발생하는 오류로, 프로그램이 비정상적으로 종료되거나 예상치 못한 결과를 초래할 수 있으며, 메모리 부족같은 외부요인으로 인해 발생하기도 한다.

이것이 이 글에서 중점으로 생각해보는 내용이다. 이러한 런타임 에러는 주로 설계 미숙에서 기인하며, 발생 시 역추적하여 원인을 파악해야 한다.
이를 방지하기 위해서는 다양한 예외 상황을 미리 고려하고 대비해야 한다.

## 오류와 예외
자바에서는 **실행 시(Runtime) 발생할 수 있는 문제를 에러(Error)와 예외(Exception)로 구분**한다.

![Error Exception](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-exception-error/java-exception-error_1.png)

에러는 메모리 부족(`OutOfMemoryError`)이나 스택 오버플로우(`StackOverflowError`)처럼, 프로그램 코드로 해결할 수 없는 심각한 오류다. 
에러는 예측이 어려우며 발생 시 복구가 거의 불가능하다. 시스템이나 JVM 레벨에서 발생하는 경우가 개발자가 대처하기도 힘들다.

예외는 잘못된 로직, 잘못된 입력값, 예상 외의 입력 패턴 등으로 인해 발생하는 오류다.
그래서 예외는 에러와 달리 발생하더라도 대비 코드를 작성해, 예상치 못한 상황에서도 프로그램이 비정상적으로 종료 혹은 동작이 수행되지 않도록 방지할 수 있다.
이러한 예외에 대한 대비 코드가 예외 처리 문법인 `try-catch`다.

# 자바의 예외 클래스

<hr>

## 예외 클래스의 계층구조

자바는 프로그램 실행 중 예외가 발생하면 해당 예외에 맞는 객체를 생성하고, 예외처리 코드에서 이 객체를 이용해 오류를 파악하고 해결할 수 있게 도와준다.
자바에서는 오류를 `Error`와 `Exception`라는 클래스로 계층적으로 구조를 나누어 관리한다.

![Throwable Hierarchy](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-exception-error/java-exception-error_2.png)

`Error` 클래스는 주로 시스템 레벨의 심각한 오류를 나타내며, 개발자가 해결할 수 없는 외부적인 문제로 간주된다. 
반면, `Exception` 클래스는 애플리케이션 레벨에서 발생하는 오류를 관리하기 때문에, 우리가 주로 다루어야 할 대상이다.

> `Throwable` 클래스는 최상위 클래스인 `Object`를 상속받는다. 예외와 오류 메시지를 담는 역할을 하며, 대표적으로 `getMessage()`와 `printStackTrace()` 메서드를 제공하여 예외의 원인과 발생 위치를 추적할 수 있게 한다.
 
자바에서 다루는 모든 예외는 `Exception` 클래스로 처리하는데 컴파일 시점에서 체크되는 `Checked Exception`과 런타임에 발생하는 `RuntimeException`으로 나누어 관리한다.

![Exception Hierarchy](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-exception-error/java-exception-error_3.png)

### 컴파일 타임 예외 클래스

`Checked Exception`은 프로그램 외부 요인으로 인해 발생하는 예외로, 컴파일러가 예외처리를 강제한다. 

- `FileNotFoundException`: 파일을 찾을 수 없을 때 발생한다.
- `ClassNotFoundException`: 클래스가 로드되지 않았을 때 발생한다.
- `IOException`: 입출력 작업 중 문제가 발생할 때 발생한다.
- `SQLException`: 데이터베이스 접근 오류 발생 시 발생한다.

### 런타임 예외 클래스

반면, `RuntimeException`은 개발자의 실수로 인해 발생하는 예외로, 주로 코드의 논리적 오류에서 비롯된다. 
예외처리를 강제하지 않는다.

- `IndexOutOfBoundsException`: 배열이나 리스트의 범위를 벗어났을 때 발생한다.
- `NullPointerException`: null인 객체에 접근할 때 발생한다.
- `ArithmeticException`: 숫자를 0으로 나누려 할 때 발생한다.
- `ClassCastException`: 잘못된 타입 변환 시 발생한다.
- `ArrayIndexOutOfBoundsException`: 배열의 범위를 넘어선 인덱스를 참조할 때 발생한다.
- `NumberFormatException`: 정수가 아닌 문자열을 정수로 변환할 때 발생한다.

# Checked Exception과 Unchecked Exception

<hr>

`Exception`은 예외를 처리할지 여부를 강제할지에 따라 `Checked Exception`과 `Unchecked Exception`으로 나눈다. 
간단히 정리하자면 `Checked Exception`은 컴파일 단계에서 검출되는 예외이고, `Unchecked Exception`은 런타임 중에 발생하는 예외를 말한다.

![Exception Hierarchy](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-exception-error/java-exception-error_4.png)

## 코드에서 명시적 예외 처리 유무

Checked Exception와 Unchecked Exception의 차이점은 명시적 예외 처리의 의무 여부이다.
`Checked Exception`은 컴파일 단계에서 체크하기 때문에 예외처리를 하지 않았다면 컴파일이 진행되지 않는다. 
따라서 `Checked Exception`을 발생시킬 가능성이 있는 메서드라면 반드시 `try-catch`로 감싸거나 `throws`로 예외를 처리해야 한다.

```java
// try - catch로 예외 처리
public static void fileOpen() {
    try {
        FileWriter file = new FileWriter("data.txt");
        file.write("Hello World");
        file.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
// throws로 예외 처리
public static void fileOpen() throws IOException {
    FileWriter file = new FileWriter("data.txt");
    file.write("Hello World");
    file.close();
}
```

반면, `Unchecked Exception`는 개발자가 충분히 예방할 수 있는 경우로 명시적인 예외처리가 강제되지 않는다. 
즉, 런타임 시 예외가 발생하더라도, 개발자가 사전에 주의를 기울여 방지할 수 있기 때문에 자바 컴파일러는 예외처리를 필수로 요구하지 않는다. 

```java
public class Main {
    public static void main(String[] args) {
        while (true) {
            String s = null;
            s.length(); // NullPointerException 발생 (Unchecked Exception이므로 예외 처리 의무 없음)
        }
    }
}
```

위 코드는 `NullPointerException`을 발생시키지만, `Unchecked Exception`이기 때문에 `try-catch`로 감싸지 않아도 컴파일 시 오류가 발생하지 않는다. 
프로그램은 예외가 발생해도 오류 로그만 쌓일 뿐, 프로그램 전체가 즉각 종료되는 상황을 초래하지 않는다.

## Checked Exception를 Unchecked Exception로 변환하기

`Checked Exception`은 반드시 `try-catch`로 감싸거나 `throws`로 처리해야 하지만, 모든 코드에서 예외 처리를 강제하는 것은 번거롭고 가독성을 해칠 수 있다. 
이때 `Chained Exception` 기법을 사용해 `Checked Exception`을 `Unchecked Exception`으로 변환하면, 예외 처리를 선택적으로 할 수 있다.

예를 들어, `IOException` 같은 `Checked Exception`을 `RuntimeException`으로 감싸면 `Unchecked Exception`으로 전환되어 컴파일러가 예외 처리를 강제하지 않는다.

```java
public class Main {
    public static void main(String[] args) {
        install();
    }

    public static void install() {
        throw new RuntimeException(new IOException("설치할 공간이 부족합니다."));
    }
}
```