---
title: "1697 숨바꼭질"
date: 2025-01-21 18:00:00
tags: 
  - Algorithm
---

## 숨바꼭질
[백준 1697번 숨바꼭질](https://www.acmicpc.net/problem/1697)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 273995 | 81767 | 52098 | 26.282% |

### 문제

수빈이는 동생과 숨바꼭질을 하고 있다. 수빈이는 현재 점 $N(0 ≤ N ≤ 100,000)$에 있고, 
동생은 점 $K(0 ≤ K ≤ 100,000)$에 있다. 수빈이는 걷거나 순간이동을 할 수 있다. 
만약, 수빈이의 위치가 X일 때 걷는다면 1초 후에 $X-1$ 또는 $X+1$로 이동하게 된다. <br>

순간이동을 하는 경우에는 1초 후에 $2 \times X$의 위치로 이동하게 된다.
수빈이와 동생의 위치가 주어졌을 때, 수빈이가 동생을 찾을 수 있는 가장 빠른 시간이 몇 초 후인지 구하는 프로그램을 작성하시오.

### 입력

첫 번째 줄에 수빈이가 있는 위치 $N$과 동생이 있는 위치 $K$가 주어진다. $N$과 $K$는 정수이다.

### 출력

수빈이가 동생을 찾는 가장 빠른 시간을 출력한다.

---

## 풀이

이 문제는 BFS를 응용해서 풀 수 있는 문제로 봤다.
`Queue`에서 `poll`한 값에 대해 `-1`, `+1`, `*2`를 해서 `K`와 같은 값이 나오면 `result`를 반환하는 방식으로 구상을 했다.
근데 제출할 때마다 `시간 초과`가 나와서 확인해보니 `visited` 부분에 `reverse` 처리를 해주지 않아서 그랬다.
그래서 `queue`에 `add`하는 부분에서 `visited`를 `true`로 처리하는 방식으로 수정을 했다.

위와 같이 수정 후, 제출을 했지만 이번엔 `IndexOutOfBoundsException`이 나오게 되었다.
이 부분에 대해서는 많은 고민을 했다. 
처음에는 그냥 `K`가 아닌가 했다가, `Integer.MAX_VALUE`로 해야하나 했다가, 
근데 문제를 다시 읽어보니 $100000$까지 이길래 `visited`의 크기를 `100001`로 설정했더니 해결되었다.

다음번에도 이런 문제가 나오면 `visited`의 크기를 잘 설정해야겠다.

```java
package test.code;

import java.io.*;
import java.util.*;

class HideAndSeek {
    private final int maxPosition = 100_000;
    private final boolean[] visited;
    private final int startPosition;
    private final int endPosition;

    private HideAndSeek(int startPosition, int endPosition) {
        this.visited = new boolean[maxPosition + 1];
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }

    public static HideAndSeek of (int startPosition, int endPosition) {
        return new HideAndSeek(startPosition, endPosition);
    }

    private static final class State {
        private final int position;
        private final int time;

        private State(int position, int time) {
            this.position = position;
            this.time = time;
        }

        public static State of(int position, int time) {
            return new State(position, time);
        }

        public int previousPosition() {
            return position - 1;
        }

        public int nextPosition() {
            return position + 1;
        }

        public int doublePosition() {
            return position * 2;
        }

        public int increaseTime() {
            return time + 1;
        }
    }

    private boolean canMoveTo(int position) {
        return position >= 0 && position <= maxPosition;
    }

    private boolean isUnvisited(int position) {
        return !visited[position];
    }

    private boolean hasReached(int position) {
        return position == endPosition;
    }

    private int findShortestTime() {
        if (startPosition == endPosition) {
            return 0;
        }

        Queue<State> queue = new LinkedList<>();
        queue.offer(State.of(startPosition, 0));
        visited[startPosition] = true;

        while (!queue.isEmpty()) {
            State current = queue.poll();

            int[] nextPositions = {current.previousPosition(), current.nextPosition(), current.doublePosition()};
            for (int nextPosition : nextPositions) {
                if (canMoveTo(nextPosition) && isUnvisited(nextPosition)) {
                    if (hasReached(nextPosition)) {
                        return current.increaseTime();
                    }
                    queue.offer(State.of(nextPosition, current.increaseTime()));
                    visited[nextPosition] = true;
                }
            }
        }
        return -1;
    }

    public int getResult() {
        return findShortestTime();
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int n = Integer.parseInt(tokenizer.nextToken());
        int k = Integer.parseInt(tokenizer.nextToken());

        reader.close();

        int result = HideAndSeek.of(n, k).getResult();

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result + "\n");
        writer.flush();
        writer.close();
    }
}
```