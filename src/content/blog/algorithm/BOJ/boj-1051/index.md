---
visible: false
title: "1051 숫자 정사각형"
date: 2025-02-04 18:00:00
tags: 
  - Algorithm
---


## 숫자 정사각형

[백준 1051번 숫자 정사각형](https://www.acmicpc.net/problem/1051)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 25921 | 11944 | 10155 | 46.780% |

### 문제

N×M크기의 직사각형이 있다. 각 칸에는 한 자리 숫자가 적혀 있다. 이 직사각형에서 꼭짓점에 쓰여 있는 수가 모두 같은 가장 큰 정사각형을 찾는 프로그램을 작성하시오. 이때, 정사각형은 행 또는 열에 평행해야 한다.

### 입력

첫째 줄에 N과 M이 주어진다. N과 M은 50보다 작거나 같은 자연수이다. 둘째 줄부터 N개의 줄에 수가 주어진다.

### 출력

첫째 줄에 정답 정사각형의 크기를 출력한다.

---

## 풀이

이 문제는 우선 완전 탐색 알고리즘으로 구현에만 집중을 했다. 구현에는 정사각형을 이루는 조건만 검증하면 간단하다. 정사각형을 이루는 조건은 4개의 꼭짓점이 같은 숫자인지 확인하는 것이다. 
이 부분에 대해선 다음과 같이 해결했다.

```java
for (int k = 1; k < Math.min(n, m); k++) {
    if (i+k < n && j+k < m) {
        if (map[i][j] == map[i][j+k] &&
            map[i][j+k] == map[i+k][j+k] &&
            map[i+k][j+k] == map[i+k][j]) {
                max = (int) Math.max(max, Math.pow(k + 1, 2));
        }
    }
}
```

잠깐 헤메었던 부분은 평소에 문자열 파싱을 할 때, `StirngTokenizer`을 사용해서 이번에도 사용했지만, 처음엔 에러가 났다.
디버그 모드로 돌려보니 전혀 tokenization 하지 못하고 있던 것이었다.
그래서 잘 parameter로 empty를 delimiter로 넘겨주었는데, 이것 또한 안되었다.
이때 어? 뭐지 하다가 찾아보니 `StringTokenizer`는 delimiter를 최소 길이가 1인 문자열을 넘겨주어야 했다.
그래서 이 문제는 `StringTokenizer`가 아닌 그냥 `toCharArray`를 이용해 풀었다.
기존 코드에서 간단히 primitive type value에 대한 비교 였기에 `char`로 type casting을 해도 문제가 없었다.
이렇게 해서 완성된 코드를 제출하니 성공.. 다음에는 `StringTokenizer`를 사용할 때 delimiter에 대한 주의를 해야겠다.

```java
package test.code;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());

        int n = Integer.parseInt(tokenizer.nextToken());
        int m = Integer.parseInt(tokenizer.nextToken());

        char[][] map = new char[n][m];
        for (int i  = 0; i < n; i++) {
            map[i] = reader.readLine().toCharArray();
        }

        int max = 1;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                for (int k = 1; k < Math.min(n, m); k++) {
                    if (i+k < n && j+k < m) {
                        if (map[i][j] == map[i][j+k] &&
                                map[i][j+k] == map[i+k][j+k] &&
                                map[i+k][j+k] == map[i+k][j]) {
                            max = (int) Math.max(max, Math.pow(k + 1, 2));
                        }
                    }
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append(max);
        System.out.println(sb.toString().trim());
    }
}
```