---
title: "로그를 봤더니 해킹 시도였던 건에 대하여"
date: 2025-02-28 23:00:00
tags: 
  - Server
  - Nginx
---

최근 개발 중인 서버에 무수히 많은 에러 로그와 트래픽이 발생하는 이슈가 발생했다.
이 글에서는 이러한 이슈를 어떻게 대응했는지에 대해 기록하고자 한다.
그리고 이를 통해 다른 개발자들이 비슷한 이슈에 대해 대응하는데 도움이 되길 바란다.

## 어떤 로그가 있었나?

CI/CD 파이프 라인을 구축하고 개발 서버 로그를 확인하던 중, 다음과 같은 로그를 발견했다.

```bash
193.41.206.72 - - [28/Feb/2025:11:59:01 +0000] "GET /.env HTTP/1.1" 301 178 "-" "-" "-""0.000"
193.41.206.72 - - [28/Feb/2025:11:59:02 +0000] "GET .env HTTP/1.1" 400 166 "-" "-" "-""0.249"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /vendor/.env HTTP/1.1" 400 102 "-" "-" "-""0.008"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.011"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/config.env HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:03 +0000] "GET /prod/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.004"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /prod/.env.dev HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.005"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/config.env HTTP/1.1" 400 102 "-" "-" "-""0.011"
193.41.206.72 - - [28/Feb/2025:11:59:04 +0000] "GET /product/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.005"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /product/.env.dev HTTP/1.1" 400 102 "-" "-" "-""0.006"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/.env.bak HTTP/1.1" 400 102 "-" "-" "-""0.007"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/config.env HTTP/1.1" 400 102 "-" "-" "-""0.008"
193.41.206.72 - - [28/Feb/2025:11:59:05 +0000] "GET /production/.env.dist HTTP/1.1" 400 102 "-" "-" "-""0.006"
```

현재 프로젝트와 전혀 무관한 정적 리소스 파일 경로였고, 비정상 적이게 많은 요청이 발생했다.
위에 로그는 5초 동안의 로그이며, 1분간 계속해서 이러한 로그가 발생했다.

그래서 정황상 봇(bot)으로 빠르게 반복 요청하여 진행한 공격 시도로 판단하고, 이에 대한 대응을 진행하기로 했다.

## 그래서 어떻게 대응했나?

먼저 경우의 수를 줄이고자, AWS 보안 그룹 설정을 변경했다.
HTTPS 전환 전까지 사용했던 HTTP(80) 포트를 삭제하고, HTTPS(443)만 허용하도록 변경했다.
그리고 8080 포트를 VPC 내부에서만 접근 가능하도록 수정했고, 모든 트래픽 허용 규칙도 삭제했다.
이들은 모두 앞서 진행했던 인프라 작업 후 불필요하게 열려있던 포트들이었다.

근본적으로 현재 실행 중인 애플리케이션인 Spring Boot의 application.yml 설정을 변경하여 정적 리소스 서빙을 비활성화했다.

```yaml
spring.web.resources.add-mappings: false
```


## AWS Security Group Configuration**
 **Removed HTTP (80) Access (HTTP(80) 포트 삭제 → HTTPS(443)만 허용)**  
 **Restricted Port 8080 to VPC Internal Access (8080 포트 외부 차단 → VPC 내부에서만 접근 가능하도록 수정)**  
 **Restricted SSH (22) to Only Trusted IPs (SSH(22) 접근 제한 → 본인 IP만 허용)**  
 **Removed "Allow All Traffic" Rule (모든 트래픽 허용 규칙 삭제 → 불필요한 포트 오픈 방지)**

 **Updated Security Group Rules (적용된 보안 그룹 규칙):**  
| Type (유형) | Protocol (프로토콜) | Port Range (포트 범위) | Source (소스) | Status (상태) |
|-------------|------------|-------------|-------------|---------|
| HTTPS | TCP | 443 | 0.0.0.0/0 | Allowed |
| SSH | TCP | 22 | **Only Trusted IPs (본인 IP만 허용)** | Secured |
| Custom TCP | TCP | 8080 | **10.0.0.0/16 (VPC Internal Only)** | Secured |
| HTTP | TCP | 80 | 0.0.0.0/0 |  Removed |
| All Traffic | All | All | 0.0.0.0/0 | Removed |

Tested Security Group Changes (적용 후 보안 그룹 테스트):**
```bash
curl -I http://dev.unretired.co.kr  # Should return "Connection refused"
```

---

###  2) Nginx Security Enhancements (Nginx 보안 설정 적용)**
**Blocked Access to `.env`, `config.env`, `.aws/credentials`**  
**Restricted Access to Hidden Directories (`/.git`, `/.htaccess`, etc.)**

**Nginx Configuration (`/etc/nginx/sites-available/default`)**
```nginx
location ~* \.(env|config\.env|aws/credentials|git|bak|old|dist|dev|local)$ {
    deny all;
    return 403;
}

location ~ /\. {
    deny all;
    return 403;
}
```

**Tested Configuration Changes (적용 후 설정 테스트):**
```bash
curl -I https://dev.unretired.co.kr/.env  # Should return "403 Forbidden"
```
**Expected Response (예상 응답 결과):**
```bash
HTTP/1.1 403 Forbidden
```


## Spring Boot Security Hardening (Spring Boot 보안 강화)

Disabled Static Resource Serving (`application.yml` 설정 추가)

```yaml
spring.web.resources.add-mappings: false
```


## Fail2Ban Implementation

Blocked IPs that request `.env` files more than 3 times  

Automatically bans suspicious IPs for 1 hour

Fail2Ban Configuration (`/etc/fail2ban/jail.local`)
```ini
[nginx-env-scan]
enabled = true
filter = nginx-env-scan
logpath = /var/log/nginx/access.log
maxretry = 3
bantime = 3600
```

**Fail2Ban Filter (`/etc/fail2ban/filter.d/nginx-env-scan.conf`)**
```ini
[Definition]
failregex = <HOST>.*"GET .*\.env.*" 403
```

**Tested Fail2Ban Configuration (Fail2Ban 설정 테스트):**
```bash
sudo systemctl restart fail2ban
fail2ban-client status nginx-env-scan
```

---

## Lessons Learned & Future Actions (교훈 및 향후 대응 방안)**

### Key Takeaways (이번 공격을 통해 배운 점)**
**Never expose `.env`, `config.env`, or any sensitive configuration files to the public.**
**Restrict access to unnecessary ports at the AWS Security Group level.**  
**Use Fail2Ban or AWS WAF to automatically detect and block attack patterns.**  
**Regularly monitor Nginx logs (`access.log`) for new attack patterns.**

🔍 **향후 추가 조치:**  
🔹 **Integrate AWS WAF to block requests targeting `.env`**  
🔹 **Enable advanced logging and real-time monitoring for suspicious activities**  
🔹 **Expand Fail2Ban rules to detect other malicious request patterns**

🚀 **Security is an ongoing process. Regular monitoring and proactive defense mechanisms are key to protecting your systems.**  
🚀 **보안은 한 번 설정하고 끝나는 것이 아닙니다. 지속적인 로그 모니터링과 대응이 필요합니다.**

---

## **📌 References (참고 자료)**
- [Fail2Ban GitHub](https://github.com/fail2ban/fail2ban)
- [AWS WAF Official Docs](https://docs.aws.amazon.com/waf/latest/developerguide/)
- [Nginx Security Best Practices](https://stackoverflow.com/questions/65650622/how-to-define-a-location-regex-matching-block-in-nginx-conf)

---

💡 **Have you faced similar attacks? How did you handle them? Share your thoughts and let's discuss best security practices!**  
💡 **비슷한 공격을 경험하셨나요? 어떻게 대응하셨나요? 댓글로 공유해주세요!** 🚀🔥  
