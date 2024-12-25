---
layout: post
title: "자바의 String 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# String
<hr>

자바에서 문자를 다루는 대표적인 타입은 `char`와 `String` 이렇게 2가지가 있다.
기본형인 `char`는 문자 하나를 다루는데 사용되고, `char`를 사용해서 여러 문자 즉 문자열을 다루기 위해선 `char[]`을 사용해야 한다.
하지만 이렇게 `char[]`을 사용하면 문자열을 다루는데 불편함이 있어서 자바에서는 `String`이라는 클래스를 제공한다.

## String 내부 구조
`String` 클래스는 대략 다음과 같은 구조로 이루어져 있다.

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
    
    private final char value[]; //자바 9이전
    private final byte value[];//자바 9이후
    private final int offset;
    
    private final int count;
    private int hash; // Default to 0
    
    public String concat(String str) {...}
    public int length() {...}
}
```

클래스이므로 필드와 메소드로 구성되어 있다.

### 필드(속성)

```java
private final char value[];
```

`String`은 `char`형 배열을 필드로 가지고 있고, 여기에는 `String`이 가지고 있는 실제 문자열을 저장하는 배열이다.
이 말의 뜻은 문자 데이터 자체는 `char`형 배열에 저장되어 있고, `String` 객체는 이 배열을 참조하고 있다는 것이다.
그러면 `char[]`가 불편해서 `String`을 사용하는 거 아닌가? 근데 `String`도 결국 `char[]`를 참조하고 있으니 똑같은 거 아닌가? 라는 의문이 들 수 있다.
하지만 `String` 클래스는 `char[]`를 참조하고 있지만, 개발자가 직접 다루기 힘든 `char[]`를 내부에 숨겨놓고, `String` 클래스의 메소드를 통해 문자열을 다룰 수 있게 해준다.

> 참고
> 자바 9부터는 `String` 클래스 내부에 `byte[]`를 사용하는 방식으로 변경되었다.
> 자바에서 문자 하나를 표현하는데 `char` 타입을 사용하면 `2byte`가 필요하다.
> 여기서 영어, 숫자는 보통 `1byte`로 표현하고(정확히는 Latin-1 인코딩의 경우 1byte로 표현 가능),
> 그렇지 않은 다른 언어는 `2byte`인 `UTF-16` 인코딩으로 표현해야 한다.
> 때문에 `char` 타입을 사용하면 메모리 낭비가 발생할 수 있다.
> 그래서 자바 9부터는 `byte[]`를 사용하여 문자열을 저장하고, 
> `String` 클래스의 메소드를 통해 `byte[]`를 `char[]`로 변환하여 사용함으로써 메모리를 더 효율적으로 사용할 수 있게 되었다.

## String은 클래스
 자바에서 `String`은 위에 보다시피 클래스로 `int`,`char`와 달리 기본형(Primitive Type) 변수가 아닌 참조형(Reference Type) 변수로 분류 된다.
참조형은 변수에 실제 값이 아닌 주소값을 가지고 있기에, 원칙적으로 `+`와 같은 연산을 할 수 없다.
자바에서 `String`은 클래스이지만, 문자열을 다루기 쉽게 하기 위해 `+`연산자를 사용할 수 있게 오버로딩 되어 있다.

```java
String str1 = "Hello";
String str2 = "World";

String str3 = str1 + str2;

System.out.println(str3); // HelloWorld
```

또한 `String`는 참조형이므로 변수에 문자열을 대입하면 실제 문자열은 메모리의 힙(Heap) 영역에 생성되고, `String` 변수는 이 문자열을 참조하게 된다.


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


## String의 주소 할당 방식
<hr>

String을 통해 문자열을 생성하는 방법은 대표적으로 두가지 방식이 있다.

1. `String Literal`을 이용한 방식
2. `new String("")`을 이용한 방식

```java
String str1 = "Hello"; // String Literal

String str2 = new String("Hello"); // new String("")
```
이 둘은 `"Hello"`라는 같은 문자열 값을 저장한지만, JVM 메모리 할당에서 차이가 존재한다.

### String Contstant Pool
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

> 참고
> 풀(Pool)은 자원이 모여있는 곳을 의미한다.
> 프로그래밍에서 풀(Pool)은 공용 자원을 모아둔 곳을 뜻한다.
> 여러 곳에서 함께 사용할 수 있는 객체를 필요할 때마다 생성하고, 제거하는 것은 비효율적이다.
> 대신 이렇게 문자열 리터럴을 `String Constant Pool`에 저장해두고, 필요할 때마다 참조하는 방식으로 메모리를 효율적으로 사용할 수 있다.
> 참고로 앞서 언급했듯이 `String Constant Pool`은 `Heap` 영역에 존재한다.
> 그리고 `String Constant Pool`에서 문자열을 찾을 때는 해시 알고리즘을 사용하는데, 
> 이 떄문에 빠른 속도로 원하는 `String` 인스턴스를 찾을 수 있다.

## String 비교

`String` 클래스를 비교할 때는 `==` 비교가 아니라 `equals()` 메소드를 사용해야 한다.

- 동일성(Idnetity): `==` 연산자를 사용해서 두 객체의 참조가 동일한 객체를 가리키고 있는지 확인.
- 동등성(Equality): `equals()` 메소드를 사용해서 두 객체의 값이 같은지 확인.

간단히 정리하자면 `==` 연산자와 `equals()` 메소드의 차이는 `주소값을 비교하냐`, `대상의 값 자체를 비교하냐`의 차이다.
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

## String의 메소드

### 문자열 정보 조회
- `length()`: 문자열의 길이를 반환한다.
- `charAt(int index)`: 문자열의 특정 인덱스에 위치한 문자를 반환한다.
- `isEmpty()`: 문자열이 비어있는지 확인한다.(길이가 0인 경우)
- `isBlank()`: 문자열이 공백 문자로만 이루어져 있는지 확인한다.(길이가 0인 경우 || 공백(witespace)만 있는 경우), 자바 11부터 지원

### 문자열 비교
- `equals(Object obj)`: 문자열이 주어진 객체와 동일한지 비교한다.
- `equalsIgnoreCase(String str)`: 대소문자를 무시하고 문자열이 같은지 비교한다.
- `compareTo(String str)`: 문자열을 사전 순으로 비교한다.
- `compareToIgnoreCase(String str)`: 대소문자를 무시하고 문자열을 사전 순으로 비교한다.
- `startsWith(String prefix)`: 문자열이 특정 문자열로 시작하는지 확인한다.
- `endsWith(String suffix)`: 문자열이 특정 문자열로 끝나는지 확인한다.


### 문자열 검색
- `contains(CharSequence s)`: 문자열이 특정 문자열을 포함하는지 확인한다.
- `indexOf(String str)`: 문자열에서 특정 문자열이 처음으로 등장하는 인덱스를 반환한다.
- `lastIndexOf(String str)`: 문자열에서 특정 문자열이 마지막으로 등장하는 인덱스를 반환한다.

### 문자열 조작 및 변환
- `concat(String str)`: 문자열을 연결한다.
- `substring(int beginIndex)`: 문자열의 특정 인덱스부터 끝까지의 부분 문자열을 반환한다.
- `replace(CharSequence target, CharSequence replacement)`: 문자열에서 특정 문자열을 다른 문자열로 대체한다.
- `replaceAll(String regex, String replacement)`: 문자열에서 특정 정규 표현식과 일치하는 문자열을 다른 문자열로 대체한다.
- `replaceFirst(String regex, String replacement)`: 문자열에서 특정 정규 표현식과 일치하는 첫 번째 문자열을 다른 문자열로 대체한다.
- `toLowerCase()`: 문자열을 소문자로 변환한다.
- `toUpperCase()`: 문자열을 대문자로 변환한다.
- `trim()`: 문자열의 앞뒤 공백을 제거한다.
- `strip()`: 문자열의 앞뒤 공백을 제거한다. 자바 11부터 지원

### 문자열 분할 및 결합
- `split(String regex)`: 문자열을 특정 정규 표현식을 기준으로 나누어 배열로 반환한다.
- `join(CharSequence delimiter, CharSequence... elements)`: 문자열을 결합한다.

### 기타 유틸리티
- `format(String format, Object... args)`: 지정된 형식 문자열을 사용하여 문자열을 생성한다.
- `valueOf(Object obj)`: 지정된 값을 문자열로 변환한다.
- `toCharArray()`: 문자열을 문자 배열로 변환한다.
- `matches(String regex)`: 문자열이 특정 정규 표현식과 일치하는지 확인한다.

> 참고
> `CharSequence`는 `String`, `StringBuffer`, `StringBuilder` 클래스의 부모 인터페이스이다.
> 문자열을 처리하는 다양한 클래스를 사용할 때, `CharSequence`를 사용하면 유연하게 문자열을 다룰 수 있다.

 