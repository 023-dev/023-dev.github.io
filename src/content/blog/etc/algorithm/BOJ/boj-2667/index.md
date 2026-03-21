---
visible: false
title: "2667 단지번호붙이기"
date: 2025-01-22 15:00:00
tags: 
  - Algorithm
---

## 단지번호붙이기
[백준 2667 단지번호붙이기](https://www.acmicpc.net/problem/2667)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 128 MB | 205711 | 93257 | 59242 | 43.144% |

### 문제

<그림 1>과 같이 정사각형 모양의 지도가 있다. 
1은 집이 있는 곳을, 0은 집이 없는 곳을 나타낸다. 
철수는 이 지도를 가지고 연결된 집의 모임인 단지를 정의하고, 단지에 번호를 붙이려 한다. 
여기서 연결되었다는 것은 어떤 집이 좌우, 혹은 아래위로 다른 집이 있는 경우를 말한다. 
대각선상에 집이 있는 경우는 연결된 것이 아니다. 
<그림 2>는 <그림 1>을 단지별로 번호를 붙인 것이다. 
지도를 입력하여 단지수를 출력하고, 각 단지에 속하는 집의 수를 오름차순으로 정렬하여 출력하는 프로그램을 작성하시오.

![](img.png)

### 입력

첫 번째 줄에는 지도의 크기 $N$(정사각형이므로 가로와 세로의 크기는 같으며 $5≤N≤25$)이 입력되고, 그 다음 N줄에는 각각 $N$개의 자료($0$혹은 $1$)가 입력된다.

### 출력

첫 번째 줄에는 총 단지수를 출력하시오. 그리고 각 단지내 집의 수를 오름차순으로 정렬하여 한 줄에 하나씩 출력하시오.

---

## 풀이

이 문제는 `N x N` 크기의 지도에서 단지를 찾아내고, 각 단지에 속하는 집의 개수를 계산하는 문제였다. 
지도는 2차원 배열로 표현하고, BFS(너비 우선 탐색)를 활용해 연결된 집을 탐색하고 단지를 구성했다. 
탐색 과정에서는 특정 좌표에서 상하좌우로 인접한 좌표를 확인하며, 
지도 범위를 벗어나지 않고 방문하지 않았으며 집(`1`)이 있는 경우에만 탐색을 이어간다. 
이를 위해 `Position` 클래스를 통해 좌표를 표현하고,
`HouseComplex` 클래스에서 탐색과 단지 크기 계산 로직을 캡슐화했다. 
BFS를 사용한 이유는 큐(Queue)를 활용한 탐색 흐름이 DFS보다 직관적이고, 
방문 상태를 관리하기 쉽고, 스택 오버플로우와 같은 위험을 방지할 수 있기 때문이었다. 
탐색 중에는 중복 방문을 방지하기 위해 `visited` 배열을 활용했고, 
모든 단지를 탐색한 뒤 단지 크기를 오름차순으로 정렬하여 출력한다. 
해결 과정에서 발생할 수 있는 문제로는 잘못된 인접 좌표 계산, 
방문 상태 관리 누락, 단지 크기 누적 오류 같은 실수를 방지하기 위해
범위를 검증하는 `isInBounds` 메서드, 
방문 상태를 확인하는 `isUnvisited` 메서드, 
방문 처리를 위한 `markVisited` 메서드를 통해 탐색 로직에 안정성 더했다. 

```java
package test.code;

import java.io.*;
import java.util.*;

class Position {
    private final int y;
    private final int x;

    private Position(int y, int x) {
        this.y = y;
        this.x = x;
    }

    public static Position of(int y, int x) {
        return new Position(y, x);
    }

    public int getY() {
        return y;
    }

    public int getX() {
        return x;
    }
}

class HouseComplex {
    private final int [][] map;
    private final boolean [][] visited;
    private final int size;
    private final List<Integer> complexSizes;

    private HouseComplex(int size, int [][] map) {
        this.size = size;
        this.map = map;
        this.visited = new boolean[size][size];
        this.complexSizes = new ArrayList<>();
    }

    public static HouseComplex of(int size, int [][] map) {
        return new HouseComplex(size, map);
    }

    public void findComplexes(){
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if(map[y][x] == 1 && !visited[y][x]) {
                    int complexSize = exploreComplex(y, x);
                    complexSizes.add(complexSize);
                }
            }
        }
        Collections.sort(complexSizes);
    }

    private int exploreComplex(int y, int x) {
        Queue<Position> queue = new LinkedList<>();

        queue.offer(Position.of(y, x));
        visited[y][x] = true;
        int size = 0;

        while (!queue.isEmpty()) {
            Position currentPosition = queue.poll();
            size++;

            for (Position position : getAdjacentPositionsFrom(currentPosition)) {
                if (isInBounds(position) && isHouse(position) && isUnvisited(position)) {
                    queue.offer(position);
                    markVisited(position);
                }
            }
        }
        return size;
    }

    private boolean isHouse(Position position) {
        return map[position.getY()][position.getX()] == 1;
    }
    private boolean isInBounds(Position position) {
        return position.getX() >= 0 && position.getX() < size && position.getY() >= 0 && position.getY() < size;
    }
    private boolean isUnvisited(Position position) {
        return !visited[position.getY()][position.getX()];
    }
    private void markVisited(Position position) {
        visited[position.getY()][position.getX()] = true;
    }

    private List<Position> getAdjacentPositionsFrom(Position position) {
        List<Position> positions = new ArrayList<>();
        int y = position.getY();
        int x = position.getX();
        positions.add(Position.of(y + 1, x));
        positions.add(Position.of(y - 1, x));
        positions.add(Position.of(y, x + 1));
        positions.add(Position.of(y, x - 1));
        return positions;
    }

    public int getComplexCount() {
        return complexSizes.size();
    }

    public List<Integer> getComplexSizes() {
        return complexSizes;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int size = Integer.parseInt(reader.readLine());
        int [][] map = new int[size][size];

        for (int y = 0; y < size; y++) {
            String line = reader.readLine();
            for (int x = 0; x < size; x++) {
                map[y][x] = parseInt(line, x);
            }
        }

        HouseComplex complex = HouseComplex.of(size, map);
        complex.findComplexes();

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(complex.getComplexCount() + "\n");
        for (int complexSize : complex.getComplexSizes()) {
            writer.write(complexSize + "\n");
        }
        writer.flush();
        writer.close();
    }

    private static int parseInt(String string, int index) {
        return string.charAt(index) - '0';
    }
}

```