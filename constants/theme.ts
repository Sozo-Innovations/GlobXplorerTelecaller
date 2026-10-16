// Powered by OnSpace.AI
export const Colors = {
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#DBEAFE',
  accent: '#10B981',
  accentDark: '#059669',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',

  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#94A3B8',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Outcome tags
  outcomeContacted: '#3B82F6',
  outcomeCallAgain: '#F59E0B',
  outcomeNotAnswered: '#F97316',
  outcomeNotReachable: '#EF4444',
  outcomeInterested: '#10B981',
  outcomeQualified: '#059669',
  outcomeReadyToApply: '#0EA5E9',
  outcomeNotInterested: '#64748B',
  outcomeDeclined: '#DC2626',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const FontSize = {
  xs: 12,
  sm: 13,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};
