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
![Java Object Class Inheritance.png](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_1.png){: width="400" }

근데 여기서 의문이 든다. 내가 생성한 클래스에는 아무것도 `extends`을 한 것이 없는데 어떻게 `Object` 클래스를 상속받은 클래스로 알고 있는걸까 이 의문에 답은 바로  클래스들은 부모 클래스가 없으면 자바가 알아서 묵시적(`Implicit`)으로  `Object` 클래스를 상속 받기 때문이다.
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
![Java Object Class Inheritance Detail.png](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_2.png){: width="500" }

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

### 다형성의 기본 구현
`Object` 클래스는 모든 클래스의 부모 클래스라는 것을 알 수 있었다. 따라서 모든 객체를 참조할 수 있다는 것을 알 수 있다. 이 말은 모든 자바 객체가 `Object` 타입으로 처리될 수 있고, `Object` 타입으로 다양한 타입의 객체를 통합적으로 처리할 수 있다는 것을 의미한다. 즉, `Object`는 모든 객체를 담을수도 있고 타입이 각각 다른 객체들을 보관할 수 있다는 것이다.

## Object 다형성
`Object`는 모든 클래스의 부모 클래스로 모든 객체를 참조할 수 있는 다형적 참조가 가능하다고 언급을 했다.
하지만 `Object`가 자식들의 모든 메서드를 알 수 없기에 `Object`를 통해 전달 받은 객체를 호출하기 위해서는 각 객체에 맞는 다운캐스팅 과정이 필요하다.


```java
public class Car {
	public void move() { System.out.println("car moving"); }
}
```
```java
public class Dog {
	public void sound() { System.out.println("dog sound"); }
}
```
```java
public class Main {
	public static void main(String[] args) {
		Dog dog = new Dog();
		Car car = new Car();

		action(dog);
		action(car);
	}

	private static void action(Object obj) {
		obj.move();
		obj.sound();
	}
}
```
만일 다운캐스팅을 하지 않는다면 `Object`타입에서 `move()`와 `sound` 메서드를 찾을 수 없고, 뿐만아니라 최상위 부모이므로 더는 올라가서 찾을 수 없다. 
따라서 action`메서드에서 컴파일 날 것이다.

![Java Object Class Poly](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_3.png){: width="500" }

그래서 해당 상황에서 오류없이 컴파일 하기 위해서는 다운 캐스팅을 해야한다.
```java
private static void action(Object obj) {    
    //객체에 맞는 다운캐스팅 필요  
    if (obj instanceof Dog dog) {  
        dog.sound();  
    } else if (obj instanceof Car car) {  
        car.move();  
    }  
}
```

![Java Object Class Poly Solution](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_4.png){: width="500" }

이처럼 `Object`는 다형적 참조가 가능하지만, 메서드 오버라이딩을 활용 할 수 없기에 다형성을 활용하기에 한계가 있다.

# Object 배열
`Object` 클래스는 모든 클래스의 부모 클래스이기 때문에 `Object` 배열을 선언하면 모든 객체를 담을 수 있다.
```java
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        Car car = new Car();
        Object object = new Object();
        Object[] objects = {dog, car, object};
        size(objects);
    }
    private static void size(Object[] objects) {
        System.out.println("전달된 객체의 수는: " + objects.length);
    }
}
```
size 메서드에서 전달된 객체의 수를 출력하는 메서드이다. 실행결과는 다음과 같다.
```java
전달된 객체의 수는: 3
```
이 메서드는 `Object` 배열을 매개변수로 받기 때문에 모든 객체를 담을 수 있기 때문에,
클래스가 추가되거나 변경되어도 메서드를 수정할 필요가 없다.
`Object`의 메서드들은 모든 객체가 공통으로 가지고 있는 메서드들이기 때문에 이러한 다형성을 활용할 수 있다.

![Java Object Array](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_5.png){: width="500" }

## Object가 없다면?
만일 `Object` 클래스가 없다면 어떻게 될까? 
모든 클래스가 `Object` 클래스를 상속받지 않는다면 다형성을 활용할 수 없게 된다. 
또한 모든 객체를 담을 수 있는 컬렉션을 만들 수 없게 된다.
그리고 직접 정의를 하게되는 경우 모든 클래스에 공통적으로 필요한 메서드를 모든 개발자가 직접 구현해야 하기에 매우 비효율적일 것이다.
따라서 `Object` 클래스가 없다면 자바의 객체지향 프로그래밍은 불가능할 것이다.

# toString()
`toString()` 메서드는 객체의 정보를 문자열로 반환한다.
이러한 `toString()` 메서드는 디버깅과 로깅을 할 때 객체의 정보를 확인하기 위해 유용하게 사용된다.
이 메서드는 `Object` 클래스에서 정의되어 있기 때문에 모든 클래스에서 상속받아 사용할 수 있다.
내부 구현은 다음과 같다.

```java
public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
```

`getClass().getName()`은 패키지를 포함한 객체의 클래스 이름을 반환하고, `hashCode()`는 객체의 해시 코드 값을 반환하는데 `Integer.toHexString(hashCode())`는 이를 16진수로 변환한다.

## println()와 toString()
`println()`과 `toString()` 메서드는 서로 연관이 있다.
각 메서드를 호출한 결과 값은 같다.
그 이유는 `System.out.println()` 메서드는 객체를 출력할 때 `toString()` 메서드를 호출하기 때문이다.
내부 구현은 다음과 같다.

```java
public void println(Object x) {
    String s = String.valueOf(x);
    if (getClass() == PrintStream.class) {
        // need to apply String.valueOf again since first invocation
        // might return null
        writeln(String.valueOf(s));
    } else {
        synchronized (this) {
            print(s);
            newLine();
        }
    }
}
public static String valueOf(Object obj) {
    return (obj == null) ? "null" : obj.toString();
}
```
그래서 `System.out.println(dog)`를 호출하면 `dog.toString()`이 호출되어 `Dog` 클래스에서 오버라이딩한 `toString()` 메서드가 호출된다.

## toString() 오버라이딩
`Object.toString()` 메서드는 객체의 정보를 문자열로 반환하는데, 이는 객체의 메모리 주소를 반환하기 때문에 객체의 정보를 확인하기 어렵다.
따라서 `toString()` 메서드를 오버라이딩하여 객체의 정보를 반환하도록 구현하여 사용한다.

![Java Object Overriding](https://raw.githubusercontent.com/023-dev/023-dev.github.io/refs/heads/main/_posts/_images/java-object/java-object_6.png){: width="150" }

```java
public class Dog {
    private String name;
    private int age;

    public Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Dog{name='" + name + "', age=" + age + "}";
    }
}
```
이렇게 하면 `Dog` 객체의 정보를 확인하기 쉽게 출력할 수 있다.

```java
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog("멍멍이", 2);
        System.out.println(dog);
    }
}
```
실행결과는 다음과 같다.
```java
Dog{name='멍멍이', age=2}
```

# Object 클래스와 OCP

만약 `Object` 클래스가 없다면 어떻게 될까?
객체지향 프로그래밍에서는 객체를 다형적으로 사용하는 것이 중요하다.
그러나 모든 클래스가 `Object` 클래스를 상속받지 않는다면 다형성을 활용할 수 없게 된다.

## OCP 원칙
OCP(Open-Closed Principle)는 확장에는 열려있고 수정에는 닫혀있어야 한다는 원칙이다.
- Open: 기존 코드를 변경하지 않고 새로운 기능을 확장할 수 있어야 한다.
- Closed: 기존 코드를 수정하지 않아야 한다.
이 원칙은 새로운 기능을 추가할 때 기존 코드를 수정하지 않고 확장할 수 있어야 한다는 것을 의미한다.

## 구체적인 개념에 의존
`Object` 클래스가 없다면 모든 클래스가 `Object` 클래스를 상속받지 않기 때문에 다형성을 활용할 수 없게 된다.
따라서 다형성을 활용하기 위해서는 구체적인 클래스에 의존하게 되어 유연성이 떨어지게 된다.
이는 객체지향 프로그래밍의 핵심인 OCP(Open-Closed Principle)를 위배하게 된다.
만약 `Object` 클래스가 없다면 새로운 클래스를 추가할 때마다 코드를 수정해야 하기 때문에 OCP를 위배하게 된다.

## 추상적인 개념에 의존
반면에 `Object` 클래스가 있다면 모든 클래스가 `Object` 클래스를 상속받기 때문에 다형성을 활용할 수 있게 된다.
따라서 추상적인 개념에 의존하게 되어 유연성이 높아지게 된다.
이는 OCP를 준수하게 되어 새로운 클래스를 추가할 때 코드를 수정할 필요가 없게 된다.

## System.out.println()
`System.out.println()` 메서드는 `Object` 타입을 매개변수로 받기 때문에 모든 객체를 출력할 수 있다.
만약 `Object` 클래스가 없다면 `System.out.println()` 메서드는 모든 클래스를 매개변수로 받아야 하기 때문에 유연성이 떨어지게 된다.
따라서 `Object` 클래스가 없다면 이와같은 메서드들을 구현하기 위해서는 매우 많은 오버로딩을 해야 하기 때문에 유지보수가 어려워진다.
이러한 이유로 자바에서는 `Object` 클래스를 제공을 한다.

# 참고 - 정적 의존관계와 동적 의존관계
- 정적 의존관계는 컴파일 시점에 결정되는 의존관계를 말한다. 즉, 코드를 작성하는 시점에 이미 결정되는 의존관계이다. 예를 들어, 클래스 A가 클래스 B를 사용한다면 A 클래스는 B 클래스에 정적 의존관계를 가진다. 이는 코드를 작성하는 시점에 이미 결정되어 있기 때문에 변경이 어렵다. 따라서 유연성이 떨어진다.
- 동적 의존관계는 실행 시점에 결정되는 의존관계를 말한다. 즉, 코드를 실행하는 시점에 결정되는 의존관계이다. 예를 들어, 객체 A가 객체 B를 사용한다면 A 객체는 B 객체에 동적 의존관계를 가진다. 이는 코드를 실행하는 시점에 결정되기 때문에 변경이 쉽다. 따라서 유연성이 높다. 