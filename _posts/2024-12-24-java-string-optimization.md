---
layout: post
title: "String Optimization"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# String Optimization
자바 컴파일러는 다음과 같이 문자열을 처리하는 코드를 만나면, 이를 최적화하여 하나의 문자열로 만들어준다.

## String literal 결합 최적화
```java
String str1 = "Hello";
String str2 = "World";
String str3 = str1 + str2;
```

위 코드는 `str1`과 `str2`를 합쳐 `str3`에 저장하는 코드이다. 하지만 자바 컴파일러는 이 코드를 다음과 같이 최적화하여 처리한다.

```java
String str3 = "HelloWorld";
```

컴파일과정에서 문자열을 합치는 코드를 만나면, 이를 최적화하여 하나의 문자열로 만들어준다.
따라서 런타임에 별도의 문자열 결합 연산을 수행하지 않기 때문에 성능이 향상된다.

## String 변수 최적화
문자열 변수의 경우 그 안에 어떤 문자열이 들어있는지 컴파일 시점에서는 알 수 없기 때문에, 단순하게 결합할 수 없다.

```java
String result = str1 + str2;
```

이런 상황인 경우, 다음과 같이 최적화를 수행한다.(최적화 방식은 자바 버전에 따라 다를 수 있다.)

```java
String result = new StringBuilder().append(str1).append(str2).toString();
```

> 참고
> 자바 9부터는 `StringConcatFactory` 클래스를 통해 `invokedynamic`를 사용하여 문자열 결합 최적화를 수행한다.

이렇듯 자바가 최적화 처리해주기 때문에 간단한 경우에는 `StringBuilder`를 사용하지 않아도 된다.

## String 최적화가 어려운 경우
하지만 다음과 같이 문자열을 루프안에서 문자열을 결합하는 경우에는 최적화가 이루어지지 않는다.

```java
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i;
}
```

왜냐하면 루프안에서 문자열을 결합할 때마다 다음과 같이 새로운 문자열을 생성하기 때문이다.

```java
String result = "";
for (int i = 0; i < 10000; i++) {
    result = new StringBuilder().append(result).append(i).toString();
}
```

반복문의 내부에서는 최적화가 되는 것 처럼 보이지만, 실제로는 반복 횟수만큼 새로운 문자열을 생성하고 이를 참조하게 된다.
반복문 내에서의 문자열 연결은 런타임에 연결할 문자열의 개수와 내용이 결정된다.
이런 경우, 컴파일러는 얼마나 많은 반복이 일어날지, 각 반복에서 어떤 문자열이 결합될지 알 수 없기 때문에 최적화를 수행하기에 어려움이 있다.

`StringBuffer`도 마찬가지로 최적화가 이루어지지 않을 것이다.
아마도 대략 반복 횟수인 10,000번만큼 `StringBuffer` 객체를 생성하고, 이를 참조하게 했을 것이다.

위 코드를 실행하면, `String`을 사용한 경우에는 약 1초 정도가 걸렸다. 
이럴 떄는 `StringBuilder`를 사용하면 된다.

```java
StringBuilder result = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    result.append(i);
}
```

`StringBuilder`를 사용한 경우에는 1ms도 걸리지 않는다.

정리를 하자면 문자열을 결합하는 상황의 대부분의 경우 최적화가 되므로 `+` 연산을 사용하면 된다.
하지만 `StringBuiler`를 사용하는 것이 더 좋은 경우도 있다.


## StringBuilder를 직접 사용하는 것이 더 좋은 경우
반복문에서 반복해서 문자를 연결할 때
조건문을 통해 동적으로 문자열을 조합할 때
복잡한 문자열의 특정 부분을 변경해야 할 때
매우 긴 대용량 문자열을 다룰 때
> 참고 - StringBuilder vs StringBuffer
> `StringBuilder` 와 똑같은 기능을 수행하는 `StringBuffer` 클래스도 있다.
> `StringBuffer` 는 내부에 동기화가 되어 있어서, 멀티 스레드 상황에 안전하지만 동기화 오버헤드로 인해 성능이 느리다.
> `StringBuilder` 는 멀티 쓰레드에 상황에 안전하지 않지만 동기화 오버헤드가 없으므로 속도가 빠르다.
> 자세한 내용은 [String vs StringBuilder vs StringBuffer](https://023-dev.github.io/2024-11-05/java-string-stringbuffer-stringbuilder)를 참고하면 되겠다.

## StringBuilder와 Method Chain
`String`은 `char[]`를 보다 효율적이고 쉽게 다룰 수 있도록 한 클래스이다.
`StringBuilder` 또한 이러한 기능들을 제공하는데 그 중 하나가 메서드 체인(Method Chain)이다.

`StringBuilder`의 `append()` 메서드의 내부코드를 보면 `this`로 자기 자신의 참조값을 반환하고 있다.

```java
public StringBuilder append(String str) {
    super.append(str);
    return this;
}
```

`StringBuilder`에서 문자열을 변경하는 대부분의 메서드도 메서드 체이닝 기법을 제공하기 위해 `this`를 반환하고 있다.
이를 이용하면 다음과 같이 메서드를 연쇄적으로 호출할 수 있다.

대표적으로 `insert()`, `delete()`, `reverse()`, `replace()` 등이 있다.

앞서 `StringBuilder`를 사용한 코드를 다음과 같이 개선할 수 있다.

```java
StringBuilder sb = new StringBuilder();
String string = sb.append("A").append("B").append("C").append("D")
        .insert(4, "Java")
        .delete(4, 8)
        .reverse()
        .toString();

System.out.println(string); // DCBA
```

이렇게 메서드 체인을 사용하면 코드가 간결해지고 가독성이 좋아진다.
메서드 체이닝의 구현은 복잡하고 번거롭지만 사용하는 입장에서는 편리함을 경험할 수 있다.
자바의 라이브러리와 오픈 소스들은 메서드 체이닝 기법을 많이 사용하고 있다.