import { Txt } from '@toss/tds-react-native';
import { View, StyleSheet } from 'react-native';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Txt typography='t4' fontWeight='bold'>
        페이지를 찾을 수 없습니다
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
