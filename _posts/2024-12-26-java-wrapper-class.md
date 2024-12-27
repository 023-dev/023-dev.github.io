---
layout: post
title: "Wrapper Class"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# Wrapper Class
자바에서 기본형 타입을 객체로 다루기 위해 제공하는 클래스를 래퍼 클래스(Wrapper Class)라고 한다.
래퍼 클래스는 기본형의 한계 때문에 객체로 다루어야 할 때 사용한다.

## 기본형의 한계
자바는 객체 지향 언어이지만, 자바가 제공하는 것들 중 객체가 아닌 것들이 있다.
그것들은 `int`, `char`, `float`, `double` 등과 같은 기본형(Primitive Type)이다.
기본형은 앞서 말했듯이 객체가 아니기에 다음과 같은 한계가 있다.

## 객체가 아니기에 발생하는 한계

계속 언급했듯이 기본형 데이터는 객체가 아니기 때문에, 객체 지향 프로그래밍의 특징과 장점을 살릴 수 없다.
예를 들자면 객체는 유용한 메서드를 가지고 있고 제공할 수 있지만, 기본형은 객체가 아니기에 메서드를 가질 수도 제공할 수도 없다.
그리고 객체 참조가 필요한 컬렉션 프레임워크를 사용할 수 없고, 제네릭 또한 사용할 수 없다. 

기본형의 한계를 이해하기 위해 코드로 예시를 들어보겠다.
예시 코드는 두 값을 비교해서 다음과 같은 결과를 출력한다
- 두 값이 같다면 `0`
- 첫 번째 값이 더 크다면 `1`
- 두 번째 값이 더 크다면 `-1`

```java
public class Main {
    public static void main(String[] args) {
        int value = 10;
        int intValue1 = compareTo(value, 5);
        int intValue2 = compareTo(value, 10);
        int intValue3 = compareTo(value, 15);

        System.out.println("intValue1: " + intValue1);
        System.out.println("intValue2: " + intValue2);
        System.out.println("intValue3: " + intValue3);
    }

    public static int compareTo(int value, int target) {
        if (value < target) {
            return -1;
        } else if (value > target) {
            return 1;
        } else {
            return 0;
        }
    }
}
```

위 코드는 `value`와 비교 대상 값을 `compareTo` 메서드에 넘겨주어 비교한 후 결과를 출력한다.
그런데 자기 사신인 `value`와 다른 값을 연산하는 것이기에 항상 자기 자신의 값인 `value`가 사용된다.
이런 경우 만약 `value`가 객체라면 `value` 객체 스스로 자기 자신의 값과 비교 대상 값을 비교할 수 있는 메소드를 만드는 것이 더 효율적일 것이다.

그래서 이런 한계를 극복하기 위해 자바는 기본형을 객체로 다루기 위한 래퍼 클래스를 제공한다.
이 문단에서는 래퍼 클래스를 구현해서 기본형의 한계를 극복하는 방법을 알아보겠다.

먼저 `int`를 객체로 다루기 위한 래퍼 클래스를 구현해보자.
`int`는 클래스가 아니지만, `int` 값을 가지고 있는 객체를 만들어서 `int`를 객체로 다룰 수 있다.
다음 코드는 `int`를 객체로 다루기 위한 래퍼 클래스를 구현한 코드이다.
이렇게 특정 기본형을 감싸서(Wrap) 객체로 만들어주는 클래스를 래퍼 클래스(Wrapper Class)라고 한다.

```java
public class IntWrapper {
    
    private final int value;

    public IntWrapper(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public int compareTo(int target) {
        if (value < target) {
            return -1;
        } else if (value > target) {
            return 1;
        } else {
            return 0;
        }
    }
    
    @Override
    public String toString() {
        return String.valueOf(value);tring
    }
}
```

위 코드에서 `IntWrapper` 클래스는 `int` 값을 가지고 있는 객체를 만들어주는 래퍼 클래스이다.
이를 통해 기본형 변수를 편리하게 사용할 수 있도록 다양한 메소드를 제공한다.
앞에서 구현한 `compareTo` 메서드를 `IntWrapper` 클래스에 내부로 캡슐화하여 구현했다.
그리고 이클래스는 불변으로 만들기 위해 `value` 필드를 `final`로 선언했다.

이제 `IntWrapper` 클래스를 사용해보자.

```java
public class Main {
    public static void main(String[] args) {
        IntWrapper value = new IntWrapper(10);
        int intValue1 = value.compareTo(5);
        int intValue2 = value.compareTo(10);
        int intValue3 = value.compareTo(15);

        System.out.println("intValue1: " + intValue1);
        System.out.println("intValue2: " + intValue2);
        System.out.println("intValue3: " + intValue3);
    }
}
```

위 코드는 `IntWrapper` 클래스의 `compareTo` 메서드를 사용하여 `value`와 비교 대상 값을 비교한다.
`IntWrapper`는 객체이기에 예시 코드처럼 자신이 가진 메서드를 편리하게 호출할 수 있다.

## null 값을 가질 수 없는 한계

기본형은 항상 값을 가져야 한다. 하지만 프로그래밍을 하다보면 상황에 따라 데이터가 없는 경우가 발생한다.
그리고 이때 데이터가 없음을 나타내기 위해 `null`이라는 상태가 필요할 수 있다.
하지만 기본형은 `null` 값을 가질 수 없기 때문에 이런 상황을 처리하기 어렵다.

해당 상황에 대한 예시 코드를 보자.

```java
public class Main {
    public static void main(String[] args) {
        int[] values = {-1, 0, 1, 2, 3};
        System.out.println(findValue(values, -1)); // -1
        System.out.println(findValue(values, 0)); // 0
        System.out.println(findValue(values, 1)); // 1
        System.out.println(findValue(values, 100)); // -1
    }

    public static int findValue(int[] values, int target) {
        for (int value : values) {
            if (value == target) {
                return value;
            }
        }
        return -1;
    }
}
```

위 코드는 `findValue` 메서드를 사용하여 배열에서 특정 값을 찾는다.
그리고 해당 값이 있으면 값을 반환하고, 없으면 `-1`을 반환한다.
`findValue`는 결과로 항상 `int`를 반환하게 되는데, 이때 `int`와 같은 기본형은 항상 값이 있어야 한다.
여기서도 값을 반환할 때 값을 찾지 못한다면 숫자 중에 하나를 반환해야 하는데 보통 이때는 `-1`이나 `0`을 반환한다.

하지만 이런 경우에는 `-1`이나 `0`이 실제로 배열에 있는 값일 수도 있다.
코드를 보면 `-1`일 때 `-1`을 반환하는 경우가 있는데, 배열에 없는 값 `100`을 입력해도 같은 `-1`을 반환한다.
그래서 이런 경우에는 `-1`을 반환하는 것이 정상적인 결과인지 아닌지 판단하기 어렵다.

객체의 경우는 이런 상황에서 데이터가 없다는 것을 나타내기 위해 `null`을 사용할 수 있다.
그럼 이제 `null`을 가질 수 있는 래퍼 클래스를 이용한 코드를 보자.

```java
public class Main {
    public static void main(String[] args) {
        IntWrapper[] values = {new IntWrapper(-1), new IntWrapper(0), new IntWrapper(1), new IntWrapper(2), new IntWrapper(3)};
        System.out.println(findValue(values, new IntWrapper(-1))); // -1
        System.out.println(findValue(values, new IntWrapper(0))); // 0
        System.out.println(findValue(values, new IntWrapper(1))); // 1
        System.out.println(findValue(values, new IntWrapper(100))); // null
    }
    
    private static IntWrapper findValue(IntWrapper[] values, IntWrapper target) {
        for (IntWrapper value : values) {
            if (value.equals(target)) {
                return value;
            }
        }
        return null;
    }
}
```

위 코드에선 앞서 구현해놓은 `IntWrapper` 클래스를 사용하여 `null`을 반환할 수 있는 `findValue` 메서드를 구현했다.
실행결과를 보면 `findValue` 메서드는 배열에서 특정 값을 찾아서 반환하는데, 값이 없다면 `null`을 반환한다.
이렇게함으로써 `null`을 반환하면 값이 없다는 것을 명확하게 나타낼 수 있다.

앞선 `IntWrapper`를 사용하지 않은 예시에서도 본 것 처럼 기본형은 항상 값이 존재해야 한다.
반면에 객체인 참조형은 값이 없다는 `null`을 사용할 수 있다.
물론 `null` 값을 반환하는 경우 잘못하면 `NullPointerException`이 발생할 수 있기 때문에 주의해서 사용해야 한다.

## 자바 래퍼 클래스
위에서 설명한 것처럼 래퍼 클래스는 기본형을 객체로 감싸서 더 편리하게 사용할 수 있도록 다양한 기능을 제공하기에 상당히 유용하다는 것을 알 수 있었다.
지금까지 설명은 기본형의 한계로 인한 래퍼 클래스에 대한 필요성을 이해하고자 설명을 한 것이다.
그래서 자바에서는 기본형을 객체로 다루기 위한 래퍼 클래스를 제공한다.

자바는 다음과 같이 기본형에 대응하는 래퍼 클래스를 기본으로 제공한다.
- `byte`: `Byte`
- `short`: `Short`
- `int`: `Integer`
- `long`: `Long`
- `float`: `Float`
- `double`: `Double`
- `char`: `Character`
- `boolean`: `Boolean`

그리고 자바가 제공하는 기본 래퍼 클래스는 다음과 같은 특징을 가진다.
- 불변(Immutable)이어서 값을 변경할 수 없다.
- `equals()`로 값을 비교해야한다.

### 박싱(Boxing)
앞서 말해듯이 자바의 기본 래퍼 클래스는 기본형을 객체로 다루기 위해 존재한다.
기본형을 객체로 다루기 위해 래퍼 클래스로 변경하는 모습이 마치 상자에 기본형을 담는 것과 같다고 해서 이런 행위를 박싱(Boxing)이라고 한다.

```java
public class Main {
    public static void main(String[] args) {
        int intValue = 10;
        Integer integerValue = Integer.valueOf(intValue); // Boxing
    }
}
```

### 언박싱(Unboxing)
박싱과 반대로 래퍼 클래스를 기본형으로 변경하는 것을 언박싱(Unboxing)이라고 한다.
박스에 담겨져 있는 것을 꺼내는 것 같다고 해서 이런 행위를 언박싱이라고 한다.

```java
public class Main {
    public static void main(String[] args) {
        Integer integerValue = Integer.valueOf(10);
        int intValue = integerValue.intValue(); // Unboxing
    }
}
```

### 비교는 equals() 사용
래퍼 클래스는 객체이기에 `==` 연산자로 비교하면 주소값을 비교하게 된다.
그래서 래퍼 클래스는 `equals()` 메서드를 재정의하여 내부의 값을 비교하도록 구현되어 있다.
따라서 래퍼 클래스의 값을 비교할 때는 `equals()` 메서드를 사용해야 한다.
참고로 래퍼 클래스 객체를 그대로 출해도 내부의 값을 출력하도록 `toString()` 메서드 역시 재정의되어 있다. 

```java
public class Main {
    public static void main(String[] args) {
        Integer integerValue1 = Integer.valueOf(10);
        Integer integerValue2 = Integer.valueOf(10);
        System.out.println(integerValue1 == integerValue2); // false
        System.out.println(integerValue1.equals(integerValue2)); // true
    }
}
```

### 오토 박싱(Auto Boxing)과 오토 언박싱(Auto Unboxing)
자바에서는 기본형에서 래퍼 클래스로 변환하는 작업이 자주 발생하기 때문에 이를 편리하게 사용할 수 있도록 오토 박싱(Auto Boxing)과 오토 언박싱(Auto Unboxing) 기능을 제공한다.
여기서 오토 박싱은 기본형을 래퍼 클래스로 자동으로 변환하는 것이고, 오토 언박싱은 래퍼 클래스를 기본형으로 자동으로 변환하는 것이다.
자동으로 변환되기 때문에 개발자는 이를 명시적으로 변환하지 않아도 된다.

```java
public class Main {
    public static void main(String[] args) {
        Integer integerValue = 10; // Auto Boxing
        int intValue = integerValue; // Auto Unboxing
    }
}
```

## 래퍼 클래스 주요 메서드
래퍼 클래스는 기본형을 객체로 다루기 위한 클래스이기에 기본형과 관련된 다양한 메서드를 제공한다.
래퍼 클래스의 주요 메서드는 다음과 같다.

- `valueOf()`: 기본형 값을 래퍼 클래스 객체로 변환한다.
- `parseInt()`: 문자열을 정수로 변환한다.
- `compareTo()`: 두 값을 비교한다.
- `Integer.sum()`, `Integer.max()`, `Integer.min()`: `static` 메서드로 두 값을 더하거나 최대값, 최소값을 구한다.

### parseInt()와 valueOf()
`parseInt()`와 `valueOf()` 메서드는 문자열을 정수로 변환하는 메서드이다.
`parseInt()`는 정적 메서드로 문자열을 정수로 변환하고, `valueOf()`는 인스턴스 메서드로 문자열을 정수로 변환한다.
- `parseInt("10")`은 기본형인 `int`를 반환한다.
- `valueOf("10")`은 래퍼 클래스인 `Integer`를 반환한다.

```java
public class Main {
    public static void main(String[] args) {
        int intValue1 = Integer.parseInt("10");
        Integer integerValue2 = Integer.valueOf("10");
    }
}
```

## 래퍼 클래스 성능
래퍼 클래스는 객체이기에 기본형보다 다양한 메서드를 제공하고 편리하게 사용할 수 있다.
근데 그렇다면 기본형 보다 좋은 래퍼 클래스만 사용하면 되지 왜 기본형을 제공하고 사용하는 것일까?
다음 코드를 통해 래퍼 클래스와 기본형의 성능 차이를 알아보자.

```java
public class Main {
    public static void main(String[] args) {
        int iterations = 1_000_000_000;
        long startTime, endTime;
        long sumPrimitive = 0;
        startTime = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            sumPrimitive += i;
        }
        endTime = System.currentTimeMillis();
        System.out.println("기본 자료형 연산 경과 시간: " + (endTime - startTime) + "ms");
        
        Long sumWrapper = 0L;
        startTime = System.currentTimeMillis();
        for (int i = 0; i < iterations; i++) {
            sumWrapper += i;
        }
        endTime = System.currentTimeMillis();
        System.out.println("래퍼 클래스 연산 경과 시간: " + (endTime - startTime) + "ms");
        
    }
}
```

단순히 값을 반복해서 10억번 더하는 코드를 작성했다.
그리고 기본형 `long`과 래퍼 클래스 `Long`을 사용하여 성능을 비교했다.
결과는 다음과 같다.

```java
기본 자료형 연산 경과 시간: 361ms
래퍼 클래스 연산 경과 시간: 1828ms
```

물론 시스템 성능의 따라 다르겠지만, 기본형 연산이 래퍼 클래스 연산보다 약 5배 정도 빠르다는 것을 확인 할 수 있다. 
그 이유는 기본형은 메모리에서 단순히 그 크기만큼의 공간을 차지한다. 예를들면 `int`는 4바이트, `long`은 8바이트이다.
하지만 래퍼 클래스의 인스턴스는 내부에 필드로 가지고 있는 기본형의 값 외에도 자바에서 객체를 다루는데 필요한 객체 메타데이터를 포함하므로 더 많은 메모리를 차지한다.
대략 래퍼 클래스는 기본형의 2배 정도의 메모리를 차지한다.

### 유지보수와 최적화
그럼 뭐를 사용하라는 것일까?
아까는 래퍼 클래스가 기본형보다 편해서 좋다고 했다가,
지금은 기본형이 래퍼 클래스보다 성능이 좋다고 했다가 
혼란스럽지 않은가?

앞서 실험한 코드를 보면 5배라는 성능 차이는 10억번의 연산을 수행했을 때 발생한 것이다.
기본형이든 래퍼 클래스든 이것을 1회로 환산하면 둘 다 매우 빠르게 연산이 수행된다.
즉 10억번 연산의 결과인 0.3초와 1.8초라는 차이는 사실 1번 연산의 결과로 환산하면 0.3초 나누기 10억과 1.8초 나누기 10억이라는 매우 작은 차이이다.
일반적인 애플리케이션을 만드는 관점에서 봤을 때 이정도의 성능 차이는 최적화를 한다 해도 큰 의미가 없다.

만약 이렇게 유지보수와 최적화를 두고 둘중에 하나를 선택해야 한다면 유지보수를 먼저 고려하는 것이 좋다.
우선 요즘 컴퓨터는 매우 빠르기 때문에 이정도의 성능 차이는 크게 의미가 없다.
그리고 코드 변경 없이 성능 최적화를 하면 가장 좋겠지만, 성능 최적화는 대부분 단순함보다 복잡함을 요구하고, 더 많은 코드를 추가로 작성해야 한다.
이는 최적화를 위해 유지보수 해야 할 코드가 늘어난다는 것이다.
그런데 여기서 진짜 문제는 최적화를 한다고 했지만 전체 애플리케이션의 성능 관점에서 보면 불필요한 최적화일 수 있다.
시간과 노력을 들여서 최적화를 했지만, 전체 애플리케이션의 성능에는 큰 영향을 미치지 않는다면 그것은 얼마나 비효율적인가?

특히 웹 어플리케이션의 경우, 메모리 안에서 발생하는 연산 속도보다 네트워크 호출 속도가 수천수만배는 더 느리다.
이 말은 자바 메모리 내부에서 발생하는 연산을 수천번에서 한 번으로 줄이는 것보다, 네트워크 호출 한 번을 줄이는 것이 훨씬 더 중요하다는 것이다.
그래서 성능 최적화를 할 때는 전체 애플리케이션의 성능을 고려해야 한다.




