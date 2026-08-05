import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 56,
  },
  header: {
    paddingHorizontal: 24,
  },
  title: {
    color: '#18201C',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 37,
  },
  description: {
    marginTop: 11,
    color: '#46514A',
    fontSize: 15,
    lineHeight: 24,
  },
  form: {
    marginTop: 30,
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
  passwordInput: {
    marginTop: 14,
  },
  errorText: { marginTop: 10, paddingHorizontal: 24, color: '#B54745', fontSize: 13, lineHeight: 20 },
  forgotButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  forgotText: {
    color: '#6E776F',
    fontSize: 13.5,
    fontWeight: '700',
  },
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
  guestButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    borderWidth: 1.5,
    borderColor: '#D8DCD6',
    borderRadius: 12,
  },
  guestText: {
    color: '#18201C',
    fontSize: 15.5,
    fontWeight: '700',
  },
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  signupPromptText: {
    color: '#46514A',
    fontSize: 14,
  },
  signupLink: {
    color: '#176B52',
    fontSize: 14,
    fontWeight: '700',
  },
  loginButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#176B52',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  disabledButton: { backgroundColor: '#C8CCD3' },
});
