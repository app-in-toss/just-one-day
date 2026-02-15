import { Asset, Top, FixedBottomCTA, FixedBottomCTAProvider, StepperRow } from '@toss/tds-react-native';

import { createRoute, Spacing } from '@granite-js/react-native';
import { View } from 'react-native';

import { fontSize, colors, spacing, size } from '../styles/variables';

export const Route = createRoute('/', {
  component: Page,
});

function Page() {
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
        <FixedBottomCTA loading={false}>오늘부터 시작하기</FixedBottomCTA>
      </FixedBottomCTAProvider>
    </>
  );
}
