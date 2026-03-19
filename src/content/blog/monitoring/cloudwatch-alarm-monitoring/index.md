---
visible: true
title: "나는 항상 모니터링할 수 없다"
date: 2026-02-28 16:18:00
tags: ["Engineering", "DevOps"]
heroImage: "./image.png"
---

일전에 장애 대응을 위해 서버에 유지보수를 위해 모니터링을 도입했다.
 운영 중인 서비스 특성상 기능 개발, 버그 대응, 배포 등 여러 작업을 동시에 처리해야 했다. 그 과정에서 지표를 일일이 지속적으로 확인하는 모니터링 방식에는 분명한 한계가 있었다.
아직 일어나지 않은 장애를 예지할 수 있어야 했고, 일어난 장애에 대해서는 재빠른 대응을 했어야 했다.
그래서 이번 알림 시스템을 구축하게 되었다. 

## 그래서 어떤 데이터를 감시해야 할까?

현재 모니터링은 Grafana 대신 CloudWatch를 사용하고 있었고, 이미 기본적인 메트릭들은 수집하고 있었다.  

하지만 디스크 사용률(DiskUtilization)이나 메모리 사용률(MemoryUtilization)에 대해서도 수집해야하는 필요성을 느꼈고,  
CloudWatch Agent을 사용해서 커스텀 메트릭을 추가 수집했다.

```bash
systemctl status amazon-cloudwatch-agent
```

이후, CloudWatch Alarms을 통해 임계치 초과 감지 및 알림 트리거를 설정했다.
OK 6개, Warning 6개, Critical 6개로 총 18개의 알람 트리거를 설정했다.
해당 알람 트리거가 동작을 하면 설정한 SNS Topic으로 이벤트 전송을 한다.

## 트리거 데이터를 지지고 볶고..

알람이 발생하면 Amazon Simple Notification Service Topic으로 이벤트가 전달된다. 문제는 이 이벤트가 그대로는 사람이 읽기 어렵다는 점이었다. 메트릭 중심의 데이터라서 “그래서 지금 뭐가 문제인지”가 한 번에 들어오지 않았다.

그래서 중간에 **AWS Lambda**를 두고, 이벤트를 우리가 이해할 수 있는 메시지로 재구성해서 처리해야 했다.
이를 위해 Lambda를 이용했고, 메트릭을 받으면 메시지를 지지고 볶아서 우리에게 필요한 정보들로 구성한 메시지를 생성했다.

```javascript
export const buildMessage = (event) => {
    const snsMessage = parseSnsMessage_(event);
    const {
        AlarmName: alarmName,
        AlarmDescription: alarmDescription = '',
        StateChangeTime: stateChangeTime,
        NewStateValue: newState,
        NewStateReason: stateReason,
        OldStateValue: oldState,
        Trigger: trigger,
    } = snsMessage;

    const severity = determineSeverity_(alarmName, newState);
    const currentValue = extractCurrentValue_(stateReason, trigger.Threshold);
    const durationMin = calculateDuration_(trigger.EvaluationPeriods, trigger.Period);
    const operatorText = COMPARISON_OPERATOR_MAP[trigger.ComparisonOperator] || trigger.ComparisonOperator;

    // 지표 정보: "CPUUtilization"
    const metricName = trigger.MetricName;

    // 임계치 정보: "70% 이상 (3분 지속)"
    const thresholdInfo = `${trigger.Threshold}% ${operatorText} (${durationMin}분 지속)`;

    // 현재 값 정보: "85.2%"
    const currentValueText = currentValue !== null ? `${currentValue.toFixed(1)}%` : 'N/A';

    const timestamp = convertToKst_(stateChangeTime);

    return {
        instanceId: extractInstanceId_(trigger.Dimensions),
        issueTitle: alarmDescription || alarmName,
        metricName,
        currentValue: currentValueText,
        threshold: thresholdInfo,
        severity,
        timestamp,
        link: createCloudWatchLink_(snsMessage),
        alarmName,
        newState,
        oldState,
    };
};
```

아래와 같은 정보를 포함하도록 해서 단순 로그가 아니라 상황으로 읽히는 메시지가 만들어지도록 했다.

- 어떤 인스턴스에서 발생했는지
- 어떤 지표가 문제인지
- 현재 값이 얼마인지
- 임계치와 비교했을 때 어느 정도 초과했는지
- 몇 분 동안 지속됐는지
- 지금 상태가 Warning인지 Critical인지

## 계속되는 알림은 개발자를 무뎌지게 한다.

처음에는 모든 알림을 하나의 채널로 보내려고 했다. 
그런데 금방 문제가 생겼다. Warning 수준의 알림까지 전부 동일하게 받다 보니 점점 무뎌졌다. 
흔히 말하는 알림 피로가 발생했다.
그래서 알림을 “심각도 기반”으로 나누기로 했다.

Warning이나 Recovery 같은 알림은 Discord로 보내어 가벼운 알림으로 정하였고,
Critical한 알림은 Amazon Simple Email Service으로 이메일 발송을 해서 알림을 보내게 설정했다.

이렇게 나누니까 행동이 달라졌다. 디스코드는 “확인”의 채널이 되었고, 
이메일은 “즉시 대응”의 신호가 되었다. 채널이 많아진 게 아니라, 역할이 분리된 것이다.

알림을 보낼 대상에 대해서는 이미 API 서버에서 프로젝트 운영진의 계정이 등록되어 있었기에 
이를 통해 대상을 유동적으로 설정했다.

또한, 동일한 문제로 알람이 도배되는 것을 방지하기 위해 쿨다운(Cooldown) 정책을 적용했다. 
한 번 알람이 울리면 같은 단계의 후속 알람은 억제하여 알람 폭주로 인한 2차 피해를 방지했다.

그리고 알람이 외부 장애로 인해 전송되지 않는 것을 생각해 CloudWatch Logs를 통해 모든 이벤트를 기록하도록 했다.

## 근데 서버가 죽으면?

하지만 이런 생각이 들었다.
> 서버가 죽었을 때 연락을 해야 하는데, 연락처 정보를 제공하는 API도 그 죽어가는 서버 안에 있다면?

이건 순환 의존이다. 장애 상황에서 가장 먼저 깨지는 부분이 의존성이다. 
그래서 알림 시스템은 반드시 “감시 대상과 분리”되어야 한다고 판단했다.
이를 피하기 위해 감시 대상 객체와 알림 시스템 간의 의존성 분리를 하고자 고민했다.
그러던 중 생각난 방식이 Notion 데이터 베이스를 이용하는 것이였다.
수신자 정보를 애플리케이션 DB가 아니라 Notion에 두고, Lambda에서 직접 조회하도록 했다. 이 구조의 장점은 명확했다.
서버가 죽어도 수신자 정보를 가져올 수 있었고, 코드 배포 없이 수신자를 변경할 수 있다.
특히 가장 장점은 기존 운영진에게도 친화적이라, 운영진이 직접 관리할 수 있다는 것이었다.

별도의 코드 배포 없이 외부 서비스인 Notion 데이터베이스에서 직접 관리할 수 있게하여
유지보수에도 좋고, 안정성도 좋은 아키텍처를 구현하게 되었다.
수신자 관리용 Notion 데이터베이스는 다음 속성을 필수로 가지고 있어야 한다.

| 속성명 | 유형 | 설명 |
| :--- | :--- | :--- |
| **발송 여부** | Checkbox | 이 항목이 체크된 사용자에게만 알림이 발송된다. |
| **이메일** | Email | 이메일 수신 주소 |
| **전화번호** | Phone | SMS 수신 번호 (예: 010-1234-5678) |

이 중에서, 특히 “발송 여부” 체크박스 하나로 알림 대상에서 즉시 제외할 수 있는 구조는 운영 관점에서 굉장히 유용했다.
담당자가 휴가 중이거나 알림을 잠시 중단하고 싶을 경우, 발송 여부 체크박스만 해제하면 즉시 배포나 코드 수정 없이 수신 대상에서 제외할 수 있게 했다.

아키텍처를 한 번에 정리하면, 
1. EC2에서 CloudWatch Agent가 메트릭 수집
2. CloudWatch Alarm이 임계치 초과 감지
3. SNS Topic으로 이벤트 전달
4. Lambda가 이벤트 가공
5. Notion에서 수신자 조회
6. Discord / Email로 알림 발송
7. 모든 이벤트는 CloudWatch Logs에 기록

이 구조에서 중요하게 생각한 것은 각 컴포넌트가 서로 독립적이라는 점이다. 
하나가 실패해도 전체 시스템이 무너지지 않도록 했다.

## 커피 한 잔보다 저렴한 심리적 안정감

이 시스템의 월 비용은 대략 $2 수준이었다. 비용만 보면 매우 작다. 
하지만 이 구조가 만들어내는 가치는 이 비용을 넘어섰다.
장애를 인지하는 시간이 줄어들고
대응까지의 리드 타임이 짧아지고
운영자가 항상 보고 있지 않아도 되는 상태가 된다.

결국 이 시스템의 본질은 모니터링이 아니라 주의력을 자동화한 것에 가깝다.
사람이 계속 보고 있어야 하는 시스템은 언젠가 놓치게 된다.
그래서 시스템이 먼저 말하게 만들었다.
이 알림 시스템이 앞으로 우리 서비스의 안정성을 지탱하는 든든한 기반이 되어주길 기대한다.
