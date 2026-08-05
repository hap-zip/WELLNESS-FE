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
    color: '#18201C',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 36,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    color: '#18201C',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  description: {
    marginTop: 11,
    color: '#46514A',
    fontSize: 14.5,
    lineHeight: 24,
  },
  providers: {
    marginTop: 26,
    paddingHorizontal: 24,
  },
  providerRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: '#E9EAE5',
  },
  lastProviderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  providerIcon: {
    width: 21,
    color: '#285C4D',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  pulseIcon: {
    fontSize: 27,
    fontWeight: '400',
  },
  providerName: {
    flex: 1,
    color: '#18201C',
    fontSize: 16,
    fontWeight: '700',
  },
  connectText: {
    color: '#285C4D',
    fontSize: 13.5,
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  laterButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  laterText: {
    color: '#6E776F',
    fontSize: 14.5,
    fontWeight: '700',
  },
  startButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#176B52',
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.55,
  },
});
