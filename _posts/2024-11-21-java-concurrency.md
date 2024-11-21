---
layout: post
title: "자바의 동시성 이해하기"
author: "023"
comments: true
tags: Java
excerpt_separator: <!--more-->
---

# 동시성

## 동시성과 병렬성의 차이점
**동시성(Concurrency)**과 **병렬성(Parallelism)**은 다중 작업을 처리하는 방식에서 차이가 있습니다.

동시성(Concurrency): 여러 작업을 논리적으로 동시에 실행하는 것을 의미합니다. 실제로는 하나의 CPU에서 시분할 방식으로 여러 작업을 처리합니다.
예시: 싱글코어 CPU에서 스레드를 교차적으로 실행.
병렬성(Parallelism): 여러 작업을 물리적으로 동시에 실행하는 것을 의미합니다. 멀티코어 CPU에서 각 작업이 다른 코어에서 실행됩니다.
예시: 멀티코어 CPU에서 서로 다른 스레드가 동시에 실행.

## Thread-Safe하다는 것의 의미
Thread-Safe란 다중 스레드 환경에서 동시에 실행해도 프로그램의 동작이 안전하게 수행되는 것을 의미합니다.

 Thread-Safe를 구현하는 방법:
Mutual Exclusion (상호 배제): synchronized 키워드를 사용하여 한 번에 하나의 스레드만 특정 코드 블록에 접근.
Thread-Local Storage: 스레드마다 고유한 메모리를 할당.
불변 객체 사용: 상태를 변경하지 않아 동기화가 필요 없음.
Concurrent 패키지 사용: Java의 java.util.concurrent 라이브러리 사용.

## 가시성 문제와 원자성 문제
가시성 문제
문제 설명: 한 스레드에서 변경한 값이 다른 스레드에서 즉시 보이지 않는 현상.
원인: CPU 캐시 또는 컴파일러 최적화로 인해 메모리의 일관성이 깨짐.
해결 방법:
volatile 키워드: 변수의 값을 항상 메인 메모리에서 읽도록 보장.
synchronized 블록: 메모리 배리어로 동작하여 일관성을 유지.
원자성 문제

문제 설명: 한 작업 단위가 중간에 끼어들기 없이 완료되지 않는 현상.
예제: i++ 연산은 read-modify-write의 세 단계로 나뉘어, 다른 스레드가 중간에 간섭 가능.
해결 방법:
synchronized 키워드: 블록 내부의 코드를 원자적으로 처리.
Atomic 클래스: AtomicInteger 등 CAS 알고리즘 기반.
## 자바의 동시성 이슈 해결 방법
synchronized 키워드 사용: 상호 배제와 메모리 일관성을 보장.
volatile 키워드 사용: 변수 값의 가시성 확보.
Java Concurrency 패키지 사용: Lock, Executor, ConcurrentHashMap 등의 고급 도구 제공.
Atomic 클래스 사용: 원자 연산을 제공하여 성능과 안전성을 확보.
volatile 키워드
역할: 변수의 값을 모든 스레드에서 즉시 읽을 수 있도록 보장.
동작 원리:
volatile 변수를 읽거나 쓸 때, CPU 캐시가 아닌 메인 메모리에서 값을 읽고 씀.
컴파일러와 CPU의 재정렬 방지.
제한 사항:
원자성을 보장하지 않음. (e.g., i++ 연산에는 사용 불가)
public class VolatileExample {
private volatile boolean running = true;

    public void stop() {
        running = false; // 다른 스레드에서도 즉시 반영
    }

    public void doWork() {
        while (running) {
            // 작업 실행
        }
    }
}
synchronized 키워드
역할: 코드 블록 또는 메서드에 대해 한 번에 하나의 스레드만 접근 가능.
사용 예제:
public class SynchronizedExample {
private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }
}
문제점:
성능 저하: 모든 스레드가 순차적으로 실행.
데드락 위험: 여러 스레드가 서로의 자원을 대기할 때 발생.
경합 비용: 스레드 간의 경합으로 인한 오버헤드.
synchronized의 내부 구현
모니터 락(Monitor Lock) 기반으로 구현.
JVM은 객체의 Monitor를 사용하여 스레드 간 동기화 수행.
Monitor는 객체의 **헤더(Header)**에 저장된 비트로 관리.
바이너리 코드로 컴파일 시:
monitorenter와 monitorexit 명령어가 사용됨.
Atomic하다는 것의 의미
Atomic은 불가분한 작업 단위를 의미합니다. 즉, 중단될 수 없는 작업.
예: AtomicInteger의 incrementAndGet()은 원자적으로 수행.
Atomic 타입: AtomicInteger, AtomicLong, AtomicReference 등이 있음.
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
private AtomicInteger count = new AtomicInteger();

    public void increment() {
        count.incrementAndGet(); // 원자적 연산
    }

    public int getCount() {
        return count.get();
    }
}
동시성 프로그래밍 심화

가시성 문제와 CPU 캐시
문제 원인: CPU는 메모리 접근을 줄이기 위해 캐시 일관성 프로토콜을 사용.
해결 방법:
Happens-before 관계: volatile 또는 synchronized로 보장.
Memory Barrier: 하드웨어 차원에서 메모리 동기화.
CAS 알고리즘 (Compare-And-Swap)
역할: Lock 없이 원자적 연산 수행.
동작 과정:
메모리에서 값 읽기.
예상 값과 비교.
일치하면 새 값으로 교체.
실패하면 재시도.
장점: 높은 성능.
문제점:
ABA 문제: 값이 변경되었다가 다시 원래 값으로 돌아왔을 때 탐지 불가.
CPU 자원 소모: 재시도가 많을 경우 성능 저하.
import java.util.concurrent.atomic.AtomicInteger;

public class CASExample {
private AtomicInteger count = new AtomicInteger();

    public void increment() {
        while (true) {
            int current = count.get();
            int next = current + 1;
            if (count.compareAndSet(current, next)) {
                break;
            }
        }
    }
}
Vector, Hashtable, Collections.SynchronizedXXX의 문제점
Vector, Hashtable: 동기화가 모든 메서드에 적용되어 과도한 락 경쟁 발생.
Collections.synchronizedXXX:
메서드에만 동기화 적용. 반복문에서 ConcurrentModificationException 발생 가능.
SynchronizedList와 CopyOnWriteArrayList의 차이
SynchronizedList:
메서드마다 동기화 적용.
반복문에서 ConcurrentModificationException 발생 가능.
CopyOnWriteArrayList:
쓰기 작업 시 전체 배열을 복사.
읽기 작업이 많은 환경에 적합, 쓰기 성능 저하.
ConcurrentHashMap vs SynchronizedMap
SynchronizedMap:
모든 메서드에 동기화 적용.
성능 저하.
ConcurrentHashMap:
세그먼트 단위로 락을 적용해 성능 향상.
Java 8 이후에는 버킷 단위로 동기화.
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapExample {
private ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

    public void increment(String key) {
        map.merge(key, 1, Integer::sum);
    }

    public int get(String key) {
        return map.getOrDefault(key, 0);
    }
}