---
visible: false
title: "자바 Class 클래스와 System 클래스"
date: 2024-12-27 00:00:00
tags: 
  - Java
---

# Class 클래스
자바에서 `Class` 클래스는 클래스의 정보(메타데이터)를 다루는데 사용된다.
`Class` 클래스를 토앻 개발자는 실행 중인 자바 애플리케이션 내에서 필요한 클래스의 정보를 조회하고 조작할 수 있다.

`Class` 클래스의 주요 기능은 다음과 같다.
- 타입 정보 얻기: 클래스의 이름, 슈퍼 클래스, 인터페이스, 필드, 메서드, 생성자 정보 등과 같은 정보를 얻을 수 있다.
- 리플렉션: 클래스에 정의된 메서드, 필드, 생성자 등을 조회하고, 이들을 통해 클래스의 인스턴스를 생성하거나 메서드를 호출는 등의 작업을 할 수 있다.
- 동적 로딩과 생성: `Class.forName()` 메서드를 사용해 동적으로 클래스를 로딩하고, `newInstance()` 메서드를 사용해 클래스의 인스턴스를 생성할 수 있다.
- 애노테이션 처리: 클래스에 적용된 애노테이션 정보를 조회하고, 이를 통해 클래스의 동작을 변경할 수 있는 기능을 제공한다.

예를 들어, `String.class`는 `String` 클래스의 정보를 담고 있는 `Class` 객체를 반환한다.
이를 통해 `String` 클래스의 정보를 조회하거나 조작할 수 있다.

```java
public class Main {
    public static void main(String[] args) throws Exception {
        Class stringClass = String.class; //클래스에서 조회 
        //Class stringClass = "java.lang.String".getClass(); // 인스턴스에서 조회
        //Class stringClass = Class.forName("java.lang.String"); // 문자열로 조회
        
        
        // 모든 필드 조회
        Field[] fields = stringClass.getDeclared;
        for (Field field : fields) {
            System.out.println("Field: " + field.getType() + field.getName());
        }
        
        // 모든 메서드 조회
        Method[] methods = stringClass.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println("Method: " + method.getReturnType() + method.getName());
        }
        
        // 상위 클래스 조회
        System.out.println(stringClass.getSuperclass()); // class java.lang.Object
        
        // 인터페이스 조회
        Class[] interfaces = stringClass.getInterfaces();
        for (Class inter : interfaces) {
            System.out.println("Interface: " + inter.getName());
        }
    }
}
```

위 코드의 실행 결과는 다음과 같다.

```
Field: class java.lang.Stringvalue
...
Method: class java.lang.StringcharAt
Method: class java.lang.StringcodePointAt
...
Superclass: java.lang.Object
Interface: java.io.Serializable
Interface: java.lang.Comparable
```

`Class` 클래스는 다음과 같이 3가지 방법으로 조회할 수 있다.
```java
Class stringClass = String.class; //클래스에서 조회
Class stringClass = "java.lang.String".getClass(); // 인스턴스에서 조회
Class stringClass = Class.forName("java.lang.String"); // 문자열로 조회
```

## Class 클래스의 주요 메서드
`Class` 클래스는 다음과 같은 주요 메서드를 제공한다.

- `getDeclaredFields()`: 모든 필드를 조회한다.
- `getDeclaredMethods()`: 모든 메서드를 조회한다.
- `getSuperclass()`: 슈퍼 클래스를 조회한다.
- `getInterfaces()`: 인터페이스를 조회한다.

이러한 메서드들을 통해 해당 클래스의 다양한 정보를 확인할 수 있다.

## 클래스 생성
`Class` 클래스에는 클래스의 모든 정보가 담겨 있기 때문에, 이를 통해 클래스의 인스턴스를 생성하거나, 메서드를 호출하고, 필드의 값도 변경할 수 있다.
이 문단에서는 간단하게 클래스의 인스턴스를 생성하는 방법을 알아본다.

```java
public class Hello {
    public void hello() {
        System.out.println("Hello, Java!");
    }
}
```

위와 같은 `Hello` 클래스가 있다고 가정하자.
이 클래스의 인스턴스를 생성하고, `hello()` 메서드를 호출하는 코드는 다음과 같다.

```java
public class Main {
    public static void main(String[] args) throws Exception {
        Class helloClass = Hello.class;
        Hello hello = (Hello) helloClass.getDeclaredConstructor().newInstance();
        hello.hello();
    }
}
```

위 코드의 실행 결과는 다음과 같다.

```
Hello, Java!
```

코드에서 사용된 `getDeclaredConstructor().newInstance()` 메서드에 기능은 다음과 같다.
`getDeclaredConstructor()` 메서드를 통해 클래스의 생성자를 조회하고, `newInstance()` 메서드를 통해 생성자를 호출하여 인스턴스를 생성한다.

## 리플렉션(Relfection)
`Class` 클래스를 통해 클래스의 메타 데이터를 기반으로 클래스의 인스턴스를 생성하거나, 메서드를 호출하는 등의 작업을 할 수 있다.
이러한 작업을 리플렉션(Reflection)이라고 한다.
추가로 애노테이션 정보를 읽어서 특별한 기능을 수행하거나 클래스의 동작을 변경하는 등의 작업도 가능하다.
최신 프레임워크들은 리플렉션을 적극 활용하여 다양한 기능을 제공하고 있다.

# System 클래스

`System` 클래스는 자바 프로그램과 관련된 시스템과 관련된 정보를 다루는데 사용된다.
주요 기능을 코드를 통해 알아보겠다.

```java
public class Main {
    public static void main(String[] args) {
        // 현재 시간(밀리초)를 가져온다.
        long currentTimeMillis = System.currentTimeMillis();
        System.out.println("currentTimeMillis: " + currentTimeMillis);

        // 현재 시간(나노초)를 가져온다.
        long currentTimeNano = System.nanoTime();
        System.out.println("currentTimeNano: " + currentTimeNano);
        
        // 환경 변수를 읽는다.
        System.out.println("getenv = " + System.getenv());
        
        // 시스템 속성을 읽는다.
        System.out.println("properties = " + System.getProperties());
        System.out.println("Java version: " + System.getProperty("java.version"));
        
        // 배열을 고속으로 복사한다.
        char[] originalArray = new char[]{'h', 'e', 'l', 'l', 'o'};
        char[] copiedArray = new char[5];
        System.arraycopy(originalArray, 0, copiedArray, 0,
                originalArray.length);
        
        // 배열 출력
        System.out.println("copiedArray = " + copiedArray);
        System.out.println("Arrays.toString = " + Arrays.toString(copiedArray));
        
        //프로그램 종료
        System.exit(0);
    }
}
```

- 표준 입력, 출력, 에러 스트림: `System.in`, `System.out`, `System.err` 필드를 통해 표준 입력, 출력, 에러 스트림을 사용할 수 있다.
- 시간 측정: `System.currentTimeMillis()`, `System.nanoTime()`를 통해 현재 시간을 밀리초, 나노초 단위로 가져올 수 있다.
- 환경 변수 읽기: `System.getenv()`를 통해 환경 변수를 읽을 수 있다.
- 시스템 속성 읽기: `System.getProperties()`로 시스템 속성을 읽을 수 있고, `System.getProperty(String key)` 메서드를 통해 특정 속성을 읽을 수 있다.
- 시스템 종료: `System.exit(int status)`를 통해 프로그램을 종료할 수 있다. 여기서 `status`는 종료 상태를 나타낸다. 일반적으로 0은 정상 종료, 그 외의 값은 비정상 종료를 의미한다.
- 배열 고속 복사: `System.arraycopy()`는 시스템 레벨에서 최적화된 방식으로 메모리 복사를 연산을 수행한다. 직접 반복문을 사용해서 배열을 복사하는 것보다 수 배 이상 빠른 성능을 제공한다.

