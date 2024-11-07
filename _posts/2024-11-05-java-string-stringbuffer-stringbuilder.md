---
layout: post
title: "자바의 String, StringBuffer, StringBuilder 차이 알아보기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

자바에서는 `String`, `StringBuffer`, `StringBuilder`라는 3가지 클래스 자료형을 통해 문자열을 다룰 수 있다.

어떤 상황에 어떤 자료형을 사용하는 것이 성능적인 측면에서 좋은지 알아본다.

# StringBuffer / StringBuilder 클래스

<hr>

`StringBuffer`와 `StringBuilder` 클래스는 문자열을 연결이나 수정하는 연산을 할 때 주로 사용하는 자료형이다. 이 둘의 차이점을 간단하게 하자면 `StringBuffer`는 멀티 쓰레드 환경에서 안전하다는 장점이 있고, `StringBuilder`는 문자열 파싱 성능이 가장 우수하다는 장점이 있다.
`String`에서는 `+` 연산이나 `concat()` 메소드를 사용할 수 있지만 `String`의 특성상 **인스턴스의 문자열 값이 바뀌게 되면 새로운 String 인스턴스를 생성**하게 되어,
이러한 연산을 할수록 메모리랑 성능적인 측면에서 저하 발생된다.

```java
String str = "";
str +=  "Hello";
str +=  " ";
str +=  "World";
System.out.println(str);
```

그래서 자바에서는 이러한 이슈로 인해 연산을 전용으로 하는 자료형을 제공해 주고 있다. 

`StringBuffer` 클래스는 내부적으로 **버퍼(Buffer)라고 하는 독립적인 공간을 가지게되어, 문자열 연산을 할 때 버퍼에 적용하여 메모리나 성능적인 측면에서 저하가 발생하는 현상을 방지**한다.

```java
StringBuffer sb = new String();
sb.append("Hello");
sb.append(" ");
sb.append("World");
System.out.println(sb.toString());
```

> `StringBuffer`는 버퍼에 기본적으로 16개의 문자를 저장하는 크기를 지원한다. 이때 한 문자는 2바이트를 차지하므로, 초기 버퍼 크기는 총 32바이트이다. 생성자를 통해 크기를 설정할 수 있고 만일 문자열 연산 중 할당된 버퍼의 크기를 넘게 되면 자동으로 버퍼를 스케일업 해준다.

## StringBuffer 내장 메소드
`StringBuffer`클래스는 효율적인 문자열 연산을 위한 메소드를 제공하고 이 메서드를은 `StringBuilder` 클래스에서도 동일하게 제공된다.
- `append(...)`: 문자열을 끝에 추가
- `insert(int pos, ...)`: 지정 위치에 문자열 삽입
- `delete(int start, int end)`: 지정 범위의 문자열 삭제
- `deleteCharAt(int index)`: 특정 인덱스의 문자 삭제
- `replace(int start, int end, String str)`: 지정 범위의 문자열을 다른 문자열로 대체
- `reverse()`: 문자열을 뒤집음
- `substring(int start)`: 시작 위치부터 끝까지의 문자열 반환
- `substring(int start, int end)`: 지정 범위의 문자열 반환
- `toString()`: `StringBuffer` 객체를 `String`으로 변환
- `setCharAt(int index, char ch)`: 특정 인덱스의 문자 변경
- `setLength(int newLength)`: 문자열의 길이를 지정된 길이로 설정
- `capacity()`: 버퍼의 용량 반환
- `length()`: 현재 문자열의 길이 반환
- `charAt(int index)`: 특정 인덱스의 문자 반환
- `ensureCapacity(int minimumCapacity)`: 버퍼의 최소 용량 설정
- `trimToSize()`: 현재 문자열 길이에 맞게 버퍼 크기 조정


# Stinrg과 StringBuffer/StringBuilder 비교

<hr>

## 문자열 자료형의 불변성과 가변성

### String은 불변(Immutable)
자바에서는 `String`은 **불변(Immutable) 자료형**이다. 그래서 초기 값과 다른 값에 대한 연산에 많은 추가 자원을 사용하게 된다는 특징이 있다.

실제로 String 객체의 내부 구조를 보면 다음과 같이 되어 있다.

```java
public final class String implements java.io.Serializable, Comparable {
	private final byte[] value;
}
```

인스턴스 생성 시 생성자의 매개변수로 입력받는 문자열은 이 `value`라는 인스턴스 변수에 문자형 배열로 저장되게 된다. 이 `value`는 상수형인 `final`이니 값을 바꾸지 못하는 것이다.

아래 코드를 보면 변수 `str`이 참조하는 메모리의 "Hello"라는 값에 " World"라는 문자열을 더해서 `String` 객체의 자체의 값을 업데이트 시킨 것으로 볼 수 있지만 실제로는 메모리에 새로 "Hello World"라는 값을 저장한 영역을 만들고 `str`이 다시 참조하는 방식으로 작동한다. 

```java
String str = "Hello";
str += " World";

System.out.println(str);
```

![String](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-string-stringbuffer-stringbuilder/java-string-stringbuffer-stringbuilder_1.png)

이외에도 문자열을 다루는데 있어 가장 많이 사용하는 `trim`이나 `toUpperCase`, `toLowerCase` 같은 메소드 사용 형태를 보면, 문자열이 변경되는 것 처럼 보일 수 있지만 해당 메소드 수행 시 새로운 `String` 객체를 생성해서 반환할 뿐이다. 

```java
String str = "abc";  // "abc"
str.toUpperCase();  // "ABC"

System.out.println(str); // "abc"
```

자바에서 `String`을 불변으로 설정한 이유는 다음 글에서 볼 수 있다. 
[자바의 String 이해하기](https://023-dev.github.io/2024-11-05/java-string#:~:text=%ED%98%84%EC%83%81%EC%9D%B4%20%EC%83%9D%EA%B8%B0%EB%8A%94%20%EA%B2%83%EC%9D%B4%EB%8B%A4.-,%EC%99%9C%20%EB%B6%88%EB%B3%80%EC%9C%BC%EB%A1%9C%20%EC%84%A4%EA%B3%84%20%EB%90%98%EC%97%88%EB%8A%94%EA%B0%80%3F,-%EC%9D%B4%EC%B2%98%EB%9F%BC%20String%EC%9D%B4)

`String`은 문자열이 변할 때마다 계속해서 새로운 메모리를 잡게 되고, 변하기 전의 값이 있던 메모리는 가비지 컬렉션(Garbage Collector, GC) 대상이 되어 `Minor GC`을 빈번히 발생시킨다. 이러한 `Minor GC`의 잦은 발생은 `Full GC(Major GC)`으로 이어질 수 있다.

> `Minor GC`는 자바 메모리의 작은 영역에서 불필요한 메모리를 빠르게 정리하는 작업이며, `Full GC`는 전체 메모리를 대상으로 하는 더 큰 정리 작업이다. 이때 `Minor GC`가 빈번히 발생하면, 시스템은 `Full GC`를 시작한다. `Full GC`는 전체 메모리를 검사하고 불필요한 객체를 모두 제거하므로 시간이 오래 걸리고 CPU 자원을 많이 사용해 성능저하와 지연을 초래할 수 있다.

### StringBuffer/StringBuilder는 가변(Mutable)
`StringBuffer`와 `StringBuilder는`의 경우 문자열 데이터를 다룬다는 점에서 `String` 객체와 같지만, 객체의 공간이 부족해지는 경우 버퍼를 스케일업 해주어 가변적이라는 차이점이 있다. 

실제 `StringBuffer` 객체의 내부 구조를 보면 `String`과 달리 `final`이 없다.

```java
public final class StringBuffer implements java.io.Serializable {
	private byte[] value;
}
```

두 클래스는 내부적으로 데이터를 임시로 저장할 수 있는 메모리인 버퍼을 가지고 있어 버퍼에 문자열을 저장해두고 필요한 연산 작업을 추가적인 메모리 없이 작업을 할 수 있도록 설계되어 있다. 

```java
StringBuffer sb = new StringBuffer("Hello");
sb.append(" World");
System.out.println(sb.toString());
```

![StringBuffer](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-string-stringbuffer-stringbuilder/java-string-stringbuffer-stringbuilder_2.png)

따라서 값이 변함에 따라 새로운 객체를 생성하는 불변적인 `String` 보다 메모리와 성능적인 측면에서 좋기 때문에, 문자열 연산이 빈번하게 발생하는 경우에는 `String`가 아닌 `StringBuffer/StringBuilder`를 사용하는 것이 이상적이다.

## 문자열 자료형의 값 비교

### String 값 동등 비교
 `String`은 `equals()`을 사용해 동등 비교가 가능하다.

```java
String str1 = "Hello";
String str2 = new String("Hello");

System.out.println(str1 == str2; // false
System.out.println(str2.equals(str1)); //true
```

### StringBuffer/StringBuilder 값 동등 비교
`StringBuffer`와 `StringBuilder`는 `String`와 달리 `equals()` 메서드를 오버라이딩하지 않아 `==`로 비교한 것과 같은 결과를 얻게 되어 버린다.

```java
StringBuffer sb1 = new StringBuffer("Hello");
StringBuffer sb2 = new StringBuffer("Hello");

System.out.println(sb1 == sb2); // false
System.out.println(sb2.equals(sb1)); // false
```

그래서 `toString()`으로 `StringBuffer`와 `StringBuilder`을 `String`으로 변환 후 `equals()`로 비교를 한다.

```java
String sb1_tmp = sb1.toString();
String sb2_tmp = sb2.toString();
System.out.println(sb1_tmp.equals(sb2_tmp)); // true
```

## 문자열 자료형의 성능 비교
위에서 설명했듯이, `String`을 `+`으로 연산하면 불필요한 객체들이 힙(Heap) 메모리에 추가되어 안좋기 때문에 `StringBuffer`이나 `StringBuilder`의 `append()`를 통해 문자열 연산을 수행하는 것이 좋다.

하지만 이런 연산 작업 빈도 수가 적으면 `String`의 `+` 연산이랑 `StringBuffer`이나 `StringBuilder`의 `append()`가 차이가 없어 보일 수 도 있다.

```java
String str = "Hello" + " World";
// 컴파일 전 내부적으로 StringBuilder 클래스를 만든 후 아래와 같은 작업을 수행한다.
String str = new StringBuilder("Hello").append(" World").toString();
```

이처럼 겉으로는 보기에는 문자열 리터럴(String Literal)로 `+` 연산하거나, `StringBuilder`를 사용하거나 어차피 자동 변환해줘서 차이가 없어 보일지도 모른다.

하지만 다음과 같이 문자열을 합치는 일이 많을 경우 단순히 `+`연산을 쓰면 성능과 메모리 효율이 떨어지게 된다.

```java
String str = "";

for(int i = 0; i < 10000; i++) {
    str += i;
}

/* 반복 횟수 만큼 new StringBuilder() 메모리를 생성하고 다시 변수에 대입하는 미련한 짓을 하는 것을 알 수 있다. */

String str = "";

for(int i = 0; i < 10000; i++) {
    str = new StringBuilder("").append(i).toString();
}
```

위 코드에서 문자열 값을 변경하는 작업이 많을수록 성능저하를 유발하는 원인이 될 수 있다는 것을 느낄 수 있다.

그래서 만일 문자열 연산이 빈번하게 수행 될 경우 초기부터 `StringBuidler`을 사용해서 문자열을 관리하는게 이상적이다.

```java
StringBuilder sb = new StringBuilder();

for(int i = 0; i < 10000; i++) {
        sb.append(i);
}
```

![+ 연산자 성능 비교](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-string-stringbuffer-stringbuilder/java-string-stringbuffer-stringbuilder_3.png)

정리하자면, 문자열 연산 작업이 잦을 경우에는 `StringBuffer/StringBuilder`를, 문자열 변경 작업이 거의 없는 경우에는 `String`을 사용하는 것만 이상적이다.

# StringBuffer와 StringBuilder 차이점
<hr>
`StringBuffer`와 `StringBuilder`는 공통적으로 가변성을 가지고 있고, 제공하는 메서드도 같고, 사용법도 동일하다.

하지만 멀티 쓰레드 환경(Tread)에서 안정성(Safety)에 대한 차이가 난다. 

## 쓰레드 안전성

`StringBuffer`와 `StringBuilder`는 동기화(Synchronization)에서의 지원 측면에서 보면 차이가 명확해진다.

`StringBuffer`는 동기화를 지원하는 반면,  `StringBuilder`는 동기화를 지원하지 않는다. 이로 인해 `StringBuffer`는 멀티 쓰레드 환경에서도 안전하게 동작할 수 있다.
그 이유는 `StringBuffer`의 모든 메서드에 `synchronized` 키워드가 붙어 있기때문이다.

> 자바에서 synchronized 키워드는 한 번에 하나의 스레드만 접근할 수 있도록 잠금을 걸어, 다른 스레드는 현재 작업이 끝날 때까지 기다리게 해서 여러 스레드가 동시에 하나의 자원에 접근할 때 발생할 수 있는 데이터 불일치 문제를 방지한다. 


아래 코드는 `StringBuffer`와 `StringBuilder`을 생성해서 멀티 쓰레드 환경에서의 `synchronized` 키워드의 유무차이와 필요성을 보여준다.
```java
public class StringBufferVsStringBuilderTest {
    public static void main(String[] args) throws InterruptedException {
        StringBuffer stringBuffer = new StringBuffer();
        StringBuilder stringBuilder = new StringBuilder();

        // StringBuffer에 문자열 추가하는 두 스레드
        Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) stringBuffer.append("A"); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) stringBuffer.append("A"); });

        // StringBuilder에 문자열 추가하는 두 스레드
        Thread t3 = new Thread(() -> { for (int i = 0; i < 10000; i++) stringBuilder.append("B"); });
        Thread t4 = new Thread(() -> { for (int i = 0; i < 10000; i++) stringBuilder.append("B"); });

        // 스레드 실행 및 완료 대기
        t1.start(); t2.start(); t3.start(); t4.start();
        t1.join(); t2.join(); t3.join(); t4.join();

        // 결과 출력
        System.out.println("StringBuffer length: " + stringBuffer.length());   // 20000
        System.out.println("StringBuilder length: " + stringBuilder.length()); // 18957
    }
}
```

위 코드에서 볼 수 있듯이 `StringBuilder`의 값이 더 작은 것을 확인 할 수 있는데, 이는 쓰레드 안전성이 없어 충돌이 발생한 결과이다. 
반면, `StringBuffer`는 쓰레드 안전성을 보장해주어 정상적인 결과값이 출력되는 것을 볼 수 있다.

그래서 웹이나 소켓같은 비동기로 동작하는 환경에서는 `StringBuffer`을 사용하는 것이 안전하다.

## 성능 비교
 그럼 멀티 쓰레드 환경이 아니라 쓰레드 안정을 생각하지 않고 사용하는 상황일 때 어떤 것을 사용하는 것이 좋을까? 
 아래코드는 `StringBuffer`와 `StringBuilder`의 성능을 비교하는 코드이다.
 
```java
public class StringBufferVsStringBuilderPerformanceTest {
    public static void main(String[] args) {
        final int loopCount = 100_000;

        // StringBuffer 성능 테스트
        long startTimeBuffer = System.nanoTime();
        StringBuffer stringBuffer = new StringBuffer();
        for (int i = 0; i < loopCount; i++) {
            stringBuffer.append("*");
        }
        long endTimeBuffer = System.nanoTime();
        System.out.println("StringBuffer time: " + (endTimeBuffer - startTimeBuffer) + " ns");// StringBuffer time: 123456789 ns

        // StringBuilder 성능 테스트
        long startTimeBuilder = System.nanoTime();
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < loopCount; i++) {
            stringBuilder.append("*");
        }
        long endTimeBuilder = System.nanoTime();
        System.out.println("StringBuilder time: " + (endTimeBuilder - startTimeBuilder) + " ns");// StringBuilder time: 98765432 ns

    }
}
```

결과를 보면, 순수 성능은 `StringBuilder`가 우월한 것을 알 수 있다. 그 이유는 위에서 설명한 `+`연산 시 컴파일 전에 `StringBuilder`로 변환하는 이유와 같다. 

`StringBuffer`와 `StringBuilder` 차이는 `synchronized`의 키워드 유무로 인한 쓰레드 안전성인데, 이때 `StringBuffer`는 `synchronized` 키워드를 사용하면서 동기화 오버헤드가 발생하기 때문에 이러한 결과가 나온다.

![String StringBuffer StringBuilder 속도 비교](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-string-stringbuffer-stringbuilder/java-string-stringbuffer-stringbuilder_4.png)

위 그래프를 보면 10만번 이상의 연산 작업 수행 시 `String`의 수행시간이 기하급수적으로 늘어나지만, `StringBuffer`와 `StringBuilder`는 1000만번까지 준수하다가, 그 후로는 `StringBuilder`가 더 좋다는 것을 볼 수 있다.

그래서 멀티 쓰레드 환경이 아니고선 `StringBuilder`을 사용하는 것이 이상적이다.

정리하자면 `String`은 불변 객체로 문자열을 변경할 수 없으며, 문자열 연산이 적고 스레드 안전성이 중요한 경우에 적합하다. 
반면, `StringBuffer`와 `StringBuilder`는 가변 객체로, 동일 객체 내에서 문자열을 수정할 수 있다. 
`StringBuffer`는 모든 메서드가 `synchronized`되어 쓰레드 안전성을 보장해 멀티 쓰레드 환경에서 안전하게 사용할 수 있지만, 이로 인해 `StringBuilder`보다 약간 느리다. 
`StringBuilder`는 쓰레드 안전성을 제공하지 않지만 가장 빠른 성능을 제공하므로, 단일 스레드 환경에서 빈번한 문자열 조작이 필요할 때 사용하기 적합하다.