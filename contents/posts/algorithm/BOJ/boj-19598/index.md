---
title: "19598 최소 회의실 개수"
date: 2025-02-15 03:30:00
tags: 
  - Algorithm
---


## 최소 회의실 개수

[백준 19598번 최소 회의실 개수](https://www.acmicpc.net/problem/19598)

| 시간 제한 | 메모리 제한 | 제출   | 정답   | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-----|:-----|:------|:--------|
| 2 초   | 256 MB | 9412 | 4203 | 3245  | 44.698% |

### 문제

서준이는 아빠로부터 N개의 회의를 모두 진행할 수 있는 최소 회의실 개수를 구하라는 미션을 받았다. 각 회의는 시작 시간과 끝나는 시간이 주어지고 한 회의실에서 동시에 두 개 이상의 회의가 진행될 수 없다. 단, 회의는 한번 시작되면 중간에 중단될 수 없으며 한 회의가 끝나는 것과 동시에 다음 회의가 시작될 수 있다. 회의의 시작 시간은 끝나는 시간보다 항상 작다. N이 너무 커서 괴로워 하는 우리 서준이를 도와주자.

### 입력

첫째 줄에 배열의 크기 N(1 ≤ N ≤ 100,000)이 주어진다. 둘째 줄부터 N+1 줄까지 공백을 사이에 두고 회의의 시작시간과 끝나는 시간이 주어진다. 시작 시간과 끝나는 시간은 231−1보다 작거나 같은 자연수 또는 0이다.

### 출력

첫째 줄에 최소 회의실 개수를 출력한다.

---

## 풀이


```java
package test.code;

import java.util.*;
import java.io.*;

public class Main {
    static int N;
    static PriorityQueue<Time> pq;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        N = Integer.parseInt(br.readLine());
        pq = new PriorityQueue<>();

        for (int i = 0; i < N; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            pq.add(new Time(Integer.parseInt(st.nextToken()), true)); // 시작시간
            pq.add(new Time(Integer.parseInt(st.nextToken()), false)); // 종료시간
        }

        int cnt = 0; // 회의실 개수
        int answer = 0; // 최대값

        while (!pq.isEmpty()) {
            Time t = pq.poll();

            if (t.isStart) {
                cnt++;
                answer = Math.max(cnt, answer);
            }
            else {
                cnt--;
            }
        }

        System.out.println(answer);
    }

    static class Time implements Comparable<Time>{
        int time;
        boolean isStart;

        public Time(int time, boolean isStart) {
            this.time = time;
            this.isStart = isStart;
        }

        @Override
        public int compareTo(Time o) {
            return this.time - o.time;
        }
    }
}
```