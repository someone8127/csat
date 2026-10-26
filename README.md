# CSAT English Assistant

수능·평가원·교육청 모의고사 영어 리딩을 학년별/유형별로 풀어 보는 **정적 웹사이트**입니다. (비영리 학습 목적)
서버 없이 동작하며 GitHub Pages로 호스팅합니다.

## 페이지 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 홈. 고1 / 고2 / 고3 / 유형별 카드 |
| `first.html` · `second.html` · `third.html` | 고1 · 고2 · 고3 문제 풀이 (샘플 문제로 바로 시작) |
| `types.html` | 유형별 목록 (9개 유형 + 문제 번호 범위) |
| `type.html?t=blank` | 선택한 유형의 문제 풀이 |

공통: 헤더(로고 · 로그인 · 마이페이지) / 푸터(비영리·저작권 안내)는 `js/layout.js` 가 모든 페이지에 넣습니다.

## 폴더 구조

```
index.html  first.html  second.html  third.html  types.html  type.html
css/
  style.css            ← 빌드 결과 (Tailwind, 커밋 필요)
  tailwind.src.css     ← 빌드 원본 + 커스텀 CSS
js/
  config.js            ← 학년·유형(번호 구간) 정의 (단일 출처)
  layout.js            ← 헤더/푸터/토스트
  solver.js            ← 풀이·채점·해설/번역 토글 엔진
data/
  src/*.json           ← 사람이 편집하는 문제 원본 (시험지 1회분 = 파일 1개)
  bank.js              ← 빌드 결과 (자동 생성, 커밋 필요)
tools/
  build-bank.mjs       ← 검증 + bank.js 생성
  new-exam.mjs         ← 새 시험지 뼈대 생성
docs/ADDING_QUESTIONS.md   ← 문제 넣는 방법 (꼭 읽어 보세요)
assets/img/            ← 도표 이미지 등
```

## 실행

빌드 결과(`css/style.css`, `data/bank.js`)가 이미 포함되어 있어 **`index.html` 을 더블클릭**하면 바로 열립니다.

## 수정 후 다시 빌드

Node.js 18+ 필요.

```bash
npm install            # 최초 1회 (Tailwind CLI 설치)
npm run build:data     # data/src/*.json → data/bank.js
npm run build:css      # HTML/JS에서 쓰는 Tailwind 클래스만 css/style.css 로 생성
npm run build          # 둘 다
```

HTML/JS에 새 Tailwind 클래스를 쓰면 `npm run build:css` 를 다시 실행해야 반영됩니다.

## GitHub Pages 배포

1. 이 폴더 내용을 저장소 루트에 올립니다. (`node_modules/` 는 올리지 않음 → `.gitignore` 포함)
2. 저장소 **Settings → Pages → Branch: main / (root)** 선택
3. `https://<계정>.github.io/<저장소>/` 로 접속

## 로드맵

- [x] Step 1~2: UI 뼈대, 문제 풀이/채점/해설
- [x] 홈 · 학년별 · 유형별 페이지, 문제 데이터 파이프라인
- [ ] Step 3: Firebase 로그인 · 마이페이지 (푼 문제 수 / 정답률)
- [ ] Step 4: 오답노트 저장 · 복습 모드
- [ ] Step 5: Web Speech API 듣기 평가

## 저작권

본 사이트는 비상업적 학습 목적으로 제작된 비영리 웹사이트입니다. 제공되는 모의고사 문항 및 지문의 저작권은 한국교육과정평가원 및 각 시도교육청에 있습니다.
현재 포함된 3개 문항은 UI 확인을 위해 직접 작성한 **샘플**이며 실제 기출이 아닙니다.
