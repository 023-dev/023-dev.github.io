# Astro 사이트 매핑

이 문서는 경로를 빠르게 찾기 위한 지도다. 감사할 때는 항상 현재 파일을 다시 읽고, 이 문서와 소스가 다르면 소스를 기준으로 한다.

## 핵심 경로

| 경로 | 확인할 계약 |
| --- | --- |
| `astro.config.mjs` | 공개 `site` 주소, sitemap integration, MDX/React 설정 |
| `src/components/BaseHead.astro` | title, description, canonical, Open Graph, Twitter, favicon, 공통 script |
| `src/layouts/BaseLayout.astro` | 공통 head props와 HTML 언어, 공통 layout |
| `src/layouts/BlogPost.astro` | 글 title/date/tags, OG 이미지, H1, 본문, 내부 탐색 |
| `src/pages/index.astro` | 공개 글 필터와 홈 목록 |
| `src/pages/blog/[...slug].astro` | 정적 경로 생성, 공개 글 필터, 글별 head 입력 |
| `src/pages/tags/[tag].astro` | tag route의 공개 글 필터와 canonical 대상 |
| `src/content/config.ts` | frontmatter 타입·기본값·필수값 |
| `src/content/blog/**/*.{md,mdx}` | title, date, tags, heroImage, visible, 본문 heading·링크·이미지 |
| `src/components/PostListItem.astro` | 목록 카드의 제목, 발췌, 이미지 alt와 링크 |
| `src/pages/rss.xml.js` | 공개 글만 포함하는 feed와 pubDate |
| `public/robots.txt` | crawler 정책과 sitemap 주소 |
| `public/` | favicon, 이미지, 폰트 등 정적 리소스 |
| `package.json` | build와 검증에 사용할 기존 script |

## 반드시 교차 확인할 것

- `visible: false`인 글이 홈·tag·blog route·RSS·sitemap에 노출되지 않는지 실제 산출물로 확인한다.
- description이 frontmatter schema, layout props, 공통 head, 생성 HTML 사이에서 끊기지 않는지 확인한다.
- canonical, `og:url`, `og:image`, Twitter URL이 설정된 공개 주소를 기준으로 절대 URL을 생성하는지 확인한다.
- title·description·canonical·구조화 데이터처럼 검색에 중요한 요소는 초기 서버 HTML에 존재해야 한다.
- `heroImage`가 없는 글과 있는 글, 장식 이미지와 정보 전달 이미지를 같은 규칙으로 처리하지 않는다.
- 정적 생성 route와 API route를 혼동하지 않는다. API 응답이나 방문자 수는 SEO 본문 근거가 아니다.
- 현재 날짜나 검색엔진 정책이 필요한 결론은 공식 문서 또는 실제 조회 결과로 최신성을 확인한다.

## 좁은 검증

```sh
npm run build
rg -n "description|canonical|og:|twitter:|application/ld\+json|robots|sitemap" src public dist
find dist -type f \( -name '*.html' -o -name 'robots.txt' -o -name '*sitemap*' \) | sort
```

`dist/`는 생성물이며 커밋 대상이 아니다. 검사 후에는 기존 작업 트리 상태가 바뀌지 않았는지 다시 확인한다.
