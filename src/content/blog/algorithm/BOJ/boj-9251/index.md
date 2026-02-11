---
visible: false
title: "9251 LCS"
date: 2025-02-19 18:00:00
tags: 
  - Algorithm
---


## LCS

[백준 9251번 LCS](https://www.acmicpc.net/problem/9251)

| 시간 제한 | 메모리 제한 | 제출    | 정답    | 맞힌 사람 | 정답 비율   |
|:------|:-------|:------|:------|:------|:--------|
| 0.1 초 | 256 MB | 100941 | 42608 | 31180 | 41.497% |

### 문제

LCS(Longest Common Subsequence, 최장 공통 부분 수열)문제는 두 수열이 주어졌을 때, 모두의 부분 수열이 되는 수열 중 가장 긴 것을 찾는 문제이다.

예를 들어, ACAYKP와 CAPCAK의 LCS는 ACAK가 된다.

### 입력

첫째 줄과 둘째 줄에 두 문자열이 주어진다. 문자열은 알파벳 대문자로만 이루어져 있으며, 최대 1000글자로 이루어져 있다.

### 출력

첫째 줄에 입력으로 주어진 두 문자열의 LCS의 길이를 출력한다.

---

## 풀이

LCS(Longest Common Subsequence) 문제를 해결하기 위해 처음에는 전통적인 **2차원 DP 테이블**을 사용했지만, 메모리 사용량이 너무 커지는 문제가 있었다. 
그래서 **1차원 DP 배열**을 활용하는 방식으로 최적화하여 공간 복잡도를 `O(N*M)`에서 `O(N)`으로 줄였다. 
`prev[]`와 `current[]` 두 개의 배열을 사용해 이전 행과 현재 행만 유지하도록 했으며, 이를 **스왑 방식**으로 구현해 메모리 사용량을 절반으로 줄였다. 
LCS 길이 계산에서는 기존의 `dp[i][j]` 값을 갱신하는 방식에서 `Math.max()`를 활용해 불필요한 조건문을 줄이며 연산량을 최적화했다. 
결국, 공간 복잡도를 줄이면서도 시간 복잡도 `O(N*M)`을 유지한 채 더 빠른 실행 속도로 구현할 수 있었다.

```java
import java.nio.Buffer;

class NQueenSolver {
    private final int N;
    private int count;
    private final int[] board;

    public NQueenSolver(int n) {
        this.N = n;
        this.board = new int[N];
        this.count = 0;
    }

    public void solve() {
        int half = (N % 2 == 0) ? (N / 2) : (N / 2 + 1);
        for (int col = 0; col < half; col++) {
            board[0] = col;
            placeQueen(1);
        }
        count *= 2;  // 대칭 적용
        if (N % 2 != 0)
            count -= removeDuplicatedCases();
    }

    private void placeQueen(int row) {
        if (row == N) {
            count++;
            return;
        }
        for (int col = 0; col < N; col++) {
            if (isSafe(row, col)) {
                board[row] = col;
                placeQueen(row + 1);
            }
        }
    }

    private boolean isSafe(int row, int col) {
        for (int prevRow = 0; prevRow < row; prevRow++) {
            int prevCol = board[prevRow];
            if (prevCol == col || Math.abs(prevCol - col) == Math.abs(prevRow - row)) {
                return false;
            }
        }
        return true;
    }

    private int removeDuplicatedCases() {
        int centerCol = N / 2;
        board[0] = centerCol;
        count = 0;
        placeQueen(1);
        return count;
    }

    public int getSolutionCount() {
        return count;
    }
}

public class Main {
    public static void main(String[] args) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int N = Integer.parseInt(reader.readLine());
        NQueenSolver solver = new NQueenSolver(N);
        solver.solve();
        System.out.println(solver.getSolutionCount());
    }
}

```