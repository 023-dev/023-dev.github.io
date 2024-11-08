---
layout: post
title: "Java의 Lambda 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글에서는 자바의 `Lambda`에 대해 알아본다.

# 람다 표현식(Lambda Expression)

<hr>

람다 표현식(Lambda Expression)은 함수형 프로그래밍을 위해 자바에서 제공하는 간결한 함수식으로, 자바의 메서드를 간단하게 표현할 수 있는 방법이다.
기존 자바에서는 메서드를 표현하려면 별도의 클래스를 정의해야 했지만, 람다 표현식을 사용하면 메서드의 이름과 반환값을 생략하여 코드가 간결해지게 할 수 있다.

`int add(int x, int y) { return x  + y; }`와 같은 메서드 표현식을 아래 코드처럼 람다식을 사용하면 간결하게 작성할 수 있다.
이처럼 람다식은 이름없는 함수다 해서 익명함수(anonymous function)라고도 불린다.

```java
// 기존 메서드 표현
int add(int x, int y) {
    return x + y;
}

// 람다 표현식을 사용한 간결한 표현 (메서드 반환 타입과 이름 생략)
(int x, int y) -> {
        return x + y;
};

// 매개변수 타입까지 생략
        (x, y) -> {
        return x + y;
};

// 리턴문 한 줄만 있을 때는 중괄호와 return까지 생략
(x, y) -> x + y;
```

> 위 코드에서 타입을 생략해도 컴파일러가 오류를 발생시키지 않는 이유는, 컴파일러가 생략된 타입을 추론할 수 있기 때문이다.

람다식은 특히 컬렉션의 요소를 필터링하거나 매핑할 때 사용하면 원하는 결과를 코드의 가독성을 살리면서 얻을 수 있다.

## 람다식의 화살표 함수

자바의 화살표 함수는 자바스크립트의 화살표함수와 구조와 개념이 유사하다.
자바스크립트는 약타입 언어로 타입 선언 없이 자유롭게 변수를 받을 수 있지만, 자바는 강타입 언어이므로 람다식을 사용하기 위해 함수형 인터페이스를 통해 타입을 선언해야 한다. 
하지만, 자바에는 함수 타입을 직접 표현할 자료형이 없기 때문에, 인터페이스를 사용하여 람다식을 표현할 수 있도록 설계되어 있다.

```javascript
// JavaScript - 화살표 함수 사용
const MyFunction = {
    print: (str) => console.log(str)
};
MyFunction.print("Hello World");

```

```java
// Java - 람다 표현식 사용
interface MyFunction {
    void print(String str);
}

public class Main {
    public static void main(String[] args) {
        MyFunction myfunc = (str) -> System.out.println(str);
        myfunc.print("Hello World");
    }
}
```

## 람다식과 함수형 인터페이스
람다식은 마치 메서드를 변수로 선언하는 것처럼 보이지만, 사실 자바에서는 메서드를 단독으로 표현할 수 없다.
때문에 람다식은 함수형 인터페이스를 구현하는 익명 클래스로 간략하게 표현된 객체라고 할 수 있다. 

```java
public class Main {
    public static void main(String[] args) {
        IAdd lambda = (x, y) -> x + y; // 익명 클래스로 람다식 사용
        int result = lambda.add(1, 2);
        System.out.println(result);
    }
}
```
이때 람다식 객체를 콘솔에 출력해보면 `외부클래스명$$Lambda$번호`와 같은 형식으로 출력되며, 이는 익명 구현 객체로 표현되는 것을 의미합니다. 
단, 람다 표현은 함수형 인터페이스의 추상 메서드를 구현할 때만 가능하며, 익명 클래스의 모든 메서드를 람다식으로 줄일 수는 없다.

### 함수형 인터페이스
함수형 인터페이스란 딱 하나의 추상 메더스가 있는 인터페이스를 의미한다.
람다식은 이와 같은 함수형 인터페이스의 추상메서드를 간단하게 표현할 수 있도록 고안되었다.

람다식은 하나의 메서드를 한 줄로 정의하기 때문에, 함수형 인터페이스에 추상 메서드가 두 개 이상 존재하면 람다식으로 표현할 방법이 없으므로 람다 표현의 대상이 될 수 없다.
단, 자바 8부터 함수형 인터페이스에는 `default`, `static`, `private` 메서드를 추가할 수 있는데 이러한 메서드들은 추상 메서드가 아니기 때문에 인터페이스 내에 존재하더라도 람다식을 사용할 수 있다.

```java
// 함수형 인터페이스 - 하나의 추상 메서드만 존재
interface IAdd {
    int add(int x, int y);
}

// 함수형 인터페이스가 아닌 경우 - 두 개의 추상 메서드 존재
interface ICalculate {
    int add(int x, int y);
    int subtract(int x, int y);
}

// 다양한 구성요소를 포함해도 추상 메서드가 하나면 함수형 인터페이스
interface IAdd {
    int add(int x, int y);

    final boolean isNumber = true; // 상수 필드
    default void print() {}; // 디폴트 메서드
    static void printStatic() {}; // 정적 메서드
}
```

### @FunctionalInterface

함수형 인터페이스를 정의할 때, @FunctionalInterface 어노테이션을 추가하면 추상 메서드가 하나만 존재해야 함을 컴파일러가 확인해준다. 
이 어노테이션을 붙임으로써 실수로 두 개 이상의 추상 메서드를 정의하는 경우 컴파일 오류가 발생하게 되어, 함수형 인터페이스 규칙을 명확히 준수할 수 있다.

```java
@FunctionalInterface
public interface MyFunctionalInterface {
    void method();
    // void anotherMethod(); // 추가 시 컴파일 오류 발생
}
```

## 람다식의 타입 추론 

람다식은 리턴 타입이나 파라미터 타입을 명시하지 ㅇ낳는 점에서 컴파일러가 이 함수의 타입을 어떻게 인식하는지 궁금할 수 있다.
사실, 컴파일러는 람다식을 보고 해당 함수의 타입을 스스로 추론하는데, 이 타입 추론은 사람이 미리 정의해놓은 타입 정보와 정의문을 보고 이루어진다.
대부분의 함수형 인터페이스는 제네릭을 사용하기에 컴파일러가 타입을 추론하는데 필요한 타입 정보 대부분을 제네릭에서 판별해서 얻을 수 있다.

아래 코드에서는 List<String> 타입의 리스트를 생성하고 Collections 클래스의 sort 메서드를 호출한다.
sort 메서드는 첫 번째 인자로 리스트 객체를 받고, 두 번째 인자로는 람다식을 사용하여 문자열 길이를 기준으로 리스트를 정렬한다.

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date");

        // 문자열 길이를 기준으로 정렬
        Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length()));
    }
}
```

여기서 컴파일러의 타입 추론 과정은 다음과 같다.

1. `sort` 메서드의 첫 번째 매개변수로 `List<String>` 객체가 전달된다.
2. 첫 번째 매개변수 타입으로 인해 `sort` 메서드의 제네릭 타입 매개변수는 `String`으로 지정된다.
3. `Comparator` 인터페이스의 제네릭 타입 `T`도 `String`으로 지정된다.
    - `Integer.compare(s1.length(), s2.length())`는 `Comparator` 함수형 인터페이스를 구현한 것이다.
4. 최종적으로 람다식의 매개변수 s1과 s2는 String 타입으로, 리턴 타입은 `int`로 추론된다.

따라서 위 코드와 같은 람다식에서 파라미터 타입을 명시하지 않더라도, 컴파일러는 제네릭 정보로 인해 String 타입 파라미터와 int 타입 리턴 타입을 자동으로 추론할 수 있다.

### 명시적 타입 지정
하지만, 상황에 따라 파라미터 타입을 명시적으로 작성하는 것이 유리할 때도 있다.
특히, 복잡한 람다식에서는 타입을 명시하는 것이 코드의 카독성을 향상 시켜준다. 
이 부분은 상황에 따라 개발자가 트레이드 오프를 해야한다.
```java
// 람다식 파라미터 타입 명시
Collections.sort(words, (String s1, String s2) -> Integer.compare(s1.length(), s2.length()));
```

## 람다 표현식의 한계

람다 표현식은 자바 코드를 간결하게 만들지만, 모든 상황에 적합한 것은 아니다. 
람다 표현식이 갖는 몇 가지 한계점과 사용 시 주의사항을 살펴보겠다.

### 람다는 문서화할 수 없다

람다는 이름 없는 함수이기 때문에 메서드나 클래스와 다르게 문서화를 할 수 없다. 
코드 자체로 동작이 명확하게 설명되지 않거나, 람다가 길거나 읽기 어려운 경우에는 코드의 가독성과 유지보수를 고려해 람다를 쓰지 않는 방향으로 리팩토링하는 것이 좋다.

### 람다는 디버깅이 어렵다

람다식은 기본적으로 익명 구현 객체 기반으로 동작하여, 콜 스택(call stack) 추적이 어렵다. 
예를 들어, 0으로 나누는 오류가 발생하는 코드를 `for` 문과 람다식을 사용한 코드로 각각 구현했을 때, 오류 메시지에 표시되는 줄이 다르다.

```java
// 일반 for문 사용
public static void main(String[] args) {
    List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
    for (Integer i : list) {
        for (int j = 0; j < i; j++) {
            System.out.println(i / j); // 0으로 나누는 예외 발생
        }
    }
}
```

```java
// 람다 표현식 사용
public static void main(String[] args) {
    List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
    list.forEach(i -> {
        IntStream.range(0, i).forEach(j -> {
            System.out.println(i / j); // 0으로 나누는 예외 발생
        });
    });
}
```

### Stream의 람다 사용은 `for` 문보다 성능이 떨어진다

성능에 민감한 환경에서는 람다 표현식과 `Stream`이 일반 `for` 문보다 성능이 낮을 수 있다. 
아래 코드는 0부터 10,000까지 단순 순회하는 코드를 `Stream`의 람다와 `for` 문으로 각각 구성하여 실행 시간을 비교한다.

```java
public static void main(String[] args) {
    // 람다식 stream 순회
    long startTime = System.nanoTime();
    IntStream.range(0, 10000).forEach(value -> {});
    long endTime = System.nanoTime();
    System.out.println("람다식 stream 순회: " + (endTime - startTime) + "ns");//13870700ns

    // 일반 for문 순회
    startTime = System.nanoTime();
    for (int i = 0; i < 10000; i++) {}
    endTime = System.nanoTime();
    System.out.println("일반 for문 순회: " + (endTime - startTime) + "ns");//43900ns
}
```

### 람다를 남발하면 코드가 지저분해질 수 있다

람다식은 실행부에서 직접 동작을 지정하기 때문에, 남발하면 비슷한 형태의 람다식이 반복되어 코드가 지저분해질 수 있다. 
예를 들어, 아래 코드와 같이 여러 연산을 위한 람다식을 매번 작성하면 코드가 반복적으로 길어질 수 있다.

```java
interface OperationStrategy {
    int calculate(int x, int y);
}

// 템플릿 클래스
class OperationTemplate {
    int calculate(int x, int y, OperationStrategy cal) {
        return cal.calculate(x, y);
    }
}

public class Main {
    public static void main(String[] args) {
        int x = 100;
        int y = 30;

        OperationTemplate template = new OperationTemplate();

        // 각 연산을 위한 람다식
        System.out.println(template.calculate(x, y, (a, b) -> a + b)); // 덧셈
        System.out.println(template.calculate(x, y, (a, b) -> a - b)); // 뺄셈
        System.out.println(template.calculate(x, y, (a, b) -> a * b)); // 곱셈
        System.out.println(template.calculate(x, y, (a, b) -> a / b)); // 나눗셈
    }
}
```

### 람다식은 재귀 호출에 부적합하다

람다식은 재귀 함수를 작성하는 데 적합하지 않다. 
특히, 재귀 람다식을 사용하려고 하면 컴파일 오류가 발생할 수도 있다. 
예를 들어, 팩토리얼 함수를 람다식으로 작성하려 하면 다음과 같은 오류가 발생한다.

```java
public static void main(String[] args) {
    UnaryOperator<Long> factorial = (x) -> {
        return x == 0 ? 1 : x * factorial.apply(x - 1); // 컴파일 오류 발생
    };

    System.out.println(factorial.apply(5L));
}
```

이처럼, 람다식은 내부에서 자기 자신을 참조하는 재귀 호출이 불가능하며, 이는 함수형 인터페이스의 제한으로 인해 발생하는 문제다.


## 스트림(Stream)

이처럼 람다 표현식은 개별 연산을 간단히 표현하기에 탁월하지만, 컬렉션 전체에 걸친 데이터 흐름을 나타내기에는 제한적이다. 
람다식으로는 단일 동작만 표현할 수 있고, 복잡한 데이터를 다룰 때에는 여전히 반복문과 조건문이 필요했다. 
때문에 전체 데이터 흐름을 선언적으로 표현하기에는 한계가 있었다.
이러한 부분들을 보완하고자 자바 8에서 람다와 같이 스트림(Stream)이 함께 출시되게 되었다.

스트림은 컬렉션과 배열의 데이터를 람다처럼 간결하고 효율적으로 처리하기 위한 연속 데이터 처리 프레임워크다. 
스트림을 통해 데이터를 필터링, 매핑, 정렬 등 다양한 연산을 선언적으로 수행할 수 있고, 이로 인해 복잡한 반복문 대신 가독성이 높은 코드로 데이터 처리 흐름을 구성할 수 있다.

스트림의 주요 특징으로는 다음과 같다.
- 지연 연산: 스트림은 필요할 때에만 연산을 수행한다. 최종 연산이 호출되기 전까지는 실제 연산이 수행되지 않고, 설정한 모든 연산이 최종 연산 시점에 한꺼번에 처리된다.
- 병렬 처리: `parallelStream`을 사용해 병렬 처리를 수행할 수 있어서 대용량 데이터 처리에 적합하다.

### 스트림 수행 과정

스트림은 다음과 같은 과정들을 통해 수행되어진다.

#### 스트림 생성

스트림을 이용하기 위해서는 먼저 스트림을 생성해야한다. 
`Stream Collection.stream()` 을 이용하여 원하는 타입의 컬렉션을 기반으로 스트림을 생성할 수 있다. 

#### 중간 연산

데이터의 유형 변환 혹은 필터링, 정렬 등 스트림을 활용하기 전 데이터를 필요에 따라 가공하는 작업이 필요하다. 
이를 위해서 사용되는 메소드를은 다음과 같다.

- map(변환)
- sorted(정렬)
- skip(스트림 자르기)
- limit(스트림 자르기)

#### 최종 연산

스트림이 한번 결과를 반환하면, 이후에는 닫혀서 재사용이 불가능하다. 
최종 연산 결과 값은 하나의 값이거나, 배열 혹은 다른 유형의 컬렉션 데이터일 수 있다. 
그러므로 필요에 따라, 결과값의 데이터 타입을 변환하거나 결과값을 가지고 원하는 형태로 바꾸는 추가적인 최종 연산이 필요할 수 있다. 
예를 들어 `collect()` 매서드를 활용해 다른 컬렉션 유형으로 변환하거나 `reduce` 를 활용하여 특정한 수 만큼 일정하게 값이 증가하는 증분연산(Incremental Calculation)을 할 수도 있다. 
필요에 따라서 다양한 형태의 연산이 가능하다.

```java
List<String> words = Arrays.asList("apple", "banana", "cherry", "date");

// 스트림을 사용하여 데이터 필터링, 매핑, 정렬, 출력
words.stream()
   .filter(word -> word.length() > 4)    // 길이가 4보다 큰 단어만 남김
   .map(String::toUpperCase)             // 대문자로 변환
   .sorted()                             // 정렬
   .forEach(System.out::println);        // 출력
```
