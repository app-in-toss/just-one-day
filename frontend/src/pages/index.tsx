import { Asset, Top, FixedBottomCTA, FixedBottomCTAProvider, StepperRow } from '@toss/tds-react-native';
import { appLogin, Storage } from '@apps-in-toss/framework';

import { createRoute, Spacing } from '@granite-js/react-native';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { fontSize, colors, spacing, size } from '../styles/variables';

const API_BASE = 'http://192.168.0.27:3000';

export const Route = createRoute('/', {
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // 만약 스토리지에 이미 로그인 토큰이 있다면 main으로 이동
  useEffect(() => {
    Storage.getItem('accessToken').then((token) => {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigation.reset({ index: 0, routes: [{ name: '/main' as any }] });
      } else {
        setChecking(false);
      }
    });
  }, []);

  // 로그인 이벤트
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { authorizationCode, referrer } = await appLogin();

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode, referrer }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('로그인 실패', data.error?.reason || '알 수 없는 오류');
        return;
      }

      await Storage.setItem('accessToken', data.accessToken);
      await Storage.setItem('refreshToken', data.refreshToken);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.reset({ index: 0, routes: [{ name: '/main' as any }] });
    } catch (error) {
      Alert.alert('로그인 실패', '다시 시도해주세요.');
      console.log('로그인 에러: ', error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <>
      <Spacing size={fontSize.sm} />
      <Top
        title={
          <Top.TitleParagraph color={colors.defaultTextColor}>
            하루 하나 실천하고 {'\n'} 포인트 받아요
          </Top.TitleParagraph>
        }
      />

      <Spacing size={spacing.md} />

      <View style={{ alignItems: 'center' }}>
        <View>
          <Asset.Icon frameShape={{ width: size.full, height: size.full }} name="icon-coffee-drink-fill" />

          {/* 세밀한 위치 조정을 위해 -5px씩 이동. 굳이 variable에 넣지 않아도 될 것 같음 */}
          <View style={{ position: 'absolute', bottom: -5, right: -5 }}>
            <Asset.Icon
              frameShape={{ width: size.sm, height: size.sm }}
              name="icon-point-circle-yellow"
              accessibilityLabel=""
            />
          </View>
        </View>
      </View>

      <Spacing size={spacing.xxl} />

      <View>
        <StepperRow
          left={
            <StepperRow.AssetFrame
              shape={Asset.frameShape.CircleMedium}
              content={<Asset.Icon name="icon-emoji-fire" />}
              backgroundColor="transparent"
            />
          }
          center={
            <StepperRow.Texts
              type="A"
              title="이번주에 선택한 소비를 참아요"
              description="커피 · 택시 · 배달 중 하나만"
            />
          }
        />
        <StepperRow
          left={
            <StepperRow.AssetFrame
              shape={Asset.frameShape.CircleMedium}
              content={<Asset.Icon name="icon-alarm-reddot" />}
              backgroundColor="transparent"
            />
          }
          center={
            <StepperRow.Texts type="A" title="매일 저녁, 알림으로 알려드려요" description="잊지않게 하루 한 번만" />
          }
        />
        <StepperRow
          left={
            <StepperRow.AssetFrame
              shape={Asset.frameShape.CircleMedium}
              content={<Asset.Icon name="icon-point-circle-green-list-fill" />}
              backgroundColor="transparent"
            />
          }
          center={<StepperRow.Texts type="A" title="성공하면 포인트를 받아요" description="참으면 포인트가 쌓여요" />}
          hideLine
        />
      </View>

      <FixedBottomCTAProvider>
        <FixedBottomCTA loading={loading} onPress={handleLogin}>
          오늘부터 시작하기
        </FixedBottomCTA>
      </FixedBottomCTAProvider>
    </>
  );
}
