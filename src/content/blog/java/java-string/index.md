---
visible: false
title: "자바 문자열(String)"
date: 2024-11-05 18:00:00
tags: ["Engineering"]
---

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
자바에서 `String`은 위에 보다시피 클래스로 `int`,`char`와 달리 기본형 변수가 아닌 참조형 변수로 분류 된다.
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
`String`의 내부 구조를 위에서 보여줬듯이 `char[]` 혹은 `byte[]`를 가지고 있지만, 이 배열은 `final`로 선언되어 있어서 한 번 생성되면 변경할 수 없다.

하지만 `String`의 값을 변경하는 것 처럼 보이는 연산을 할 수 있다.

```java
String str = "Hello";

str = str + " World";

System.out.println(str); // Hello World
```

위의 코드를 보면 `str` 변수에 `Hello`라는 문자열을 대입하고, `str` 변수에 `World`라는 문자열을 더해서 다시 대입했다.
이렇게 보면 `String`의 값을 변경한 것 처럼 보이지만, 실제로는 새로운 문자열 데이터 객체를 생성하고, 이를 `str` 변수가 참조하게 된다.

즉, `String`은 불변하다는 것은 한 번 생성된 문자열은 변경할 수 없다는 것을 의미한다.

`hashCode()` 메소드를 이용해 실제로 변수가 가지고 있는 주소값을 찍어보면 알 수 있다.

```java
String str = "Hello";

System.out.println(str.hashCode()); // 69609650

str = str + " World";

System.out.println(str.hashCode()); // -862545276
```

똑같은 변수 str 의 해시코드(주소값)을 출력했음에도 가지고 있는 값이 바뀜에 따라 아예 주소값이 달라짐을 알 수 있다.  
즉, 문자열 값 자체는 불변이라 변경할수 없기 때문에 새로운 문자열 데이터 객체를 대입하는 식으로 값을 대체 하기 때문에 이러한 현상이 생기는 것이다.

### 왜 불변으로 설계 되었는가?
이처럼 `String`이 불변적인 특성을 가지는 이유는 크게 3가지로 꼽을 수 있다.
1. JVM 에서는 따로 String Constant Pool 이라는 독립적인 영역을 만들고 문자열들을 Constant 화 하여 다른 변수 혹은 객체들과 공유하게 되는데, 이 과정에서 데이터 캐싱이 일어나고 그만큼 성능적 이점을 취할 수 있기 때문이다.
2. 데이터가 불변성을 유지한다면 Multi-Thread 환경에서 동기화 문제가 발생하지 않기 때문에 더욱 safe 한 결과를 낼 수 있기 때문이다.
3. 보안 적인 측면을 들 수 있다.
예를 들어 데이터베이스 사용자 이름, 암호는 데이터베이스 연결을 수신하기 위해 문자열로 전달되는데,
만일 번지수의 문자열 값이 변경이 가능하다면 누군가가 참조 값을 변경하여 애플리케이션에 보안 문제를 일으킬 수 있다.

### 불변인 String 클래스의 단점
하지만 불변한 `String` 클래스는 메모리 사용량이 많아지는 단점이 있다.
불변인 `String` 클래스는 문자열을 변경할 때마다 새로운 문자열 객체를 생성해야 한다는 점이다.
문자를 변경하는 상황이 자주 발생하는 상황이라면 `String` 객체를 만들고 GC가 빈번히 발생한다.
결과적으로 CPU와 메모리를 많이 사용하게 되어 성능에 영향을 미칠 수 있다.
그리고 문자열의 크기가 클수록, 문자열을 더 자주 변경할수록 이러한 단점이 더욱 부각된다.

이러한 단점을 보완하기 위해 `StringBuffer`와 `StringBuilder` 클래스가 존재한다.
`StringBuffer`와 `StringBuilder`는 `String`과 달리 가변적인 특성을 가지고 있어 문자열을 변경할 때 새로운 객체를 생성하지 않고 기존 객체를 변경한다.
이러한 특성 때문에 문자열을 변경하는 작업이 많은 상황에서는 `StringBuffer`와 `StringBuilder`를 사용하는 것이 성능상 이점이 있다.

자세한 내용은 [자바의 String, StringBuffer, StringBuilder 차이 알아보기](https://023-dev.github.io/blog/java/java-string-stringbuffer-stringbuilder/)를 참고하자.

## String의 주소 할당 방식

String을 통해 문자열을 생성하는 방법은 대표적으로 두가지 방식이 있다.

1. `String Literal`을 이용한 방식
2. `new String("")`을 이용한 방식

```java
String str1 = "Hello"; // String Literal

String str2 = new String("Hello"); // new String("")
```
이 둘은 `"Hello"`라는 같은 문자열 값을 저장한지만, JVM 메모리 할당에서 차이가 존재한다.

### String은 캐싱이 된다.
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
이러한 이유로 `new String()` 방식보다 문자열 리터럴 할당이 선호된다.

> 프로그래밍에서 풀(Pool)은 공용 자원을 모아둔 곳을 뜻한다.
> 여러 곳에서 함께 사용할 수 있는 객체를 필요할 때마다 생성하고, 제거하는 것은 비효율적이다.
> 대신 이렇게 문자열 리터럴을 `String Constant Pool`에 저장해두고, 필요할 때마다 참조하는 방식으로 메모리를 효율적으로 사용할 수 있다.
> 참고로 앞서 언급했듯이 `String Constant Pool`은 `Heap` 영역에 존재한다.
> 그리고 `String Constant Pool`에서 문자열을 찾을 때는 해시 알고리즘을 사용하는데,
> 이 떄문에 빠른 속도로 원하는 `String` 인스턴스를 찾을 수 있다.

## String을 비교하는 방법

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