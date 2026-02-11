---
visible: false
title: "2212 센서"
date: 2025-02-17 20:50:00
tags: 
  - Algorithm
---


## 센서

[2212번: 센서](https://www.acmicpc.net/problem/2212)


| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 19143 | 9890 | 8069 | 50.921% |

### 문제

한국도로공사는 고속도로의 유비쿼터스화를 위해 고속도로 위에 N개의 센서를 설치하였다. 문제는 이 센서들이 수집한 자료들을 모으고 분석할 몇 개의 집중국을 세우는 일인데, 예산상의 문제로, 고속도로 위에 최대 K개의 집중국을 세울 수 있다고 한다.

각 집중국은 센서의 수신 가능 영역을 조절할 수 있다. 집중국의 수신 가능 영역은 고속도로 상에서 연결된 구간으로 나타나게 된다. N개의 센서가 적어도 하나의 집중국과는 통신이 가능해야 하며, 집중국의 유지비 문제로 인해 각 집중국의 수신 가능 영역의 길이의 합을 최소화해야 한다.

편의를 위해 고속도로는 평면상의 직선이라고 가정하고, 센서들은 이 직선 위의 한 기점인 원점으로부터의 정수 거리의 위치에 놓여 있다고 하자. 따라서, 각 센서의 좌표는 정수 하나로 표현된다. 이 상황에서 각 집중국의 수신 가능영역의 거리의 합의 최솟값을 구하는 프로그램을 작성하시오. 단, 집중국의 수신 가능영역의 길이는 0 이상이며 모든 센서의 좌표가 다를 필요는 없다.

### 입력

첫째 줄에 센서의 개수 N(1 ≤ N ≤ 10,000), 둘째 줄에 집중국의 개수 K(1 ≤ K ≤ 1000)가 주어진다. 셋째 줄에는 N개의 센서의 좌표가 한 개의 정수로 N개 주어진다. 각 좌표 사이에는 빈 칸이 하나 있으며, 좌표의 절댓값은 1,000,000 이하이다.

### 출력

첫째 줄에 문제에서 설명한 최대 K개의 집중국의 수신 가능 영역의 길이의 합의 최솟값을 출력한다.

---

## 풀이

우선 입력 데이터 개수를 보고, 시간 복잡도를 생각해봤다.
N은 최대 10,000이고, K는 최대 1000이다.
N이 10,000이고, K가 1000이므로, O(N^2)의 시간 복잡도로 풀면 시간 초과가 날 것이다.
그래서 O(NlogN)의 시간 복잡도로 풀어야 한다.
자료형 또한 최대 1,000,000이므로 int형으로 충분하다.
즉, 문제는 센서의 좌표를 입력받아 정렬하고, 각 센서 사이의 거리를 구한 뒤, 가장 큰 거리부터 K-1개를 제외한 나머지 거리를 더하면 된다.
하지만 주의 해야할 부분이 있는데, K가 N보다 크거나 같을 경우에는 0을 출력하면 된다.


```java
package test.code;

import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(System.out));

        int n = Integer.parseInt(reader.readLine()); // 센서의 갯수
        int k = Integer.parseInt(reader.readLine()); // 집중국의 갯수
        //if k >= n then print 0 and exit.
        if(k >= n) {
            System.out.println(0);
            return;
        }

        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());
        int[] sensors = new int[n];
        for(int i = 0; i < n; i++) {
            sensors[i] = Integer.parseInt(tokenizer.nextToken());
        }
        Arrays.sort(sensors);

        Integer[] distances = new Integer[n-1];
        for(int i = 0; i < n-1; i++)
            distances[i] = sensors[i+1] - sensors[i];

        Arrays.sort(distances, Collections.reverseOrder());

        int result = 0;
        for(int i = k-1; i < n-1; i++) {
            result += distances[i];
        }


        writer.write(result + "\n");

        writer.flush();
        writer.close();
        reader.close();
    }
}
```