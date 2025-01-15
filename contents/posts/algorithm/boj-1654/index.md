---
title: "1654 랜선 자르기"
date: 2024-11-05 18:00:00
tags: 
  - Algorithm
---


## 랜선 자르기
[랜선 자르기 링크](https://www.acmicpc.net/problem/1654)

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

## 풀이

문제를 보면 해당 문제는 탐색 알고리즘을 사용해서 해결하라는 것을 알 수 있다.
어떤 탐색 알고리즘을 사용하냐는 시간제한과 실제 탐색해야할 개수를 보고 선택해야 한다.
내가 생각한 건 2가지 방식이다.
하나는 순차 탐색하여 해결하는 방식과 나머지 하나는 이분 탐색으로 해결하는 방식이다.
직접 탐색에 경우는 `N`과 `M`이 각가 최대 $10^6$이므로 단순히 순차 탐색(Linear Search)을 하면 최악의 경우 $O(N \times M)$의 시간이 소요된다.
이렇게 하면 $10^6 \times 10^6(ms) \approx 166(s)$이므로 시간 제한에 걸린다.
따라서, 이보다 더 빠른 $O(M \log N)$ 복잡도를 가진 이분 탐색(Binary Search)로 구현을 필요로 한다.

이분 탐색은 정렬된 배열에서만 사용해야하기에 `수첩1`의 데이터를 정렬하고 `수첩2`의 데이터를 탐색하는 코드를 구현했다.


```java
package test.code;

import java.io.*;
import java.util.*;

class Notebook {
    private final int[] numbers;

    Notebook(int count, String input, boolean shouldSort) {
        int[] numbers = new int[count];
        numbers = Arrays.stream(input.split(" ")).mapToInt(Integer::parseInt).toArray();
        if (shouldSort) {
            Arrays.sort(numbers);
        }
        this.numbers = numbers;
    }

    public static Notebook from(int count, String text, boolean shouldSort) {
        return new Notebook(count, text, shouldSort);
    }

    public int[] getNumbers() {
        return numbers;
    }

    public boolean contains(int number) {
        return Arrays.binarySearch(numbers, number) >= 0;
    }
}

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int T = Integer.parseInt(br.readLine()); // 테스트케이스 개수
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < T; i++) {
            int N = Integer.parseInt(br.readLine());
            Notebook notebook1 = Notebook.from(N, br.readLine(), true);// 수첩 1
            int M = Integer.parseInt(br.readLine());
            Notebook notebook2 = Notebook.from(M, br.readLine(), false);// 수첩 2

            StringBuilder sb = new StringBuilder();

            for(int number : notebook2.getNumbers()) {
                if(notebook1.contains(number)) {
                    sb.append(1).append("\n");
                } else {
                    sb.append(0).append("\n");
                }
            }
            result.append(sb);
        }
        System.out.println(result);
    }
}
```