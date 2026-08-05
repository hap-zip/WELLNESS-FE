import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#E9EAE5',
  },
  progressValue: {
    width: '50%',
    height: '100%',
    backgroundColor: '#176B52',
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
  step: {
    color: '#176B52',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    color: '#18201C',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  description: {
    marginTop: 10,
    color: '#46514A',
    fontSize: 14,
    lineHeight: 23,
  },
  form: {
    marginTop: 26,
    paddingHorizontal: 24,
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D8DCD6',
    color: '#18201C',
    fontSize: 16,
  },
  helperText: {
    marginTop: 8,
    color: '#6E776F',
    fontSize: 12.5,
  },
  passwordInput: {
    marginTop: 18,
  },
  errorText: { marginTop: 10, paddingHorizontal: 24, color: '#B54745', fontSize: 13, lineHeight: 20 },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  notice: {
    paddingBottom: 12,
    color: '#6E776F',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  nextButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#176B52',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  disabledButton: { backgroundColor: '#C8CCD3' },
});
