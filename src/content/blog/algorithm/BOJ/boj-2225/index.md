---
visible: false
title: "2225 합분해"
date: 2025-02-20 18:00:00
tags: 
  - Algorithm
---


## 합분해

[백준 2225번 합분해](https://www.acmicpc.net/problem/2225)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 51202 | 23406 | 17432 | 44.397% |

### 문제

0부터 N까지의 정수 K개를 더해서 그 합이 N이 되는 경우의 수를 구하는 프로그램을 작성하시오.

덧셈의 순서가 바뀐 경우는 다른 경우로 센다(1+2와 2+1은 서로 다른 경우). 또한 한 개의 수를 여러 번 쓸 수도 있다.

### 입력

첫째 줄에 두 정수 N(1 ≤ N ≤ 200), K(1 ≤ K ≤ 200)가 주어진다.

### 출력

첫째 줄에 답을 1,000,000,000으로 나눈 나머지를 출력한다.

---

## 풀이

이 문제를 풀면서 처음에는 단순한 재귀로 접근하려 했지만, 중복 계산이 많아 비효율적이라는 걸 깨달았다. 
그래서 동적 계획법(DP)으로 접근하여 `dp[k][n]`을 "K개의 정수를 사용하여 합이 N이 되는 경우의 수"로 정의했다. 
점화식은 `dp[k][n] = dp[k-1][n] + dp[k][n-1]`을 활용하여 누적 합 방식으로 최적화할 수 있었고, 
이를 통해 O(K * N)의 시간 복잡도를 갖는 효율적인 풀이가 가능했다.


```java
package test.code;

import java.io.*;
import java.util.*;

public class Main {
    static final int MOD = 1_000_000_000;

    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));

        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int N = Integer.parseInt(tokenizer.nextToken());
        int K = Integer.parseInt(tokenizer.nextToken());

        int[][] dp = new int[K + 1][N + 1];

        for (int i = 0; i <= N; i++) {
            dp[1][i] = 1;
        }

        for (int k = 2; k <= K; k++) {
            for (int n = 0; n <= N; n++) {
                dp[k][n] = dp[k - 1][n];
                if (n > 0) dp[k][n] = (dp[k][n] + dp[k][n - 1]) % MOD;
            }
        }

        writer.write(dp[K][N] + "\n");
        writer.flush();
        reader.close();
        writer.close();
    }
}

```