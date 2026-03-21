---
visible: false
title: "No 'Access-Control-Allow-Origin' header is present on the requested resource"
date: 2025-03-09 02:00:00
tags:
  - Error
---

## Problem

웹 프론트엔드에서 다음과 같은 에러가 발생했다.

```shell
Access to XMLHttpRequest at 'http://dev.site.co.kr/login' from origin 'http://dev.site.co.kr' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Possible Causes

위 에러는 백엔드 개발자라면 필연적으로 만나게 된다는 CORS(Cross-Origin Resource Sharing) 에러다.
CORS는 웹 브라우저에서 보안상의 이유로 다른 출처의 리소스에 접근하는 것을 제한하는 정책인데,
이로 인해 다른 출처의 리소스에 접근하려고 할 때, 브라우저가 요청을 차단하게 된다.
이 글에서 CORS를 설명하기엔 조금 길어서, 
자세한 설명은 [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)에서 확인하면 된다.

## Solution

CORS 에러를 해결하기 위해서는 백엔드에서 CORS 정책을 설정해줘야 한다.
Spring Boot에서는 `@CrossOrigin` 어노테이션을 사용하여 사용되는 controller에 직접 CORS를 설정할 수 있다.

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://dev.site.co.kr")
public class ApiController {
    // ...
}
```

하지만 이렇게 설정하면 모든 API에 대해 CORS를 직접 설정해줘야 하므로,
전역으로 설정할 수 있는 방법을 사용하면 좋다.

Spring Boot에서는 `WebMvcConfigurer`를 구현한 클래스를 만들어서 CORS를 전역으로 설정할 수 있다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://dev.site.co.kr")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

위 코드를 설명하면
- `addMapping("/**")`: 모든 경로에 대해 CORS를 설정한다.
- `allowedOrigins("http://dev.site.co.kr")`: 허용할 출처를 설정한다.
- `allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")`: 허용할 HTTP 메서드를 설정한다.
- `allowedHeaders("*")`: 허용할 헤더를 설정한다.
- `allowCredentials(true)`: 인증 정보를 포함한 요청을 허용한다.

이렇게 설정하면 모든 API에 대해 CORS를 전역으로 설정할 수 있다.