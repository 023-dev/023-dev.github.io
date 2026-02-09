---
title: "int 상수 대신 열거 타입을 사용하라"
date: 2025-01-29 11:00:00
tags:
  - Java
  - Effective Java
series: "Effective Java"
---

> 열거 타입: 일정 개수의 상수 값을 정의한 다음, 그외의 값은 허용하지 않는 타입

## 정수 열거 패턴의 단점

```java
public static final int APPLE_FUJI = 0;
public static final int APPLE_PIPPIN = 1;
public static final int APPLE_GRANNY_SMITH = 2;

public static final int ORANGE_NAVEL = 0;
public static final int ORANGE_TEMPLE = 1;
public static final int ORANGE_BLOOD = 2;
```

기존 정수 열거 패턴(int enum pattern)은 **타입 안전을 보장할 방법이 없고 표현력이 좋지 않다**는 단점이 존재한다.
위 코드에서 `APPLE`에서 `ORANGE`를 동등 비교(`==`)를 해도 컴파일러의 경고 메시지가 없다.

```java
int i = (APPLE_FUJI - ORANGE_NAVEL) / APPLE_PIPPIN;
```

**자바에서는 정수 열거 패턴을 위한 별도 이름 공간(namespace)을 지원하지 않아** 접두어를 사용해 이름 충돌을 방지하는 방법을 사용한다.

이렇게 정수 열거 패턴을 사용한 프로그램은 그냥 상수 나열이라, 컴파일 하면 그 값이 클라이언트 쪽에 그대로 새겨지기 때문에 **프로그램이 깨지기 쉽다.**

정수 열거 그룹에 속한 모든 상수를 한 바퀴 **순회하는 방법도 마땅치 않고**, 상수가 몇 개인지도 알 수 없다.

## 문자열 열거 패턴

문자열 열거 패턴(string enum pattern)은 상수의 의미를 출력할 수 있지만, 문자열 상수의 이름 대신 문자열 값을 그대로 하드코딩하게 만들어야 한다.
이 부분에서 오타가 있어도 컴파일러가 확인할 방법이 없으니 자연스럽게 런타임 버그가 생기게 된다.
또한 문자열 비교에 따른 성능 저하도 있어 지금까지의 단점들을 조합해보면 정수 열거 패턴보다 더 나쁜 걸 볼 수 있다.

## 열거 타입

자바의 열거 타입(enum type)은 이러한 기존 열거 패턴의 단점을 모두 해결해준다.

```java
public enum Apple { FUJI, PIPPIN, GRANNY_SMITH }
public enum Orange { NAVEL, TEMPLE, BLOOD }
```

모습은 이렇다. 완전한 형태의 클래스라서 단순히 정수값 뿐인 다른 언어의 열거 타입보다 훨씬 강력하다.

### 열거 타입의 아이디어

자바 열거 타입을 뒷받침하는 아이디어는 단순하다.
열거 타입 자체는 클래스로 하고, 상수 하나당 자신의 인스턴스를 하나씩 만들어 `public static final` 필드로 공개해둔다.
그럼 외부에서 접근할 수 있다는 것인가? 라고 생각할 수 있다.
하지만, 열거 타입은 밖에서 접근할 수 있는 생성자를 제공하지 않으므로 사실상 `final`이라고 해도 무방하다.
따라서 열거 타입 선은으로 만들어진 인스턴스는 하나씩만 존재하다는 것을 보장할 수 있게 된다.(인스턴스 통제)

이러한 특징으로 책에서는 다음과 같이 열거 타입을 **싱글턴 패턴의 일종**이라고 설명한다.
> 열거 타입은 싱글턴을 일반화한 형태라고 할 수 있고, 싱글턴은 원소가 하나뿐인 열거 타입이라고 볼 수 있다.

## 열거 타입의 장점

열거 타입은 컴파일 타입 안정성을 제공한다.
전 예제처럼 `APPLE` 열거 타입 인수에 `ORANGE`를 넘기려 하면 컴파일 오류를 일으킨다.

그리고 이름 같은 상수 공간이 공존하여 열거 타입이 수정되어도 문제가 되지 않는다.
공개 되는 것이 필드의 이름이라 정수 열거 패턴과 달리 상수 값이 클라이언트로 컴파일되어 각인되지 않는다.

여기서 끝이 아니다. 열거 타입에는 임의의 메서드나 필드를 추가할 수 있고 임의의 인터페이스를 구현하게 할 수 있다.

## 데이터와 메서드를 갖는 열거 타입

각 상수와 연관된 데이터를 해당 상수 내에 내재 시킬 수 있다.
이렇게 하면 고차원의 추상 개념 하나를 표현하게 된다.

```java
public enum Planet {
    MERCURY(3.302e+23, 2.439e6),
    VENUS  (4.869e+24, 6.052e6),
    EARTH  (5.975e+24, 6.378e6),
    MARS   (6.419e+23, 3.393e6),
    JUPITER(1.899e+27, 7.149e7),
    SATURN (5.685e+26, 6.027e7),
    URANUS (8.683e+25, 2.556e7),
    NEPTUNE(1.024e+26, 2.477e7);

    private final double mass;           // 질량(단위: 킬로그램)
    private final double radius;         // 반지름(단위: 미터)
    private final double surfaceGravity; // 표면중력(단위: m / s^2)

    // 중력상수(단위: m^3 / kg s^2)
    private static final double G = 6.67300E-11;

    // 생성자
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
        surfaceGravity = G * mass / (radius * radius);
    }

    public double mass()           { return mass; }
    public double radius()         { return radius; }
    public double surfaceGravity() { return surfaceGravity; }

    public double surfaceWeight(double mass) {
        return mass * surfaceGravity;  // F = ma
    }
}
```

열거 타입 상수 각각을 특정 데이터와 연결 지을 때는 생성자에서 데이터를 받아 인스턴스 필드에 저장하면 된다.

인지할 점은 열거 타입은 불변이라 모든 필드는 `final`로 선언되어야 하고,
필드를 `private`으로 선언하고 `public` 접근자 메서드를 제공해야 한다.

## 열거 타입의 배열

```java
public class WeightTable {
   public static void main(String[] args) {
      double earthWeight = Double.parseDouble(args[0]);
      double mass = earthWeight / Planet.EARTH.surfaceGravity();
      for (Planet p : Planet.values())
         System.out.printf("%s에서의 무게는 %f이다.%n",
                           p, p.surfaceWeight(mass));
   }
}
```

열거 타입은 자신 안에 정의된 상수들의 값을 배열에 담아 반환하는 정적 메서드인 `values`를 제공한다.

> 값들은 서언된 순서로 저장된다.

심지어 각 열거 타입의 값의 `toString` 메서드는 상수 이름을 문자열로 반환해 `print`로 출력하기 딱 좋다.

## 열거 타입을 올바르게 사용하는 예

일반 클래스와 마찬가지로 기능을 클라이언트에게 노출해야하 합당한 이유가 없다면 `private`로, 혹은 필요하다면 `package-private`로 선언해야 한다.
만약 널리 쓰이는 열거 타입인 경우, 톱레벨 클래스로 구현해야 한다. 만일 특정 톱레벨 클래스에서만 사용된다면 해당 클래스의 멤버 클래스로 만들면 된다.

## 상수별 메서드 구현

책에서는 사칙연산 계산기의 연산 종류를ㄹ 열거 타입으로 선언하여 실제 연산을 타입 상수가 맡아 수행하게 `switch`문을 사용하는 방법을 소개한다.

```java
public enum Operation {
    PLUS, MINUS, TIMES, DIVIDE;
    
    public double apply(double x, double y) {
        switch(this) {
            case PLUS:   return x + y;
            case MINUS:  return x - y;
            case TIMES:  return x * y;
            case DIVIDE: return x / y;
        }
        throw new AssertionError("알 수 없는 연산: " + this);
    }
}
```

이렇게 하면 `Operation` 열거 타입을 사용하는 클라이언트 코드는 새로운 연산을 추가하거나 기존 연산을 수정하기 쉬워진다.
그래서 이런 동작을 필요로 한다면 상수별 메서드 구현을 권장하고 있다.
즉, 열거 타입에 추상 메서드를 선언하고, 각 상수에서 자신에 맞게 동작을 재구현하는 방법이다.
이것을 상수별 메서드 구현(`constant-specific method implementation`)이라고 한다.

```java
public enum Operation {
    PLUS   { public double apply(double x, double y) { return x + y; } },
    MINUS  { public double apply(double x, double y) { return x - y; } },
    TIMES  { public double apply(double x, double y) { return x * y; } },
    DIVIDE { public double apply(double x, double y) { return x / y; } };

    public abstract double apply(double x, double y);
}
```

이러한 상수별 메서드 구현을 상수별 데이터와 결합할 수 도 있다.

```java
public enum Operation {
    PLUS("+") {
        public double apply(double x, double y) { return x + y; }
    },
    MINUS("-") {
        public double apply(double x, double y) { return x - y; }
    },
    TIMES("*") {
        public double apply(double x, double y) { return x * y; }
    },
    DIVIDE("/") {
        public double apply(double x, double y) { return x / y; }
    };

    private final String symbol;

    Operation(String symbol) {
        this.symbol = symbol;
    }

    @Override
    public String toString() {
        return symbol;
    }
    
    public abstract double apply(double x, double y);
}
```

## 열거 타입 반환 메서드

열거 타입 상수를 반환해야 하는 상황이라면
아래 두 메서드를 사용하면 문자열을 열거 타입 상수로 변환하여 반환하는 로직을 구현할 수 있다.
- `valueOf(String)`: 지정한 문자열과 일치하는 열거 타입 상수를 반환하는 메서드
- `fromString(String)`: `valueOf`와 비슷하지만, 문자열과 일치하는 상수가 없을 때 예외를 던지지 않고 `null`을 반환한다.

```java
private static final Map<String, Operation> stringToEnum = 
        Stream.of(values()).collect(
    toMap(Object::toString, e -> e));

public static Optional<Operation> fromString(String symbol) {
    return Optional.ofNullable(stringToEnum.get(symbol));
}
```

## 열거 타입 정적 필드의 생성 시점

```java
private static final Map<String, Operation> stringToEnum = 
        Stream.of(values()).collect(
    toMap(Object::toString, e -> e));
```

여기서 `Operation` 상수가 `stringToEnum` 맵에 추가되는 시점은 열거 타입 상수 생성 후 정적 필드가 초기화될 때다.
스트림이 없던 자바 8이전에는 빈 해시맵에 반환된 배열(`values`)을 순회하며 맵을 추가했을 것이다.
하지만 열거 타입 상수는 생성자에서 자신의 인스턴스틀 맵에 추가할 수 없게 컴파일 오류가 발생한다.
만약 이 방식이 허용되었다면 런타임에 `NullPointerException`이 발생할 것이다.

그 이유는 열거 타입에 접근 할 수 있는 방법은 상수 뿐인데,
열거 타입 생성자가 실행되는 시점에는 정적 필드들이 아직 초기화되기 전이라,
이러한 자기 자신을 추가하지 못하게 하는 제약이 꼭 필요하다.


> 열거 타입 생성자에서 같은 열거 타입의 다른 형제 상수에도 접근할 수 없다.

## 전략 열거 타입 패턴

열거 타입 상수 일부가 같은 동작을 공유한다면 전략 열거 타입 패턴을 사용하면 된다.

> 그렇지 않은 경우에는 `switch`문을 사용하는 것이 더 나은 선택일 수 있다.

```java
import static effectivejava.chapter6.item34.PayrollDay.PayType.*;

enum PayrollDay {
    MONDAY(WEEKDAY), TUESDAY(WEEKDAY), WEDNESDAY(WEEKDAY),
    THURSDAY(WEEKDAY), FRIDAY(WEEKDAY),
    SATURDAY(WEEKEND), SUNDAY(WEEKEND);

    private final PayType payType;

    PayrollDay(PayType payType) { this.payType = payType; }

    int pay(int minutesWorked, int payRate) {
        return payType.pay(minutesWorked, payRate);
    }

    enum PayType {
        WEEKDAY {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked <= MINS_PER_SHIFT ? 0 :
                        (minsWorked - MINS_PER_SHIFT) * payRate / 2;
            }
        },
        WEEKEND {
            int overtimePay(int minsWorked, int payRate) {
                return minsWorked * payRate / 2;
            }
        };

        abstract int overtimePay(int mins, int payRate);
        private static final int MINS_PER_SHIFT = 8 * 60;

        int pay(int minsWorked, int payRate) {
            int basePay = minsWorked * payRate;
            return basePay + overtimePay(minsWorked, payRate);
        }
    }

    public static void main(String[] args) {
        for (PayrollDay day : values())
            System.out.printf("%-10s%d%n", day, day.pay(8 * 60, 1));
    }
}
```

## 열거 타입을 사용 시점

책에서는 열거 타입의 장점을 설명하는 동시에 사용 시점을 제시한다.

- 필요한 원소를 컴파일 타임에 다 알 수 있는 상수 집합이라면 항상 열거 타입을 사용하자(예: 태양계 행성, 한 주의 요일).
- 열거 타입에 정의된 상수 개수가 영원히 고정 불변일 필요는 없다(예: 연산 코드, 플래그).

## 정리

열거 타입은 확실히 정수 상수 보다 읽기 쉽고, 안전하고, 강력하여 뛰어나다.
각 상수를 특정 데이터와 연결짓거나 상수마다 다르게 동작하거나, 하나의 메서드가 상부별로 다르게 동작할 때 열거 타입을 상수별 메서드 구현을 하면 된다.
그리고 열거 타입 상수 일부가 같은 동작을 공유한다면 전략 열거 타입 패턴을 사용하면 된다.