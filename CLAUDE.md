# Just One Day

Yarn Workspaces 기반 모노레포 프로젝트 (Granite React Native 앱)

## 디렉토리 구조

```
just-one-day/
├── frontend/                      # Granite React Native 앱
│   ├── src/
│   │   ├── _app.tsx               # 앱 루트 컴포넌트
│   │   ├── pages/
│   │   │   ├── index.tsx          # 로그인 페이지 (엔트리)
│   │   │   ├── setup.tsx          # 온보딩 페이지 (카테고리 선택 + 단가 설정)
│   │   │   ├── main.tsx           # 메인 페이지 (로그인 후)
│   │   │   ├── _404.tsx           # 404 페이지
│   │   │   └── about.tsx          # About 페이지
│   │   ├── core/
│   │   │   └── ModelSchemeForServer.ts  # Firestore 스키마 타입 및 파서
│   │   ├── styles/
│   │   │   └── variables.ts       # 디자인 토큰 (색상, 폰트, 간격 등)
│   │   └── router.gen.ts          # 자동 생성 라우터 (수정 금지)
│   ├── index.ts                   # 앱 엔트리포인트
│   ├── require.context.ts         # 번들러 컨텍스트
│   ├── granite.config.ts          # Granite 프레임워크 설정
│   ├── babel.config.js            # Babel 설정
│   ├── jest.config.js             # Jest 설정
│   ├── jest.setup.ts              # Jest 셋업
│   ├── react-native.config.js     # React Native 설정
│   ├── tsconfig.json              # TypeScript 설정
│   ├── eslint.config.mjs          # ESLint 설정
│   └── package.json               # name: "frontend"
├── backend/                       # Express.js 백엔드
│   ├── src/
│   │   ├── index.ts              # Express 서버 엔트리포인트 (포트 3000)
│   │   ├── firebase.ts           # Firebase Admin SDK 초기화
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT userId 추출 미들웨어
│   │   └── routes/
│   │       ├── auth.ts           # 토스 로그인/로그아웃/리프레시 라우트
│   │       └── challenge.ts      # 챌린지 카테고리/설정/상태 라우트
│   ├── package.json               # name: "just-one-day-backend"
│   ├── tsconfig.json              # TypeScript 설정
│   ├── .env.example               # 환경변수 예시
│   └── serviceAccountKey.json     # Firebase 서비스 계정 키 (gitignore)
├── package.json                   # 루트 - workspaces 설정
├── .yarnrc.yml                    # Yarn 설정
├── .gitignore
├── .prettierrc
├── .nvmrc
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── yarn.lock
└── README.md
```

## 주요 명령어

```bash
# frontend
cd frontend && yarn dev          # 개발 서버 실행
cd frontend && yarn build        # 빌드
cd frontend && yarn test         # 테스트
cd frontend && yarn typecheck    # 타입 체크
cd frontend && yarn lint         # 린트

# backend
cd backend && yarn dev           # 개발 서버 실행 (포트 3000)
cd backend && yarn build         # 빌드
```

## 토스 앱인토스 API

- 토스 API Base URL: `https://apps-in-toss-api.toss.im`
- 참고 문서:
  - 로그인 API: https://developers-apps-in-toss.toss.im/login/develop.html
  - 연동 프로세스 (mTLS): https://developers-apps-in-toss.toss.im/development/integration-process.html
- **mTLS 인증서 필수**: 토스 API 호출 시 클라이언트 인증서(cert.pem) + 키(key.pem)를 사용한 mTLS 통신 필요
  - 인증서는 앱인토스 콘솔에서 발급 (유효기간 390일)
  - 인증서 파일: `first_public.crt`, `first_private.key` → `backend/certs/`에 배치
  - 환경변수 `TOSS_CERT_PATH`, `TOSS_KEY_PATH`로 경로 설정 (`backend/.env` 사용)
- 엔드포인트:
  - `POST /auth/login` — authorizationCode로 토큰 발급 + 사용자 정보 조회 (isOnboarded 포함)
  - `POST /auth/refresh` — refreshToken으로 accessToken 갱신
  - `POST /auth/logout` — accessToken 무효화
  - `GET /challenge/categories` — 사용자 카테고리 목록 조회 (Bearer 토큰 필요)
  - `POST /challenge/setup` — 카테고리 선택 + 단가 설정 + 챌린지 생성 (Bearer 토큰 필요)
  - `GET /challenge/status` — 현재 활성 챌린지 조회 (Bearer 토큰 필요)

## Firebase / Firestore

- Firebase Admin SDK는 백엔드에서만 사용 (프론트엔드는 백엔드 API를 통해 접근)
- 서비스 계정 키: `backend/serviceAccountKey.json` (Firebase 콘솔에서 발급, gitignore 대상)
- 환경변수: `FIREBASE_SERVICE_ACCOUNT_PATH` (`backend/.env`에 설정)

### Firestore 컬렉션 스키마

```
users/{userId}
  ├── name: string                 # 토스 사용자 이름
  ├── email: string                # 토스 이메일
  ├── gender: string               # 토스 성별
  ├── totalPoints: number          # 누적 포인트
  ├── currentStreak: number        # 현재 연속 성공 일수
  ├── longestStreak: number        # 최장 연속 기록 (일 단위)
  ├── isOnboarded: boolean         # 온보딩 완료 여부
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  │
  ├── categories/{categoryId}      # 챌린지 카테고리
  │     name: string               # 카테고리명 (커피, 택시, 담배, 배달, 충동구매)
  │     icon: string               # Asset.Icon name (예: 'icon-coffee-drink-2')
  │     description: string        # 카테고리 설명
  │     isDefault: boolean         # 기본 카테고리 여부
  │     unitPrice: number          # 1회 평균 지출액
  │     createdAt: timestamp
  │
  ├── challenges/{challengeId}     # 주간 챌린지
  │     categoryId: string
  │     categoryName: string
  │     weekStart: timestamp       # 주 시작일
  │     weekEnd: timestamp         # 주 종료일
  │     status: string             # active | completed | failed
  │     dailyChecks: map           # { 'YYYY-MM-DD': boolean }
  │     successDays: number        # 성공 일수
  │     createdAt: timestamp
  │
  └── pointHistory/{pointId}       # 포인트 이력
        amount: number             # 포인트 양 (+/-)
        type: string               # challenge_complete | streak_bonus 등
        challengeId: string
        date: timestamp
        createdAt: timestamp
```

- userId는 토스 JWT의 `sub` 클레임 사용
- 신규 사용자 로그인 시 기본 카테고리 3개 자동 생성 (커피, 택시, 배달)

## 코딩 스타일

- 따옴표는 작은따옴표(`'`) 사용 (JSX 포함)
- 들여쓰기는 스페이스 2칸
- 연속 빈 줄은 최대 1줄까지만 허용

## 규칙

- `src/router.gen.ts`는 자동 생성 파일이므로 직접 수정하지 않는다.
- 새 페이지 추가 시 `frontend/src/pages/` 하위에 생성한다.
- 파일 생성/삭제 시 이 문서의 디렉토리 구조를 업데이트한다.
