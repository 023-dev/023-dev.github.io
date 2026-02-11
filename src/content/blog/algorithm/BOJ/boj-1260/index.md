---
visible: false
title: "1260 DFS와 BFS"
date: 2025-01-20 18:00:00
tags: 
  - Algorithm
---


## DFS와 BFS
[백준 1260번 DFS와 BFS](https://www.acmicpc.net/problem/2110)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 315827 | 125581 | 74304 | 38.332% |

### 문제

그래프를 DFS로 탐색한 결과와 BFS로 탐색한 결과를 출력하는 프로그램을 작성하시오. 
단, 방문할 수 있는 정점이 여러 개인 경우에는 정점 번호가 작은 것을 먼저 방문하고, 
더 이상 방문할 수 있는 점이 없는 경우 종료한다. 정점 번호는 1번부터 N번까지이다.

### 입력

첫째 줄에 정점의 개수 $N(1 ≤ N ≤ 1,000)$, $간선의 개수 M(1 ≤ M ≤ 10,000)$, 
탐색을 시작할 정점의 번호 V가 주어진다. 
다음 M개의 줄에는 간선이 연결하는 두 정점의 번호가 주어진다. 
어떤 두 정점 사이에 여러 개의 간선이 있을 수 있다. 
입력으로 주어지는 간선은 양방향이다.

### 출력

첫째 줄에 DFS를 수행한 결과를, 그 다음 줄에는 BFS를 수행한 결과를 출력한다. 
V부터 방문된 점을 순서대로 출력하면 된다.

---

## 풀이

이 문제는 그래프를 DFS와 BFS로 탐색한 결과를 출력하는 문제이다.
DFS와 BFS는 각각 스택과 큐를 활용하여 구현할 수 있으며,
이를 위해 각 정점의 연결 정보를 저장하는 인접 리스트를 활용한다.
먼저 DFS는 재귀 호출을 통해 구현하며, 방문한 정점을 스택에 저장하여
스택이 빌 때까지 반복하여 탐색한다.
BFS는 큐를 활용하여 구현하며, 방문한 정점을 큐에 저장하여
큐가 빌 때까지 반복하여 탐색한다.


```java
package test.code;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int N = Integer.parseInt(tokenizer.nextToken());//정점의 개수
        int M = Integer.parseInt(tokenizer.nextToken());//간선의 개수
        int V = Integer.parseInt(tokenizer.nextToken());//시작 정점

        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i <= N; i++) {
            graph.add(new ArrayList<>());
        }

        for (int i = 0; i < M; i++) {
            tokenizer = new StringTokenizer(reader.readLine());
            int a = Integer.parseInt(tokenizer.nextToken());
            int b = Integer.parseInt(tokenizer.nextToken());
            graph.get(a).add(b);
            graph.get(b).add(a);
        }

        for (int i = 0; i <= N; i++) {
            Collections.sort(graph.get(i));
        }

        boolean[] visited = new boolean[N+1];
        dfs(graph, V, visited);

        System.out.println();

        bfs(graph, V);


    }

    private static void dfs(List<List<Integer>> graph, int V, boolean[] visited) {
        visited[V] = true;
        System.out.print(V + " ");

        for (int adjacent : graph.get(V)) {
            if (!visited[adjacent]) {
                dfs(graph, adjacent, visited);
            }
        }
    }

    private static void bfs(List<List<Integer>> graph, int V) {
        boolean[] visited = new boolean[graph.size()];
        Queue<Integer> queue = new LinkedList<>();

        queue.add(V);
        visited[V] = true;

        while (!queue.isEmpty()) {
            int current = queue.poll();
            System.out.print(current + " ");

            for (int adjacent : graph.get(current)) {
                if (!visited[adjacent]) {
                    queue.add(adjacent);
                    visited[adjacent] = true;
                }
            }
        }
    }
}
```