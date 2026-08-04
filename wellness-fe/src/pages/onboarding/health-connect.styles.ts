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
    borderTopColor: '#EEF0F3',
  },
  lastProviderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },
  providerIcon: {
    width: 21,
    color: '#1257E0',
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
    color: '#17191C',
    fontSize: 16,
    fontWeight: '700',
  },
  connectText: {
    color: '#1257E0',
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
    color: '#8B919B',
    fontSize: 14.5,
    fontWeight: '700',
  },
  startButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#17191C',
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.55,
  },
});
