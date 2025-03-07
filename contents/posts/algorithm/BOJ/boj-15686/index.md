---
title: "15686 치킨 배달"
date: 2025-02-07 18:00:00
tags: 
  - Algorithm
---


## 치킨 배달

[백준 15686번 치킨 배달](https://www.acmicpc.net/problem/15686)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 512 MB | 102036 | 50626 | 30573 | 46.376% |

### 문제

크기가 N×N인 도시가 있다. 도시는 1×1크기의 칸으로 나누어져 있다. 도시의 각 칸은 빈 칸, 치킨집, 집 중 하나이다. 도시의 칸은 (r, c)와 같은 형태로 나타내고, r행 c열 또는 위에서부터 r번째 칸, 왼쪽에서부터 c번째 칸을 의미한다. r과 c는 1부터 시작한다.

이 도시에 사는 사람들은 치킨을 매우 좋아한다. 따라서, 사람들은 "치킨 거리"라는 말을 주로 사용한다. 치킨 거리는 집과 가장 가까운 치킨집 사이의 거리이다. 즉, 치킨 거리는 집을 기준으로 정해지며, 각각의 집은 치킨 거리를 가지고 있다. 도시의 치킨 거리는 모든 집의 치킨 거리의 합이다.

임의의 두 칸 (r1, c1)과 (r2, c2) 사이의 거리는 |r1-r2| + |c1-c2|로 구한다.

예를 들어, 아래와 같은 지도를 갖는 도시를 살펴보자.

```java
0 2 0 1 0
1 0 1 0 0
0 0 0 0 0
0 0 0 1 1
0 0 0 1 2
```

0은 빈 칸, 1은 집, 2는 치킨집이다.

(2, 1)에 있는 집과 (1, 2)에 있는 치킨집과의 거리는 |2-1| + |1-2| = 2, (5, 5)에 있는 치킨집과의 거리는 |2-5| + |1-5| = 7이다. 따라서, (2, 1)에 있는 집의 치킨 거리는 2이다.

(5, 4)에 있는 집과 (1, 2)에 있는 치킨집과의 거리는 |5-1| + |4-2| = 6, (5, 5)에 있는 치킨집과의 거리는 |5-5| + |4-5| = 1이다. 따라서, (5, 4)에 있는 집의 치킨 거리는 1이다.

이 도시에 있는 치킨집은 모두 같은 프랜차이즈이다. 프렌차이즈 본사에서는 수익을 증가시키기 위해 일부 치킨집을 폐업시키려고 한다. 오랜 연구 끝에 이 도시에서 가장 수익을 많이 낼 수 있는  치킨집의 개수는 최대 M개라는 사실을 알아내었다.

도시에 있는 치킨집 중에서 최대 M개를 고르고, 나머지 치킨집은 모두 폐업시켜야 한다. 어떻게 고르면, 도시의 치킨 거리가 가장 작게 될지 구하는 프로그램을 작성하시오.
        
### 입력

첫째 줄에 N(2 ≤ N ≤ 50)과 M(1 ≤ M ≤ 13)이 주어진다.

둘째 줄부터 N개의 줄에는 도시의 정보가 주어진다.

도시의 정보는 0, 1, 2로 이루어져 있고, 0은 빈 칸, 1은 집, 2는 치킨집을 의미한다. 집의 개수는 2N개를 넘지 않으며, 적어도 1개는 존재한다. 치킨집의 개수는 M보다 크거나 같고, 13보다 작거나 같다.

### 출력

첫째 줄에 폐업시키지 않을 치킨집을 최대 M개를 골랐을 때, 도시의 치킨 거리의 최솟값을 출력한다.

---

## 풀이

이 문제는 도시의 치킨 거리를 최소화하는 **조합 최적화 문제**로, 
M개의 치킨집을 선택하는 **백트래킹(조합)**을 활용하여 해결했다. 
먼저, 도시의 정보를 객체 지향적으로 모델링하여 `City`, `House`, `ChickenStore` 클래스를 정의하고, 
각각의 역할을 명확히 분리했다. 조합을 활용하여 가능한 모든 치킨집 조합을 생성하고, 선택된 치킨집들에 대해 도시의 치킨 거리를 계산하는 방식으로 진행했다. 거리 계산은 각 집이 가장 가까운 치킨집까지의 맨해튼 거리를 구하여 합산하는 방식이며, 이를 `Stream API`를 활용하여 간결하게 구현했다. 전체적인 시간 복잡도는 \( C(13, M) \times O(N^2) \)로, 최악의 경우에도 치킨집 개수가 13개 이하로 제한되므로 충분히 해결 가능했다. 이를 통해 객체 지향적인 구조를 유지하면서도 효율적인 탐색이 가능하도록 최적화된 풀이를 도출할 수 있었다.

```java
package test.code;

import java.util.*;

class City {
    private final int size;
    private final List<House> houses;
    private final List<ChickenStore> chickenStores;

    public City(int size) {
        this.size = size;
        this.houses = new ArrayList<>();
        this.chickenStores = new ArrayList<>();
    }

    public void addHouse(int r, int c) {
        houses.add(new House(r, c));
    }

    public void addChickenStore(int r, int c) {
        chickenStores.add(new ChickenStore(r, c));
    }

    public int calculateMinChickenDistance(List<ChickenStore> selectedStores) {
        int totalDistance = 0;
        for (House house : houses) {
            totalDistance += house.getMinDistance(selectedStores);
        }
        return totalDistance;
    }

    public List<ChickenStore> getChickenStores() {
        return chickenStores;
    }
}

class House {
    private final int row;
    private final int col;

    public House(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getMinDistance(List<ChickenStore> stores) {
        return stores.stream()
                .mapToInt(store -> store.getDistance(this))
                .min()
                .orElse(Integer.MAX_VALUE);
    }

    public int getDistanceTo(House house) {
        return Math.abs(this.row - house.row) + Math.abs(this.col - house.col);
    }
}

class ChickenStore {
    private final int row;
    private final int col;

    public ChickenStore(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getDistance(House otherHouse) {
        House thisHouse = new House(this.row, this.col);
        return thisHouse.getDistanceTo(otherHouse);
    }
}

public class Main {
    private static int N, M;
    private static City city;
    private static int minDistance = Integer.MAX_VALUE;

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        N = scanner.nextInt();
        M = scanner.nextInt();
        city = new City(N);

        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                int type = scanner.nextInt();
                if (type == 1) {
                    city.addHouse(i, j);
                } else if (type == 2) {
                    city.addChickenStore(i, j);
                }
            }
        }
        scanner.close();

        selectChickenStores(0, new ArrayList<>(), 0);
        System.out.println(minDistance);
    }

    private static void selectChickenStores(int start, List<ChickenStore> selected, int count) {
        if (count == M) {
            minDistance = Math.min(minDistance, city.calculateMinChickenDistance(selected));
            return;
        }

        List<ChickenStore> chickenStores = city.getChickenStores();
        for (int i = start; i < chickenStores.size(); i++) {
            selected.add(chickenStores.get(i));
            selectChickenStores(i + 1, selected, count + 1);
            selected.remove(selected.size() - 1);
        }
    }
}
```