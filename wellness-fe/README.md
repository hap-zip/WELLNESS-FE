# 몸기록 Wellness FE

Expo SDK 54와 Expo Router 기반의 React Native 웰니스 기록 앱입니다.

## 개발 문서

- [제품 완성 마스터 로드맵](./MASTER_ROADMAP.md)
- [다음 개발 실행 계획](./NEXT_STEPS.md)
- [서비스 전체 API 목록](./API_SPEC.md)
- [회사 Codex 연결 및 재개 가이드](./CODEX_COMPANY_SETUP.md)
- [현재 구현 상태와 다음 작업 인계서](./WORK_HANDOFF.md)
- [Codex 저장소 작업 규칙](./AGENTS.md)
- [화면 구현 체크리스트](./IMPLEMENTATION_CHECKLIST.md)
- [페이지·라우트 명세](./PAGE_SPEC.md)
- [최종 PDF 기능 기준 구현 점검](./FINAL_FUNCTION_AUDIT.md)

새 개발 환경에서는 `CODEX_COMPANY_SETUP.md`를 먼저 읽습니다.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm ci
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
