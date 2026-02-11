---
visible: false
title: "Java Method Naming Conventions"
date: 2025-03-02 00:00:00
tags: 
  - Java
---

프로그래머는 항상 깔끔한 코드를 작성해야 하며, 다른 프로그래머가 코드를 쉽게 읽을 수 있도록 적절한 이름을 사용해야 한다고 생각한다. 
좀 더 작은 차원에서는 이러한 접근이 무의미해 보일 수 있지만, 협업 상황에서 시간을 절약하기 위해 깔끔한 코드를 작성해야 하는 경우가 많다.
그래서 클래스, 변수, 메서드의 이름을 무작위로 지정하는 대신, 실제로 수행되는 기능을 고려하여 지정하는 것이 좋다고 생각한다.
자바의 패키지 중 `java.time.LocalTime`에는 이러한 메서드 이름을 지정하는 방법에 대한 규칙의 표본이라고 할 수 있는 메서드들이 있다.
아래에서는 `java.time.LocalTime`의 메서드들로 어떤 규칙을 따르는지 살펴보겠다.


## of (static factory)

> _Creates an instance where the factory is primarily validating the input parameters, not converting them._

`of`는 입력 매개변수를 변환하지 않고, 주로 검증하고 인스턴스를 생성하는 정적 메서드라고 할 수 있다.

```java
public static LocalTime of(int hour, int minute) {
    HOUR_OF_DAY.checkValidValue(hour);
    if (minute == 0) {
        return HOURS[hour];  // for performance
    }
    MINUTE_OF_HOUR.checkValidValue(minute);
    return new LocalTime(hour, minute, 0, 0);
}
```

```java
import java.time.LocalTime;

// hour, minutes을 인자로 받아 9시 30분을 의미하는 LocalTime 객체를 반환
LocalTime time = LocalTime.of(7, 30);
```


## from (static factory)
> _Converts the input parameters to an instance of the target class, which may involve losing information from the input_

`from`은 입력 매개변수의 데이터를 파싱하거나 변환하여 인스턴스를 생성하는 정적 메서드라고 할 수 있다.
이로 인해 입력 데이터가 손실될 수 있다.

```java
public static LocalTime from(TemporalAccessor temporal) {
    Objects.requireNonNull(temporal, "temporal");
    LocalTime time = temporal.query(TemporalQueries.localTime());
    if (time == null) {
        throw new DateTimeException("Unable to obtain LocalTime from TemporalAccessor: " +
                temporal + " of type " + temporal.getClass().getName());
    }
    return time;
}
```

DTO와 Entity 간에 자유롭게 형 변환이 가능하여 내부 구현을 모르더라도 쉽게 변환할 수 있다.

```java
import java.time.LocalTime;

// 정적 팩토리 메서드를 쓴 경우
LocalTime time = LocalTime.from(temporal);
// 생성자를 쓴 경우
LocalTime time = new LocalTime(temporal.getHour(), temporal.getMinute());
```

## parse (static factory)

> _Parses the input string to produce an instance of the target class._

`parse`는 입력 문자열을 파싱하여 타겟 클래스의 인스턴스를 생성하는 정적 메서드라고 할 수 있다.

```java
public static LocalTime parse(CharSequence text, DateTimeFormatter formatter) {
    Objects.requireNonNull(formatter, "formatter");
    return formatter.parse(text, LocalTime::from);
}
```

```java
import java.time.LocalTime;

// 문자열을 LocalTime으로 변환
LocalTime time = LocalTime.parse("07:30", DateTimeFormatter.ofPattern("HH:mm"));
```

## format (instance)

> _Uses the specified formatter to format the values in the temporal object to produce a string._

`format`은 지정된 포맷터를 사용하여 객체의 값을 특정 타입으로 변환하는 정적 메서드라고 할 수 있다.

```java
public String format(DateTimeFormatter formatter) {
    Objects.requireNonNull(formatter, "formatter");
    return formatter.format(this);
}
```

```java
import java.time.LocalTime;

// LocalTime 객체를 문자열로 변환
String timeString = time.format(DateTimeFormatter.ofPattern("HH:mm"));
```

## get (instance)

> _Returns a part of the state of the target object._

`get`은 타겟 객체의 상태 중 일부를 반환하는 정적 메서드라고 할 수 있다.

```java
public int getHour() {
    return hour;
}
```

```java
import java.time.LocalTime;

// LocalTime 객체에서 시(hour) 값을 가져옴
int hour = time.getHour();
```

## is (instance)

> _Queries the state of the target object._

`is`는 타겟 객체의 일부 데이터인지 물어보는 정적 메서드라고 할 수 있다.

```java
public boolean isAfter(LocalTime other) {
    return compareTo(other) > 0;
}
```

```java
import java.time.LocalTime;

// LocalTime 객체가 다른 LocalTime 객체보다 늦은지 확인
boolean isAfter = time.isAfter(otherTime);
```

## with (instance)

> _Returns a copy of the target object with one element changed; this is the immutable equivalent to a set method on a JavaBean._

`with`는 타겟 객체의 복사본을 반환하는 정적 메서드라고 할 수 있다.

```java
public LocalTime withHour(int hour) {
    return (hour == this.hour ? this : of(hour, minute));
}
```

```java
import java.time.LocalTime;

// LocalTime 객체의 시(hour) 값을 변경하여 새로운 LocalTime 객체를 생성
LocalTime newTime = time.withHour(10);
```

## to (instance)

> _Converts this object to another type._

`to`는 타겟 객체를 다른 타입으로 변환하는 정적 메서드라고 할 수 있다.

```java
public OffsetTime toOffsetTime(ZoneOffset offset) {
    return OffsetTime.of(this, offset);
}
```

```java
import java.time.LocalTime;
import java.time.OffsetTime;
import java.time.ZoneOffset;

// LocalTime 객체를 OffsetTime으로 변환
OffsetTime offsetTime = time.toOffsetTime(ZoneOffset.ofHours(9));
```

## at (instance)

> _Combines this object with another._

`at`는 타겟 객체와 다른 객체를 결합하는 정적 메서드라고 할 수 있다.

```java
public OffsetTime atOffset(ZoneOffset offset) {
    return OffsetTime.of(this, offset);
}
```

```java
import java.time.LocalTime;
import java.time.OffsetTime;
import java.time.ZoneOffset;

// LocalTime 객체와 ZoneOffset을 결합하여 OffsetTime 객체를 생성
OffsetTime offsetTime = time.atOffset(ZoneOffset.ofHours(9));
```

## references

- [Java Method Naming Conventions, Oracle](https://docs.oracle.com/javase/tutorial/datetime/overview/naming.html)