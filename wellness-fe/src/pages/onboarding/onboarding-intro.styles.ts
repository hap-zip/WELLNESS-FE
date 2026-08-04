import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 52,
  },
  title: {
    color: '#17191C',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
  },
  steps: {
    marginTop: 34,
    paddingHorizontal: 24,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 2,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F3',
  },
  lastStep: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },
  stepNumber: {
    width: 20,
    marginTop: 2,
    color: '#1257E0',
    fontSize: 13,
    fontWeight: '800',
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: '#17191C',
    fontSize: 16.5,
    fontWeight: '700',
  },
  stepDescription: {
    marginTop: 5,
    color: '#4A4F58',
    fontSize: 14,
    lineHeight: 22,
  },
  disclaimer: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F4F5F7',
  },
  disclaimerText: {
    color: '#4A4F58',
    fontSize: 13.5,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  startButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#17191C',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.55,
  },
});
