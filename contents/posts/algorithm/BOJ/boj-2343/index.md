---
title: "2343 기타 레슨"
date: 2025-01-16 18:00:00
tags: 
  - Algorithm
---


## 랜선 자르기
[백준 1654번 랜선 자르기](https://www.acmicpc.net/problem/1654)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 41659 | 14728 | 10194 | 33.343% |

### 문제

강토는 자신의 기타 강의 동영상을 블루레이로 만들어 판매하려고 한다. 
블루레이에는 총 N개의 강의가 들어가는데, 블루레이를 녹화할 때, 강의의 순서가 바뀌면 안 된다. 
순서가 뒤바뀌는 경우에는 강의의 흐름이 끊겨, 학생들이 대혼란에 빠질 수 있기 때문이다. 
즉, i번 강의와 j번 강의를 같은 블루레이에 녹화하려면 i와 j 사이의 모든 강의도 같은 블루레이에 녹화해야 한다.<br>

강토는 이 블루레이가 얼마나 팔릴지 아직 알 수 없기 때문에, 블루레이의 개수를 가급적 줄이려고 한다. 
오랜 고민 끝에 강토는 M개의 블루레이에 모든 기타 강의 동영상을 녹화하기로 했다. 
이때, 블루레이의 크기(녹화 가능한 길이)를 최소로 하려고 한다. 
단, M개의 블루레이는 모두 같은 크기이어야 한다.<br>

강토의 각 강의의 길이가 분 단위(자연수)로 주어진다. 
이때, 가능한 블루레이의 크기 중 최소를 구하는 프로그램을 작성하시오.<br>

### 입력

첫째 줄에 강의의 수 N (1 ≤ N ≤ 100,000)과 M (1 ≤ M ≤ N)이 주어진다. 
다음 줄에는 강토의 기타 강의의 길이가 강의 순서대로 분 단위로(자연수)로 주어진다. 
각 강의의 길이는 10,000분을 넘지 않는다.

### 출력

첫째 줄에 가능한 블루레이 크기중 최소를 출력한다.

---

## 풀이

이 문제는 이분 탐색(Binary Search)을 활용하여 최적의 블루레이 크기를 찾는 방식으로 해결할 수 있었다. 
강의는 순서를 바꿀 수 없으며, 강의 길이의 합을 기준으로 블루레이 크기를 최소화해야 한다. 
블루레이 크기의 최소값은 가장 긴 강의의 길이이며, 최대값은 모든 강의 길이의 합으로 설정한다. 
이분 탐색을 통해 블루레이 크기를 조정하며, 
각 중간값(mid)을 블루레이 크기로 설정하고 M개의 블루레이에 강의를 나눌 수 있는지 확인한다. 
현재 블루레이 크기(mid)로 강의를 순서대로 배치하다가 크기를 초과하면 새로운 블루레이를 사용하며, 
사용된 블루레이 개수가 M개를 초과하면 더 큰 크기를 탐색하고, M개 이하로 나눌 수 있다면 크기를 줄이는 방향으로 탐색한다. 
`findMinimumSize` 메서드는 이 과정을 통해 최소 블루레이 크기를 계산하며, 
`canDivide` 메서드는 특정 크기에서 M개의 블루레이로 나눌 수 있는지 여부를 판단한다.

```java
import java.util.*;

class BluRayManager {
    private int[] lectures;
    private int maxLecture;
    private int sumLectures;

    private BluRayManager(int[] lectures) {
        this.lectures = lectures;
        this.maxLecture = Arrays.stream(lectures).max().orElse(0);
        this.sumLectures = Arrays.stream(lectures).sum();
    }
    
    public static BluRayManager from(int[] lectures) {
        return new BluRayManager(lectures);
    }

    public int findMinimumSize(int m) {
        int left = maxLecture;
        int right = sumLectures;
        int result = right;

        while (left <= right) {
            int mid = (left + right) / 2;

            if (canDivide(mid, m)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        return result;
    }
    
    private boolean canDivide(int size, int m) {
        int count = 1;
        int currentSum = 0;

        for (int lecture : lectures) {
            if (currentSum + lecture > size) {
                count++;
                currentSum = lecture;

                if (count > m) {
                    return false;
                }
            } else {
                currentSum += lecture;
            }
        }

        return true;
    }
    
    public void printResult() {
        System.out.println(findMinimumSize(m));
    }
}

public class Main {
    public static void main(String[] args) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer tokenizer = new StringTokenizer(reader.readLine());

        int N = Integer.parseInt(tokenizer.nextToken());
        int M = Integer.parseInt(tokenizer.nextToken());
        
        int[] lectures = new int[N];
        tokenizer = new StringTokenizer(reader.readLine());
        for (int i = 0; i < N; i++) {
            lectures[i] = Integer.parseInt(tokenizer.nextToken());
        }

        BluRayManager.from(lectures).printResult();
    }
}
```