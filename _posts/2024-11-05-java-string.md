---
layout: post
title: "자바의 String 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

자바에서 `String`은 문자열 데이터를 다루기 위해 사용한다. 

이 글에서는 `String`에 대해서 자세히 알아본다.
# String의 특징
<hr>

## String은 객체(Object)
 자바에서 `String`은 `int`,`char`와 달리 기본형(Primitive Type) 변수가 아닌 참조형(Reference Type) 변수로 분류 된다.
 
즉, 스택(Stack) 영역이 아닌 힙(Heap) 영역에서 생성되고 관리된다는 말이다.

## String은 불변(Immutable)
기본적으로 자바에서는 `String`의 값을 변경할 수 없다.  

`String`으로 생성한 `str`변수가 있고, 참조하는 메모리의`"Hello"`라는 값이 있을 때, `"World"`라는 문자열을 `+`연산자를 통해 더해서 String 객체의 값을 변경시키고자 할 때 실제 메모리에서는 `"Hello World"`를 따로 만들고 변수`str`를 다시 참조하는 식으로 작동한다.
```java
String str = "Hello";
str = str + " World";

System.out.println(str); // Hello World
```

`hashCode()` 메소드를 이용해 실제로 변수가 가지고 있는 주소값을 찍어보면 알 수 있다.
> `hashCode()` 메소드는 객체의 메모리 번지를 이용해서 해시코드를 만들어 리턴하는 메소드이다.

```java
String str = "Hello";

System.out.println(str.hashCode()); // 69609650

str = str + " World";

System.out.println(str.hashCode()); // -862545276
```
똑같은 변수 str 의 해시코드(주소값)을 출력했음에도 **가지고 있는 값이 바뀜에 따라 아예 주소값이 달라짐**을 알 수 있다.
즉, **문자열 값 자체는 불변이라 변경할수 없기 때문에 새로운 문자열 데이터 객체를 대입하는 식으로 값을 대체 하기 때문에** 이러한 현상이 생기는 것이다.

### 왜 불변으로 설계 되었는가?
이처럼 `String`이 불변적인 특성을 가지는 이유는 크게 3가지로 꼽을 수 있다.

첫번째는 JVM(자바 가싱 머신) 에서는 따로 String Constant Pool 이라는 독립적인 영역을 만들고 문자열들을 Constant 화 하여 다른 변수 혹은 객체들과 공유하게 되는데, 이 과정에서 **데이터 캐싱**이 일어나고 그 만큼 성능적 이득을 취할 수 있기 때문이다.

두번째는 데이터가 불변(immutable) 하다면 Multi-Thread 환경에서 동기화 문제가 발생하지 않기 때문에 더욱 safe 한 결과를 낼 수 있기 때문이다.

세번째는 보안(Security) 적인 측면을 들 수 있다.

예를 들어 데이터베이스 사용자 이름, 암호는 데이터베이스 연결을 수신하기 위해 문자열로 전달되는데, 만일 번지수의 문자열 값이 변경이 가능하다면 해커가 참조 값을 변경하여 애플리케이션에 보안 문제를 일으킬 수 있다.

# String의 주소 할당 방식
<hr>

String 변수를 선언하는 방법은 대표적으로 두가지 방식이 있다.

1. `String Literal`을 이용한 방식
2. `new String("")`을 이용한 방식

```java
String str1 = "Hello"; // String Literal

String str2 = new String("Hello"); // new String("")
```
이 둘은 `"Hello"`라는 같은 문자열 값을 저장한지만, JVM 메모리 할당에서 차이가 존재한다.

## String Contstant Pool
`String`의 주소 할당을 어떠한 방식으로 하는지에 따라 메모리에서 형태가 다르게 된다.

`String Literal`을 변수에 저장하게 되면 이 값은 `String Constant Pool`이라는 영역에 존재하게 되고, `new` 연산자를 통해 `String`을 생성하면 이 값은 `Heap` 영역에 존재하게 된다.

```java
String str1 = "Hello";
String str2 = "Hello";

String str3 = new String("Hello");
String str4 = new String("Hello");
```

위의 코드를 실행하면 문자열 리터럴 값으로 두 변수 `str1`, `str2`가 같은 메모리 주소를 가리킨다.

그 이유는 `String`이 불변(immutable)하다는 특성 덕분에, 동일한 `String Literal`은 `String Constant Pool`이라는 메모리 영역에서 재사용되어 같은 문자열 가리킨다.

이러한 이유로 `str1`과 `str2`는 동일한 메모리 주소를 참조하게 된다. 

정리하면, `String Constant Pool`은 동일한 문자열 리터럴을 캐싱하여 불필요한 객체 생성을 줄여 메모리를 사용을 최적화하고 성능을 향상시킨다.
이러한 이유로 new String() 방식보다 문자열 리터럴 할당이 선호된다.

## String의 ==, equqls() 차이점
 우선 `==` 연산자와 `equals()` 메소드의 차이는 `주소값을 비교하냐`, `대상의 값 자체를 비교하냐`의 차이다.
그래서 `String Literal`의 비교는 `==` 연산자를 사용해도 `String Constant Pool`에서 같은 객체 값을 참조하고 있기 때문에 주소값이 같아 `true`가 반환된다.

하지만 `new Stirng("")`의 비교는 힙 메모리에서 다른 주소 값을 참조하고 있어서 `==` 연산자를 사용하면 `false`가 반환된다. 따라서 `new Stirng("")`은 주소 값이 아닌 그 안에 값 자체를 비교해야 하고 이 역할을 `equals()` 메소드가 한다.
```java
String str1 = "Hello"; // String Literal
String str2 = "Hello";

String str3 = new String("Hello"); // new String("")
String str4 = new String("Hello");

// String Literal 비교
System.out.println(str1 == str2); // true

// new String("") 비교
System.out.println(str3 == str4); // false
System.out.println(str3.equals(str4)); // true

// 리터럴과 객체 문자열 비교
System.out.println(str1 == str3); // false
System.out.println(str3.equals(str1)); // true
```

