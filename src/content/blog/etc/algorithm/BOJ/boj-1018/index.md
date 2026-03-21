---
visible: false
title: "1018 체스판 다시 칠하기"
date: 2025-02-03 18:00:00
tags: 
  - Algorithm
---


## 체스판 다시 칠하기

[백준 1018번 체스판 다시 칠하기](https://www.acmicpc.net/problem/1018)

| 시간 제한 | 메모리 제한 | 제출     | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:-------|:------|:------|:--------|
| 2 초   | 128 MB | 141306 | 71100 | 56615 | 50.245% |

### 문제

지민이는 자신의 저택에서 MN개의 단위 정사각형으로 나누어져 있는 M×N 크기의 보드를 찾았다. 어떤 정사각형은 검은색으로 칠해져 있고, 나머지는 흰색으로 칠해져 있다. 지민이는 이 보드를 잘라서 8×8 크기의 체스판으로 만들려고 한다.

체스판은 검은색과 흰색이 번갈아서 칠해져 있어야 한다. 구체적으로, 각 칸이 검은색과 흰색 중 하나로 색칠되어 있고, 변을 공유하는 두 개의 사각형은 다른 색으로 칠해져 있어야 한다. 따라서 이 정의를 따르면 체스판을 색칠하는 경우는 두 가지뿐이다. 하나는 맨 왼쪽 위 칸이 흰색인 경우, 하나는 검은색인 경우이다.

보드가 체스판처럼 칠해져 있다는 보장이 없어서, 지민이는 8×8 크기의 체스판으로 잘라낸 후에 몇 개의 정사각형을 다시 칠해야겠다고 생각했다. 당연히 8*8 크기는 아무데서나 골라도 된다. 지민이가 다시 칠해야 하는 정사각형의 최소 개수를 구하는 프로그램을 작성하시오.

### 입력

첫째 줄에 N과 M이 주어진다. N과 M은 8보다 크거나 같고, 50보다 작거나 같은 자연수이다. 둘째 줄부터 N개의 줄에는 보드의 각 행의 상태가 주어진다. B는 검은색이며, W는 흰색이다.

### 출력

첫째 줄에 지민이가 다시 칠해야 하는 정사각형 개수의 최솟값을 출력한다.

---

## 풀이

체스판 다시 칠하기 문제를 풀면서 가장 먼저 떠올린 방법은 8×8 크기의 체스판을 만들 수 있는 모든 경우를 탐색하는 것이었다. 보드에서 가능한 모든 8×8 영역을 잘라낸 후, 각 영역을 두 가지 체스판 패턴(왼쪽 위가 W 또는 B)과 비교하여 다시 칠해야 하는 개수를 구했다. 처음에는 직접 체스판 패턴을 리스트로 만들어 비교하려고 했는데, `(i + j) % 2` 규칙을 활용하면 불필요한 비교 연산을 줄일 수 있다는 점을 깨달았다. 이렇게 하면 현재 좌표가 W여야 하는지 B여야 하는지를 쉽게 판별할 수 있었고, 두 패턴과의 차이를 계산해 최소 변경 횟수를 구할 수 있었다. 이 방식을 적용해서 `(N-7) × (M-7)` 개의 8×8 영역을 검사하고, 각 영역에서 필요한 최소 변경 횟수를 구한 후 전체 최솟값을 찾는 방식으로 구현했다. 코드의 시간 복잡도는 `O(NM)`이었고, 입력 크기가 최대 50×50이라 충분히 빠르게 동작했다. 결과적으로 원하는 답을 효율적으로 구할 수 있었고, 최적화도 자연스럽게 이루어졌다.

```java
import java.io.*;

public class Main {
    static char[][] board; // 입력받을 보드
    static int N, M; // 보드의 크기
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] size = br.readLine().split(" ");
        N = Integer.parseInt(size[0]);
        M = Integer.parseInt(size[1]);
        
        board = new char[N][M];
        for (int i = 0; i < N; i++) {
            board[i] = br.readLine().toCharArray();
        }
        
        int minRepaints = Integer.MAX_VALUE; // 최솟값 초기화
        
        // 8x8 체스판을 추출할 수 있는 모든 경우 탐색
        for (int i = 0; i <= N - 8; i++) {
            for (int j = 0; j <= M - 8; j++) {
                minRepaints = Math.min(minRepaints, countRepaints(i, j));
            }
        }
        
        System.out.println(minRepaints);
    }
    
    // (x, y)에서 시작하는 8x8 체스판을 다시 칠하는 최소 비용 계산
    public static int countRepaints(int x, int y) {
        int repaintW = 0; // W로 시작하는 체스판과 비교
        int repaintB = 0; // B로 시작하는 체스판과 비교

        // 8x8 체스판 검사
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                char currentColor = board[x + i][y + j];

                // 기준 체스판 패턴과 비교
                if ((i + j) % 2 == 0) { // 짝수 위치
                    if (currentColor != 'W') repaintW++; // 'W'가 아니면 다시 칠하기
                    if (currentColor != 'B') repaintB++; // 'B'가 아니면 다시 칠하기
                } else { // 홀수 위치
                    if (currentColor != 'B') repaintW++; // 'B'가 아니면 다시 칠하기
                    if (currentColor != 'W') repaintB++; // 'W'가 아니면 다시 칠하기
                }
            }
        }
        
        // W로 시작하는 경우와 B로 시작하는 경우 중 최소값 반환
        return Math.min(repaintW, repaintB);
    }
}

```