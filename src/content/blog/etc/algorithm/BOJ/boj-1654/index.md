---
visible: false
title: "1654 랜선 자르기"
date: 2025-01-14 18:00:00
tags: 
  - Algorithm
---


## 랜선 자르기
[백준 1654번 랜선 자르기](https://www.acmicpc.net/problem/1654)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 256 MB | 254208 | 61202 | 41370 | 21.687% |

### 문제

집에서 시간을 보내던 오영식은 박성원의 부름을 받고 급히 달려왔다. 
박성원이 캠프 때 쓸 N개의 랜선을 만들어야 하는데 너무 바빠서 영식이에게 도움을 청했다. <br>

이미 오영식은 자체적으로 K개의 랜선을 가지고 있다. 
그러나 K개의 랜선은 길이가 제각각이다. 
박성원은 랜선을 모두 N개의 같은 길이의 랜선으로 만들고 싶었기 때문에 K개의 랜선을 잘라서 만들어야 한다. 
예를 들어 300cm 짜리 랜선에서 140cm 짜리 랜선을 두 개 잘라내면 20cm는 버려야 한다. (이미 자른 랜선은 붙일 수 없다.) <br>

편의를 위해 랜선을 자르거나 만들 때 손실되는 길이는 없다고 가정하며, 기존의 K개의 랜선으로 N개의 랜선을 만들 수 없는 경우는 없다고 가정하자. 
그리고 자를 때는 항상 센티미터 단위로 정수길이만큼 자른다고 가정하자. 
N개보다 많이 만드는 것도 N개를 만드는 것에 포함된다. 
이때 만들 수 있는 최대 랜선의 길이를 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에는 오영식이 이미 가지고 있는 랜선의 개수 K, 그리고 필요한 랜선의 개수 N이 입력된다. 
K는 1이상 10,000이하의 정수이고, N은 1이상 1,000,000이하의 정수이다. 
그리고 항상 K ≦ N 이다. 그 후 K줄에 걸쳐 이미 가지고 있는 각 랜선의 길이가 센티미터 단위의 정수로 입력된다. 
랜선의 길이는 231-1보다 작거나 같은 자연수이다.

### 출력

첫째 줄에 N개를 만들 수 있는 랜선의 최대 길이를 센티미터 단위의 정수로 출력한다.

---

## 풀이

랜선 자르기 문제는 탐색 알고리즘을 사용해 해결해야 하는 전형적인 문제다. 
문제를 분석해 보면, 랜선의 최대 길이를 구하기 위해 어떤 탐색 알고리즘을 선택해야 할지 판단해야 한다. 
시간 제한과 탐색해야 할 범위를 고려했을 때, 이 문제는 이분 탐색(Binary Search)을 사용해야 효율적으로 해결할 수 있다.

단순히 순차 탐색(Linear Search)을 사용하는 경우, 
랜선의 개수 $K$는 최대 $10^4$과 필요한 랜선의 개수 $N$이 최대 $10^6$까지 주어질 수 있으므로 
최악의 경우 $O(K \times N)$의 시간이 소요된다. 
이는 약 $10^{10}$번의 연산으로, 현실적으로 시간 제한에 걸리게 된다. 
따라서 더 나은 시간 복잡도를 제공하는 이분 탐색을 사용하는 것이 적합합니다. 
이분 탐색은 $O(K \cdot \log M)$의 시간 복잡도를 가지며, 여기서 $M$은 가장 긴 랜선의 길이다.

이분 탐색을 적용하기 위해서는 다음과 같은 과정이 필요하다.

### 랜선 길이의 범위 설정
- 최소 길이는 $1$, 최대 길이는 주어진 랜선 길이 중 가장 긴 값으로 설정한다.
- 중간값을 기준으로 탐색하며 범위를 점점 좁혀간다.

### 랜선 자르기 개수 계산
- 현재 중간값으로 랜선을 자를 경우 몇 개의 랜선을 만들 수 있는지 계산한다.
- 필요한 랜선 개수 $N$ 이상을 만들 수 있는 경우, 더 긴 길이를 탐색한다.
- 필요한 랜선 개수 $N$ 미만인 경우, 더 짧은 길이를 탐색한다.

### 결과 저장
- 조건을 만족하는 경우, 중간값을 최적의 값으로 저장하고 탐색이 끝날 때까지 반복한다.


```java
package test.code;

import java.io.*;
import java.util.*;

class LanCableCutter {
    private final int number;
    private final int target;
    private final long[] cables;

    private LanCableCutter(int number, int target, long[] cables) {
        this.number = number;
        this.target = target;
        this.cables = cables;
    }

    public static LanCableCutter from(int number, int target, long[] cables) {
        return new LanCableCutter(number, target, cables);
    }

    private long getMax() {
        return Arrays.stream(cables).max().getAsLong();
    }

    private long cut() {
        long min = 1;
        long max = getMax();
        long length = 0;

        while(min <= max) {
            long count = 0;
            long mid = (min + max ) / 2;
            for(int i = 0; i < number; i++) {
                count += cables[i] / mid;
            }
            if (count >= target) {
                length = mid;
                min = mid + 1;
            } else {
                max = mid - 1;
            }
        }

        return length;
    }

    public void getResult() {
        System.out.println(cut());
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int number = Integer.parseInt(tokenizer.nextToken());
        int target = Integer.parseInt(tokenizer.nextToken());
        long[] array = new long[number];
        for (int i = 0; i < number; i++){
            array[i] = Long.parseLong(reader.readLine());
        }
        LanCableCutter.from(number, target, array).getResult();
    }
}
```