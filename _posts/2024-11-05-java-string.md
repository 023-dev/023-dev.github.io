---
layout: post
title: "Java의 String 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

Java의 `String`은 불변(Immutable) 객체로

# Java String의 특징
## String은 객체이다.
<hr>
 Java에서 `String`은 `int`,`char`와 달리 기본형(Primitive Type)이 아닌 참조형(Reference Type) 변수로 분류 된다.
 
즉, 스택 영역이 아닌 객체와 같이 힙 영역에서 문자열 데이터가 생성되고 다뤄진다는 말이다.
이상하게 혼자만 자료형 키워드 첫글자가  대문자인 점을 예의 주시해야 한다.
```java
int age = 35;
String name = "홍길동";
```

