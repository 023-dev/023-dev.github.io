---
layout: post
title: "JVM(Java Virtual Machine)"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

# JVM(Java Virtual Machine)

<hr>

JVM(Java Virtual Machine)은 자바 프로그램이 실행되는 환경으로, 운영체제와 독립적으로 동작할 수 있도록 중간 역할을 한다.
그럼 어떻게 JVM이 동작하길래 운영체제에 독립적인지 알아보자.

# JVM 동작 방식

<div class="mermaid">
graph TD
    A[JAVA Source] -->|JAVA Compiler| B[JAVA Byte Code]
    B --> C[Class Loader]
    subgraph JVM [JVM]
        C <--> D[Runtime Data Area]
        D <--> E[Execution Engine]
        C <--> E
    end
</div>

1. JVM은 자바 애플리케이션을 실행하기 위해 메모리를 할당받고, 자바 소스 파일을 바이트 코드로 변환하여 실행하는 역할을 한다.
2. 자바 프로그램 실행 시, 자바 컴파일러(`javac`)는 소스 코드(`.java`)를 바이트 코드(`.class`)로 변환된다.
3. 이후 바이트 코드는 JVM의 `Class Loader`를 통해 필요한 클래스들이 동적으로 로딩되고 링크되어 `Runtime Data Area`에 배치된다.
4. 이 영역은 실행 중 메모리를 관리하는 핵심 공간으로, 여기에 로드된 바이트 코드는 JVM의 `Execution Engine`에 의해 해석되고 실행된다.
5. 이 과정에서 `Garbage Collector`가 메모리 관리를 담당하며, `Thread` 동기화와 같은 멀티스레드 환경에서의 작업도 `Execution Engine`에 의해 처리된다.

이러한 동작 방식은 자바 프로그램의 효율적인 실행을 보장하는 동시에 플랫폼 독립성을 실현하는 기반이 된다.
> 2번 컴파일하는 이러한 동작방식으로 JVM은 속도 저하라는 단점을 가지고 있지만, JIT(Just-In-Time) 컴파일러를 통해 이를 개선하려는 시도를 하고 있다.

# JVM의 구조

<div class="mermaid"> 
graph TD
A[Java Source File] -->|Java Compiler| B[Java Byte Code]
B --> C[Class Loader]
    subgraph JVM [JVM]
        C --> D[Execution Engine]
        D --> D1[Interpreter]
        D --> D2[JIT Compiler]
        D --> D3[Garbage Collector]
        C --> E[Runtime Data Areas]
        E --> E1[Method Area]
        E --> E2[Heap]
        E --> E3[PC Register]
        E --> E4[JVM Stack]
        E --> E5[Native Method Stack] 
        E5 --> F[Native Method Interface]
        F --> G[Native Method Library]
    end
</div>

JVM(Java Virtual Machine)의 구조는 자바 애플리케이션 실행 과정에서 핵심 역할을 담당하는 다양한 구성 요소로 이루어져 있다.
이 중 가장 중요한 세 가지 구성 요소는 클래스 로더(Class Loader), 실행 엔진(Execution Engine), 그리고 런타임 데이터 영역(Runtime Data Area)이다.
클래스 로더는 자바 바이트 코드(.class 파일)를 메모리에 로드하고, 필요한 클래스와 자원을 동적으로 링크한다.
실행 엔진은 로드된 바이트 코드를 해석하거나(JIT 컴파일러와 인터프리터 사용) 실행하며, 이 과정에서 가비지 콜렉터(Garbage Collector)를 통해 메모리를 관리한다.
런타임 데이터 영역은 JVM이 애플리케이션 실행 시 사용하는 메모리 구조로, 메소드 영역(Method Area), 힙 영역(Heap), PC 레지스터(PC Register), 스택 영역(Stack Area), 네이티브 메소드 스택(Native Method Stack)으로 구성된다.
추가적으로 네이티브 메소드 인터페이스(JNI)는 네이티브 메소드 라이브러리와 상호작용하여 JVM에서 자바 이외의 언어로 작성된 코드를 호출할 수 있도록 한다.
이러한 구조는 JVM의 동작을 효율적으로 지원하며, 자바 프로그램이 플랫폼 독립적으로 실행될 수 있는 기반을 제공한다.

## 클래스 로더 (Class Loader)

클래스 로더(Class Loader)는 JVM에서 클래스 파일(*.class)을 동적으로 로드하고 이를 링크(Linking)를 통해 JVM 메모리 영역(Runtime Data Areas)에 배치하는 역할을 담당한다.
클래스 로더는 자바 애플리케이션 실행 시 필요한 클래스만 동적으로 메모리에 적재하며, 모든 클래스를 한 번에 로드하지 않음으로써 메모리 효율성을 높인다.
클래스 로딩 과정은 크게 로딩(Loading), 링킹(Linking), **초기화(Initialization)**의 3단계로 이루어진다.

<div class="mermaid">
graph TD
    A[Loading] --> B[Verifying]
    D --> E[Initializing]
    subgraph Linking
        B --> C[Preparing]
    C --> D[Resolving]
    end
</div>

1. **Loading(로드)**: 클래스 파일을 읽어 JVM 메모리로 로드하는 단계이다. 필요한 시점에 동적으로 로드된다.
2. **Linking(링크)**: 로드된 클래스 파일을 검증하고 사용할 준비를 하는 과정으로, 다시 세부적으로 나뉜다.
    - **Verifying(검증)**: 클래스 파일이 JVM 명세를 준수하는지 확인한다.
    - **Preparing(준비)**: 클래스가 필요로 하는 메모리를 할당한다.
    - **Resolving(분석)**: 클래스의 심볼릭 레퍼런스를 다이렉트 레퍼런스로 변환하여 메모리 주소를 연결한다.
3. **Initialization(초기화)**: 클래스 변수(static 필드 등)를 지정된 초기값으로 설정하고 필요한 초기화 작업을 수행한다.

## 실행 엔진(Execution Engine)

실행 엔진(Execution Engine)은 클래스 로더를 통해 런타임 데이터 영역에 배치된 바이트 코드를 읽고 이를 명령어 단위로 실행하는 역할을 한다. 
자바의 바이트 코드(.class 파일)는 기계가 직접 이해할 수 있는 언어가 아니라, JVM이 이해할 수 있는 중간 단계의 코드이기 때문에 실행 엔진은 이 바이트 코드를 실제로 기계어(Native Code)로 변환하여 실행한다. 
이 과정에서 실행 엔진은 **인터프리터(Interpreter)**와 **JIT 컴파일러(Just-In-Time Compiler)** 두 가지 방식을 사용한다. 
인터프리터는 바이트 코드를 한 줄씩 해석하며 실행하지만, 반복적으로 호출되는 메소드의 경우 속도가 느려지는 단점이 있다. 
이를 보완하는 JIT 컴파일러는 반복되는 코드를 네이티브 코드로 변환한 후 캐싱하여, 이후에는 직접 실행함으로써 성능을 개선한다. 
JIT 방식은 변환 비용이 소요되므로 JVM은 초기에는 인터프리터 방식을 사용하다가 일정 기준이 넘으면 JIT 컴파일러를 활성화한다.

또한, 실행 엔진에는 **가비지 컬렉터(Garbage Collector, GC)**가 포함되어 있어 힙(Heap) 메모리에서 사용하지 않는 객체를 자동으로 회수한다.
C 언어와 달리 자바는 메모리를 개발자가 직접 관리할 필요 없이 GC가 이를 자동으로 처리하므로, 프로그래밍의 생산성과 안정성이 높아진다. 
단, GC는 실행 시간이 정해져 있지 않고, Full GC가 발생하면 모든 스레드가 일시 정지되므로 성능 문제나 장애가 발생할 수 있다. 
참고로 `System.gc()` 메서드를 통해 GC를 수동으로 요청할 수 있지만, 실제 실행이 보장되지는 않는다. 
실행 엔진의 이러한 설계는 자바 애플리케이션의 효율적인 실행과 메모리 관리의 자동화를 지원하며, 자바의 주요 강점 중 하나로 작용한다.

## 런타임 데이터 영역(Runtime Data Area)
런타임 데이터 영역(Runtime Data Area)은 JVM의 메모리 공간으로, 자바 애플리케이션 실행 시 사용되는 데이터를 저장하는 영역이다.
이 영역은 크게 **메서드 영역(Method Area)**, **힙 영역(Heap Area)**, **스택 영역(Stack Area)**, **PC 레지스터(Program Counter Register)**, **네이티브 메서드 스택(Native Method Stack)**으로 나뉜다. 이 중 **메서드 영역**과 **힙 영역**은 모든 쓰레드가 공유하며, **스택 영역**, **PC 레지스터**, **네이티브 메서드 스택**은 각 쓰레드마다 독립적으로 생성된다.

### 메서드 영역(Method Area)
**메서드 영역(Method Area)**은 JVM 시작 시 생성되며, 클래스 정보(필드, 메서드, 타입 정보 등)를 저장하는 공간이다. 
이 영역은 클래스 로딩 시 초기화되며, JVM 종료 시까지 유지된다. 
정적 필드, 메서드 정보와 함께 **런타임 상수 풀(Constant Pool)**도 포함되어 있어 클래스와 인터페이스의 참조 정보를 관리한다.

### 힙 영역(Heap Area)
**힙 영역(Heap Area)**은 런타임 시 동적으로 객체를 할당하는 공간이다. 
모든 쓰레드가 공유하며, `new` 연산자로 생성된 객체와 배열 등이 저장된다. 
힙 영역은 가비지 컬렉터(GC)에 의해 관리되며, **Young Generation**(Eden, Survivor 영역)과 **Old Generation**으로 나뉘어 효율적인 메모리 관리를 수행한다. 
객체가 참조되지 않으면 GC에 의해 제거된다.

### 스택 영역(Stack Area)
**스택 영역(Stack Area)**은 메서드 호출 시 사용되는 공간으로, 기본 자료형 및 지역 변수를 저장한다. 
메서드 호출 시 **스택 프레임(Stack Frame)**이 생성되며, 호출이 종료되면 프레임이 제거된다. 
LIFO 구조로 동작하며, 스택 오버플로우가 발생할 수 있으므로 크기가 제한된다.

### PC 레지스터(Program Counter Register) 
**PC 레지스터(Program Counter Register)**는 현재 실행 중인 JVM 명령어의 주소를 저장하는 공간으로, 쓰레드가 실행 중인 명령을 추적한다. 
자바 명령은 PC 레지스터에 저장되지만, 네이티브 메서드를 실행할 때는 `undefined` 상태가 된다.

### 네이티브 메서드 스택(Native Method Stack)
**네이티브 메서드 스택(Native Method Stack)**은 자바가 아닌 네이티브 코드(C, C++ 등)로 작성된 메서드를 실행하기 위한 공간이다. JIT 컴파일러에 의해 네이티브 코드로 변환된 메서드도 이 스택에서 실행된다. 
네이티브 메서드는 JNI(Java Native Interface)와 연결되어 JVM 외부의 네이티브 라이브러리를 호출하거나 실행한다.

## JNI(Java Native Interface)

<div class="mermaid">
graph LR
    A[C / C++ Side] <--> B[JNI]
    B <--> C[Java Side]

    subgraph TD 
    A[C / C++ Side]
        A1[Function]
        A2[Library]
    end

    subgraph TD
     C[Java Side]
        C1[Exception]
        C2[Class]
        C3[VM]
    end
</div>

JNI(Java Native Interface)는 자바가 다른 언어로 작성된 애플리케이션과 상호작용할 수 있도록 지원하는 인터페이스를 제공한다. 
이를 통해 자바는 JVM 내부에서 네이티브 메서드를 로드하고 실행할 수 있으며, C/C++와 같은 언어로 구현된 라이브러리나 기능을 호출하여 사용할 수 있다. 
주로 네이티브 코드와의 통합이 필요한 상황에서 활용되며, 네이티브 코드의 강력한 성능과 자바의 이식성을 결합할 수 있는 장점을 제공한다. 
하지만 실제로는 C나 C++ 언어와의 상호작용에 가장 적합하게 설계되어 있어, 다른 언어와의 호환성은 제한적이다. 
JNI를 활용하면 네이티브 코드 기반의 고성능 기능을 자바 애플리케이션에서 손쉽게 호출할 수 있지만, 네이티브 코드 관리와 디버깅이 복잡해질 수 있으므로 신중하게 사용해야 한다.

## Native Method Library

<div class="mermaid">
graph TD
    A[Class loader sub system] <-->|Class files| B[Runtime data areas]
    subgraph B[Runtime data areas]
        B1[Method area]
        B2[Heap]
        B3[Java stacks]
        B4[PC Registers]
        B5[Native method stacks]
    end

    B <--> C[Execution Engine]
    B5 <--> D[Native method interface]
    D <--> E[Native method library]
    C <--> D
</div>

**Native Method Library**는 C, C++로 작성된 라이브러리를 지칭하며, 자바 애플리케이션이 네이티브 메서드를 호출할 때 사용된다. 
이 라이브러리는 JNI(Java Native Interface)에 의해 JVM이 로드하여 실행된다. 
자바 코드가 네이티브 메서드를 호출하면, JVM은 필요한 네이티브 라이브러리를 메모리에 로드하고 실행 환경을 제공한다. 
필요할 경우, JNI는 네이티브 메서드 실행에 필요한 헤더 파일을 생성하거나 참조하며, 이를 통해 자바와 네이티브 코드를 연결한다. 
Native Method Library는 자바가 제공하지 않는 플랫폼 고유의 기능을 활용하거나, 성능이 중요한 로우레벨 작업을 수행할 때 유용하게 사용된다.

> 추후에 더 자세한 내용을 추가할 예정이다.