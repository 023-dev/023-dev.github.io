---
layout: post
title: "기본형(Primitive)과 참조형(Reference)"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# 기본형(Primitive)과 참조형(Reference)
자바에서는 변수의 타입에 따라 기본형(Primitive)과 참조형(Reference)으로 나뉜다.
기본형은 실제 값을 저장하고, 참조형은 값이 저장된 주소를 저장한다.

## 기본형(Primitive)
기본형은 실제 값을 저장하는 변수로, 스택 메모리에 저장된다.
기본형은 8가지 종류가 있다.

| 종류 | 크기 | 기본값 | 표현범위 |
|:---:|:---:|:---:|:---:|
| `boolean` | 1 byte | `false` | `true`, `false` |
| `char` | 2 byte | `\u0000` | `0` ~ `65,535` |
| `byte` | 1 byte | `0` | `-128` ~ `127` |
| `short` | 2 byte | `0` | `-32,768` ~ `32,767` |
| `int` | 4 byte | `0` | `-2,147,483,648` ~ `2,147,483,647` |
| `long` | 8 byte | `0L` | `-9,223,372,036,854,775,808` ~ `9,223,372,036,854,775,807` |
| `float` | 4 byte | `0.0f` | `1.4E-45` ~ `3.4028235E38` |
| `double` | 8 byte | `0.0d` | `4.9E-324` ~ `1.7976931348623157E308` |

## 참조형(Reference)
참조형은 값이 저장된 주소를 저장하는 변수로, 힙 메모리에 저장된다.
참조형은 클래스, 인터페이스, 배열 등이 있다.

```java
public class Main {
    public static void main(String[] args) {
        int num = 10; // 기본형
        String str = "Hello, Java!"; // 참조형
    }
}
```

위 코드에서 `num`은 기본형 변수로 실제 값을 저장하고, `str`은 참조형 변수로 값이 저장된 주소를 저장한다.

## 기본형과 참조형의 차이
기본형은 실제 값을 저장하고, 참조형은 값이 저장된 주소를 저장한다.
기본형은 스택 메모리에 저장되고, 참조형은 힙 메모리에 저장된다.
기본형은 8가지 종류가 있고, 참조형은 클래스, 인터페이스, 배열 등이 있다.
    
<!--more-->
```java
public class Main {
    public static void main(String[] args) {
        int num = 10; // 기본형
        String str = "Hello, Java!"; // 참조형

        System.out.println(num); // 10
        System.out.println(str); // Hello, Java!
    }
}
```

위 코드에서 `num`은 기본형 변수로 실제 값을 저장하고, `str`은 참조형 변수로 값이 저장된 주소를 저장한다.
`System.out.println(num)`은 `num` 변수에 저장된 값을 출력하고, `System.out.println(str)`은 `str` 변수에 저장된 주소에 있는 값을 출력한다.

## 참조형 변수의 초기화
참조형 변수는 값이 저장된 주소를 저장하는 변수이기 때문에 초기화를 하지 않으면 `null`로 초기화된다.

```java
public class Main {
    public static void main(String[] args) {
        String str; // 참조형 변수 선언
        System.out.println(str); // null
    }
}
```

위 코드에서 `str`은 참조형 변수로 값이 저장된 주소를 저장하는 변수이다.
`System.out.println(str)`은 `str` 변수에 저장된 주소에 있는 값을 출력하는데, 초기화를 하지 않았기 때문에 `null`로 초기화된다.

## 참조형 변수의 `null` 체크
참조형 변수는 값이 저장된 주소를 저장하는 변수이기 때문에 `null` 체크를 해야한다.

```java
public class Main {
    public static void main(String[] args) {
        String str = null; // null로 초기화
        if (str != null) {
            System.out.println(str.length());
        }
    }
}
```

위 코드에서 `str`은 참조형 변수로 값이 저장된 주소를 저장하는 변수이다.
`str` 변수를 `null`로 초기화하고, `if (str != null)`로 `null` 체크를 한 후 `str.length()`를 호출한다.

## 참조형 변수의 `null` 체크를 피하기
참조형 변수의 `null` 체크를 피하기 위해서는 `Optional` 클래스를 사용할 수 있다.

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String str = null; // null로 초기화
        Optional<String> optional = Optional.ofNullable(str);
        optional.ifPresent(s -> System.out.println(s.length()));
    }
}
```

위 코드에서 `str` 변수를 `null`로 초기화하고, `Optional.ofNullable(str)`로 `Optional` 객체를 생성한다.
`optional.ifPresent(s -> System.out.println(s.length()))`는 `null` 체크를 하고, 값이 존재하면 `s.length()`를 호출한다.

## 참조형 변수의 `null` 체크를 피하기(orElse)
참조형 변수의 `null` 체크를 피하기 위해서는 `Optional` 클래스의 `orElse` 메서드를 사용할 수 있다.

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String str = null; // null로 초기화
        Optional<String> optional = Optional.ofNullable(str);
        System.out.println(optional.orElse("").length());
    }
}
```

위 코드에서 `str` 변수를 `null`로 초기화하고, `Optional.ofNullable(str)`로 `Optional` 객체를 생성한다.
`optional.orElse("").length()`는 `null` 체크를 하고, 값이 존재하면 `s.length()`를 호출하고, 값이 없으면 `""`로 초기화한다.

## 참조형 변수의 `null` 체크를 피하기(orElseGet)
참조형 변수의 `null` 체크를 피하기 위해서는 `Optional` 클래스의 `orElseGet` 메서드를 사용할 수 있다.

```java
import java.util.Optional;
    
public class Main {
    public static void main(String[] args) {
        String str = null; // null로 초기화
        Optional<String> optional = Optional.ofNullable(str);
        System.out.println(optional.orElseGet(() -> "").length());
    }
}
```

위 코드에서 `str` 변수를 `null`로 초기화하고, `Optional.ofNullable(str)`로 `Optional` 객체를 생성한다.
`optional.orElseGet(() -> "").length()`는 `null` 체크를 하고, 값이 존재하면 `s.length()`를 호출하고, 값이 없으면 `""`로 초기화한다.

## 참조형 변수의 `null` 체크를 피하기(orElseThrow)
참조형 변수의 `null` 체크를 피하기 위해서는 `Optional` 클래스의 `orElseThrow` 메서드를 사용할 수 있다.

```java
import java.util.Optional;
    
public class Main {
    public static void main(String[] args) {
        String str = null; // null로 초기화
        Optional<String> optional = Optional.ofNullable(str);
        System.out.println(optional.orElseThrow(() -> new IllegalArgumentException("null")));
    }
}
```

위 코드에서 `str` 변수를 `null`로 초기화하고, `Optional.ofNullable(str)`로 `Optional` 객체를 생성한다.
`optional.orElseThrow(() -> new IllegalArgumentException("null"))`는 `null` 체크를 하고, 값이 존재하면 `s`를 호출하고, 값이 없으면 `IllegalArgumentException`을 발생시킨다.



