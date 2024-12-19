---
layout: post
title: "동일성과 동등성"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# 동일성와 동등성
자바에서는 두 객체가 같은지 비교하는 두 가지 방법이 있다.
- 동일성(Identity): `==` 연산자를 사용하여 두 객체의 주소값을 비교해서 동일한 객체를 참조하는지 확인
- 동등성(Equality): `equals()` 메서드를 사용하여 두 객체의 내용이 같은지 확인

쉽게 설명하면 `==` 연산자는 두 객체의 주소값을 비교하는 것이고, `equals()` 메서드는 두 객체의 내용을 비교하는 것이다.

예를 들어 같은 내용을 가진 두 객체를 생성하고 `==` 연산자와 `equals()` 메서드를 사용하여 비교해보자.

```java
public class Main {
    public static void main(String[] args) {
        String str1 = new String("hello");
        String str2 = new String("hello");

        System.out.println(str1 == str2); // false
        System.out.println(str1.equals(str2)); // true
    }
}
```

동일성을 비교하는 `==` 연산자는 두 객체의 주소값을 비교하기 때문에 `str1`과 `str2`는 서로 다른 객체를 참조하고 있기 때문에 `false`를 반환한다.
반면에 동등성을 비교하는 `equals()` 메서드는 두 객체의 내용을 비교하기 때문에 `str1`과 `str2`는 내용이 같기 때문에 `true`를 반환한다.

![In Java, Compare Identity & Equality](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-identity-equality/java-identity-equality_1.png){: width="150" }

## equals() 메서드
`equals()` 메서드는 두 객체의 내용이 같은지 비교하는 메서드이다.
`Object` 클래스에서는 `equals()` 메서드가 두 객체의 주소값을 비교하기 때문에 `==` 연산자와 같은 결과를 반환한다.
내부 구현은 다음과 같다.

```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

동등성이라는 개념은 객체마다 다르게 정의할 수 있다. 어떤 객체는 회원번호를 비교하고, 어떤 객체는 주민번호를 비교할 수 있다.
따라서 동등성 비교를 위해서는 `equals()` 메서드를 오버라이딩하여 적절한 객체의 내용을 비교하도록 구현해야 한다.

회원 객체를 생성하고 `equals()` 메서드를 오버라이딩하여 회원번호가 같은지 비교하는 것으로 예를 들어보겠다.

```java
public class Member {
    private int memberId;

    public Member(int memberId) {
        this.memberId = memberId;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Member) {
            Member member = (Member) obj;
            return this.memberId == member.memberId;
        }
        return false;
    }

    public static void main(String[] args) {
        Member member1 = new Member(1);
        Member member2 = new Member(1);

        System.out.println(member1.equals(member2)); // true
        System.out.println(member1 == member2); // false
    }
}
```

`equals()` 메서드를 오버라이딩하여 회원번호를 비교하도록 구현하였기 때문에 `member1`과 `member2`는 회원번호가 같기 때문에 `true`를 반환한다.
반면 이것을 동일성 관점에서 보면 `member1`과 `member2`는 서로 다른 객체를 참조하고 있기 때문에 `false`를 반환해야 한다.

## 정확한 동등성 비교를 위한 equals() 메서드 구현
앞서 살펴본 `equals()` 메서드는 회원번호를 비교하는 것으로 간단한 예제를 보여주었다. 
하지만 실제 프로젝트에서 `equals()` 메서드를 오버라이딩하여 정확한 동등성 비교를 위해서는 다음과 같은 사항을 고려해야 한다.
- 반사성(Reflexivity): 객체는 자기 자신과 동등해야한다. 즉, `x.equals(x)`는 항상 `true`를 반환해야 한다.
- 대칭성(Symmetry): 두 객체가 동등하다면, 서로에 대해서도 동등해야 한다. 즉, `x.equals(y)`가 `true`를 반환하면 `y.equals(x)`도 `true`를 반환해야 한다.
- 추이성(Transitivity): 세 객체가 동등하다면, 이들 간의 모든 비교에서 동등해야 한다. 즉, `x.equals(y)`와 `y.equals(z)`가 모두 `true`를 반환하면 `x.equals(z)`도 `true`를 반환해야 한다.
- 일관성(Consistency): 객체의 내용이 변경되지 않았다면, `equals()` 메서드의 결과는 항상 동일해야 한다.
- null 비교: `null`과의 비교는 항상 `false`를 반환해야 한다.

참고로 동일성 비교가 항상 필요한 것은 아니다.
동등성 비교가 필요한 경우에만 `equals()` 메서드를 오버라이딩하여 구현하면 된다.

## hashCode() 메서드
해시코드는 객체의 주소값을 기반으로 생성되는 정수값으로 `hashCode()` 메서드는 객체의 해시코드를 반환하는 메서드이다.
`hashCode()` 메서드는 보통 `equals()` 메서드와 함께 사용되는데, `equals()` 메서드로 두 객체의 내용이 같은지 비교한 후에 `hashCode()` 메서드로 두 객체가 같은 객체인지 해시코드를 비교한다.

그럼 `hashCode()` 메서드를 오버라이딩해야 하나라는 의문이 들 것이다. 
`hashCode()` 메서드를 오버라이딩하지 않으면 `equals()` 메서드를 오버라이딩한 클래스에서 `hashCode()` 메서드를 호출할 때 `Object` 클래스의 `hashCode()` 메서드가 호출되어 객체의 주소값을 기반으로 해시코드를 생성한다.
따라서 `equals()` 메서드와 `hashCode()` 메서드의 일관성을 유지하기 위해서는 `hashCode()` 메서드를 오버라이딩해야 한다.

회원 객체를 생성하고 `hashCode()` 메서드를 오버라이딩하여 회원번호를 기반으로 해시코드를 생성하는 것으로 예를 들어보겠다.

```java
public class Member {
    private int memberId;

    public Member(int memberId) {
        this.memberId = memberId;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Member) {
            Member member = (Member) obj;
            return this.memberId == member.memberId;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return memberId;
    }

    public static void main(String[] args) {
        Member member1 = new Member(1);
        Member member2 = new Member(1);

        System.out.println(member1.equals(member2)); // true
        System.out.println(member1.hashCode() == member2.hashCode()); // true
    }
}
```

`hashCode()` 메서드를 오버라이딩하여 회원번호를 기반으로 해시코드를 생성하도록 구현하였기 때문에 `member1`과 `member2`는 회원번호가 같기 때문에 `true`를 반환한다.
