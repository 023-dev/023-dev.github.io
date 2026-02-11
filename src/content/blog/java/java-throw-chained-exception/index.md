---
visible: false
title: "throw와 throws 그리고 Chained Exception"
date: 2024-11-06 18:00:00
tags: 
  - Java
---

자바에서 예외처리는 오류를 예측하고 이에 대응하여 프로그램의 안정성을 높일 뿐만 아니라, 상황에 따라서 단순히 발생한 오류를 잡아내는 것을 넘어, 필요에 따라 예외를 발생시키거나 떠넘기고,
예외를 다른 예외로 감싸 처리하는 등 다양한 방법을 유현하게 활용하여 코드의 가독성과 유지보수성을 높일 수 있다.

이 글에서는 자바의 예외처리 핵심 개념인 `throw`와 `throws` 그리고 `Chained Exception`에 대해 알아본다.

# 예외 던지기

<hr>

## 예외 발생시키기

일반적으로 프로그램은 실행 중 예외가 발생하면 시스템이 자동으로 오류를 탐지하고 이를 처리하도록 되어 있다.
하지만 특정 상황에서는 개발자가 의도적으로 `throw`를 사용해 예외를 발생시키고 `catch`에서 이를 처리하는 경우도 있다.

`throw`는 `new` 연산자로 예외 클래스의 객체를 초기화하여 사용하며, 생성자에 메시지를 전달하면 `catch`에서 `getMessage()` 메서드를 통해 해당 메시지를 출력할 수 있다.

아래 코드에서는 사용자가 음수를 입력한 경우, `IllegalArgumentException` 예외가 발생하도록 설정하였다. `throw` 키워드를 통해 예외를 발생시키고, `catch`에서 이를 받아 오류 메시지를 출력한다.

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        try {
            Scanner scanner = new Scanner(System.in);
            System.out.print("양수를 입력하세요: ");
            int number = scanner.nextInt();
            
            if (number < 0) {
                // 사용자가 음수를 입력한 경우, 의도적으로 예외 발생
                throw new IllegalArgumentException("양수만 입력할 수 있습니다."); // 예외 메시지를 설정하여 catch 블록으로 전달
            }
            
            System.out.println("정상적인 입력을 받았습니다.");
        } catch (IllegalArgumentException e) {
            System.out.println("오류 발생: " + e.getMessage());
        } finally {
            System.out.println("프로그램이 종료됩니다.");
        }
    }
}
```

## 예외 떠넘기기

예외가 발생할 수 있는 코드를 작성할 때는 `try-catch`를 통해 예외를 처리하는 것이 일반적이다.
하지만 경우에 따라 예외 처리를 호출한 메서드로 넘겨 다른 곳에서 처리하도록 할 수 있다.
이를 위해 사용하는 키워드다 `throws`다.
`throws`는 메서들 선언부 끝에 작성되며, 해당 메서드에서 발생할 수 있는 예외를 직접 처리(`catch`)하지 않고 호출한 곳으로 떠넘긴다.

> throw는 예외를 발생시키는, throws는 예외를 메서드에 선언하는 키워드이다.

아래 코드에서는 `method1()`, `method2()`, `method3()` 세 메서드가 각각 예외 처리를 위해 `try-catch`로 감싸져 있다.

```java
public class Main {
    public static void main(String[] args) {
        method1();
        method2();
        method3();
    }

    public static void method1() {
        try {
            throw new ClassNotFoundException("에러 발생: 클래스 찾기 실패");
        } catch (ClassNotFoundException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void method2() {
        try {
            throw new ArithmeticException("에러 발생: 수학적 오류");
        } catch (ArithmeticException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void method3() {
        try {
            throw new NullPointerException("에러 발생: Null 참조");
        } catch (NullPointerException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

이 경우 코드가 길어지고 가독성이 떨어질 수 있다.
위와 같은 코드에서 각 메서드에 `throws` 키워드를 사용해 예외를 떠넘기면, 예외가 발생해도 호출한 메서드에서 한꺼번에 처리할 수 있다.
이렇게 하면 중복된 `try-catch`를 줄여 코드가 간결해지고 가독성이 향상된다.

```java
public class Main {
    public static void main(String[] args) {
        try {
            method1();
            method2();
            method3();
        } catch (ClassNotFoundException | ArithmeticException | NullPointerException e) {
            System.out.println("오류: " + e.getMessage());
        }
    }

    public static void method1() throws ClassNotFoundException {
        throw new ClassNotFoundException("에러 발생: 클래스 찾기 실패");
    }

    public static void method2() throws ArithmeticException {
        throw new ArithmeticException("에러 발생: 수학적 오류");
    }

    public static void method3() throws NullPointerException {
        throw new NullPointerException("에러 발생: Null 참조");
    }
}
```

이렇게 메서드 선언부에 예외 클래스를 `throws`로 명시하면, 해당 메서드에서 예외를 처리하지 않고 호출한 상위 메서드로 떠넘기게 된다.
`throws`를 사용해 예외를 던진 메서드는 자신이 예외를 직접 처리하지 않고, 예외를 호출한 메서드에게 전달해 처리하게끔 할 수 있다.

이 예외는 호출 스택을 따라 상위 메서드로 계속 전달될 수 있으며, 최종적으로 `main` 메서드까지 떠넘겨질 수 있다.
만약 `main` 메서드도 `throws`로 예외를 던진다면, 마지막에는 JVM에서 처리하게 된다.

# 연결된 예외

<hr>

## 예외를 다른 예외로 감싸 던지기

연결된 예외(Chained Exception)는 원인 예외를 다른 예외로 감싸서 던지는 기법이다.

`Throwable` 클래스에서는 연결된 예외를 처리할 수 있도록 다음과 같은 메서드를 제공한다.

- `Throwable initCause(Throwable caues)`: 원인 예외를 등록하는 메서ㅡㄷ
- `Throwable getCause()`: 원인 예외를 반환하는 메서드

이 메서드들을 통해 발생한 예외를 다른 예외로 감싸 던질 수 있으며, `Exception` 클래스의 상위 클래스인 `Throwable`에 정의되어 있기 때문에 모든 예외에서 사용할 수 있다.

아래 코드는 `FileNotFountException`을 원인 예외로 감싸 `IOException`으로 던지는 방식이다.

```java
import java.io.FileNotFoundException;
import java.io.IOException;

class FileProcessingException extends IOException {
    public FileProcessingException(String message) {
        super(message);
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            processFile();
        } catch (FileProcessingException e) {
            System.out.println("원인 예외: " + e.getCause()); // 원인 예외 출력
            e.printStackTrace();
        }
    }

    public static void processFile() throws FileProcessingException {
        try {
            throw new FileNotFoundException("파일을 찾을 수 없습니다."); // 원인 예외 발생
        } catch (FileNotFoundException e) {
            FileProcessingException fileProcessingException = new FileProcessingException("파일 처리 중 오류 발생"); // 새로운 예외 생성
            fileProcessingException.initCause(e); // FileProcessingException의 원인 예외를 FileNotFoundException으로 지정
            throw fileProcessingException; // FileProcessingException을 던져 상위 메서드로 전달
        }
    }
}
```

코드에 대한 부가 설명을 하겠다.

1. `processFile()` 메서드에서 `FileNotFoundException`이 발생한다.
2. `catch`에서 `FileProcessingException` 예외 객체를 생성한다.
3. 그리고 `FileProcessingException`의 `initCause()` 메서드를 통해 원인 예외를 `FileNotFoundException`으로 지정한다.
4. `FileProcessingException`을 상위 메서드로 던지며, `main()` 메서드에서 `catch`가 이를 처리한다.
5. `getCause()` 메서드를 사용해 원인 예외(`FileNotFoundException`)를 `catch`하고 `getCause()` 메서드를 통해 원인 예외 로르글 출력한다.

이렇게 연결된 예외를 사용하는 이유는 여러 예외를 하나의 큰 범주의 예외로 묶어서 처리하기 위함이다.
예외를 감싸는 방식은 다형성을확장하여 다양한 예외를 한 번에 처리하는 방법을 제공하며, 복잡한 예외 처리를 간소화 할 수 있다.
또한, 특정 예외에 대한 명확한 에러 메시지를 제공하는 대신, 단계별로 문제의 원인과 발생 과정을 추적할 수 있게 해준다.

## Checked Exception를 Unckecked Exception으로 변환하기

연결된 예외(`Chained Exception`)를 사용하는 또 다른 이유는 `Checked Exception`을 `Unchecked Exception`으로 변환하여 컴파일러가 예외 처리를 강제하지 않도록 하는 것이다.

자바에서 `Checked Exception`을 도입한 이유는 프로그래밍 경험이 적은 개발자도 안정적인 프로그래밍을 하도록 돕기 위함이다.
하지만 런타임 예외로 처리해도 무방한 예외들이 `Checked Exception`으로 등록되어 있는 경우가 많다.
이때 연결된 예외를 사용해 `Checked Exception`을 `Unchecked Exception`으로 감싸 변환하면, 컴파일러의 예외 처리 강제성을 회피할 수 있다.
이렇게 함으로써 예외처리가 선택사항이 되어 코드가 더 간결해지고, 개발자는 필수적인 부분에서만 예외를 다루는 선택을 할 수 있다.

```java
public class Main {
    public static void main(String[] args) {
            install();
    }

    public static void install() {
        throw new RuntimeException(new IOException("설치할 공간이 부족합니다."));
        // Checked 예외인 IOException을 Unchecked 예외인 RuntimeException으로 감싸 Unchecked 예외로 변환
    }
}
```