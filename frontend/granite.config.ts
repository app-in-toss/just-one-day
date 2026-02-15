import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'just-one-today-2',
  plugins: [
    appsInToss({
      brand: {
        displayName: '하루하나', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
        primaryColor: '#3BAD7A', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
        icon: 'https://static.toss.im/appsintoss/14413/18317012-8f5b-4cdd-9887-45b154fa7042.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
      },
      permissions: [],
    }),
  ],
});
