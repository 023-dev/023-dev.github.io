---
title: "1325 효율적인 해킹"
date: 2025-02-03 18:00:00
tags: 
  - Algorithm
---


## 효율적인 해킹

[백준 1325번 효율적인 해킹](https://www.acmicpc.net/problem/1325)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 5 초   | 256 MB | 107393 | 16523 | 11108 | 18.941% |

### 문제

해커 김지민은 잘 알려진 어느 회사를 해킹하려고 한다. 이 회사는 N개의 컴퓨터로 이루어져 있다. 김지민은 귀찮기 때문에, 한 번의 해킹으로 여러 개의 컴퓨터를 해킹 할 수 있는 컴퓨터를 해킹하려고 한다.

이 회사의 컴퓨터는 신뢰하는 관계와, 신뢰하지 않는 관계로 이루어져 있는데, A가 B를 신뢰하는 경우에는 B를 해킹하면, A도 해킹할 수 있다는 소리다.

이 회사의 컴퓨터의 신뢰하는 관계가 주어졌을 때, 한 번에 가장 많은 컴퓨터를 해킹할 수 있는 컴퓨터의 번호를 출력하는 프로그램을 작성하시오.

### 입력

첫째 줄에, N과 M이 들어온다. N은 10,000보다 작거나 같은 자연수, M은 100,000보다 작거나 같은 자연수이다. 둘째 줄부터 M개의 줄에 신뢰하는 관계가 A B와 같은 형식으로 들어오며, "A가 B를 신뢰한다"를 의미한다. 컴퓨터는 1번부터 N번까지 번호가 하나씩 매겨져 있다.

### 출력

첫째 줄에, 김지민이 한 번에 가장 많은 컴퓨터를 해킹할 수 있는 컴퓨터의 번호를 오름차순으로 출력한다.

---

## 풀이



```java
import java.io.*;
import java.util.*;

public class EfficientHacking {
    static int N, M;
    static List<Integer>[] graph;
    static int[] hackCount; // 각 노드에서 해킹 가능한 개수 저장

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        N = Integer.parseInt(st.nextToken());
        M = Integer.parseInt(st.nextToken());

        graph = new ArrayList[N + 1];
        hackCount = new int[N + 1];

        for (int i = 1; i <= N; i++) {
            graph[i] = new ArrayList<>();
        }

        // 신뢰 관계 입력 받기
        for (int i = 0; i < M; i++) {
            st = new StringTokenizer(br.readLine());
            int A = Integer.parseInt(st.nextToken());
            int B = Integer.parseInt(st.nextToken());
            graph[B].add(A); // B를 해킹하면 A도 해킹됨
        }

        int maxCount = 0;
        List<Integer> result = new ArrayList<>();

        // 모든 노드에서 BFS 수행
        for (int i = 1; i <= N; i++) {
            int count = bfs(i);
            if (count > maxCount) {
                maxCount = count;
                result.clear();
                result.add(i);
            } else if (count == maxCount) {
                result.add(i);
            }
        }

        Collections.sort(result);
        StringBuilder sb = new StringBuilder();
        for (int num : result) {
            sb.append(num).append(" ");
        }

        System.out.println(sb.toString().trim());
    }

    // BFS를 이용해 해킹 가능한 컴퓨터 개수 계산
    static int bfs(int start) {
        Queue<Integer> queue = new LinkedList<>();
        boolean[] visited = new boolean[N + 1];

        queue.add(start);
        visited[start] = true;
        int count = 1; // 자기 자신 포함

        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int next : graph[node]) {
                if (!visited[next]) {
                    visited[next] = true;
                    queue.add(next);
                    count++;
                }
            }
        }
        return count;
    }
}

```