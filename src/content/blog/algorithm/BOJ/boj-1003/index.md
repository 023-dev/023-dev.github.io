---
title: "1003 피보나치 함수"
date: 2025-02-17 18:00:00
tags: 
  - Algorithm
---


## 피보나치 함수

[1003번: 피보나치 함수](https://www.acmicpc.net/problem/1003)


| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 141306 | 71100 | 56615 | 50.245% |

### 문제

다음 소스는 N번째 피보나치 수를 구하는 C++ 함수이다.

```cpp
int fibonacci(int n) {
    if (n == 0) {
        printf("0");
        return 0;
    } else if (n == 1) {
        printf("1");
        return 1;
    } else {
        return fibonacci(n‐1) + fibonacci(n‐2);
    }
}
```

fibonacci(3)을 호출하면 다음과 같은 일이 일어난다.

- fibonacci(3)은 fibonacci(2)와 fibonacci(1) (첫 번째 호출)을 호출한다. 
- fibonacci(2)는 fibonacci(1) (두 번째 호출)과 fibonacci(0)을 호출한다. 
- 두 번째 호출한 fibonacci(1)은 1을 출력하고 1을 리턴한다. 
- fibonacci(0)은 0을 출력하고, 0을 리턴한다. 
- fibonacci(2)는 fibonacci(1)과 fibonacci(0)의 결과를 얻고, 1을 리턴한다. 
- 첫 번째 호출한 fibonacci(1)은 1을 출력하고, 1을 리턴한다. 
- fibonacci(3)은 fibonacci(2)와 fibonacci(1)의 결과를 얻고, 2를 리턴한다.

1은 2번 출력되고, 0은 1번 출력된다. N이 주어졌을 때, fibonacci(N)을 호출했을 때, 0과 1이 각각 몇 번 출력되는지 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 테스트 케이스의 개수 T가 주어진다.

각 테스트 케이스는 한 줄로 이루어져 있고, N이 주어진다. N은 40보다 작거나 같은 자연수 또는 0이다.

### 출력

각 테스트 케이스마다 0이 출력되는 횟수와 1이 출력되는 횟수를 공백으로 구분해서 출력한다.

---

## 풀이

이 문제는 피보나치 수열을 재귀로 구현했을 때, 0과 1이 각각 몇 번 출력되는지 구하는 문제이다.
예전에 했던 방법이 떠올라서 바로 풀었다.
재귀를 안 쓰는 방식이라 복합적으로 복잡도의 계수가 줄어들 수 있다.
코드를 보면 무슨 의미인지 알기에 따로 풀이에 대한 설명은 필요 없을 것 같다.

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int T = Integer.parseInt(reader.readLine());

        int[] countZero = new int[41];
        int[] countOne = new int[41];

        countZero[0] = 1;
        countOne[0] = 0;
        countZero[1] = 0;
        countOne[1] = 1;

        for (int i = 2; i <= 40; i++) {
            countZero[i] = countZero[i - 1] + countZero[i - 2];
            countOne[i] = countOne[i - 1] + countOne[i - 2];
        }

        StringBuilder result = new StringBuilder();
        for (int t = 0; t < T; t++) {
            int N = Integer.parseInt(reader.readLine());
            result.append(countZero[N]).append(" ").append(countOne[N]).append("\n");
        }

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result + "\n");

        writer.flush();
        writer.close();
        reader.close();
    }
}
```