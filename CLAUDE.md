# Just One Day

Yarn Workspaces 기반 모노레포 프로젝트 (Granite React Native 앱)

## 디렉토리 구조

```
just-one-day/
├── frontend/                      # Granite React Native 앱
│   ├── src/
│   │   ├── _app.tsx               # 앱 루트 컴포넌트
│   │   ├── pages/
│   │   │   ├── index.tsx          # 메인 페이지
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
├── backend/                       # 백엔드 (준비 중)
│   └── package.json               # name: "just-one-day-backend"
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
```

## 코딩 스타일

- 따옴표는 작은따옴표(`'`) 사용 (JSX 포함)
- 들여쓰기는 스페이스 2칸
- 연속 빈 줄은 최대 1줄까지만 허용

## 규칙

- `src/router.gen.ts`는 자동 생성 파일이므로 직접 수정하지 않는다.
- 새 페이지 추가 시 `frontend/src/pages/` 하위에 생성한다.
- 파일 생성/삭제 시 이 문서의 디렉토리 구조를 업데이트한다.
