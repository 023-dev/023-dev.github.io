---
title: "Utility Class에서 생성자를 private으로 선언해야 하는 이유"
date: 2025-04-15 00:00:00
tags: 
  - Java
---

개발을 하다 보면 `Utils`, `Helper`, `Constants` 등과 같이 객체를 생성하지 않고 정적인 메서드나 상수를 모아두는 **유틸리티 클래스(Utility Class)**를 사용하는 경우가 있다.
그런데 이때 흔히 저지르는 실수 중 하나가 바로 이러한 유틸리티 클래스에 `public` 생성자를 선언하거나, 아예 생성자를 생략해버리는 것이다.

이런 상황이 왜 문제가 되는지, 그리고 어떻게 해결할 수 있는지에 대해 알아보자.

## 왜 public 생성자가 문제일까?

유틸리티 클래스는 인스턴스를 생성하지 않고 사용하기 위해 보통 아래와 같은 형태로 설계된다.

```java
class StringUtils { // Noncompliant

  public static String concatenate(String s1, String s2) {
    return s1 + s2;
  }

}
```

이 코드의 문제점은, 컴파일러가 기본 생성자(default constructor)를 자동으로 추가하므로, 아래와 같은 불필요한 객체 생성을 허용하게 된다.

```java
StringUtils stringUtils = new StringUtils(); // Noncompliant
```

이렇게 되면 클래스의 본래 의도와 다르게 사용될 수 있으며, 테스트 코드나 리팩토링 과정에서 문제가 발생할 소지가 있다.

실제로 Checkstyle(HideUtilityClassConstructor) 공식 문서에서 다음과 같이 설명하고 있다.

> _Makes sure that utility classes (classes that contain only static methods or fields in their API) do not have a public constructor._
> 
> _Rationale: Instantiating utility classes does not make sense. Hence, the constructors should either be private or (if you want to allow subclassing) protected. A common mistake is forgetting to hide the default constructor._

SonarQube(Utility classes should not have public constructors, Rule S1118)에서 또한 이러한 유틸리티 클래스에 대해 `public` 생성자를 허용하지 않도록 경고하고 있다.

> _Utility classes, which are collections of static members, are not meant to be instantiated. Even abstract utility classes, which can be extended, should not have public constructors._

## 왜 생성자를 숨겨야 할까?

### 인스턴스화 방지

유틸리티 클래스는 상태를 유지하지 않으며, 오직 기능만을 제공한다. 
따라서 이러한 클래스의 인스턴스를 생성할 필요가 없다. 
private 생성자는 다른 곳에서 이 클래스의 객체를 만들려는 시도를 컴파일 타임에 방지하여, 클래스의 의도와 목적에 부합하는 사용을 강제한다.

```java
public class StringUtils {// not final to allow subclassing
    private StringUtils() {
        throw new UnsupportedOperationException(); // prevents calls from subclass
    }

    public static int count(char c, String s) {
        // ...
    }
}
```

이렇게 `StringUtils` 클래스의 인스턴스를 생성하려고 할 때, `UnsupportedOperationException` 예외가 발생를 던지는 방식은 의도치 않게 리플렉션 등을 사용해 인스턴스를 생성하려는 시도를 차단할 수 있다.

### 의도 명확성

`private` 생성자를 포함하는 것은 클래스의 사용 의도를 명확히 전달하는 방법이다. 
이는 유틸리티 클래스가 클라이언트 코드에 의해 인스턴스화되지 않도록 의도되었음을 명시적으로 나타낸다. 
이는 다른 개발자들이 코드를 이해하고 올바르게 사용하는 데 도움을 준다.

### 상속 방지

Java에서는 생성자가 `private`인 클래스를 상속할 수 없다. 
유틸리티 클래스는 일반적으로 상태가 없으며 정적 메서드만을 포함하므로, 이를 상속하는 것은 의미가 없다. 
`private` 생성자는 이러한 클래스가 다른 클래스에 의해 확장되는 것을 방지함으로써, 클래스의 설계 의도를 보존한다.


## Lombok을 사용한 예시

`Lombok` 라이브러리를 사용하면, `@NoArgsConstructor(access = AccessLevel.PRIVATE)` 어노테이션을 통해 클래스의 기본 생성자를 `private`으로 설정할 수 있다.

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class StringUtils {// not final to allow subclassing
    public static int count(char c, String s) {
        // ...
    }
}
```

또는 `@UtilityClass` 어노테이션을 통해 유틸리티 클래스를 쉽게 생성할 수 있다.
이 어노테이션을 클래스에 적용하면 그 클래스를 유틸리티 클래스로 간주하고, 다음과 같은 작업을 자동으로 수행한다.

- 자동으로 `private` 생성자를 생성하여 클래스의 인스턴스화 방지
- 클래스 내의 모든 메소드를 자동으로 `static`으로 생성
- 클래스 내의 모든 필드를 자동으로 `static`으로 생성

```java
@UtilityClass
public class StringUtils {// not final to allow subclassing
    public static int count(char c, String s) {
        // ...
    }
}
```

## references

- [HideUtilityClassConstructor, checkstyle](https://checkstyle.sourceforge.io/checks/design/hideutilityclassconstructor.html)
- [Utility classes should not have public constructors, Sonar](https://rules.sonarsource.com/java/RSPEC-1118/)
- [Effective Java, Joshua Bloch](https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/)
- [Is it mandatory utility class should be final and private constructor?, stackoverflow](https://stackoverflow.com/questions/32375149/is-it-mandatory-utility-class-should-be-final-and-private-constructor)
- [Utility class without 'private' constructor, Jetbrains](https://www.jetbrains.com/help/inspectopedia/UtilityClassWithoutPrivateConstructor.html)
- 