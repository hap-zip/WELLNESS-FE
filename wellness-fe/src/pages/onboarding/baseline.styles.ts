import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 56,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#17191C',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 36,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    color: '#17191C',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  description: {
    marginTop: 11,
    color: '#4A4F58',
    fontSize: 14.5,
    lineHeight: 24,
  },
  rows: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
  },
  rowLabel: {
    flex: 1,
    color: '#17191C',
    fontSize: 15.5,
    fontWeight: '600',
  },
  rowValue: {
    marginRight: 8,
    color: '#1257E0',
    fontSize: 15,
    fontWeight: '700',
  },
  chevron: {
    color: '#C3C7CE',
    fontSize: 27,
    fontWeight: '300',
    lineHeight: 24,
  },
  notice: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F7F8FA',
  },
  noticeText: {
    color: '#4A4F58',
    fontSize: 13,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#17191C',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.55,
  },
});
