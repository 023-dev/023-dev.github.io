---
visible: false
title: "11053 가장 긴 증가하는 부분 수열"
date: 2025-02-18 18:00:00
tags: 
  - Algorithm
---


## 가장 긴 증가하는 부분 수열

[11053번: 가장 긴 증가하는 부분 수열](https://www.acmicpc.net/problem/11053)


| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 1 초   | 256 MB | 187720 | 76040 | 50446 | 38.364% |

### 문제

수열 A가 주어졌을 때, 가장 긴 증가하는 부분 수열을 구하는 프로그램을 작성하시오.

예를 들어, 수열 A = {10, 20, 10, 30, 20, 50} 인 경우에 가장 긴 증가하는 부분 수열은 A = {**10**, **20**, 10, **30**, 20, **50**} 이고, 길이는 4이다.

### 입력

첫째 줄에 수열 A의 크기 N (1 ≤ N ≤ 1,000)이 주어진다.

둘째 줄에는 수열 A를 이루고 있는 Ai가 주어진다. (1 ≤ Ai ≤ 1,000)

### 출력

첫째 줄에 수열 A의 가장 긴 증가하는 부분 수열의 길이를 출력한다.

---

## 풀이

가장 긴 증가하는 부분 수열을 구하는 문제이다.
접근 방식은 다음과 같다.
먼저 입력 데이터 개수를 보고, 시간 복잡도를 생각해봤다.
N은 최대 1,000이고, 수열 A의 크기 N이므로, O(N^2)의 시간 복잡도로 풀면 시간 초과가 날 것이다.
그래서 O(NlogN)의 시간 복잡도로 풀어야 한다.
자료형 또한 최대 1,000이므로 int형으로 충분하다.
다시 문제로 돌아와서 요구사항을 보면 수열 A를 입력받아 가장 긴 증가하는 부분 수열의 길이를 출력하면 된다.
시간 복잡도를 고려해 봤을 때 이 문제는 이진 탐색을 사용하여 풀 수 있다.
이진 탐색을 사용하여 풀기 위해서는 다음과 같은 방법을 사용한다.
수열 A의 각 원소를 순회하면서, 현재 원소보다 작은 원소가 있으면 그 원소의 값에 1을 더한 값으로 현재 원소의 값을 갱신해준다.
이렇게 하면 수열 A의 각 원소를 순회하면서 가장 긴 증가하는 부분 수열의 길이를 구할 수 있다.


```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));
        int n = Integer.parseInt(reader.readLine());
        int[] numbers = new int[n];

        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        for (int i = 0; i < N; i++) {
            numbers[i] = Integer.parseInt(tokenizer.nextToken());
        }

        ArrayList<Integer> list = new ArrayList<>();

        for (int number : numbers) {
            if (list.isEmpty() || list.get(lis.size() - 1) < number) {
                list.add(number);
            } else {
                int pos = Collections.binarySearch(list, num);
                if (pos < 0) pos = -(pos + 1);
                lis.set(pos, number);
            }
        }
        writer.write(lis.size() + "\n");
            
        writer.flush();
        writer.close();
    }
}
```