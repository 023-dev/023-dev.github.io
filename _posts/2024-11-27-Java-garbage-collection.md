---
layout: post
title: "GC(Garbage Collection)"
author: "023"
comments: true
tags: [Java, Concurrent Programming]
excerpt_separator: <!--more-->
---

# GC(Garbage Collection)

<hr>

**가비지 컬렉션(Garbage Collection, GC)**은 자바의 메모리 관리 방식 중 하나로, JVM(자바 가상 머신)의 힙(Heap) 영역에서 더 이상 사용되지 않는 객체(garbage)를 자동으로 식별하고 제거하는 프로세스를 의미한다. 
이는 프로그래머가 직접 메모리를 할당하고 해제해야 했던 C/C++와 달리, 자바에서는 GC가 메모리 관리를 대신 처리해줌으로써 메모리 누수(Memory Leak)를 방지하고 개발자가 로직 구현에만 집중할 수 있도록 돕는다.

예를 들어, 반복문 내에서 다수의 객체를 생성하고 사용 후 버리는 코드가 있다고 가정할 때, GC는 이러한 객체들을 주기적으로 정리해줘서 메모리를 효율적으로 사용할 수 있게 한다. 
GC의 이러한 자동화는 자바뿐만 아니라 파이썬, 자바스크립트, Go 언어 등 다양한 언어에서도 기본적으로 제공되며, 웹 브라우저와 같은 소프트웨어에서도 GC를 활용해 메모리 관리를 자동화한다.

그러나 GC에도 단점이 있다. 
GC가 언제 실행될지 명확히 알 수 없기 때문에 메모리 해제를 개발자가 직접 제어하기 어렵고, GC가 실행되는 동안 모든 애플리케이션 스레드가 멈추는 **Stop-The-World(STW)** 현상이 발생한다. 
이로 인해 GC가 지나치게 자주 실행되면 애플리케이션의 성능이 저하될 수 있으며, 실시간 성능이 중요한 시스템에서는 GC의 동작이 치명적일 수 있다. 
예를 들어, 과거의 웹 브라우저인 인터넷 익스플로러는 GC를 너무 자주 실행해 성능 문제를 야기했던 사례가 있다.

이러한 이유로 GC의 실행을 최소화하고 최적화하는 작업이 중요시하며, 이를 **GC 튜닝**이라고 한다. 
> GC 튜닝은 어플리케이션의 성능을 유지하면서 효율적으로 메모리를 관리하는 방법을 설계하는 과정으로, 애플리케이션의 성능과 안정성을 보장하기 위해 필수적인 기술 중 하나이다.

## 가비지 컬렉션 대상
가비지 컬렉션(Garbage Collection)의 대상은 객체가 더 이상 프로그램에서 참조되지 않는 경우, 즉 도달 불가능(Unreachable)한 상태로 판단된 객체들이다. 
이를 위해 **도달성(Reachability)**이라는 개념이 사용된다. 객체에 참조가 있으면 해당 객체는 Reachable(도달 가능) 상태로 간주되고, 반대로 참조가 없다면 Unreachable(도달 불가능) 상태로 분류되어 가비지 컬렉션의 대상이 된다.

Reachable 상태의 객체는 현재 사용 중인 객체로, JVM의 Method Area나 Stack Area에서 해당 객체의 메모리 주소를 참조하고 있다. 
반면, Unreachable 상태의 객체는 어떤 변수나 메서드에서도 참조되지 않는 상태로, 더 이상 프로그램에서 사용되지 않는 객체다. 
이러한 Unreachable 객체는 힙(Heap) 영역에서만 존재하며, 가비지 컬렉션에 의해 자동으로 제거된다.

<div class="mermaid">
graph LR
    subgraph Heap
        A1[1 Reachable]
        A2[2 Unreachable]
        A3[3 Reachable]
        A4[4 Reachable]
        A5[5 Reachable]
    end

    subgraph Stack
        B6[6]
        B7[7]
    end

    subgraph MethodArea
        C8[8]
    end

    B6 --> A1
    B7 --> A5
    A5 --> A4
    C8 --> A3
</div>

예를 들어, 객체는 주로 힙 영역에서 생성되고, 메서드가 실행되거나 변수가 선언될 때 Method Area나 Stack Area에 객체의 참조 주소를 저장한다. 
하지만 메서드 종료와 같은 특정 이벤트로 인해 참조 변수가 삭제되거나 스코프를 벗어나면, 힙 영역의 해당 객체는 더 이상 참조되지 않게 된다. 
이처럼 도달 불가능한(Unreachable) 상태가 된 객체는 프로그램에서 쓸모없어진 것으로 간주되어 가비지 컬렉터가 주기적으로 수거하여 메모리를 해제한다.

이 과정은 프로그래머가 명시적으로 메모리를 해제하지 않아도 JVM이 자동으로 메모리를 관리하게 해 주는 장점이 있다. 
하지만, 가비지 컬렉션이 언제 실행될지는 명확히 알 수 없으므로, 이를 고려한 메모리 관리 전략이 필요하다. 
Unreachable 객체를 효율적으로 식별하고 제거하는 것이 가비지 컬렉션의 핵심 역할이다.

## 가비지 컬렉션 동작 방식

**가비지 컬렉션의 청소 방식**은 Unreachable 객체를 식별하고 제거하는 과정에서 사용하는 알고리즘에 따라 달라진다. 
가장 기본적인 방식은 **Mark and Sweep** 알고리즘으로, 많은 GC에서 기본으로 사용되는 메모리 정리 방법이다. 

<div class="mermaid">
graph TD
    subgraph Mark
        A1[Object <br> reachable]
        A2[Object <br> unreachable]
        A3[Object <br> reachable]
        A4[Object <br> unreachable]
        A5[Object <br> reachable]
    end
    subgraph Sweep
        B1[Object <br> reachable]
        B2[<br>]
        B3[Object <br> reachable]
        B4[<br>]
        B5[Object <br> reachable]
    end
    subgraph Compaction
        C1[Object <br> reachable]
        C2[Object <br> reachable]
        C3[Object <br> reachable]
    end

    Mark --> Sweep
    Sweep --> Compaction
</div>

이 방식은 다음 세 단계로 구성된다:

1. **Mark 과정**: GC는 Root Space(루트 공간)에서 시작해 연결된 객체들을 그래프 형태로 순회하며, 참조되고 있는 객체들을 식별하고 마킹한다. Root Space는 힙 메모리를 참조하는 Method Area, Static 변수, JVM Stack, Native Method Stack 등을 포함한다. 이 과정을 통해 Reachable 객체와 Unreachable 객체를 구분한다.

2. **Sweep 과정**: 마킹되지 않은 객체들(Unreachable 객체)을 힙(Heap)에서 제거한다. 이 단계에서는 더 이상 사용되지 않는 메모리를 해제하여 새 객체가 저장될 수 있도록 공간을 확보한다.

3. **Compaction 과정**: Sweep 이후에 메모리 조각화(Fragmentation)를 줄이기 위해 남아있는 객체들을 힙의 시작 주소 쪽으로 압축한다. 이를 통해 연속된 메모리 공간을 확보해 새로운 객체를 할당할 때 메모리 할당 실패를 방지한다. 단, 이 과정은 모든 GC에서 수행되는 것은 아니며, 가비지 컬렉터의 종류에 따라 생략되기도 한다.

이 방식은 **루트 공간(Root Space)** 기준으로 객체의 Reachable 상태를 판단하기 때문에 순환 참조와 같은 문제가 있는 객체도 효과적으로 정리할 수 있다. 
Root Space는 JVM 메모리 구조에서 중요한 요소로, Method Area, Static 변수, JVM Stack, Native Method Stack이 루트 역할을 한다.

Mark and Sweep 방식은 간단하고 효율적이지만, 모든 객체를 순회하고 처리해야 하므로 수행 시간에 따라 애플리케이션의 성능에 영향을 줄 수 있다. 
또한, GC가 실행되는 동안 애플리케이션이 멈추는 **Stop-The-World(STW)** 현상이 발생할 수 있어 최적화된 GC 전략이 필요하다. 
Mark and Sweep 알고리즘은 이런 기본 원리를 바탕으로 다양한 GC 최적화 기술의 기반이 되고 있다.

# 가비지 컬렉션 동작 과정

<hr>

<div class="mermaid">
graph TB
    subgraph JVM_Memory [JVM Memory Runtime Data Area]
        A[Method Area]
        B[Heap]
        C[JVM Language Stacks]
        D[PC Registers]
        E[Native Method Area]
    end

    subgraph Heap_Structure [Heap Structure]
        F[Eden]
        G[Survivor 1]
        H[Survivor 2]
        I[Old Generation]
        J[Permanent Generation]
    end

    A --> B
    B --> F
    B --> I
    G --> F
    H --> G
    I --> H
    I --> J

    F -->|Minor GC| G
    G -->|Minor GC| H
    H -->|Major GC <br> Full GC| I
</div>

## Heap 메모리의 구조

**힙(Heap) 메모리의 구조**는 JVM에서 동적으로 생성된 객체와 레퍼런스 데이터를 저장하며, 가비지 컬렉션의 대상이 되는 공간이다. 
JVM의 힙 영역은 객체의 생존 기간과 특성을 기반으로 효율적으로 설계되었으며, 크게 **Young Generation**과 **Old Generation** 두 영역으로 나뉜다. 이러한 설계는 **Weak Generational Hypothesis**에 기반하며, 대부분의 객체는 금방 Unreachable 상태가 되고, 오래된 객체에서 새로운 객체로의 참조는 드물다는 가정을 전제로 한다.

### Young Generation (Young 영역)
**Young 영역**은 새롭게 생성된 객체가 처음 할당되는 공간이다. 대부분의 객체가 이 영역에서 생성되고 금방 Unreachable 상태가 되어 제거되며, 소규모 가비지 컬렉션인 **Minor GC**가 주로 이 영역에서 수행된다. 
Young 영역은 다음 세 가지로 더 나뉜다:
- **Eden**: 새롭게 생성된 객체가 위치하며, 정기적인 Minor GC 수행 후 살아남은 객체가 Survivor 영역으로 이동된다.
- **Survivor 0 / Survivor 1**: Eden에서 살아남은 객체가 복사되는 영역으로, 최소 한 번 이상 GC를 통과한 객체들이 이곳에 존재한다. Survivor 0과 Survivor 1은 하나가 항상 비어 있어야 하는 규칙이 있다.

### Old Generation (Old 영역)
**Old 영역**은 Young 영역에서 여러 번의 GC를 거쳐 살아남은 객체가 복사되는 공간이다. 
Young 영역보다 크며, 오래된 객체들이 위치하기 때문에 가비지 발생률이 상대적으로 낮다. 
Old 영역에서 수행되는 GC는 **Major GC** 또는 **Full GC**로 불리며, Young 영역보다 훨씬 더 큰 메모리를 다룬다.

### 힙 영역 설계의 효율성
Old 영역이 Young 영역보다 크도록 설계된 이유는, Young 영역의 객체 수명이 짧기 때문에 큰 공간을 필요로 하지 않으며, 대형 객체는 Young 영역을 거치지 않고 바로 Old 영역에 할당되기 때문이다. 
또한, Young 영역을 Eden과 두 개의 Survivor 영역으로 나누어 객체의 생존 기간을 면밀히 추적하고, 불필요한 객체를 효율적으로 제거하도록 가비지 컬렉션의 정확도를 높인다.

### Permanent Generation (Java 7 이전)과 Metaspace (Java 8 이후)
**Permanent Generation(PermGen)**은 클래스 로더에 의해 로드된 클래스와 메서드의 메타정보가 저장되던 공간으로, Java 7까지 힙 영역에 존재했다. 
그러나 Java 8 이후에는 힙 메모리에서 분리되어 **Metaspace**라는 Native Method Stack 영역에 통합되었다. 
이를 통해 PermGen에서 발생하던 메모리 부족 문제를 해결하고, 보다 유연한 메모리 관리를 가능하게 했다.

## Minor GC 과정
**Minor GC 과정**은 Young Generation에서 메모리를 효율적으로 관리하기 위해 수행되는 가비지 컬렉션으로, 객체의 생명 주기와 도달 가능성을 기준으로 불필요한 객체를 제거하는 프로세스이다. 
Young Generation은 Eden 영역과 두 개의 Survivor 영역(Survivor 0, Survivor 1)으로 구성되어 있으며, Minor GC는 주로 Eden 영역에서 발생한다. 

주요 과정은 다음과 같다:

1. **객체 생성 및 Eden 영역 할당**: 새로운 객체는 Young Generation의 Eden 영역에 위치하며, Eden 영역이 가득 차기 전까지 계속 저장된다.

2. **Eden 영역 가득참 및 Minor GC 실행**: 객체가 계속 생성되어 Eden 영역이 꽉 차게 되면 Minor GC가 실행된다.

3. **Mark 동작**: GC가 Eden 영역에서 Reachable 객체를 탐색하여 마킹한다. Reachable 객체는 참조되고 있는 상태로, 메모리에서 제거되지 않는다.

4. **Reachable 객체 Survivor 영역 이동**: Eden 영역에서 살아남은 객체는 하나의 Survivor 영역(예: Survivor 0)으로 이동된다.

5. **Unreachable 객체 메모리 해제**: Eden 영역에서 참조되지 않은 Unreachable 객체는 메모리에서 해제(Sweep)된다.

6. **객체의 Age 증가**: Survivor 영역에 남아있는 객체들은 **age** 값이 1씩 증가한다. 이 값은 객체가 Survivor 영역에서 살아남은 횟수를 의미하며, `Object Header`에 기록된다. 특정 임계값(예: HotSpot JVM의 기본값 31)에 도달하면 객체는 Old Generation으로 승격(Promotion)된다.

7. **다시 Eden 영역 할당**: Eden 영역에 신규 객체가 추가로 생성되어 다시 가득 차게 되면, Minor GC가 반복된다.

8. **Survivor 영역 교체**: 마킹된 객체들은 비어있는 다른 Survivor 영역(예: Survivor 1)으로 이동하며, 사용 중인 Survivor 영역은 비워진다.

9. **반복적인 Minor GC**: Eden 영역이 반복적으로 가득 차고, 객체들이 Survivor 영역 간 이동하며 age 값이 증가하는 과정을 계속 반복한다.

10. **Survivor 영역의 제한 조건**: Survivor 영역 중 하나는 항상 비어 있어야 한다. 두 Survivor 영역이 동시에 사용 중이거나 모두 비어 있다면, 이는 시스템이 비정상적으로 작동하고 있음을 의미한다.

Minor GC는 메모리 공간이 상대적으로 작은 Young Generation에서 수행되기 때문에 짧은 시간 내에 완료될 수 있다. 
하지만 Minor GC의 빈도가 지나치게 높아지면 애플리케이션 성능에 영향을 미칠 수 있으므로, 이를 고려한 메모리 관리 전략이 필요하다. 
이 과정을 통해 메모리를 효율적으로 관리하면서 Old Generation으로의 객체 이동을 최소화한다.

## Major GC 과정

**Major GC 과정**은 Old Generation 영역에서 발생하는 가비지 컬렉션으로, 상대적으로 수명이 긴 객체들이 저장된 메모리 공간을 관리하는 역할을 한다. Old Generation에 있는 객체들은 대부분 Young Generation에서 시작되어 Minor GC를 여러 번 통과하며, age 값이 임계값(예: 8)에 도달하면 Promotion 과정을 거쳐 이동된 객체들이다. Major GC는 Old Generation에 더 이상 새로운 객체를 저장할 공간이 부족해질 때 실행되며, Old Generation의 모든 객체를 검사해 참조되지 않은 객체를 제거한다.

### Major GC의 주요 단계
1. **객체 Promotion**: Young Generation에서 age 값이 임계값에 도달한 객체들은 Old Generation으로 이동된다.
2. **Old Generation 메모리 부족**: Old Generation 영역에 객체가 계속 Promotion되면, 결국 메모리가 부족해지는 상황이 발생한다.
3. **Major GC 발생**: Old Generation이 가득 차게 되면 Major GC가 실행된다. 이 과정에서는 Old Generation 내의 모든 객체를 검사하고, Unreachable 객체를 한꺼번에 제거한다.

### Minor GC와 Major GC 비교

| **항목**        | **Minor GC**                       | **Major GC (Full GC)**                |
|-----------------|-----------------------------------|--------------------------------------|
| **대상 영역**   | Young Generation                 | Old Generation                      |
| **발생 빈도**   | 빈번하게 발생                    | 드물게 발생                         |
| **처리 속도**   | 빠르다 (0.5~1초)                  | 상대적으로 느리다 (10배 이상 소요)    |
| **영향**        | 애플리케이션 성능에 큰 영향 없음 | Stop-The-World 발생으로 성능 저하    |

### Major GC의 특성과 문제점
Major GC는 Old Generation의 메모리를 확보하기 위해 모든 객체를 검사하므로 Minor GC에 비해 처리 시간이 오래 걸린다. 
이 과정에서 애플리케이션의 모든 스레드가 정지하는 **Stop-The-World** 현상이 발생하며, CPU에 부하를 주고 애플리케이션이 일시적으로 멈추거나 느려지는 현상을 유발할 수 있다. 
이로 인해 Major GC는 실시간 성능이 중요한 애플리케이션에서 문제가 될 수 있다.

현재도 Major GC로 인한 성능 저하를 줄이기 위해 다양한 알고리즘을 활용하여 GC의 처리 시간을 최소화하고, Stop-The-World 현상을 줄이는 방향으로 최적화 작업이 이루어지고 있다. 
JDK에서 제공하는 가비지 컬렉션 알고리즘의 종류와 각 버전에 따른 GC 방식의 변화에 대해 알아보고, 이를 통해 애플리케이션의 성능을 최적화할 수 있는 가비지 컬렉션 설정을 이해해보도록 하자.

# JVM의 가비지 컬렉션 알고리즘 종류

<hr>

자바의 가비지 컬렉션(GC)은 메모리 관리 효율성을 극대화하고 애플리케이션 성능을 유지하기 위해 다양한 알고리즘을 제공하며, 각 알고리즘은 특정한 요구와 환경에 맞게 설계되었다. GC 알고리즘은 JVM 옵션을 통해 상황에 따라 설정할 수 있다. 다음은 주요 GC 알고리즘의 특징과 사용 방법에 대한 정리이다.

## Serial GC
CPU 코어가 1개인 환경에서 적합하며, 일반적인 서버 환경에서는 잘 사용되지 않음.
- 단일 스레드(Single Thread)로 동작하며 가장 단순한 GC.
- **Mark-Sweep** 방식으로 Minor GC, **Mark-Sweep-Compact** 방식으로 Major GC 수행.
- Stop-The-World 시간이 가장 길며, 성능이 낮은 환경에서만 사용.

```bash
java -XX:+UseSerialGC -jar Application.java
```
  
## Parallel GC
기본적인 멀티 코어 CPU 환경에서 사용.
- Java 8의 기본 GC.
- Minor GC를 멀티 스레드로 처리하지만, Old Generation은 싱글 스레드로 처리.
- Serial GC 대비 Stop-The-World 시간이 줄어듦.

```bash
java -XX:+UseParallelGC -jar Application.java
java -XX:ParallelGCThreads=N # 사용할 스레드 개수 지정
```

## Parallel Old GC
멀티 코어 환경에서 Old Generation의 GC 성능이 중요한 경우 사용.
- Parallel GC의 개선 버전.
- Young Generation과 Old Generation 모두 멀티 스레드로 GC 수행.
- Mark-Summary-Compact 방식을 사용하여 효율성 증가.

```bash
java -XX:+UseParallelOldGC -jar Application.java
java -XX:ParallelGCThreads=N
```

## CMS GC (Concurrent Mark Sweep)
실시간 처리가 중요한 애플리케이션에서 사용되었으나 현재는 사용되지 않음.
- 애플리케이션 스레드와 GC 스레드가 동시에 실행되어 Stop-The-World 시간을 줄임.
- GC 과정이 복잡하고 CPU 사용량이 높으며, 메모리 파편화 문제가 존재.
- Java 9에서 deprecated, Java 14에서 제거됨.

```bash
java -XX:+UseConcMarkSweepGC -jar Application.java
```

## G1 GC (Garbage First)
힙 크기가 4GB 이상이며, 실시간 응답성이 중요한 애플리케이션에서 사용.
- CMS GC를 대체하기 위해 JDK 7에서 도입, Java 9부터 기본 GC.
- 힙 메모리를 고정된 Young/Old 영역으로 나누지 않고 **Region**이라는 단위로 분할.
- 메모리가 많이 사용된 Region을 우선적으로 수집하여 효율성 향상.
- Stop-The-World 시간이 짧고 예측 가능(0.5초).

```bash
java -XX:+UseG1GC -jar Application.java
```

## Shenandoah GC
Pause 시간이 중요한 대규모 애플리케이션에서 적합.
- Java 12에서 도입, Red Hat에서 개발.
- 강력한 동시성(Concurrency)으로 Stop-The-World 시간을 최소화.
- CMS의 단편화와 G1의 Pause 이슈를 해결한 GC.
- 힙 크기에 관계없이 일정한 Pause 시간이 특징.

```bash
java -XX:+UseShenandoahGC -jar Application.java
```

## ZGC (Z Garbage Collector)
매우 낮은 지연 시간과 대규모 메모리 관리가 필요한 애플리케이션에서 사용.
- Java 15에서 도입.
- 대규모 메모리(8MB ~ 16TB)를 처리하며 Stop-The-World 시간이 10ms를 넘지 않음.
- 힙 메모리를 **ZPage**라는 동적 크기의 영역으로 관리.

```bash
java -XX:+UnlockExperimentalVMOptions -XX:+UseZGC -jar Application.java
```

## GC 알고리즘 비교 요약

| **알고리즘**       | **특징**                                                  | **장점**                         | **단점**                            |
|------------------|-------------------------------------------------------|--------------------------------|-----------------------------------|
| Serial GC        | 단일 스레드, 가장 단순한 GC                             | 구현 간단, CPU가 낮은 환경에 적합 | Stop-The-World 시간이 길다         |
| Parallel GC      | Young 영역 멀티 스레드 처리                             | 성능 향상, Stop-The-World 감소   | Old Generation은 싱글 스레드 처리 |
| Parallel Old GC  | Old Generation도 멀티 스레드 처리                       | 더 나은 성능                    | 높은 CPU 사용량                   |
| CMS GC           | 동시 실행으로 Stop-The-World 최소화                     | 실시간 처리 적합                | 복잡한 과정, 메모리 파편화 문제    |
| G1 GC            | Region 개념 도입, 메모리 효율성 증가                     | 낮은 지연 시간                  | 설정이 복잡할 수 있음             |
| Shenandoah GC    | 매우 짧은 Pause 시간                                    | 힙 크기와 상관없는 일정한 Pause | 최신 JVM에서만 사용 가능           |
| ZGC              | 대규모 메모리와 낮은 지연 시간 처리                     | Stop-The-World 시간 10ms 이하   | 메모리 사용량이 많을 수 있음       |

# GC 모니터링 및 메모리 문제

GC는 JVM 메모리를 효율적으로 관리하기 위해 자동으로 수행되지만, 그 과정에서 예상치 못한 문제가 발생할 수 있다. 
GC가 과도하게 실행되면 CPU 사용량이 증가하고 메모리 자원이 부족해져 애플리케이션의 응답 시간이 길어질 수 있다. 
특히, 클라우드 환경이나 대규모 시스템에서는 리소스 관리가 중요한데, 이런 환경에서 GC가 적절히 작동하지 않으면 서비스 장애로 이어질 수 있다. 
이를 방지하기 위해 **jstat**, **VisualVM**, **Prometheus+Grafana** 같은 도구를 활용하여 GC와 메모리 사용 상태를 실시간으로 모니터링해야 한다. 
이를 통해 GC가 애플리케이션에 미치는 영향을 파악하고 적절한 조치를 취할 수 있다.

### **OutOfMemoryError와 대처 방안**
GC를 모니터링하던 중 **OutOfMemoryError**가 발생하는 경우, 이는 힙 메모리의 부족 또는 메모리 누수로 인해 발생할 가능성이 높다. 
이를 해결하려면 먼저 원인을 파악하는 것이 중요하다. 
**힙 덤프(Heap Dump)**를 생성한 뒤, **Eclipse MAT(Memory Analyzer Tool)**이나 **VisualVM** 같은 분석 도구를 활용해 메모리 누수 여부와 객체 참조 상태를 분석한다.

1. **메모리 누수의 원인 파악**: 메모리 누수가 원인인 경우, 불필요한 객체 참조가 제거되지 않은 코드를 찾아 수정해야 한다. 일반적인 원인으로는 캐시 관리 실수, 이벤트 리스너 미해제, 전역 컬렉션에 남아 있는 객체 등이 있다.
2. **힙 메모리 크기 조정**: 애플리케이션 데이터 처리량이 메모리 크기를 초과하는 경우, JVM 옵션(`-Xmx`, `-Xms`)으로 힙 크기를 늘리고, 적합한 GC 알고리즘(G1 GC, ZGC 등)을 선택해 GC 튜닝을 수행한다.
3. **추적과 예방**: 애플리케이션 로깅 및 모니터링 체계를 구축해 메모리 사용량 추이를 관찰하고, OutOfMemoryError가 발생하기 전에 문제를 사전에 탐지하도록 한다.

### **메모리 누수 확인과 방지**
메모리 누수는 GC가 제거하지 못하는 객체가 메모리를 지속적으로 점유하는 문제로, 힙 메모리를 고갈시킬 수 있다. 
이를 해결하려면 실행 중인 애플리케이션에서 **힙 덤프**를 생성한 후, **객체 그래프**를 분석하여 불필요하게 참조되고 있는 객체를 식별해야 한다.

- **분석 도구 활용**: **Eclipse MAT**이나 **VisualVM**을 사용해 객체의 참조 체인을 추적하고 의도치 않게 유지되고 있는 객체를 찾아낸다.
- **실시간 모니터링**: **JConsole**, **jstat**, 또는 **APM(Application Performance Monitoring)** 도구를 사용해 메모리 사용량 변화를 실시간으로 모니터링한다. 이를 통해 메모리 사용량이 지속적으로 증가하는 패턴을 확인할 수 있다.
- **일반적인 누수 원인 해결**: 캐시 관리 실수, 이벤트 리스너 미해제, 전역 컬렉션 문제 등이 누수의 일반적인 원인이므로, 이러한 요소들을 면밀히 검토하여 코드 문제를 수정한다.

> 추후 왜 STW(Stop-The-World)가 발생하는지 등에 대한 내용 추가할 예정이다.