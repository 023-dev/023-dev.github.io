---
title: "2512 예산"
date: 2025-01-15 18:00:00
tags: 
  - Algorithm
---

## 예산
[백준 2512번 예산](https://www.acmicpc.net/problem/2512)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 128 MB | 66885 | 25609 | 18686 | 37.058% |

### 문제

국가의 역할 중 하나는 여러 지방의 예산요청을 심사하여 국가의 예산을 분배하는 것이다. 
국가예산의 총액은 미리 정해져 있어서 모든 예산요청을 배정해 주기는 어려울 수도 있다. 
그래서 정해진 총액 이하에서 **가능한 한 최대의** 총 예산을 다음과 같은 방법으로 배정한다.

1. 모든 요청이 배정될 수 있는 경우에는 요청한 금액을 그대로 배정한다.
2. 모든 요청이 배정될 수 없는 경우에는 특정한 **정수** 상한액을 계산하여 그 이상인 예산요청에는 모두 상한액을 배정한다. 상한액 이하의 예산요청에 대해서는 요청한 금액을 그대로 배정한다.

예를 들어, 전체 국가예산이 485이고 4개 지방의 예산요청이 각각 120, 110, 140, 150이라고 하자. 
이 경우, 상한액을 127로 잡으면, 위의 요청들에 대해서 각각 120, 110, 127, 127을 배정하고 그 합이 484로 가능한 최대가 된다.

여러 지방의 예산요청과 국가예산의 총액이 주어졌을 때, 위의 조건을 모두 만족하도록 예산을 배정하는 프로그램을 작성하시오.

### 입력

첫째 줄에는 지방의 수를 의미하는 정수 $N$이 주어진다. 
$N$은 $3$ 이상 $10,000$ 이하이다. 
다음 줄에는 각 지방의 예산요청을 표현하는 $N$개의 정수가 빈칸을 사이에 두고 주어진다. 
이 값들은 모두 $1$ 이상 $100,000$ 이하이다. 
그 다음 줄에는 총 예산을 나타내는 정수 $M$이 주어진다. $M$은 $N$ 이상 $1,000,000,000$ 이하이다.

### 출력

첫째 줄에는 배정된 예산들 중 최댓값인 정수를 출력한다.

---

## 풀이

문제의 시간 제한은 1초이다.
문제를 보면 최적화 문제로 보인다.
그리고 최솟값을 위한 최적화이기에 `Upper Bound`를 사용하면 될 것 같았다.
총 예산 보다 적게 배정한다면 쉽게 구할 수 있을 것 같았다.

```java
package test.code;

import java.io.*;
import java.util.*;

class BudgetDistributor {
    private final long[] budgetRequests;
    private final long totalBudget;

    private BudgetDistributor(long[] budgetRequests, long totalBudget) {
        Arrays.sort(budgetRequests);
        this.budgetRequests = budgetRequests;
        this.totalBudget = totalBudget;
    }

    public static BudgetDistributor of(long[] budgetRequests, long totalBudget) {
        return new BudgetDistributor(budgetRequests, totalBudget);
    }

    public long getMaxBudget() {
        long left = 1;
        long right = budgetRequests[budgetRequests.length - 1];
        long result = 0;
        while (left <= right) {
            long mid = (left + right) / 2;
            long currentBudget = 0;

            for (long budgetRequest : budgetRequests) {
                currentBudget += Math.min(mid, budgetRequest);
            }

            if (currentBudget <= totalBudget) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(reader.readLine());

        long[] requests = new long[n];
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        for (int i = 0; i < n; i++) {
            requests[i] = Long.parseLong(tokenizer.nextToken());
        }

        long m = Long.parseLong(reader.readLine());

        reader.close();

        long result = BudgetDistributor.of(requests, m).getMaxBudget();

        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        writer.write(result + "\n");
        writer.flush();
        writer.close();
    }
}
```