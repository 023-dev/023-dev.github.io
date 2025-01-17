---
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

문제의 시간 제한은 1초이다. 입력으로 주어지는 좌표의 개수는 최대 100,000개이다.
그리고 탐색을 하여 몇개의 점이 선분위에 위치하는지 요구하는 문제인 것을 알 수 있다.
그래서 이 문제는 이분 탐색 방식을 사용하고자 했다.
문제 지문을 자세히 보고 생각난 풀이법은 백준 1654번 문제를 해결하기 위한 Upper Bound와 Lower Bound를 사용하는 방법을 사용하는 것을 떠올렸다.
Upper Bound로 선분의 끝점보다 큰 점의 인덱스를 찾고, Lower Bound로 선분의 시작점보다 크거나 같은 점의 인덱스를 찾아서 두 인덱스의 차이를 구하면 된다.
그리고 저번 문제에서 실수한 long 타입을 사용하지 않아서 발생한 오류를 방지하기 위해 long 타입을 사용했다.

```java
package test.code;

import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int N = Integer.parseInt(tokenizer.nextToken());// 나무의 수 1 <= N <= 1,000,000
        long target = Integer.parseInt(tokenizer.nextToken());// 나무의 길이 1 <= target <= 2,000,000,000
        long[] trees = new long[N];
        tokenizer = new StringTokenizer(reader.readLine());
        for (int i = 0; i < N; i++) {
            trees[i] = Integer.parseInt(tokenizer.nextToken());
        }
        Arrays.sort(trees);
        long min = 1;
        long max = trees[trees.length - 1];
        long result = 0;
        while (min < max) {
            long mid = (min + max) / 2;
            long height = 0;

            for (int index = 0; index < N; index++) {
                if(trees[index] > mid) {
                    height += trees[index] - mid;
                }
            }

            if (height >= target) {
                result = mid;
                min = mid + 1;
            } else {
                max = mid - 1;
            }
        }
        StringBuilder output = new StringBuilder();
        output.append(result);
        System.out.println(output);
    }
}
```