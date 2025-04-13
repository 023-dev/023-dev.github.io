---
title: "JSON serialization with Jackson don’t work properly."
date: 2025-03-10 02:00:00
tags:
  - Error
---

## Problem

웹 프론트엔드에서 다음과 같은 에러가 발생해서 CORS 에러를 해결하기 위해서 
Spring Boot에서 CORS 정책을 설정했는데, 이번엔 JSON serialization 에러가 발생했다.

```shell
REST API responses are not serialized to JSON properly.
```

## Possible Causes

위 에러는 Spring Boot에서 JSON serialization을 위해 사용하는 Jackson 라이브러리와 관련된 에러다.
여기서 Jackson은 Java 객체를 JSON으로 변환하는 라이브러리로, Spring Boot에서 기본적으로 사용된다.
그래서 현재 상태는 JSON serialization이 제대로 이루어지지 않고 있다는 것이다.

그래서 Contrller Layer 이상의 Layer로 판단하고, 에러가 날 만한 부분을 찾아보니
이전에 CORS 에러를 해결하기 위해서 작성했던 클래스에서 `@EnableWebMvc` 어노테이션을 사용하고 있었다.

이전엔 잘 되었으니 이게 제일 의심스러웠다.
찾아보니 `@EnableWebMvc` 어노테이션은 Spring MVC를 활성화하는 어노테이션으로,
Spring Boot에서는 기본적으로 Spring MVC가 활성화되어 있는 `@EnableWebMvc` 어노테이션을 사용하면 Spring Boot의 자동 설정을 비활성화하게 된다.

그래서 Spring Boot의 자동 설정을 비활성화하게 되면, Jackson 라이브러리도 자동으로 설정되지 않아서 JSON serialization이 제대로 이루어지지 않게 되었고,
이로 인해 JSON serialization 에러가 발생하게 되었다.

## Solution

그래서 JSON serialization 에러를 해결하기 위해서는 `@EnableWebMvc` 어노테이션을 제거해주면 되었다.

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