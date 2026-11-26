# ESG 커리어 맵

사회공헌백서 2022–2025년판 부록에 실린 기업·공공기관의 대표 사회공헌 프로그램과 채용공고 바로가기를 보여 주는 정적 웹사이트입니다.

## 페이지
| 페이지 | 기능 |
|---|---|
| `index.html` ESG 기업 | 기업·공공기관 292곳의 대표 사회공헌 프로그램, 채용 사이트 바로가기 |
| `experiences.html` 경험 키워드 | 경험을 상황·과제·행동·결과(STAR)로 정리, 키워드 자동 제안·AI 제안, 12개 역량 연결, 역량 지도 |
| `mindmap.html` 경험 마인드맵 | 경험·키워드·역량을 방사형 마인드맵으로 연결, 끌어 놓아 연결, 키워드 하나를 여러 경험에 한 번에 연결, 노드를 누르면 오른쪽 창에 경험 상세와 관련 역량 |
| `calendar.html` 채용 달력 | 지원 공고의 접수 시작·마감 일시를 월간 달력과 D-day 목록으로 관리, 상태(관심~서류 합격), 마감 경고, 공고별 자기소개서 연결, 구글·애플 캘린더용 .ics 파일 받기 |
| `guide-market.html` · `guide-questions.html` · `guide-practice.html` 채용 가이드 | 「2026 하반기 채용 완벽정복 · 자소설닷컴」 파트별 요약과 주요 수치 인용(출처 표기). 기업 명단·문항 전문·표 원본은 싣지 않음 |
| `coverletter.html` 자기소개서 | 직접 작성, 글자 수, 강점 키워드(본문 반영 여부), 빠른 점검, AI 작성 코칭·작성 제안·문장 점검·종합 피드백 |

## 데이터와 AI
- 경험과 자기소개서는 **사용자 브라우저(localStorage)에만** 저장됩니다. 서버나 이 저장소로 보내지지 않습니다. 다른 기기로 옮길 때는 상단 "백업·복원"을 쓰세요.
- AI 기능은 사용자가 "AI 설정"에 입력한 **본인 Claude API 키**로 브라우저에서 Anthropic API를 직접 호출합니다(모델 `claude-opus-5-5`). 버튼을 누를 때만 문항·본문·선택한 경험이 전송되며, 요금은 키의 계정에 부과됩니다.
- 여러 사람에게 공개 서비스로 운영하려면 키를 숨기는 서버(예: Cloudflare Workers, Vercel Functions)를 두고 그쪽에서 API를 호출하도록 바꿔야 합니다.

## 파일
- `assets/base.css`, `assets/store.js`, `assets/ai.js`: 공통 스타일, 데이터 저장, AI 연결
- `vendor/anthropic-sdk-1.7.0.mjs`: Anthropic TypeScript SDK 1.7.0 브라우저 번들 (Apache-2.0, `vendor/anthropic-sdk-LICENSE.txt`)
- `programs.json`: 사회공헌 프로그램 데이터 1,417건

빌드 과정이 없습니다. 저장소 파일을 그대로 정적 호스팅에 올리면 됩니다.

## 내 컴퓨터에서 보기
`programs.json`을 불러와야 해서 파일을 더블클릭하면 열리지 않습니다. 이 폴더에서 아래 명령을 실행한 뒤 http://localhost:8000 에 접속하세요.

```bash
python3 -m http.server 8000
```

## 배포 (무료)
- **Netlify Drop**: https://app.netlify.com/drop 에 이 폴더를 끌어다 놓으면 바로 주소가 생깁니다.
- **GitHub Pages**: 저장소에 두 파일을 올리고 Settings → Pages에서 브랜치를 선택합니다.
- **Vercel / Cloudflare Pages**: 저장소를 연결하면 푸시할 때마다 자동으로 배포됩니다.

## 데이터 갱신
새 백서가 나오면 `data/scripts`의 추출 스크립트를 다시 실행한 뒤 `programs.json`을 교체하세요.

## 출처
보건복지부·한국사회복지협의회 사회공헌센터 「사회공헌백서」 2022·2023·2024·2025년판 부록

## 저장소 구조
- `index.html`, `programs.json`: 사이트 (GitHub Pages로 배포)
- `data/`: 백서에서 추출한 전체 데이터(CSV·JSON)와 추출 스크립트
