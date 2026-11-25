# ESG 커리어 맵

사회공헌백서 2022–2025년판 부록에 실린 기업·공공기관의 대표 사회공헌 프로그램과 채용공고 바로가기를 보여 주는 정적 웹사이트입니다.

## 구성
- `index.html`: 페이지 전체 (HTML·CSS·JS)
- `programs.json`: 프로그램 데이터 1,417건

빌드 과정이 없습니다. 두 파일을 같은 폴더에 올리기만 하면 됩니다.

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
