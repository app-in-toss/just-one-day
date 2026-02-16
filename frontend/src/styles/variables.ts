//! 모든 스타일링의 값을 정의해놓은 파일
//! 반드시 스타일 값은 해당 파일에서 정의하며, 특별한 케이스로 인해 단 한 번만 사용될 값만 인라인으로 작성한다.

export const colors = {
  primary: '#3BAD7A',
  white: '#fff',
  black: '#000000',

  // text 기본 색상
  defaultTextColor: '#191F28ff',
  descTextColor: '#6b7684',
} as const;

export const fontSize = {
  xs: 13,
  sm: 16,
  md: 18,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

export const size = {
  sm: 40,
  md: 50,
  large: 60,
  full: 100,
} as const;

// gap
export const spacing = {
  md: 64,
  xxl: 104,
  xxxl: 122,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
} as const;

export const shadow = {
  default: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
} as const;
