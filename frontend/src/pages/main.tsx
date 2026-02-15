import { Asset, Top } from '@toss/tds-react-native';
import { createRoute } from '@granite-js/react-native';
import { fontSize, size } from '../styles/variables';

export const Route = createRoute('/main', {
  component: Main,
});

export default function Main() {
  return (
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
  );
}
