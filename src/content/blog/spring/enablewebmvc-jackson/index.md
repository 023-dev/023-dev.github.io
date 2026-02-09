---
title: "@EnableWebMvc 사용해도 될까?"
date: 2025-02-24 09:00:00
tags: 
  - Java
  - Spring
  - Troubleshooting
---

## @EnableWebMvc의 함정

CORS를 설정을 하면서 공식 문서에 샘플이 있길래 골자를 따와 안에 값만 수정해서 배포를 진행했다.
하지만 프론트 쪽에서 응답 값의 직렬화가 작동하지 않는다는 이슈를 접하게 되었다.
조금의 삽질을 하면서 `@EnableWebMvc`가 문제라는 것을 알게 되었다.

## 그럼 @EnableWebMvc를 사용하면 어떻게 될까?

처음에는 `@EnableWebMvc`를 본 지 하도 오래되어서 왜 문제가 됐지 했다.
이게 왜 문제인지 알기 전에 먼저 Spring Boot의 자동 구성 기능 알아야 한다.
Spring Boot는 빠르게 개발할 수 있도록 자동 구성 기능 같은 많은 편의성을 제공한다.
그 중 하나가 Spring MVC에 대한 자동 구성이고, Spring MVC의 기본값 외에도 자동 설정은 다양한 설정을 제공한다.

- Inclusion of ContentNegotiatingViewResolver and BeanNameViewResolver beans.
- Support for serving static resources, including support for WebJars (covered later in this document).
- Automatic registration of Converter, GenericConverter, and Formatter beans.
- Support for HttpMessageConverters (covered later in this document).
- Automatic registration of MessageCodesResolver (covered later in this document).
- Static index.html support.
- Automatic use of a ConfigurableWebBindingInitializer bean (covered later in this document).

> 자세한 내용은 [Spring Boot Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-spring-mvc-auto-configuration)와 [WebMvcAutoConfiguration](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/autoconfigure/web/servlet/WebMvcAutoConfiguration.html)를 참고하면 된다.

아무튼 여기서 중요한 건 Spring MVC에 대한 자동 구성을 한다는 것이다.
이러한 자동 구성 환경에서 `@EnableWebMvc`는 재앙이다.
Spring Boot가 제공하는 자동 설정을 무시하게 만들기 때문이다.
그니까 정리하자면,  `@EnableWebMvc`란 Spring Boot가 제공하는 자동 구성 기능을 비활성화하고,
개발자가 수종적으로 Spring MVC 설정을 정의할 수 있는 어노테이션이다.
즉, Spring Boot 내에서 담당했던 모든 설정을 개발자가 직접 해야 한다는 것이다.

여기까지 읽어도 아직 왜 문제가 됐는지 모르겠다면, 자동 설정 기능에 대해 알아보길 권한다.
다시 돌아와서 설명하자면, `@EnableWebMvc`를 사용하면 Spring Boot가 제공하는 자동 설정을 무시하게 되는데 
이때 Spring Boot 내에서 사용 중인 Jackson 설정도 무시하게 된다.
그래서 `application.yml`에 설정한 Jackson 설정조차 무시하게 되어서 프론트 쪽에서 응답 값의 직렬화가 작동하지 않는 것이다.

내가 담당하던 클래스는 대충 아래랑 비슷한 코드였다.
클래스에 `@EnableWebMvc`가 붙어 있었는데, 이래서 당연하게도 Jackson 설정이 비활성화 되어서 적용이 안되었던 것이다.

```java
@ControllerAdvice
@EnableWebMvc
@Profile("dev")
public class DevCorsConfig extends WebMvcConfigurerAdapter {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(true)
                .maxAge(3600L);
    }
}
```

그래서 만일, `application.yml` 설정을 했는데도 직렬화가 안되는 경우가 생겼다면 `@EnableWebMvc` 설정이 되어 있는지를 확인해보자.