import { Top, FixedBottomCTA, FixedBottomCTAProvider, ListRow, Checkbox } from '@toss/tds-react-native';
import { Storage } from '@apps-in-toss/framework';
import { createRoute, Spacing } from '@granite-js/react-native';
import { useEffect, useState } from 'react';
import { Alert, View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSize } from '../styles/variables';

const API_BASE = 'http://192.168.0.27:3000';

const DEFAULT_PRICES: Record<string, number> = {
  커피: 4500,
  택시: 8000,
  담배: 4500,
  배달: 15000,
  충동구매: 20000,
};

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const Route = createRoute('/setup', {
  component: Setup,
});

export default function Setup() {
  const navigation = Route.useNavigation();
  const [step, setStep] = useState<1 | 2>(1);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await Storage.getItem('accessToken');
        const response = await fetch(`${API_BASE}/challenge/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
      }
    };
    load();
  }, []);

  const handleNext = () => {
    if (selectedIndex == null) return;
    const name = categories[selectedIndex].name;
    setUnitPrice(String(DEFAULT_PRICES[name] ?? 5000));
    setStep(2);
  };

  const handleSetup = async () => {
    if (selectedIndex == null) return;
    setLoading(true);
    try {
      const token = await Storage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/challenge/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: categories[selectedIndex!].id,
          unitPrice: Number(unitPrice),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('설정 실패', data.error || '알 수 없는 오류');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.reset({ index: 0, routes: [{ name: '/main' as any }] });
    } catch (error) {
      Alert.alert('설정 실패', '다시 시도해주세요.');
      console.error('설정 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <>
        <Top
          title={
            <Top.TitleParagraph color={colors.defaultTextColor}>
              이번 주엔 어떤 소비를{'\n'}줄여볼까요?
            </Top.TitleParagraph>
          }
        />

        <Spacing size={24} />

        {categories.map((category, index) => {
          const isSelected = selectedIndex === index;
          return (
            <ListRow
              key={category.id}
              onPress={() => setSelectedIndex(index)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              left={<ListRow.Icon type="no-background" name={category.icon} />}
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={category.name}
                  topProps={{ color: colors.defaultTextColor, fontWeight: 'bold' }}
                  bottom={category.description}
                  bottomProps={{ color: colors.descTextColor }}
                />
              }
              right={<Checkbox.Line size={20} checked={isSelected} />}
              verticalPadding="large"
            />
          );
        })}

        <FixedBottomCTAProvider>
          <FixedBottomCTA disabled={selectedIndex == null} onPress={handleNext}>
            다음
          </FixedBottomCTA>
        </FixedBottomCTAProvider>
      </>
    );
  }

  const selected = categories[selectedIndex!];

  return (
    <>
      <Top
        title={
          <Top.TitleParagraph color={colors.defaultTextColor}>
            {selected?.name}, 한 번에 얼마 쓰세요?
          </Top.TitleParagraph>
        }
        subtitle1={<Top.SubtitleParagraph>1회 평균 지출액을 알려주세요</Top.SubtitleParagraph>}
      />

      <Spacing size={40} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="number-pad"
          placeholder="금액 입력"
        />
        <Text style={styles.inputSuffix}>원</Text>
      </View>

      <FixedBottomCTAProvider>
        <FixedBottomCTA loading={loading} disabled={!unitPrice || Number(unitPrice) <= 0} onPress={handleSetup}>
          시작하기
        </FixedBottomCTA>
      </FixedBottomCTAProvider>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.defaultTextColor,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
  },
  inputSuffix: {
    fontSize: fontSize.lg,
    color: '#6B7684',
    marginLeft: 8,
  },
});
