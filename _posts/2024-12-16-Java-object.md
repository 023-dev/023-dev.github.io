---
layout: post
title: "자바의 Object 클래스"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

Object 클래스를 알아가기 전에 먼저 Object 클래스가 속한 패키지에 대해 알아야 한다.
Object 클래스가 속한 패키지는 `java.lang` 패키지에 포함되어 있다.
# java.lang 패키지 소개
자바가 기본으로 제공하는 라이브러리(클래스 모음) 중에 가장 기본이 되는 패키지로 여기서 `lang`은 `Language`를 의미한다. 즉, 자바를 이루는 가장 기본이 되는 클래스들의 패키지라고 생각하면 된다.
그런 이유 때문인지 `java.lang` 패키지는 모든 자바에서 자동으로 `import`된다. 따라서 따로 `import` 구문을 사용하지 않아도 된다.
## java.lang 대표적인 클래스
- `Object`: 모든 자바 객체의 부모 클래스
- `String`: 문자열
- `Integer`, `Long`, `Double`: 래퍼 타입, 기본형 데이터 타입을 객체로 만든 것
- `Class`: 클래스 메타 정보
- `System`: 시스템과 관련된 기본 기능들을 제공

# Object 클래스
자바에서 모든 클래스의 최상위 부모 클래스는 항상 `Object` 클래스이다.
![Java Object Class Inheritance.png](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_1.png)

근데 여기서 의문이 든다. 내가 생성한 클래스에는 아무것도 `extends`을 한 것이 없는데 어떻게 `Object` 클래스를 상속받은 클래스로 알고 있는걸까 이 의문에 답은 바로  클래스들은 부모 클래스가 없으면 자바가 알아서 묵시적(`Implicit`)으로  `Object` 클래스를 상속 받기 때문이다.
아래 코드로 예를 들어보겠다.
```java
public class Parent {
	public void parent() {System.out.println("Parent.parentMethod");}
}
```
보기엔 `Parent` 클래스에는 부모 클래스가 없어 보이지만, 사실 다음 코드와 같다고 볼 수 있다.
```java
public class Parent extends Object {
	public void parent() {System.out.println("Parent.parentMethod");}
}
```
이처럼 자바가 `extends Object` 코드를 자동으로 생성해 주기때문에 `extends Object`를 생략해주는 것을 권장한다. 또한 이때 `Parent` 클래스에서는  `Obejct` 클래스를 묵시적(`Implicit`)으로 상속 받았기 때문에 메모리에도 함께 생성된다.

그럼 `Parent`를 상속받은 클래스에서는 어떨지 의문이 들 수 있다.
```java
public class Child extends Parent {
	public void childMethod() {System.out.println("Child.childMethod");}
}
```
이처럼 클래스에 상속받을 부모 클래스를 명시적(`Explicit`)으로 지정하면 `Object` 클래스를 상속 받지 않는다.

> 여기서 묵시적(`Implicit`)이란 개발자가 코드에 직접 기술해서 작동하는 것을 의미하는 명시적(`Explicit`)이란 개념과 상반된 개념으로 개발자가 코드에 직접 기술하지 않아도 시스템 또는 컴파일러에 의해 자동으로 수행되는 것을 의미한다.

위의 말대로 라면 아무 클래스를 상속받지 않는 `Parent`  클래스에서는 `Object` 클래스를 묵시적(`Implicit`)으로 상속받기에 `Parent` 클래스를 상속받은 `Child` 클래스도 `Object`의 메서드를 사용할 수 있어야 한다. 이 말이 맞는지 확인해보자.

```java
public class Main {
	public static void main(String[] args) {
		Child child = new Child();
		child.childMethod();
		child.parentMethod();

		String childToString = child.toString();
		System.out.println(childToString);
	}
}
```
`toString`은 `Object` 클래스의 메서드로 객체의 정보를 반환한다.

실행결과는 다음과 같다.
```java
Child.childMethod
Parent.parentMethod
lang.object.Child@3feba861
```
동작 과정은 다음과 같다.
- `child.toString()`을 호출한다.
- 먼저 본인의 타입인 `Child`에서 `toString()`을 찾는다. 없으면 부모 타입으로 올라가서 찾는다.
- 부모 타입인 `Parent`에서 찾는다. 이 곳에서도 없으므로 부모 타입으로 올라가서 찾는다.
- 부모 타입인 `Object`에서 찾는다. `Object`에 `toString()`이 있으므로 해당 메서드를 호출한다.

이해를 돕기 위해 그림을 그려봤다.
![Java Object Class Inheritance Detail.png](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_2.png)

## 자바에서 Object 클래스가 최상위 부모 클래스인 이유
모든 클래스가 `Object` 클래스를 상속받는 이유는 공통 기능 제공하는 것과 다형성의 기본 구현함에 있다.

### 공통 기능 제공
객체의 정보나 다른 객체와 비교하는 기능과 기능들은 모든 객체가 필요로 하는 기본 기능일 것이다. 이러한 기능들을 객체를 구현할 때마다 항상 정의해서 만들어야 한다면 상당히 비효율적일 것이다. 그리고 이를 구현하게 되면 개발자가 누구인지에 따라 메서드의 이름부터 해서 달라질 수 있기에 일관성 또한 없을 것이다.

`Object` 클래스에서는 이러한 모든 객체가 필요로 하는 기능들을 구현한 공통 기능을 제공한다. 이렇게 하면 위에서 증명했듯이 `Object`가 최상위 부모 클래스일 수 밖에 없기 때문에 모든 객체는 공통 기능을 상속 받아 효율적으로 제공 받을 수 있어 프로그래밍이 단순화되고 일관성을 가질 수 있게 된다.

`Object` 클래스가 제공하는 공통 기능은 다음과 같다.
- 객체의 정보를 제공하는 `toString()`
- 객체를 비교하는 `equals()`
- 객체의 클래스 정보를 제공하는 `getClass()`
- `hashCode()`, `notify()`, etc.

## 다형성의 기본 구현
`Object` 클래스는 모든 클래스의 부모 클래스라는 것을 알 수 있었다. 따라서 모든 객체를 참조할 수 있다는 것을 알 수 있다. 이 말은 모든 자바 객체가 `Object` 타입으로 처리될 수 있고, `Object` 타입으로 다양한 타입의 객체를 통합적으로 처리할 수 있다는 것을 의미한다. 즉, `Object`는 모든 객체를 담을수도 있고 타입이 각각 다른 객체들을 보관할 수 있다는 것이다.

# Object 다형성
`Object`는 모든 클래스의 부모 클래스로 모든 객체를 참조할 수 있다고 언급을 했다.
어떻게 이게 가능한지 알기 위해 먼저 `Object`의 다형성에 대해 알아야 한다.