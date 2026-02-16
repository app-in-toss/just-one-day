import { Asset, Top, FixedBottomCTA, FixedBottomCTAProvider } from '@toss/tds-react-native';
import { Storage } from '@apps-in-toss/framework';
import { createRoute } from '@granite-js/react-native';
import { Alert } from 'react-native';
import { fontSize, size } from '../styles/variables';

export const Route = createRoute('/main', {
  component: Main,
});

export default function Main() {
  const navigation = Route.useNavigation();

  const handleLogout = async () => {
    await Storage.removeItem('accessToken');
    await Storage.removeItem('refreshToken');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigation.reset({ index: 0, routes: [{ name: '/' as any }] });
  };

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={fontSize.xl}>30000원</Top.TitleParagraph>}
        subtitle1={<Top.SubtitleParagraph size={fontSize.xs}>이번 주 아낀 금액</Top.SubtitleParagraph>}
        upper={
          <Top.UpperAssetContent
            content={
              <Asset.Icon
                frameShape={{ width: size.large, height: size.large }}
                name="icon-moneybag-thunder-green"
                accessibilityLabel=""
              />
            }
          />
        }
        rightVerticalAlign="end"
      />
      <FixedBottomCTAProvider>
        <FixedBottomCTA variant='secondary' onPress={handleLogout}>
          로그아웃
        </FixedBottomCTA>
      </FixedBottomCTAProvider>
    </>
  );
}
