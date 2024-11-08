---
layout: post
title: "자바의 try catch 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

이 글은 예외 처리를 알아보는 글이다. 

그러기에 읽기에 앞서 에러와 예외의 구분, 컴파일에러와 런타임에러의 차이, `Checked Exception`과 `Unchecked Exception`에 대한 기본적인 이해가 필요하다.

[자바의 Error와 Exception 이해하기](https://023-dev.github.io/2024-11-05/java-exception-error)
[자바의 throw와 throws 그리고 Chained Exception 이해하기](https://023-dev.github.io/2024-11-06/java-throw-chained-exception)

# 예외 처리하기(Exception Handling)

<hr>

예외 처리란 프로그램이 실행 중 발생할 수 있는 예기치 못한 상황에 대비해 코드를 작성하여 프로그램의 비정상적인 동작을 막는 것이다.
예외처리를 통해 오류가 발생했을 때 복구를 시도하거나 오류를 회피함으로써 프로그램이 정상적인 실행 상태를 유지하도록 할 수 있다.

## try-catch 문

예외 처리를 위해 사용하는 `try-catch`의 기본 구조는 다음과 같다. 
`try` 부분에는 예외가 발생할 가능성이 있는 코드가 위치하며, 예외가 발생하면 `catch`로 넘어가 해당 예외를 처리한다.
만약 `try` 내에서 예외가 발생하지 않으면 `catch`은 실행되지 않는다.

`catch`에서는 예외 클래스의 타입과 변수명을 선언하여, 발생한 예외를 특정 클래스의 인스턴스로 받아 처리한다.
이렇게 함으로써 프로그램의 비정상적인 동작이 발생할 때 오류를 복구하거나 대안을 마련할 수 있다.

아래 코드는 `ArithmeticException`이 발생하면 `catch`가 실행되어 예외 처리를 수행한다.
예외 발생 시 `result` 값을 -1로 초기화함으로써, 예외 상황을 회피하여 이후의 정상 동작을 유지할 수 있게 한다.

```java
public class ExceptionHandling {
    public static void main(String[] args) {
        int x, y, result;
        try {
            x = 10;
            y = 0;
            result = x / y; // 10 나누기 0 → 산술 오류 발생 (ArithmeticException)
        } catch (ArithmeticException e) {
            result = -1;  // 예외 발생 시 기본값으로 초기화
            System.out.println("산술 오류 발생: " + e.getMessage());
        }
    }
}
```

코드를 작성하면서 모든 오류를 예측하기 어렵다. 그래서 다양한 예외 상황에 대비해 여러 개의 `catch`를 사용할 수 있다.
아래 코드는 각 `catch`가 특성 예외 상황에 맞게 적절한 메시지를 출력하도록 구성되어 있다.
그러나 예외 클래스의 종류가 많이 때문에, 모든 예외를 일일 작성하기에는 비효율적일 수 있다.

```java
public class ExceptionHandling {
    public static void main(String[] args) {
        try {
            // 예외가 발생할 가능성이 있는 코드들
            
        } catch (NumberFormatException e) {
            System.out.println("숫자로 변환할 수 없습니다.");
        } catch (ClassNotFoundException e) {
            System.out.println("클래스를 찾을 수 없습니다.");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("배열 인덱스 범위를 초과했습니다.");
        } catch (IOException e) {
            System.out.println("입출력 오류가 발생했습니다.");
        } catch (NullPointerException e) {
            System.out.println("NULL 참조 오류입니다.");
        }
    }
}
```

자바에서는 클래스의 상속관계를 이용해 특정 예외를 포괄하는 상위 클래스인 `Exception` 클래스를 사용하여, 이 상황을 타개할 수 있다.
아래 코드 처럼 `catch`에서 세세한 예외 구분 없이 모든 예외를 포괄적으로 처리할 수 있다. 

```java
public class ExceptionHandling {
    public static void main(String[] args) {
        try {
            // 예외가 발생할 가능성이 있는 코드들
            
        } catch (NumberFormatException e) {
            System.out.println("숫자로 변환할 수 없습니다.");
        } catch (ClassNotFoundException e) {
            System.out.println("클래스를 찾을 수 없습니다.");
        } catch (Exception e) { // 상위 클래스 예외로 처리
            System.out.println("알 수 없는 오류 발생: " + e.getMessage());
        }
    }
}
```

다만, 위 코드와 같은 방법을 사용하면 코드 간결성을 유지할 수 있는 장점이 있지만, 예외가 발생한 원인을 정확하게 파악하기 어려울 수 있다.
이때 `printStackTrace()` 메서드를 사용하면 예외의 발생 원인을 추적할 수 있다.

## try-catch-finally 문

위에서 설명한 것처럼, 프로그램 실행 도중 예외가 발생하면 프로그램이 중단되거나 `catch`로 예외가 전달되어 예외 처리가 이루어진다.
그러나 예외 발생 여부와 상관없이 반드시 실행해야 할 코드가 있는 경우, `finally`을 사용하여 해당 코드를 지정할 수 있다.

```java
import java.io.FileReader;
import java.io.IOException;

public class TryCatchFinallyExample {
    public static void main(String[] args) {
        try {
            //만일 이 부분에서 오류 발생 시
            //이후 코드는 실행되지 않음
        } catch (Exception e) {
            System.out.println("오류 발생: " + e.getMessage());
        }
    }
}
```

위 코드에서 실행 중 오류가 발생하면 `catch`로 넘어가기 때문에 다음 코드가 실행되지 않는다. 
이처럼 예외가 발생하더라도 특정 코드가 반드시 실행되어야 하는 경우가 있는데, 이때 `finally`를 사용하면 예외 발생 여부와 관계없이 `finally` 내의 코드가 무조건 실행된다.

```java
public class TryCatchFinallyExample {
    public static void main(String[] args) {
        try {
            //만일 이 부분에서 오류 발생 시
            //이후 코드는 실행되지 않음
        } catch (Exception e) {
            System.out.println("오류 발생: " + e.getMessage());
        } finally {
            // 예외 발생 여부에 관계없이 항상 실행됨
        }
    }
}
```

이렇게 `finally`를 사용하면 `try` 내에서 오류가 발생 여부에 상관없이 `finally` 내의 코드가 실행된다.
또한, 메서드에 `return`이  있는 경우에도 `finally`가 우선적으로 실행된다. 
예외를 발생하면 `try-catch-finally` 순서로 실행되고, 예외가 발생하지 않는 경우에는 `try-finally` 순으로 실행된다.

## multi-catch 문

여러 예외를 `|`를 사용해서 하나의 `catch`에서 처리할 수 있는 `multi-catch` 기법도 있다. 
이를 통해, 동일한 방식으로 처리할 여러 예외를 하나의 `catch` 블록으로 묶어 코드를 간결하게 만들 수 있으며, 연결할 수 있는 예외 클래스의 개수에는 제한이 없다.

아래 코드에서는 `multi-catch` 기법을 사용하여 `NullPointerException`과 `ArrayIndexOutOfBoundsException`이 발생하면 동일한 방식으로 처리되게 작성했다. 

```java
public class TryCatchFinallyExample {
    public static void main(String[] args) {
        try {
            // 예외 발생 가능 코드
        } catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
            System.out.println("널 참조 또는 배열 인덱스 초과 오류 발생");
        }
    }
}
```

다만 `multi-catch`는 여러 예외를 하나로 처리한다는 특성상, 예외마다 세밀한 제어가 필요한 경우에는 `if`문과 `instanceof` 연산자를 사용해 각각의 예외를 분기 처리해야 한다.

```java
public class TryCatchFinallyExample {
    public static void main(String[] args) {
        try {
            // 예외 발생 가능 코드
        } catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
            if (e instanceof NullPointerException) {
                System.out.println("널 참조 오류 발생");
            } else if (e instanceof ArrayIndexOutOfBoundsException) {
                System.out.println("배열 인덱스 초과 오류 발생");
            }
        }
    }
}
```

# 예외 메시지 출력하기

<hr>

`catch`의 `(Exception e)` 부분에서 `Exception`은 예외 타입을 나타내는 클래스이고, `e`는 예외 객체를 참조하는 변수다.
이 변수는 `Exception` 클래스에서 제공하는 다양한 메서드를 사용하여 예외에 대한 정보를 확인할 수 있도록 한다.

- `printStackTrace()`: 예외 발생 당시의 호출 스택(Call Stack)에 있었던 메서드 정보와 예외 메시지를 출력한다.
- `getMessage()`: 예외 인스턴스에 저장된 기본적인 예외 메시지만을 간략하게 얻을 수 있다.

> 자바에서 오류와 예외는 최상위 클래스인 `Object`를 상속받고, 중간에는 `Throwable` 클래스가 있다. `Throwable` 클래스는 오류나 예외에 대한 메시지를 담는 역할을 하며, `getMessage()`와 `printStackTrace()`가 포함되어 있다. 따라서 `Throwable`을 상속받은 `Error`와 `Exception` 클래스에서도 해당 메서드들이 제공된다. 

이 외에도 다양한 메서드가 존재하지만, 주로 예외 메시지를 확인하기 위해서는 위의 두 메서드를 사용한다. 
다만, `printStackTrace`는 호출 스택을 상세하게 출력하기 때문에, 보안 문제를 방지하려면 외부 사용자에게 노출되지 않도록 주의 해야한다.

# 예외를 커스텀하기 (Custom Exception)

<hr>

자바에서는 `Exception`을 상속받아 커스텀 예외(`Custom Exception`)을 구현할 수 있다. 
이렇게 구현된 커스텀 예외는 `throw`를 통해 강제로 발생시키고, `catch`에서 커스텀 예외만의 처리를 할 수 있다.

```java
// 커스텀 예외 클래스
class InvalidValueException extends Exception {
    private String errorMessage;
    
    // 커스텀 예외 클래스 생성자
    public InvalidValueException(String errorMessage) {
        super(errorMessage); // 상위 Exception 클래스 생성자 호출
        this.errorMessage = errorMessage;
    }
    
    // 커스텀 예외 클래스 전용 메시지 출력 메서드
    public void printCustomMessage() {
        System.out.println("오류: " + this.errorMessage);
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            validateValue(-10); // 유효하지 않은 값으로 예외 발생
        } catch (InvalidValueException e) {
            e.printCustomMessage(); // 커스텀 예외 메시지 출력
            e.printStackTrace(); // 상속받은 부모 클래스의 메서드 실행
        }
    }
    
    // 값이 유효한지 확인하는 메서드, 유효하지 않으면 커스텀 예외 발생
    public static void validateValue(int value) throws InvalidValueException {
        if (value < 0) {
            throw new InvalidValueException("값이 0보다 작을 수 없습니다.");
        }
        System.out.println("값이 유효합니다: " + value);
    }
}
```