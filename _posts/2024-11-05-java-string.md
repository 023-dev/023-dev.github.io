---
layout: post
title: "Java의 String 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# Java String의 특징
<hr>

## String은 객체(Object)이다.
 Java에서 `String`은 `int`,`char`와 달리 기본형(Primitive Type)이 아닌 참조형(Reference Type) 변수로 분류 된다.
 
즉, 스택(Stack) 영역이 아닌 객체와 같이 힙(Heap) 영역에서 문자열 데이터가 생성되고 다뤄진다는 말이다.
이상하게 혼자만 자료형 키워드 첫글자가  대문자인 점을 예의 주시해야 한다.

```java
int age = 35;
String name = "홍길동";
```

## String은 불변(Immutable)이다.
기본적으로 자바에서는 String 객체의 값은 변경할 수 없다.  

아래 코드를 보면 보면 변수`a`가 참조하는 메모리의`"Hello"`라는 값에`"World"`라는 문자열을 더해서 String 객체의 값을 변경 시킨 것으로 보일수도 있다. 하지만 실제로는 메모리에`"Hello World"`를 따로 만들고 변수`a`를 다시 참조하는 식으로 작동한다.
```java
String a = "Hello";
a = a + " World";

System.out.println(a); // Hello World
```

`hashCode()` 메소드를 이용해 실제로 변수가 가지고 있는 주소값을 찍어보면 알 수 있다.
> `hashCode()` 메소드는 객체의 메모리 번지를 이용해서 해시코드를 만들어 리턴하는 메소드이다.
```java
String a = "Hello";

System.out.println(a.hashCode()); // 69609650

a = a + " World";

System.out.println(a.hashCode()); // -862545276
```
똑같은 변수 a 의 해시코드(주소값)을 출력했음에도 들고 있는 값이 바뀜에 따라 아예 주소값이 달라짐을 알 수 있다.
즉, 문자열 값 자체는 불변이라 변경할수 없기 때문에 새로운 문자열 데이터 객체를 대입하는 식으로 값을 대체 하기 때문에 이러한 현상이 생기는 것이다.

### 왜 불변으로 설계 되었는가?
이처럼 String이 불변적인 특성을 가지는 이유는 크게 3가지로 꼽을 수 있다.

첫번째는 JVM(자바 가싱 머신) 에서는 따로 String Constant Pool 이라는 독립적인 영역을 만들고 문자열들을 Constant 화 하여 다른 변수 혹은 객체들과 공유하게 되는데, 이 과정에서 데이터 캐싱이 일어나고 그 만큼 성능적 이득을 취할 수 있기 때문이다.

두번째는 데이터가 불변(immutable) 하다면 Multi-Thread 환경에서 동기화 문제가 발생하지 않기 때문에 더욱 safe 한 결과를 낼 수 있기 때문이다.

세번째는 보안(Security) 적인 측면을 들 수 있다.

예를 들어 데이터베이스 사용자 이름, 암호는 데이터베이스 연결을 수신하기 위해 문자열로 전달되는데, 만일 번지수의 문자열 값이 변경이 가능하다면 해커가 참조 값을 변경하여 애플리케이션에 보안 문제를 일으킬 수 있다.

## String의 주소 할당 방식
String 변수를 선언하는 방법은 대표적으로 두가지 방식이 있다.
1. 리터럴을 이용한 방식
2. new 연산자를 이용한 방식
