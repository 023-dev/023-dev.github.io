---
visible: false
title: "2805 나무 자르기"
date: 2025-01-16 18:00:00
tags: 
  - Algorithm
---

## 나무 자르기

[백준 2805번 나무 자르기](https://www.acmicpc.net/problem/2805)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 256 MB | 227847 | 68338 | 42397 | 26.636% |

### 문제

상근이는 나무 M미터가 필요하다. 
근처에 나무를 구입할 곳이 모두 망해버렸기 때문에, 정부에 벌목 허가를 요청했다. 
정부는 상근이네 집 근처의 나무 한 줄에 대한 벌목 허가를 내주었고, 상근이는 새로 구입한 목재절단기를 이용해서 나무를 구할것이다.<br>

목재절단기는 다음과 같이 동작한다. 
먼저, 상근이는 절단기에 높이 H를 지정해야 한다. 
높이를 지정하면 톱날이 땅으로부터 H미터 위로 올라간다. 
그 다음, 한 줄에 연속해있는 나무를 모두 절단해버린다. 
따라서, 높이가 H보다 큰 나무는 H 위의 부분이 잘릴 것이고, 낮은 나무는 잘리지 않을 것이다. 
예를 들어, 한 줄에 연속해있는 나무의 높이가 20, 15, 10, 17이라고 하자. 
상근이가 높이를 15로 지정했다면, 나무를 자른 뒤의 높이는 15, 15, 10, 15가 될 것이고, 
상근이는 길이가 5인 나무와 2인 나무를 들고 집에 갈 것이다. (총 7미터를 집에 들고 간다) 
절단기에 설정할 수 있는 높이는 양의 정수 또는 0이다.<br>

상근이는 환경에 매우 관심이 많기 때문에, 나무를 필요한 만큼만 집으로 가져가려고 한다. 
이때, 적어도 M미터의 나무를 집에 가져가기 위해서 절단기에 설정할 수 있는 높이의 최댓값을 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 나무의 수 N과 상근이가 집으로 가져가려고 하는 나무의 길이 M이 주어진다. 
(1 ≤ N ≤ 1,000,000, 1 ≤ M ≤ 2,000,000,000)<br>

둘째 줄에는 나무의 높이가 주어진다. 
나무의 높이의 합은 항상 M보다 크거나 같기 때문에, 상근이는 집에 필요한 나무를 항상 가져갈 수 있다. 
높이는 1,000,000,000보다 작거나 같은 양의 정수 또는 0이다.

### 출력

적어도 M미터의 나무를 집에 가져가기 위해서 절단기에 설정할 수 있는 높이의 최댓값을 출력한다.

---

## 풀이

이 문제는 나무의 높이를 기준으로 이분 탐색을 수행하여 필요한 나무 길이 이상을 얻을 수 있는 절단기 높이의 최댓값을 찾는 방식으로 접근한다. 
먼저, 입력으로 주어진 나무의 높이를 정렬하고, 절단기의 최소 높이 `0`과 최대 높이를 설정한 후, 이분 탐색을 시작한다. 
각 중간값(`mid`)에서 나무를 절단했을 때 잘린 나무의 총 길이를 계산하고, 이 길이가 목표 길이 이상이면 절단기 높이를 더 높게 설정하여 탐색 범위를 좁힌다. 
반대로, 목표 길이보다 작으면 절단기 높이를 낮추어 다시 탐색한다. 
탐색이 종료되면 최적의 절단기 높이를 출력하며, 시간 복잡도는 정렬 $(O(N \log N)$과 이분 탐색 $(O(N \log H)$을 합쳐 $(O(N \log N + N \log H)$로 효율적이다.

```java
package test.code;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

class Tree implements Comparable<Tree> {
    private long height;

    private Tree(long height) {
        this.height = height;
    }

    public static Tree of(long height) {
        return new Tree(height);
    }

    public long getHeight() {
        return height;
    }

    @Override
    public int compareTo(Tree other) {
        return Long.compare(this.height, other.height);
    }

    public long cutHeight(long other) {
        return this.height - other;
    }

    public boolean isCuttable(long midHeight) {
        return Long.compare(this.height, midHeight) > 0;
    }
}

class Trees {
    private List<Tree> trees;

    private Trees(List<Tree> trees) {
        this.trees = trees.stream().sorted().collect(Collectors.toList());
    }

    public static Trees of(List<Tree> trees) {
        return new Trees(trees);
    }

    public List<Tree> getTrees() {
        return trees;
    }

    public long getMaxHeight() {
        return trees.get(trees.size() - 1).getHeight();
    }

    public int size() {
        return trees.size();
    }
}

class TreeCutter {
    private Trees trees;
    private int target;

    private TreeCutter(Trees trees, int target) {
        this.trees = trees;
        this.target = target;
    }

    public static TreeCutter of(Trees trees, int target) {
        return new TreeCutter(trees, target);
    }

    private long cut() {
        long minHeight = 0;
        long maxHeight = trees.getMaxHeight();
        long result = 0;
        while (minHeight <= maxHeight) {
            long midHeight = (minHeight + maxHeight) / 2;
            long sumHeight = 0;

            for (Tree tree : trees.getTrees()) {
                if(tree.isCuttable(midHeight)) {
                    sumHeight += tree.cutHeight(midHeight);
                }
            }

            if (sumHeight >= target) {
                result = midHeight;
                minHeight = midHeight + 1;
            } else {
                maxHeight = midHeight - 1;
            }
        }
        return result;
    }

    public void printResult() {
        System.out.println(cut());
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int N = Integer.parseInt(tokenizer.nextToken());// 나무의 수 1 <= N <= 1,000,000
        int target = Integer.parseInt(tokenizer.nextToken());// 나무의 길이 1 <= target <= 2,000,000,000
        List<Tree> trees = new ArrayList<>();
        tokenizer = new StringTokenizer(reader.readLine());
        for (int i = 0; i < N; i++) {
            long height = Long.parseLong(tokenizer.nextToken());
            Tree tree = Tree.of(height);
            trees.add(tree);
        }
        TreeCutter.of(Trees.of(trees), target).printResult();
    }
}
```