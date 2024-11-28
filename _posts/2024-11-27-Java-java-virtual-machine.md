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

## JVM 동작 방식

<div class="mermaid">
graph TD
    A[JAVA Source (.java)] -->|JAVA Compiler (javac)| B[JAVA Byte Code (.class)]
    B --> C[Class Loader]
    subgraph JVM [JVM (JAVA Virtual Machine)]
        C --> D[Runtime Data Area]
        D --> C
        D --> E[Execution Engine]
        E --> D
        C --> E
    end
</div>

1. JVM은 자바 애플리케이션을 실행하기 위해 메모리를 할당받고, 자바 소스 파일을 바이트 코드로 변환하여 실행하는 역할을 한다. 
2. 자바 프로그램 실행 시, 자바 컴파일러(`javac`)는 소스 코드(`.java`)를 바이트 코드(`.class`)로 변환된다.
3. 이후 바이트 코드는 JVM의 `Class Loader`를 통해 필요한 클래스들이 동적으로 로딩되고 링크되어 `Runtime Data Area`에 배치된다. 
4. 이 영역은 실행 중 메모리를 관리하는 핵심 공간으로, 여기에 로드된 바이트 코드는 JVM의 `Execution Engine`에 의해 해석되고 실행된다. 
5. 이 과정에서 `Garbage Collector`가 메모리 관리를 담당하며, `Thread` 동기화와 같은 멀티스레드 환경에서의 작업도 `Execution Engine`에 의해 처리된다. 

이러한 동작 방식은 자바 프로그램의 효율적인 실행을 보장하는 동시에 플랫폼 독립성을 실현하는 기반이 된다.
> 2번 컴파일하는 이러한 동작방식으로 JVM은 속도 저하라는 단점을 가지고 있지만, JIT(Just-In-Time) 컴파일러를 통해 이를 개선하려는 시도를 하고 있다. 

## JVM의 구조

<div class="mermaid"> 
graph TD
A[Java Source File (.java)] -->|Java Compiler (javac)| B[Java Byte Code (.class)]
B --> C[Class Loader]
    subgraph JVM [JVM (Java Virtual Machine)]
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
        E5 --> F[Native Method Interface (JNI)]
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
