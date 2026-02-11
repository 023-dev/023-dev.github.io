---
visible: false
title: "public 클래스에서는 public 필드가 아닌 접근자 메서드를 사용하라"
date: 2025-01-09 00:00:00
tags:
  - Java
  - Effective Java
series: "Effective Java"
---

## 캡슐화의 이점을 제공하지 못하는 클래스

```java
class Point {
    public double x;
    public double y;
}
```

위와 같은 코드는 데이터 필드에 대한 직접적인 접근을 허용한다.
이러한 코드는 캡슐화의 이점을 제공하지 못한다.(아이템15와 이어지는 맥락)

### API를 수정하지 않고는 내부 표현을 바꿀 수 없다.
`public` 필드로만 구성되어 있기 때문에 내부 표현을 변경하기 위해서는 외부 API를 변경해야 한다.

책에서는 다음과 같이 `Point` 클래스에 접근자 메서드를 추가하는 방법을 제시한다.

```java
public getx() { 
    return x; 
}
public gety() { 
    return y;
}
```

### 불변식을 보장할 수 없다.
`public` 필드는 클라이언트가 필드에 접근하여 값을 변경할 수 있기 때문에 불변식을 보장할 수 없다.

```java
public static void main(String[] args) {
    Point point = new Point(1, 1);
    System.out.println(point.x); //1
    point.x += 1; // x값 변경
    System.out.println(point.x); //2
}
```

### 외부에서 필드에 접근할 때 부수 작업을 수행할 수 없다.
위 코드에서의 `point.x` 같이 필드에 직접 접근하는 경우, 1차원적인 접근만 가능해 필드에 접근할 때 추가적긴 연산 로직 같은 부수 작업을 삽입할 수 없다.

## 접근자와 수정자 메서드를 사용한 캡슐화

필드를 모두 `private`으로 선언하고, `public`한 접근자(`getter`)와 수정자(`setter`) 메서드를 사용하여 필드에 접근하도록 한다.

```java
class Point {
    private double x;
    private double y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public void setX(double x) {
        this.x = x;
    }

    public void setY(double y) {
        this.y = y;
    }
}
```

이렇게 패키지 외부에서 접근할 수 있는 클래스 접근자(`getter`,`setter`)를 제공하게 구현을 하면
클래스 내부 표현 방식을 변경해도 API를 수정하지 않고도 변경할 수 있다.
이러한 클래스의 내부 표현 방식으로 언제든지 내부표현을 유연하게 변경할 수 있다.

## package-private 클래스나 private 중첩 클래스에서는 public 필드를 사용해도 된다.
책에서는 또 다른 유용한 예로, `package-private` 클래스나 `private` 중첩 클래스을 들고 있다.

> `package-private` 클래스는 같은 패키지 내에서만 접근이 가능한 클래스이다.
> `private` 중첩 클래스는 해당 클래스를 포함하는 클래스 내에서만 접근이 가능한 클래스이다.

`package-private` 클래스나 `private` 중첩 클래스라면,
필드를 노출해도 클래스가 표현하려는 추상 개념만 문제가 되지 않는다.

다음 코드는 `private` 중첩 클래스에서 `public` 필드를 사용한 예시이다.

```java
public class Shape {
    private static class Point {
        private final int x;
        private final int y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        public int getX() {
            return x;
        }

        public int getY() {
            return y;
        }
    }

    public static Point createPoint(int x, int y) {
        return new Point(x, y);
    }
}
```

위 코드를 보면 `Point` 클래스는 `Shape` 클래스 내부에 캡슐화되어 외부에서 직접적인 접근할 수 없다.
하지만 `Shape` 클래스에서는 얼마든지 `Point` 객체를 생성하고, `Point` 객체의 필드에 접근할 수 있다.
이렇게 함으로써 처음 제시된 3가지 문제점을 해결할 수 있고,
클래스와 필드를 선언하는 면에서나 클라이언트 코드면에서나 접근자 방식보다 깔끔하게 표현이 된다.

>`private` 중첩 클래스는 같은 패키지 내에서만 해당 클래스에 대한 접근이 가능하다면 값 변경 시
> 생성한 객체를 통해서만 접근 및 변경이 가능하다.
> 그래서 `package-private` 클래스보다 `private` 중첩 클래스가 더 제한적이다.

## 자바 라이브러리에서 public 클래스의 필드를 직접 노출시킨 사례
자바 라이브러리에서도 public 클래스의 필드를 직접 노출하지 말라는 규칙을 어기는 경우가 있다.
책에 서는 이러한 경우를 통해 타산지석으로 삼아야 한다고 한다며,
대표적인 예로 `java.awt.package` 패키지의 `Point`와 `Dimension` 클래스를 들고 있다.

### `java.awt.Point` 클래스 내부

```java
public class Point extends Point2D implements Serializable {
    public int x;
    public int y;
}
```

### `java.awt.Dimensoin` 클래스 내부

```java
public class Dimension extends Dimension2D implements Serializable {
    public double width;
    public double height;
}
```

##  불변 필드를 노출한 public 클래스
그럼 `final` 키워드로 선언된 불변 필드를 노출하는 경우는 어떨까?
책에서는 `public` 클래스에서 `final` 키워드로 선언된 불변 필드를 노출하는 것은 괜찮다고 한다.
하지만 API를 변경하지 않고는 내부 표현을 바꿀 수 없다는 문제점과 부수 작업을 수행할 수 없다는 문제점은 여전히 남아있어
추천하진 않는다.

```java
public final class Time {
    private static final int HOURS_PER_DAY = 24;
    private static final int MINUTES_PER_HOUR = 60;

    public final int hour;
    public final int minute;

    public Time(int hour, int minute) {
        if (hour < 0 || hour >= HOURS_PER_DAY) {
            throw new IllegalArgumentException("시간: " + hour);
        }
        if (minute < 0 || minute >= MINUTES_PER_HOUR) {
            throw new IllegalArgumentException("분: " + minute);
        }
        this.hour = hour;
        this.minute = minute;
    }
}
```

## 정리
`public` 클래스는 절대로 가변 필드를 직접 노출해서는 안된다.
불변 필드라도 `public`으로 선언하면 해당 필드를 수정할 수 없다는 보장이 없다.
그럼에도 필드를 `public`으로 선언해야 하는 경우라면 `package-private` 클래스나 `private` 중첩 클래스에서 사용하는 방법을 사용하자.