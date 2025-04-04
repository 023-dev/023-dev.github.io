---
title: "자바 열거형 타입(Type-Safe Enum Pattern)"
date: 2024-12-28 00:00:00
tags: 
  - Java
---

자바가 제공하는 열거형(Enum) 타입은 서로 연관된 상수들의 집합을 의미한다.
이러한 자바의 열거형을 이해하기 전에 먼저 열거형이 생겨난 이유에 대해 알아야 한다.

## 문자열과 타입 안전성
다음과 같은 상황을 가정하고 코드를 구현해 가면서 근본적인 문제점을 파악해 보겠다.

요구사항은 다음과 같다.
고객을 `BASIC`, `GOLD`, `DIAMOND` 등급으로 분류하고 각 등급에 따라 할인율을 부여한다.
각각의 할인율은 10%, 20%, 30%이다. 할인 시 소수점 이하는 버린다.

이제 회원 등급과 가격을 입력하면 할인 금액을 계산하는 코드를 구현해보자.

```java
public class DiscountService {
    public int discount(String grade, int price) {
        int discountPercent = 0;
        
        if (grade.equals("BASIC")) {
            discountPercent = 10;
        } else if (grade.equals("GOLD")) {
            discountPercent = 20;
        } else if (grade.equals("DIAMOND")) {
            discountPercent = 30;
        } else {
            System.out.println(grade + ": 할인X");
        }
        return price * discountPercent / 100;
    }
}
```

위 코드에 대해서 설명하자면 `price * discountPercent / 100`는 `가격 * 할인율 / 100`을 계산하여 할인 금액을 구하는 코드이다.
회원 등급 외 다른 값이 입력되면 가격을 그대로 반환한다. 이 경우 할인율이 0%이므로 가격 그대로 반환하는 것이다.
상황을 단순화하기 위해 회원 등급에 `null`은 입력되지 않는다고 가정한다.

지금과 같이 단순히 문자열을 사용하여 회원 등급을 구분하는 방식은 문제점이 있다.
오타가 발생하기 쉽고, 유효하지 않는 값이 입력될 수 있다는 것이다.

이것 또한 코드를 구현해가며 확인해보자.

```java
public class Main {
    public static void main(String[] args) {
        int price = 10000;
        
        DiscountService discountService = new DiscountService();
     
        // 존재하지 않는 등급을 입력
        int vip = discountService.discount("VIP", price);
        System.out.println("VIP 등급의 할인 금액: " + vip);

        // 오타 입력
        int godl = discountService.discount("GODL", price);
        System.out.println("GODL 등급의 할인 금액: " + godl);
        
        // 소문자 입력
        int basic = discountService.discount("basic", price);
        System.out.println("basic 등급의 할인 금액: " + basic);
    }
}
```

위 코드는 다음과 같은 문제가 발생하고 있다.
먼저 존재하지 않는 등급인 `VIP`를 입력하고 있다.
그리고 두 번째로는 `GOLD` 등급을 오타로 `GODL`로 입력하고 있다.
마지막으로는 `BASIC` 등급을 소문자로 입력하고 있다.

이러한 문제의 코드는 문자열 오타가 발생하기 쉽고, 유효하지 않은 값이 입력될 수 있어서 타입 안정성 부족하며,
`BASIC`, `basic`, `Basic` 등 다양한 형태로 입력될 수 있는 문자열을 입력할 수 있어 데이터의 일관성 또한 떨어진다.

이 문제의 원인은 `String`을 사용하여 회원 등급을 구분하고 있기 때문에 발생한 것이다.
`String`으로 상태나 카테고리를 표현하면, 이처럼 잘못된 입력이 발생할 수 있다.
이러한 잘못된 값은 컴파일 시 확인할 수 없고, 런타임 시에 확인할 수 있기에 디버깅이 어려워질 수 있다.

이런 문제를 해결하기 위해서는 입력을 특정 범위로 제한을 해야한다.
예를 들면 `BASIC`, `GOLD`, `DIAMOND` 등의 값만 `discount()` 메서드에 전달될 수 있도록 제한을 해야한다.
하지만 `String` 자체에는 문자열이면 무엇이든 할당할 수 있기에 자바 문법 관점에서 아무런 문제가 없다.
이 말은 즉, `String` 타입을 사용해서는 문제를 해결할 수 없다는 말이 된다.

이런 문제를 해결하기 위한 대안으로 문자열 상수를 사용해서 미리 정의한 변수명만 사용할 수 있게 하는 방법이 있다.
코드를 통해 알아보도록 하겠다.

```java
public class Grade {
    public static final String BASIC = "BASIC";
    public static final String GOLD = "GOLD";
    public static final String DIAMOND = "DIAMOND";
}
```

위 코드는 `Grade` 클래스를 생성하고 `BASIC`, `GOLD`, `DIAMOND` 등의 상수를 정의하였다.
이제 `DiscountService` 클래스를 수정하여 `Grade` 클래스를 사용하도록 코드를 수정해보자.

```java
public class DiscountService {
    public int discount(String grade, int price) {
        int discountPercent = 0;
        
        if (grade.equals(Grade.BASIC)) {
            discountPercent = 10;
        } else if (grade.equals(Grade.GOLD)) {
            discountPercent = 20;
        } else if (grade.equals(Grade.DIAMOND)) {
            discountPercent = 30;
        } else {
            System.out.println(grade + ": 할인X");
        }
        return price * discountPercent / 100;
    }
}
```

이제 `Main` 클래스를 수정하여 `Grade` 클래스를 사용하도록 코드를 수정해보자.

```java
public class Main {
    public static void main(String[] args) {
        int price = 10000;
        
        DiscountService discountService = new DiscountService();
     
        int basic = discountService.discount(Grade.BASIC, price);
        int gold = discountService.discount(Grade.GOLD, price);
        int diamond = discountService.discount(Grade.DIAMOND, price);

        System.out.println("BASIC 등급의 할인 금액: " + basic);
        System.out.println("GOLD 등급의 할인 금액: " + gold);
        System.out.println("DIAMOND 등급의 할인 금액: " + diamond);
    }
}
```

문자열 상수를 사용한 덕분에 오타를 방지할 수 있고, 유효하지 않은 값이 입력될 수 없게 되었다.
그리고 `discount()` 메서드에 전달되는 값은 `Grade` 클래스에 정의된 상수만 사용할 수 있게 되었다.
이 덕분에 만약 `Grade` 클래스에 정의되지 않은 값이 입력되면 컴파일 에러가 발생하게 되고, 오류를 쉽고 빠르게 찾을 수 있게 되었다.

하지만 이 방법에도 문제점이 있다.
문자열 상수를 사용해도, 지금까지 발생한 문제들을 근본적으로 해결할 수 없다.
왜냐하면 아직도 `String`을 사용하고 있기 때문에 문자열이면 무엇이든 입력할 수 있기 때문이다.
여기서 어떤 개발자가 앞서 테스트한 것처럼 `VIP`, `GODL`, `basic` 등의 값이 입력되어도 방지할 수 있는 방법이 없다.

그리고 사용해야 하는 문자열 상수가 어디에 있는지 `discount()` 메서드를 사용하는 개발자가 알아야 한다.
코드를 보면 `String`은 다 입력 가능하게 되어있다.
```java
public int discount(String grade, int price) {}
```
이렇게 되면 `discount()` 메서드를 사용하는 개발자가 `Grade` 클래스에 정의된 상수만 사용해야 한다는 것을 알 수 없다.
주석을 남기거나 해서 알려줄 수 있지만, 이러한 방법은 개발자가 주석을 읽고 이해해야 하고 주석을 잊어버리고 직접 문자열을 입력할 수 있다.
이렇게 문자열 상수를 사용하는 방법 또한 문제점이 많다.

## Type-Safe Enum Pattern
많은 개발자들도 이러한 문제점을 해결하기 위해 오랜기간 고민을 해왔고,
이를 해결하기 위해 나온 결과가 타입 안전 열거형 패턴(Type-Safe Enum Pattern)이다.

여기서 `Enum`은 `Enumeration`의 줄임말로 번역하면 열거라는 뜻이다.
즉, 어떤 것을 나열한 것을 뜻한다.
지금 상황에서는 `BASIC`, `GOLD`, `DIAMOND`이라는 회원 등급을 열거한 것이다.
여기서 타입 안전 열거형 패턴을 사용하면 이렇게 나열한 항목만 사용할 수 있게 된다는 것이 핵심이다.
이 말은 즉, `String`처럼 어떤 값이든 입력할 수 있는 것이 아니라, `BASIC`, `GOLD`, `DIAMOND`만 사용할 수 있게 된다는 것이다.

이제 타입 안전 열거형 패턴을 구현하여 문제를 해결해보자.

```java
public class Grade {
    public static final Grade BASIC = new Grade();
    public static final Grade GOLD = new Grade();
    public static final Grade DIAMOND = new Grade();
}
```

위 코드는 `Grade` 클래스를 생성하고 `BASIC`, `GOLD`, `DIAMOND` 등의 상수를 선언하였다.
각각을 상수로 선언하기 위해 `static`과 `final` 키워드를 사용하였다.
이때 각각의 상수마다 별도의 인스턴스를 생성하고, 생성한 인스턴스를 상수에 할당하였다.

![Enum Instance](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-enum/java-enum_1.png){: width="500" }

코드를 통해 확실한 이해를 해보도록 하겠다.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("class BASIC = " + Grade.BASIC.getClass());
        System.out.println("class GOLD = " + Grade.GOLD.getClass());
        System.out.println("class DIAMOND = " + Grade.DIAMOND.getClass());

        System.out.println("ref BASIC = " + Grade.BASIC);
        System.out.println("ref GOLD = " + Grade.GOLD);
        System.out.println("ref DIAMOND = " + Grade.DIAMOND);
    }
}
```

위 코드를 실행하면 다음과 같은 결과가 출력된다.

```java
class BASIC = class enumeration.test.Grade
class BASIC = class enumeration.test.Grade
class BASIC = class enumeration.test.Grade
ref BASIC = enumeration.test.Grade@1b6d3586
ref GOLD = enumeration.test.Grade@4554617c
ref DIAMOND = enumeration.test.Grade@74a14482
```

각각의 상수는 모두 `Grade` 타입을 기반으로한 인스턴스이기에 `getClass()` 메서드를 호출하면 `Grade` 클래스가 출력된다.
하지만 각각의 상수는 모두 별도의 `Grade` 인스턴스이기에 서로 다른 메모리 주소를 가지고 있다.

또한 `static`을 사용하여 클래스 변수로 선언하였기에 `Grade` 클래스의 인스턴스를 생성하지 않고도 `Grade.BASIC`, `Grade.GOLD`, `Grade.DIAMOND` 상수를 사용할 수 있다.

이제 `DiscountService` 클래스를 수정하여 `Grade` 클래스를 사용하도록 코드를 수정해보자.

```java
public class DiscountService {
    public int discount(Grade grade, int price) {
        int discountPercent = 0;
        
        if (grade == Grade.BASIC) {
            discountPercent = 10;
        } else if (grade == Grade.GOLD) {
            discountPercent = 20;
        } else if (grade == Grade.DIAMOND) {
            discountPercent = 30;
        } else {
            System.out.println(grade + ": 할인X");
        }
        return price * discountPercent / 100;
    }
}
```

위 코드에서는 `discount()` 메서드의 매개변수 타입을 `String`에서 `Grade`로 변경하였다.
또한 값을 비교할 떄는 `grade == Grade.BASIC`와 같이 `==` 연산자를 사용하여 비교하였다.

이제 `Main` 클래스를 수정하여 `Grade` 클래스를 사용하도록 코드를 수정해보자.

```java
public class Main {
    public static void main(String[] args) {
        int price = 10000;
        
        DiscountService discountService = new DiscountService();
     
        int basic = discountService.discount(Grade.BASIC, price);
        int gold = discountService.discount(Grade.GOLD, price);
        int diamond = discountService.discount(Grade.DIAMOND, price);

        System.out.println("BASIC 등급의 할인 금액: " + basic);
        System.out.println("GOLD 등급의 할인 금액: " + gold);
        System.out.println("DIAMOND 등급의 할인 금액: " + diamond);
    }
}
```

이제 `discount()`를 호출할 떄 미리 정의된 `Grade` 클래스의 상수만 사용할 수 있게 되었다.

하지만 이 방법에도 문제점이 있다.
그것은 외부에서 임의로 `Grade` 클래스의 인스턴스를 생성할 수 있다는 것이다.

```java
public class Main {
    public static void main(String[] args) {
        int price = 10000;
        
        DiscountService discountService = new DiscountService();

        Grade vip = new Grade();
        int vipDiscount = discountService.discount(vip, price);
        System.out.println("VIP 등급의 할인 금액: " + vipDiscount);
    }
}
```

이 문제를 해결하기 위해서는 생성자를 `private`으로 선언하여 외부에서 인스턴스를 생성할 수 없도록 제한하면 된다.

```java
public class Grade {
    public static final Grade BASIC = new Grade();
    public static final Grade GOLD = new Grade();
    public static final Grade DIAMOND = new Grade();

    private Grade() {}
}
```

이제 `Grade` 클래스의 생성자를 `private`으로 선언하였기에 외부에서 인스턴스를 생성할 수 없게 되었다.
또한 `Grade` 클래스의 인스턴스는 `BASIC`, `GOLD`, `DIAMOND` 상수만 사용할 수 있게 되었다.
만일 `Grade` 클래스의 인스턴스를 생성하거나 정의된 값이 아닌 다른 값을 사용하려고 하면 컴파일 에러가 발생하게 된다.

이렇게 함으로써 타입 안전 열거형 패턴을 구현할 수 있었고, 이를 통해 정해진 객체만 사용할 수 있기에 잘몬된 값을 입력하는 문제를 근본적으로 방지할 수 있게 되었다.
또한 정해진 객체만 사용하므로 데이터의 일관성이 보장된다.

> 참고 <br>
> **제한된 인스턴스 생성**: 클래스는 사전에 정의된 몇 개의 인스턴스만 생성하고, 외부에서는 이 인스턴스들만 사용할 수 있도록 한다. 이를 통해 미리 정의된 값들만 사용하도록 보장한다.<br>
> **타입 안전성**: 이 패턴을 사용하면, 잘못된 값이 할당되거나 사용되는 것을 컴파일 시점에 방지할 수 있다. 예를 들어, 특정 메서드가 특정 열거형 타입의 값을 요구한다면, 오직 그 타입의 인스턴스만 전달할 수 있다.

이 패턴을 구현하려면 다음과 같이 코드가 길어지고, `private` 생성자를 선언해야 하는 등 번거로운 작업이 필요하다.
```java
public class Grade {
    public static final Grade BASIC = new Grade();
    public static final Grade GOLD = new Grade();
    public static final Grade DIAMOND = new Grade();

    private Grade() {}
}
```

## Enum Type
자바에서는 타입 안전 열거형 패턴을 더 쉽게 구현할 수 있도록 `Enum` 타입을 제공한다.
`Enum` 타입은 열거형 상수를 정의하고 사용할 수 있도록 한다.
`Enum` 타입을 사용하면 열거형 상수를 쉽게 정의하고 사용할 수 있으며, `Enum` 타입을 사용하면 `private` 생성자를 선언하거나 인스턴스를 생성하는 등의 작업을 할 필요가 없다.

이제 `Enum` 타입을 사용하여 `Grade` 클래스를 구현해보자.

```java
public enum Grade {
    BASIC, GOLD, DIAMOND
}
```

열거형을 정의할 때는 위 코드 처럼 `enum` 키워드를 사용하고, 열거형 상수를 정의하여 나열하면 된다.
앞서 직접 `Grade` 클래스를 구현할 때와 달리 `private` 생성자를 선언하거나 인스턴스를 생성하는 등의 작업을 할 필요가 없다.

자바의 열거형으로 작성한 `Grade` 클래스는 다음과 거의 같다고 할 수 있다.

```java
public class Grade extends Enum {
    public static final Grade BASIC = new Grade();
    public static final Grade GOLD = new Grade();
    public static final Grade DIAMOND = new Grade();

    private Grade() {}
}
```

열거형도 클래스이다.
또한 자동(강제)으로 `java.lang.Enum` 클래스를 상속받기 때문에 `Enum` 클래스의 메서드를 사용할 수 있다.
그리고 `Enum` 클래스는 `private` 생성자를 가지고 있기에 외부에서 인스턴스를 생성할 수 없다.
생성할 경우 `enum classes may not be instantiated`라는 에러 메시지를 뱉어내며, 컴파일 에러가 발생하게 된다.

이러한 열거형은 사전에 정의된 값만 사용할 수 있기에 타입 안전성을 보장한다.
그리고 열거형을 사용하면 `static import`와 `switch`를 적절하게 사용할 수도 있고, 이로 인해 코드가 간결해지고 명확해져 가독성이 좋아진다.
또한 데이터 일관성도 보장할 수 있게 된다.
만일 새로운 타입을 추가하거나 삭제하려면 `Grade` 열거형에만 추가하거나 삭제하면 되기에 확장성 측면에서도 좋다.


### Enum Type의 메서드
앞서 열거형도 클래스라고 했다.
그 말은 즉, 열거형 클래스가 제공하는 메서드들을 사용할 수 있다는 것이다.

주요 메서드는 다음과 같다.
- `values()`: 열거형의 모든 상수를 배열에 담아 반환한다.
- `valueOf(String name)`: 지정된 이름(name)과 일치하는 열거형 상수를 반환한다.
- `name()`: 열거형 상수의 이름을 문자열로 반환한다.
- `ordinal()`: 열거형 상수가 정의된 순서를 반환한다.
- `toString()`: 열거형 상수의 이름을 문자열로 반환한다.

하지만 여기서 `ordinal()` 메서드는 사용을 지양해야 한다.
왜냐하면 이 값을 사용하다가 중간에 상수를 선언하는 위치가 변경되면 전체 상수의 순서가 변경되기 때문이다.

### Enum Type 사용한 리팩토링
이제 `Enum` 타입을 사용하여 `Grade` 클래스 코드를 리팩토링해보자.
코드의 응집성을 위해 등급별 할인율과 할인 금액을 계산하는 코드를 `Grade` 열거형에 추가하고,
`DiscountService` 클래스에서 `Grade` 열거형을 사용하도록 코드를 수정했다.


```java
public enum Grade {
    BASIC(10), GOLD(20), DIAMOND(30);
    
    private final int discountPercent;
    
    Grade(int discountPercent) {
        this.discountPercent = discountPercent;
    }
    
    public int getDiscountPercent() {
        return discountPercent;
    }
    
    public int discount(int price) {
        return price * discountPercent / 100;
    }
}
```

여기서 기존 `DiscountService` 클래스의 기능을 `Grade` 열거형에 추가하였다.
더는 `DiscountService` 클래스에서 할인율을 계산하는 코드를 작성할 필요가 없어졌다.

이제 `main` 메서드를 수정하여 `Grade` 열거형을 사용하도록하고 중복된 코드를 제거하는 방향으로 수정해보겠다.

```java
public class Main {
    public static void main(String[] args) {
        int price = 10000;
        
        Grade[] grades = Grade.values();
        for (Grade grade : grades) {
            printDiscount(grade, price);
        }
    }
    
    private static void printDiscount(Grade grade, int price) {
        System.out.println(grade.name() + " 등급의 할인 금액: " + grade.discount(price));
    }
}
```

이제 `main` 메서드에서는 `Grade` 열거형의 모든 상수를 배열로 가져와서 반복문을 통해 할인 금액을 출력하도록 수정하였다.
이렇게 함으로써 중복된 코드를 제거하고, 코드의 응집성을 높일 수 있게 되었다.