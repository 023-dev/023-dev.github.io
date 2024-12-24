---
layout: post
title: "불변 객체(Immutable Object)"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# 불변 객체(Immutable Object)
객체의 상태(객체 내부 데이터, 필드, 속성)가 객체의 수명 동안 변하지 않는 객체를 불변 객체(Immutable Object)라고 한다.
불변 객체는 객체의 상태가 변하지 않기 때문에 객체를 생성한 시점의 상태를 유지하며, 객체의 상태를 변경할 수 없다.

불변 클래스는 다음 코드와 같이 만들 수 있다.

```java
public class ImmutablePerson {
    private final String name;
    private final int age;

    public ImmutablePerson(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

위 코드에서 `ImmutablePerson` 클래스는 `name`과 `age` 필드를 가지고 있다.
내부 값이 변경되지 않기 위해 필드를 `final`로 선언하고, 생성자를 통해 필드 값을 초기화를 제한한다.
또한 값을 변경할 수 있는 `setter` 메소드를 제공하지 않는다.
이 클래스는 생성자를 통해 값을 초기화하고, 이후에는 값을 변경하는 것이 불가능하다.

이렇듯 불변 클래스를 만드는 방법은 아주 단순하다. 
어떻게든 객체의 상태를 변경하는 메소드를 제공하지 않고, 객체의 상태를 변경할 수 없도록 만들면 된다.

이러한 불변이라는 단순한 제약을 사용해서 참조형 객체를 사용할 때 발생할 수 있는 사이드 이펙트라는 문제를 방지할 수 있다.
하지만 불변 객체는 설계상 값을 변경할 수 없다.
따라서 불변 객체의 값을 변경하고자 한다면 변경하고 싶은 값으로 새로운 불변 객체를 생성해야 한다.
이렇게 해야 기존 변수들이 참조하는 값에 영향을 주지 않고 새로운 값을 생성할 수 있다.

> 참고 - 가변(Mutable) 객체와 불변(Immutable) 객체
> 가변은 이름 그대로 처음 만든 이후 상태가 변할 수 있는 객체를 의미한다.
> 가변 객체는 객체의 상태가 변할 수 있기 때문에 객체를 생성한 시점의 상태를 유지하지 않으며, 객체의 상태를 변경할 수 있다.
> 불변은 처음 만든 이후 상태가 변하지 않는 객체를 의미한다.
> 불변 객체는 객체의 상태가 변하지 않기 때문에 객체를 생성한 시점의 상태를 유지하며, 객체의 상태를 변경할 수 없다.

## 값 변경
이러한 불변 객체를 사용하지만 그래도 값을 변경해야 하는 경우가 있다.
그럼 어떻게 해야 할까?
기존 객체의 값을 변경하는 대신 그대로 두고 대신에 변경된 결과를 가지는 새로운 객체를 생성하여 반환하면 된다.
이때 불변 객체에서 변경과 관련된 메서드들은 보통 객체를 새로 생성해서 반환하기 때문에
반환 값을 받아야 한다.

```java
public class ImmutablePerson {
    private final String name;
    private final int age;

    public ImmutablePerson(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public ImmutablePerson changeName(String name) {
        return new ImmutablePerson(name, this.age);
    }

    public ImmutablePerson changeAge(int age) {
        return new ImmutablePerson(this.name, age);
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}
```

위 코드에서 `changeName`과 `changeAge` 메소드는 이름과 나이를 변경한 새로운 `ImmutablePerson` 객체를 생성하여 반환한다.
이렇게 하면 기존 객체의 상태를 변경하지 않고 새로운 객체를 생성하여 변경된 값을 가질 수 있다.

