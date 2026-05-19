---
visible: true
title: "Callable, Future, ExecutorService에 대한 이해"
date: 2026-05-19 00:00:00
tags:
  - Java
heroImage: "./img.png"
---

`Thread`와 `Runnable`만으로도 새 실행 흐름을 만들 수는 있다.
하지만 실제 애플리케이션에서는 작업이 하나로 끝나지 않는다.
여러 작업을 동시에 실행해야 하고, 실행 결과를 받아야 하며, 실패나 취소도 다뤄야 한다.
매번 `new Thread(...).start()`를 호출하는 방식으로는 이런 요구사항을 관리하기 어렵다.

그래서 자바는 Java 5부터 `java.util.concurrent` 패키지에 더 높은 수준의 동시성 API를 제공한다.
`Runnable`이 “실행할 작업”을 표현했다면, `Callable`은 “결과를 반환할 수 있는 작업”을 표현한다.
`Future`는 아직 끝나지 않은 작업의 결과를 나중에 받을 수 있게 해 주고, `ExecutorService`는 작업 실행과 스레드 풀의 생명주기를 관리한다.

이 글에서는 `Callable`, `Future`, `Executor`, `ExecutorService`, `ScheduledExecutorService`, `Executors`를 한 흐름으로 정리한다.
핵심은 스레드를 직접 만드는 코드에서 벗어나, 작업을 제출하고 실행 결과와 종료 시점을 관리하는 구조로 이동하는 것이다.

## Thread와 Runnable만 썼을 때의 한계

직접 스레드를 만들면 흐름은 단순해 보인다.
작업을 `Runnable`로 만들고, `Thread`에 넣고, `start()`를 호출하면 된다.

```java
Runnable task = () -> System.out.println(Thread.currentThread().getName());

Thread thread = new Thread(task);
thread.start();
```

문제는 작업 수가 늘어난 뒤에 드러난다.
스레드를 언제 만들고 없앨지 직접 결정해야 하고, 실행 결과를 반환받기도 어렵다.
작업 중 예외가 발생했을 때 호출자에게 어떻게 전달할지도 애매하다.
무엇보다 요청이 많아질 때마다 스레드를 새로 만들면 생성 비용과 컨텍스트 스위칭 비용이 계속 쌓인다.

이런 문제를 줄이려면 “스레드”가 아니라 “작업” 중심으로 생각해야 한다.
작업은 `Runnable`이나 `Callable`로 표현하고, 실행은 `ExecutorService` 같은 실행기에게 맡긴다.

## Callable

`Runnable`의 `run()`은 반환값이 없고 체크 예외를 직접 던질 수도 없다.
그래서 결과가 필요한 작업을 표현하기에는 불편하다.
예를 들어 백그라운드에서 계산한 값을 메인 흐름에서 받아야 한다면 공유 변수나 별도 동기화 장치를 고민해야 한다.

**[`Callable`은 결과를 반환하고 예외를 던질 수 있는 작업을 표현하는 함수형 인터페이스다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Callable.html)**
추상 메서드는 `call()` 하나뿐이라 람다식으로도 자연스럽게 작성할 수 있다.

```java
import java.util.concurrent.Callable;

Callable<Integer> task = () -> {
    Thread.sleep(1_000);
    return 10 + 20;
};
```

`Runnable`과 `Callable`의 차이는 작지만 중요하다.
`Runnable`은 실행 자체가 목적일 때 어울리고, `Callable`은 실행 결과가 필요할 때 어울린다.

| 구분 | Runnable | Callable |
| --- | --- | --- |
| 메서드 | `run()` | `call()` |
| 반환값 | 없음 | 있음 |
| 체크 예외 | 직접 선언 불가 | `throws Exception` 가능 |
| 주 사용처 | fire-and-forget 작업 | 결과가 필요한 비동기 작업 |

다만 `Callable`을 만든다고 해서 그 자체로 새 스레드가 생기지는 않는다.
`Callable`도 작업의 정의일 뿐이다.
실행하려면 `ExecutorService`에 제출해야 한다.

## Future

비동기 작업은 제출하자마자 결과가 생기지 않는다.
작업이 큐에서 대기할 수도 있고, 이미 실행 중이더라도 끝나기까지 시간이 걸릴 수 있다.
이때 “언젠가 완료될 결과”를 표현하는 객체가 `Future`다.

**[`Future`는 비동기 계산의 결과를 나타내며, 완료 여부 확인, 완료 대기, 결과 조회, 취소 기능을 제공한다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Future.html)**
가장 자주 쓰는 메서드는 다음과 같다.

| 메서드 | 역할 | 주의할 점 |
| --- | --- | --- |
| `get()` | 작업이 끝날 때까지 기다렸다가 결과를 가져온다. | 완료 전이면 호출한 스레드가 블로킹된다. |
| `get(timeout, unit)` | 지정한 시간까지만 기다린다. | 시간이 지나면 `TimeoutException`이 발생한다. |
| `isDone()` | 작업 완료 여부를 확인한다. | 정상 완료, 예외 발생, 취소 모두 완료로 본다. |
| `isCancelled()` | 취소 여부를 확인한다. | 취소된 작업은 결과를 정상적으로 받을 수 없다. |
| `cancel(boolean)` | 작업 취소를 시도한다. | 이미 실행 중인 작업은 인터럽트 협조가 필요하다. |

간단한 예제는 다음과 같다.

```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class FutureExample {
    public static void main(String[] args) throws Exception {
        try (ExecutorService executor = Executors.newSingleThreadExecutor()) {
            Callable<String> task = () -> {
                Thread.sleep(1_000);
                return "done: " + Thread.currentThread().getName();
            };

            Future<String> future = executor.submit(task);

            System.out.println("다른 작업 처리");
            System.out.println(future.get());
        }
    }
}
```

`submit()`은 작업을 등록한 뒤 곧바로 `Future`를 반환한다.
그래서 호출자는 다른 일을 하다가, 결과가 필요한 시점에 `get()`을 호출할 수 있다.
하지만 `get()`은 결과가 준비될 때까지 기다리는 블로킹 메서드다.
비동기 API라고 해서 모든 호출이 논블로킹으로 동작하는 것은 아니다.

## Future 취소와 예외 처리

`Future.get()`은 작업 결과만 반환하지 않는다.
작업 안에서 예외가 발생하면 `ExecutionException`으로 감싸서 전달하고, 기다리는 중 현재 스레드가 인터럽트되면 `InterruptedException`이 발생한다.
그래서 실무 코드에서는 `get()` 호출 위치에서 예외 처리 정책을 분명히 정해야 한다.

```java
try {
    String result = future.get();
    System.out.println(result);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
} catch (ExecutionException e) {
    throw new IllegalStateException("작업 실행 중 예외가 발생했습니다.", e.getCause());
}
```

**[`Future.cancel(true)`는 실행 중인 작업을 멈추려고 해당 작업을 실행하는 스레드에 인터럽트를 시도한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Future.html#cancel(boolean)>)**
여기서 “시도”라는 표현이 중요하다.
인터럽트는 강제 종료가 아니라 협조적 취소에 가깝다.
작업 코드가 인터럽트를 확인하지 않거나, `InterruptedException`을 무시하면 바로 멈추지 않을 수 있다.

```java
Callable<String> task = () -> {
    while (!Thread.currentThread().isInterrupted()) {
        // 반복 작업
    }
    return "cancelled";
};
```

따라서 오래 실행되는 작업을 `Future`로 다룬다면 취소 가능성도 함께 설계해야 한다.
반복문 안에서 인터럽트 상태를 확인하거나, 블로킹 메서드에서 발생한 `InterruptedException`을 삼키지 않는 식이다.

## Executor

`Executor`는 동시성 API의 가장 작은 실행 단위다.
메서드는 `execute(Runnable)` 하나뿐이다.
이름 그대로 전달받은 작업을 실행한다.

**[`Executor`는 작업 제출 코드와 실제 실행 방식, 예를 들어 스레드 사용이나 스케줄링 정책을 분리하기 위한 인터페이스다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Executor.html)**
이 말은 `execute()`를 호출하는 쪽이 “이 작업을 새 스레드에서 실행할지, 현재 스레드에서 바로 실행할지, 큐에 넣었다가 나중에 실행할지”를 몰라도 된다는 뜻이다.

```java
import java.util.concurrent.Executor;

public class DirectExecutorExample {
    public static void main(String[] args) {
        Executor executor = Runnable::run;

        executor.execute(() -> {
            System.out.println(Thread.currentThread().getName());
        });
    }
}
```

위 예제는 새 스레드를 만들지 않는다.
`Runnable::run`이 결국 현재 스레드에서 `run()`을 호출하기 때문이다.

```java
Executor executor = command -> new Thread(command).start();
```

반대로 이렇게 구현하면 작업마다 새 스레드를 만든다.
즉 `Executor`는 “비동기 실행”을 반드시 보장하는 인터페이스가 아니다.
실제 실행 정책은 구현체가 결정한다.

## ExecutorService

`Executor`만으로는 작업을 실행할 수는 있어도, 작업 결과를 받거나 실행기를 종료하는 기능은 부족하다.
그 역할을 확장한 인터페이스가 `ExecutorService`다.

**[`ExecutorService`는 종료 관리 기능과, 하나 이상의 비동기 작업 진행 상황을 추적할 수 있는 `Future` 생성 기능을 제공하는 `Executor`다.](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/ExecutorService.html)**
대표 메서드는 두 그룹으로 나눌 수 있다.

| 구분 | 메서드 | 역할 |
| --- | --- | --- |
| 작업 제출 | `execute()` | `Runnable`을 실행하지만 결과를 반환하지 않는다. |
| 작업 제출 | `submit()` | `Runnable` 또는 `Callable`을 제출하고 `Future`를 반환한다. |
| 여러 작업 실행 | `invokeAll()` | 여러 작업이 모두 끝날 때까지 기다리고 `Future` 목록을 반환한다. |
| 여러 작업 실행 | `invokeAny()` | 성공적으로 끝난 작업 중 하나의 결과를 반환한다. |
| 종료 관리 | `shutdown()` | 새 작업을 받지 않고, 이미 제출된 작업은 끝까지 실행한다. |
| 종료 관리 | `shutdownNow()` | 대기 중인 작업을 중단하고 실행 중인 작업에 인터럽트를 시도한다. |
| 종료 관리 | `awaitTermination()` | 종료 요청 뒤 모든 작업이 끝날 때까지 지정 시간 동안 기다린다. |

`execute()`와 `submit()`은 자주 헷갈린다.
둘 다 작업을 실행하지만, 결과와 예외를 다루는 방식이 다르다.
`execute()`는 반환값이 없고, `submit()`은 `Future`를 반환한다.
결과가 필요하거나 작업 실패를 호출자 쪽에서 확인해야 한다면 `submit()`이 더 적합하다.

```java
try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
    Future<Integer> future = executor.submit(() -> 100);

    System.out.println(future.get());
}
```

`ExecutorService.submit(Callable)`은 값을 반환하는 작업을 제출하고, 완료 예정 결과를 나타내는 `Future`를 반환한다.
그래서 `Callable`과 `Future`는 보통 `ExecutorService`와 함께 쓰인다.

## ExecutorService 종료

`ExecutorService`를 사용할 때 가장 흔한 실수는 종료를 빼먹는 것이다.
스레드 풀의 작업 스레드는 작업 하나가 끝났다고 바로 사라지지 않는다.
다음 작업을 기다리기 때문에 실행기를 닫지 않으면 애플리케이션이 종료되지 않을 수 있다.

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
executor.submit(() -> System.out.println("work"));
executor.shutdown();
```

**[`shutdown()`은 새 작업을 더 받지 않고 기존에 제출된 작업을 실행한 뒤 종료를 시작하며, 이미 종료된 상태에서 다시 호출해도 추가 효과는 없다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/ExecutorService.html#shutdown()>)**
더 강하게 멈추고 싶을 때는 `shutdownNow()`를 사용할 수 있지만, 이 역시 실행 중인 작업을 강제로 죽인다는 뜻은 아니다.
실행 중인 작업에는 보통 인터럽트를 보내므로, 작업 코드가 인터럽트에 협조해야 한다.

Java 19 이후의 `ExecutorService`는 `AutoCloseable`을 상속한다.
그래서 최신 JDK를 기준으로는 `try-with-resources`를 사용할 수 있다.

```java
try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
    Future<Integer> future = executor.submit(() -> 1 + 2);
    System.out.println(future.get());
}
```

다만 오래된 JDK를 사용한다면 `try-finally`에서 `shutdown()`을 호출하는 방식이 더 안전하다.

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
try {
    Future<Integer> future = executor.submit(() -> 1 + 2);
    System.out.println(future.get());
} finally {
    executor.shutdown();
}
```

## invokeAll과 invokeAny

여러 `Callable`을 한꺼번에 실행해야 할 때는 `invokeAll()`과 `invokeAny()`를 사용할 수 있다.
두 메서드는 이름은 비슷하지만 기다리는 기준이 다르다.

`invokeAll()`은 주어진 작업들을 실행하고 모두 완료되면 각 작업의 상태와 결과를 담은 `Future` 목록을 반환한다.
반환된 `Future`의 순서는 넘긴 컬렉션의 반복 순서를 따른다.
그래서 여러 작업의 결과를 모두 모아야 할 때 적합하다.

```java
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class InvokeAllExample {
    public static void main(String[] args) throws Exception {
        List<Callable<String>> tasks = List.of(
                () -> "A",
                () -> "B",
                () -> "C"
        );

        try (ExecutorService executor = Executors.newFixedThreadPool(3)) {
            List<Future<String>> futures = executor.invokeAll(tasks);

            for (Future<String> future : futures) {
                System.out.println(future.get());
            }
        }
    }
}
```

`invokeAny()`는 여러 작업 중 하나만 필요할 때 쓴다.
성공적으로 완료된 작업이 하나라도 있으면 그 결과를 반환하고, 아직 끝나지 않은 나머지 작업은 취소된다.
예를 들어 여러 서버에 같은 요청을 보내고 가장 빠른 응답 하나만 쓰는 구조에서 생각해 볼 수 있다.

```java
try (ExecutorService executor = Executors.newFixedThreadPool(3)) {
    String result = executor.invokeAny(tasks);
    System.out.println(result);
}
```

작업을 전부 끝내야 하는지, 가장 빠른 하나만 필요할지에 따라 두 메서드 중 하나를 고르면 된다.

## ScheduledExecutorService

일정 시간이 지난 뒤 작업을 실행하거나, 일정 주기로 작업을 반복해야 할 때는 `ScheduledExecutorService`를 사용한다.
`Timer`보다 유연하고, 여러 스레드를 가진 스케줄러로도 구성할 수 있다.

`ScheduledExecutorService`는 지정한 지연 시간 뒤에 명령을 실행하거나 주기적으로 실행할 수 있는 `ExecutorService`다.
자주 쓰는 메서드는 다음 세 가지다.

| 메서드 | 실행 방식 |
| --- | --- |
| `schedule()` | 지정한 지연 시간 뒤에 한 번 실행한다. |
| `scheduleAtFixedRate()` | 이전 실행 시작 시점을 기준으로 일정 주기마다 실행한다. |
| `scheduleWithFixedDelay()` | 이전 실행이 끝난 뒤 지정한 지연 시간이 지나면 다음 실행을 시작한다. |

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ScheduledExample {
    public static void main(String[] args) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        scheduler.schedule(() -> {
            System.out.println("3초 뒤 실행");
            scheduler.shutdown();
        }, 3, TimeUnit.SECONDS);
    }
}
```

반복 실행에서는 `scheduleAtFixedRate()`와 `scheduleWithFixedDelay()`의 차이가 중요하다.

```java
scheduler.scheduleAtFixedRate(task, 0, 2, TimeUnit.SECONDS);
scheduler.scheduleWithFixedDelay(task, 0, 2, TimeUnit.SECONDS);
```

**[`scheduleAtFixedRate()`는 `initialDelay`, `initialDelay + period`, `initialDelay + 2 * period`처럼 시작 시점 기준으로 반복 실행을 예약한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html#scheduleAtFixedRate(java.lang.Runnable,long,long,java.util.concurrent.TimeUnit)>)**
반면 `scheduleWithFixedDelay()`는 이전 작업이 끝난 뒤 지정한 지연 시간을 두고 다음 작업을 시작한다.

작업 시간이 짧고 일정한 주기를 최대한 맞추고 싶다면 `scheduleAtFixedRate()`가 맞다.
이전 작업이 얼마나 오래 걸렸는지에 따라 다음 실행 간격을 조정하고 싶다면 `scheduleWithFixedDelay()`가 더 자연스럽다.

## Executors

`Executors`는 자주 쓰는 실행기를 쉽게 만들기 위한 팩토리 클래스다.
직접 `ThreadPoolExecutor` 생성자에 여러 값을 넘기지 않아도, 대표적인 스레드 풀을 간단히 만들 수 있다.

```java
ExecutorService fixed = Executors.newFixedThreadPool(4);
ExecutorService single = Executors.newSingleThreadExecutor();
ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(2);
```

**[`Executors.newFixedThreadPool(int)`는 고정된 수의 스레드를 재사용하는 풀을 만들고, 모든 스레드가 바쁘면 추가 작업을 큐에서 기다리게 한다.](<https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/Executors.html#newFixedThreadPool(int)>)**
쓰기 쉽지만 주의할 점도 있다.
고정 스레드 풀은 작업 처리량보다 제출량이 훨씬 많아지면 큐에 작업이 계속 쌓일 수 있다.
작업이 매우 많거나 지연 시간이 중요한 서비스에서는 큐 크기, 거부 정책, 스레드 이름, 모니터링 기준까지 직접 정하는 편이 낫다.
그때는 `ThreadPoolExecutor`를 직접 구성한다.

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

ThreadPoolExecutor executor = new ThreadPoolExecutor(
        4,
        8,
        60,
        TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(100)
);
```

`Executors`의 팩토리 메서드는 학습과 간단한 작업에는 좋다.
하지만 운영 환경에서는 “몇 개의 스레드를 둘 것인가”만큼 “큐가 가득 찼을 때 어떻게 할 것인가”도 중요하다.

## Future의 한계와 CompletableFuture

`Future`는 자바의 비동기 작업 모델을 이해하는 데 중요한 출발점이다.
다만 한계도 분명하다.
결과를 얻으려면 결국 `get()`으로 기다려야 하고, 완료 후 콜백을 붙이거나 여러 비동기 작업을 자연스럽게 이어 붙이는 기능은 부족하다.

그래서 Java 8부터는 `CompletableFuture`가 추가되었다.
`CompletableFuture`는 작업이 끝난 뒤 실행할 콜백을 등록하거나, 여러 비동기 작업을 조합하는 데 더 편하다.
다만 `CompletableFuture` 역시 내부적으로는 실행기와 스레드 풀의 영향을 받는다.
`Callable`, `Future`, `ExecutorService`의 역할을 먼저 이해하면 `CompletableFuture`도 훨씬 덜 헷갈린다.

## 정리

`Thread`와 `Runnable`이 자바 동시성의 출발점이라면, `Callable`, `Future`, `ExecutorService`는 실무에서 작업을 관리하기 위한 기본 도구다.
`Callable`은 결과가 있는 작업을 표현하고, `Future`는 아직 완료되지 않은 결과를 추적한다.
`Executor`는 작업 제출과 실행 방식을 분리하고, `ExecutorService`는 여기에 결과 추적과 종료 관리를 더한다.
`ScheduledExecutorService`는 지연 실행과 반복 실행을 맡는다.

직접 스레드를 만드는 방식은 작고 단순한 예제에서는 충분하다.
하지만 작업 수가 늘고 결과, 실패, 취소, 종료까지 관리해야 한다면 실행기를 쓰는 편이 낫다.
작업은 작게 정의하고 실행 정책은 실행기에게 맡기는 구조가 자바 동시성 API의 핵심이다.

## 참고

- [MangKyu's Diary - Callable, Future 및 Executors, Executor, ExecutorService, ScheduledExecutorService에 대한 이해 및 사용법](https://mangkyu.tistory.com/259)
