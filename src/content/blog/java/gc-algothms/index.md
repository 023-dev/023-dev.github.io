---
visible: false
title: "GC 알고리즘(Garbage Collection Algorithms)"
date: 2025-05-27 00:00:00
tags: 
  - Java
---

## Serial GC

Serial GC는 JDK에 도입된 최초의 가바지 컬렉터이며, 단일 스레드로 동작하는 가장 단순한 형태이다. 
작은 힙 메모리와 단일 CPU 환경에 적합하며 Stop-The-World 시간이 가장 길게 발생한다.

## Parallel GC

Parallel GC는 Java 5부터 8까지 default 가비지 컬렉터로 사용되었으며, 
Serial GC와 달리 Young 영역의 GC를 멀티 스레드로 수행한다. 
높은 처리량에 초점을 두기 때문에 Throughput GC라고도 불린다.

## Parallel Old GC

Parallel Old GC는 Parallel GC의 향상된 버전으로, 
Old 영역에서도 멀티 스레드를 활용하여 GC를 수행한다.

## CMS GC

CMS(Concurrent Mark-Sweep) GC는 Java 5부터 8까지 사용된 가비지 컬렉터로, 
애플리케이션 스레드와 병렬로 실행되어 Stop-The-World 시간을 최소화하도록 설계되었다.
하지만 메모리와 CPU 사용량이 많고, 메모리 압축을 수행하지 않아 메모리 단편화 문제가 있었다.
그래서 Java 9부터 deprecated 처리가 되고, Java 14에서 완전히 제거되었다.

## G1 GC

G1(Garbage First) GC는 Java 9부터 default 가비지 컬렉터이며, 
기존의 GC 방식과 달리 힙을 여러 개의 region으로 나누어 논리적으로 Young, Old 영역을 구분한다. 
처리량과 Stop-The-World 시간 사이의 균형을 유지하며 32GB보다 작은 힙 메모리를 사용할 때 가장 효과적이다. 
GC 대상이 많은 region을 먼저 회수하기 때문에 garbage first라는 이름이 붙었다.

## ZGC

ZGC는 Java 11부터 도입된 가비지 컬렉터로, 
10ms 이하의 Stop-The-World 시간과 대용량 힙을 처리할 수 있도록 설계되었다.

## Shenandoah GC

Shenandoah GC는 Red Hat에서 개발한 가비지 컬렉터로, Java 12부터 도입되었다. 
G1 GC와 마찬가지로 힙을 여러 개의 region으로 나누어 처리하며, 
ZGC처럼 저지연 Stop-The-World와 대용량 힙 처리를 목표로 한다.

## Epsilon GC

Epsilon GC는 Java 11부터 도입되었으며 GC 기능이 없는 실험용 가비지 컬렉터이다. 
애플리케이션 성능 테스트에서 GC 영향을 분리하거나 GC 오버헤드 없이 메모리 한계를 테스트할 때 사용되지만, 
프로덕션 환경에는 적합하지 않다.

## G1 GC에서 Humongous 객체에 대한 문제

Humongous 객체는 region 크기의 50% 이상을 차지하는 큰 객체를 의미한다. 
Humongous 객체는 크기에 따라 하나 또는 여러 개의 연속된 region을 차지할 수 있고, 
region 내 잉여 공간은 다른 객체에 할당되지 않아 메모리 단편화가 발생할 수 있다. 
또한, Young 영역을 거치지 않고 바로 Old 영역에 할당되기 때문에 Full GC가 발생할 가능성이 높아진다. 
이 문제를 해결하려면 -XX:G1HeapRegionSize 옵션을 사용하여 region 크기를 조정하거나, 
큰 객체를 작은 객체로 분할하여 처리해 볼 수 있다.


## G1 GC와 서버 스케일업

2vCPU, 1GB 메모리를 가진 Linux 서버에 JDK 17을 설치하면 어떤 가비지 컬렉터가 사용될까?
JDK 9부터 G1 GC가 default 가비지 컬렉터이지만, 서버 스펙에 따라 자동으로 결정된다.

OpenJDK에서는 CPU 코어 수가 2개 이상이고 메모리가 2GB 이상일 경우 서버를 Server-Class Machine으로 인식한다. 
Server-Class Machine이라면 가비지 컬렉터로 G1 GC가 선택되지만, 
이 서버는 조건을 충족하지 않기 때문에 Serial GC가 선택된다. 
이처럼 G1 GC를 사용하려면 서버를 스케일업하거나 -XX:+UseG1GC 옵션을 명시적으로 설정해야 한다.

참고로 현재 실행 중인 JVM의 GC를 확인하려면 다음 명령어를 사용할 수 있다:

```bash
sudo jcmd {pid} VM.info
```

또는

```bash
sudo jinfo {pid}
```

## 참고

- [10분 테코톡 - 조엘의 GC](https://www.youtube.com/watch?v=FMUpVA0Vvjw)
- [최범균님 유튜브 - G1 GC 써 볼까?](https://www.youtube.com/watch?v=H4yuuYXK8_o)