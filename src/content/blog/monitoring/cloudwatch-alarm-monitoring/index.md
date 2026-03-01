---
visible: false
title: "나는 항상 모니터링할 수 없다"
date: 2026-02-28 16:18:00
tags: ["DevOps", "Engineering"]
---

일전에 장애 대응을 위해 서버에 유지보수를 위해 모니터링을 도입했지만, 운영 중인 서비스 특성상 기능 개발, 버그 대응, 배포 등 여러 작업을 동시에 처리해야 했고, 그 과정에서 지표를 일일이 지속적으로 확인하는 모니터링 방식에는 분명한 한계가 있었다.
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

SNS Topic으로 전달된 알람은 메트릭 자체이기에 전부 다 필요하지 않을뿐더러 우리가 원하는 방식으로 처리해야 했다.
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

우리 팀의 경우 위험도에 따른 알림 방식을 구분하여 여러 채널로 알림을 보내고자 했다.
WANRING과 RECOVERY에 대한 알림은 디스코드 채널로 받고, 
심각한 알람인 CRITICAL에 대한 알림은 이메일과 SMS로도 받아 처리하게끔 구현했다.

알림을 보낼 대상에 대해서는 이미 API 서버에서 프로젝트 운영진의 계정이 등록되어 있었기에 
이를 통해 대상을 유동적으로 설정했다.

그리고 알람이 외부 장애로 인해 전송되지 않는 것을 생각해 CloudWatch Logs를 통해 모든 이벤트를 기록하도록 했다.

## 근데 서버가 죽으면

하지만 이런 생각이 들었다.
> 서버가 죽었을 때 연락을 해야 하는데, 연락처 정보를 제공하는 API도 그 죽어가는 서버 안에 있다면?

이를 피하기 위해 감시 대상 객체와 알림 시스템 간의 의존성 분리를 하고자 고민했다.
그러던 중 생각난 방식이 Notion 데이터 베이스를 이용하는 것이다.
기존 운영진에게도 친화적이고, 
별도의 코드 배포 없이 외부 서비스인 Notion 데이터베이스에서 직접 관리할 수 있게하여
유지보수에도 좋고, 안정성도 좋은 아키텍처를 구현하게 되었다.

수신자 관리용 Notion 데이터베이스는 다음 속성을 필수로 가지고 있어야 한다.

| 속성명 | 유형 | 설명 |
| :--- | :--- | :--- |
| **발송 여부** | Checkbox | 이 항목이 체크된 사용자에게만 알림이 발송된다. |
| **이메일** | Email | 이메일 수신 주소 |
| **전화번호** | Phone | SMS 수신 번호 (예: 010-1234-5678) |

담당자가 휴가 중이거나 알림을 잠시 중단하고 싶을 경우, 발송 여부 체크박스만 해제하면 즉시 배포나 코드 수정 없이 수신 대상에서 제외할 수 있었다.

