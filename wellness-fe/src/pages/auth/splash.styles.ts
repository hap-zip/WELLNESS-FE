import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6F3',
  },
  logoMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#176B52',
  },
  title: {
    marginTop: 24,
    color: '#171A18',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 42,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 26,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CFE2DA',
  },
  continueButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  continueText: {
    color: '#176B52',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.55,
  },
});
