---
title: "1697 숨바꼭질"
date: 2025-01-21 18:00:00
tags: 
  - Algorithm
---

## 예산
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
`Queue`에서 `poll`한 값에 대해 `-1`, `+1`, `*2`를 해서 `K`와 같은 값이 나오면 `result`를 반환하면 된다.

```java
package test.code;

import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int n = Integer.parseInt(tokenizer.nextToken());
        int k = Integer.parseInt(tokenizer.nextToken());

        reader.close();

        long result = bfsResult(n, k);

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result + "\n");
        writer.flush();
        writer.close();
    }

    private static long bfsResult(int n, int k) {
        Queue<Integer> queue = new LinkedList<>();
        boolean[] visited = new boolean[100001];
        long result = 0;

        queue.add(n);
        visited[n] = true;

        while (!queue.isEmpty()) {
            int size = queue.size();

            for (int i = 0; i < size; i++) {
                int current = queue.poll();

                if (current == k) {
                    return result;
                }

                if (current - 1 >= 0 && !visited[current - 1]) {
                    queue.add(current - 1);
                    visited[current - 1] = true;
                }

                if (current + 1 <= 100000 && !visited[current + 1]) {
                    queue.add(current + 1);
                    visited[current + 1] = true;
                }

                if (current * 2 <= 100000 && !visited[current * 2]) {
                    queue.add(current * 2);
                    visited[current * 2] = true;
                }
            }

            result++;
        }
        return result;
    }
}
```