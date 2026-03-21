---
visible: false
title: "1707 이분 그래프"
date: 2025-01-24 00:34:00
tags: 
  - Algorithm
---


## 이분 그래프

[백준 1707번 이분 그래프](https://www.acmicpc.net/problem/1707)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 256 MB | 106990 | 29772 | 18509 | 24.959% |

### 문제

그래프의 정점의 집합을 둘로 분할하여, 
각 집합에 속한 정점끼리는 서로 인접하지 않도록 분할할 수 있을 때, 
그러한 그래프를 특별히 이분 그래프 (Bipartite Graph) 라 부른다.

그래프가 입력으로 주어졌을 때, 
이 그래프가 이분 그래프인지 아닌지 판별하는 프로그램을 작성하시오.

### 입력

입력은 여러 개의 테스트 케이스로 구성되어 있는데, 
첫째 줄에 테스트 케이스의 개수 $K(2 ≤ K ≤ 5)$가 주어진다. 
각 테스트 케이스의 첫째 줄에는 그래프의 정점의 개수 $V(1 ≤ V ≤ 20,000)$와 간선의 개수 $E(1 ≤ E ≤ 200,000)$가 빈 칸을 사이에 두고 순서대로 주어진다. 
각 정점에는 1부터 $V$까지 차례로 번호가 붙어 있다. 
이어서 둘째 줄부터 E개의 줄에 걸쳐 간선에 대한 정보가 주어지는데,
각 줄에 인접한 두 정점의 번호 $u, v (u ≠ v)$가 빈 칸을 사이에 두고 주어진다.

### 출력

$K$개의 줄에 걸쳐 입력으로 주어진 그래프가 이분 그래프이면 YES, 아니면 NO를 순서대로 출력한다.

---

## 풀이

이 문제는 그래프가 이분 그래프인지 확인하는 문제로, 
BFS(너비 우선 탐색)를 사용하여 각 정점을 두 개의 집합으로 나눌 수 있는지 판단하는 방식으로 해결했다.
이분 그래프의 정의에 따라, 인접한 정점끼리는 서로 다른 집합에 속해야 하므로, 
탐색 중 색을 번갈아가며 정점을 색칠하면서 조건을 확인했다. 
그래프가 여러 연결 요소로 나뉘어 있을 수 있기 때문에, 
방문하지 않은 모든 정점에서 BFS를 수행하도록 했고, 
탐색 도중 색이 충돌하면 이분 그래프가 아니라고 판단했다.
무방향 그래프라는 조건에 맞게 간선을 양방향으로 추가했고, 
색칠 정보를 효율적으로 관리하기 위해 배열을 사용했다. 
이를 통해 각 테스트 케이스마다 주어진 그래프가 이분 그래프인지 "YES" 또는 "NO"로 출력하도록 구현했다.

```java
package test.code;

import java.io.*;
import java.util.*;

class BipartiteGraph {
    private int nodes;
    private List<List<Integer>> adjacents;

    private BipartiteGraph(int nodes) {
        this.nodes = nodes;
        this.adjacents = new ArrayList<>();
        for (int index = 0; index <= nodes; index++) {
            this.adjacents.add(new ArrayList<>());
        }
    }

    public static BipartiteGraph of(int node) {
        return new BipartiteGraph(node);
    }

    public void addEdge(int parent, int child) {
        this.adjacents.get(parent).add(child);
        this.adjacents.get(child).add(parent);
    }

    public boolean isBipartite() {
        List<Integer> colors = new ArrayList<>(Collections.nCopies(nodes + 1, -1));

        for (int node = 1; node <= nodes; node++) {
            if ( colors.get(node) == -1) {
                if (!bfs(node, colors)) {
                    return false;
                }
            }
        }

        return true;
    }

    private boolean bfs (int node, List<Integer> colors) {
        Queue<Integer> queue = new LinkedList<>();
        queue.offer(node);
        colors.set(node, 0);

        while(!queue.isEmpty()) {
            int parent = queue.poll();

            for (int child : this.adjacents.get(parent)) {
                if (colors.get(child) == - 1) {
                    queue.offer(child);
                    colors.set(child, 1 - colors.get(parent));
                } else if (colors.get(child) == colors.get(parent)) {
                    return false;
                }
            }
        }
        return true;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        int number = Integer.parseInt(reader.readLine());
        StringBuilder result = new StringBuilder();
        while(number --> 0) {
            StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
            int nodes = Integer.parseInt(tokenizer.nextToken());
            int edges = Integer.parseInt(tokenizer.nextToken());

            BipartiteGraph graph = BipartiteGraph.of(nodes);

            while(edges --> 0) {
                tokenizer = new StringTokenizer(reader.readLine());
                int parent = Integer.parseInt(tokenizer.nextToken());
                int child = Integer.parseInt(tokenizer.nextToken());
                graph.addEdge(parent, child);
            }

            result.append(graph.isBipartite()? "YES" : "NO").append("\n");
        }

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result.toString());
        writer.flush();
        writer.close();
    }
}

```