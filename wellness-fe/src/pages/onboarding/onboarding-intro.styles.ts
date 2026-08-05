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
    color: '#18201C',
    fontSize: 27,
    fontWeight: '700',
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
    borderTopColor: '#E9EAE5',
  },
  lastStep: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  stepNumber: {
    width: 20,
    marginTop: 2,
    color: '#285C4D',
    fontSize: 13,
    fontWeight: '700',
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: '#18201C',
    fontSize: 16.5,
    fontWeight: '700',
  },
  stepDescription: {
    marginTop: 5,
    color: '#46514A',
    fontSize: 14,
    lineHeight: 22,
  },
  disclaimer: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ECEEEC',
  },
  disclaimerText: {
    color: '#46514A',
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
    backgroundColor: '#176B52',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.55,
  },
});
