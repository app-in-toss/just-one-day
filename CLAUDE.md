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
│   │   │   ├── main.tsx           # 메인 페이지 (로그인 후)
│   │   │   ├── _404.tsx           # 404 페이지
│   │   │   └── about.tsx          # About 페이지
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
│   │   └── routes/
│   │       └── auth.ts           # 토스 로그인/로그아웃/리프레시 라우트
│   ├── package.json               # name: "just-one-day-backend"
│   └── tsconfig.json              # TypeScript 설정
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
  - `POST /auth/login` — authorizationCode로 토큰 발급 + 사용자 정보 조회
  - `POST /auth/refresh` — refreshToken으로 accessToken 갱신
  - `POST /auth/logout` — accessToken 무효화

## 코딩 스타일

- 따옴표는 작은따옴표(`'`) 사용 (JSX 포함)
- 들여쓰기는 스페이스 2칸
- 연속 빈 줄은 최대 1줄까지만 허용

## 규칙

- `src/router.gen.ts`는 자동 생성 파일이므로 직접 수정하지 않는다.
- 새 페이지 추가 시 `frontend/src/pages/` 하위에 생성한다.
- 파일 생성/삭제 시 이 문서의 디렉토리 구조를 업데이트한다.
