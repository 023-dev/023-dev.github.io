---
visible: false
title: "2110 공유기 설치"
date: 2025-01-19 18:00:00
tags: 
  - Algorithm
---


## 공유기 설치
[백준 2110번 공유기 설치](https://www.acmicpc.net/problem/2110)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 83981 | 30721 | 21201 | 37.071% |

### 문제

도현이의 집 N개가 수직선 위에 있다. 
각각의 집의 좌표는 $x_{1}, ..., x_{N}$ 이고, 집 여러개가 같은 좌표를 가지는 일은 없다.<br>

도현이는 언제 어디서나 와이파이를 즐기기 위해서 집에 공유기 C개를 설치하려고 한다. 
최대한 많은 곳에서 와이파이를 사용하려고 하기 때문에, 한 집에는 공유기를 하나만 설치할 수 있고, 
가장 인접한 두 공유기 사이의 거리를 가능한 크게 하여 설치하려고 한다. <br>

C개의 공유기를 N개의 집에 적당히 설치해서, 가장 인접한 두 공유기 사이의 거리를 최대로 하는 프로그램을 작성하시오.<br>

### 입력

첫째 줄에 집의 개수 $N (2 ≤ N ≤ 200,000)$과 공유기의 개수 $C (2 ≤ C ≤ N)$이 하나 이상의 빈 칸을 사이에 두고 주어진다. 
둘째 줄부터 $N$개의 줄에는 집의 좌표를 나타내는 $x_{i} (0 ≤ x_{i} ≤ 1,000,000,000)$가 한 줄에 하나씩 주어진다.

### 출력

첫째 줄에 가장 인접한 두 공유기 사이의 최대 거리를 출력한다.

---

## 풀이

이 문제는 집의 좌표가 주어졌을 때, 가장 인접한 두 공유기 사이의 거리를 최대로 하는 값을 구하는 문제이다. 
접근 방식은 이진 탐색과 정렬을 활용하며, 먼저 집의 좌표를 정렬한 뒤 가능한 거리의 범위를 최소 거리와 최대 거리로 설정한다. 
이때 최소 거리는 항상 $1$, 최대 거리는 정렬된 좌표의 최댓값과 최솟값의 차이로 초기화한다. 
이진 탐색을 통해 현재 거리(`mid`)가 주어졌을 때,
공유기를 설치할 수 있는지 판단하는 함수(`canInstall`)로 설치 가능한지 확인을 한다. 
이 함수는 첫 번째 집에 공유기를 설치한 후, 
현재 거리 조건을 만족하는 다음 위치에 공유기를 설치하며, 
이렇게 설치한 공유기의 수가 목표 개수 이상인지 확인한다. 
만약 설치 가능하다면 현재 거리를 결과로 저장하고 더 큰 거리를 탐색하며, 
불가능하다면 거리를 줄여 탐색을 계속한다. 최종적으로 이진 탐색이 종료되면, 
저장된 최대 거리를 출력하여 문제를 해결한다. 
이와 같은 방식은 정렬에 $(O(N \log N)$, 
탐색에 $O(\log(max\_distance) \times N)$이 소요된 시간복잡도를 가진다.


```java
package test.code;


import java.io.*;
import java.util.*;

class House implements Comparable<House> {
    private final long cooridnate;

    private House (long cooridnate) {
        this.cooridnate = cooridnate;
    }

    public static House of(long cooridnate) {
        return new House(cooridnate);
    }

    @Override
    public int compareTo(House other) {
        return Long.compare(this.cooridnate, other.cooridnate);
    }

    public long minusTo(House other) {
        return this.cooridnate - other.cooridnate;
    }
}

class RouterInstaller {
    private final List<House> houses;
    private final int routes;

    private RouterInstaller(List<House> houses, int routes) {
        Collections.sort(houses);
        this.houses = houses;
        this.routes = routes;
    }

    public static RouterInstaller of(List<House> houeses, int routes) {
        return new RouterInstaller(houeses, routes);
    }

    private long getMaxDistance() {
        long left = 1;
        long right = houses.get(houses.size() - 1).minusTo(houses.get(0));
        long result = 0;
        while (left <= right) {
            long mid = (left + right) / 2;

            if (canInstall(mid)) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }

    private boolean canInstall(long distance) {
        int count = 1;
        House lastInstalledHouse = houses.get(0);

        for (int i = 1; i< houses.size(); i++) {
            if (houses.get(i).minusTo(lastInstalledHouse) >= distance ) {
                count++;
                lastInstalledHouse = houses.get(i);
                if (count >= routes) {
                    return true;
                }
            }
        }
        return false;
    }

    public void printDistance() {
        System.out.println(getMaxDistance());
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int number = Integer.parseInt(tokenizer.nextToken());
        int routes = Integer.parseInt(tokenizer.nextToken());
        List<House> houses = new ArrayList<>();

        for (int i = 0; i < number; i++) {
            houses.add(House.of(Long.parseLong(reader.readLine())));
        }

        RouterInstaller.of(houses, routes).printDistance();
    }
}
```