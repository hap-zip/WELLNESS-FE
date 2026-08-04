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
    backgroundColor: '#EEF0F3',
  },
  progressValue: {
    width: '50%',
    height: '100%',
    backgroundColor: '#1257E0',
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
  step: {
    color: '#1257E0',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    color: '#17191C',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  description: {
    marginTop: 10,
    color: '#4A4F58',
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
    borderBottomColor: '#DEE1E6',
    color: '#17191C',
    fontSize: 16,
  },
  helperText: {
    marginTop: 8,
    color: '#8B919B',
    fontSize: 12.5,
  },
  passwordInput: {
    marginTop: 18,
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
  notice: {
    paddingBottom: 12,
    color: '#8B919B',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
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
});
