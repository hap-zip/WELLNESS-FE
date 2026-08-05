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
  consentList: {
    marginTop: 26,
    paddingHorizontal: 24,
  },
  consentRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 17,
    borderTopWidth: 1,
    borderTopColor: '#E9EAE5',
  },
  optionalRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  rowCopy: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    color: '#18201C',
    fontSize: 15.5,
    fontWeight: '700',
  },
  required: {
    color: '#285C4D',
  },
  optional: {
    color: '#6E776F',
  },
  rowDescription: {
    marginTop: 4,
    color: '#6E776F',
    fontSize: 13,
  },
  deleteNotice: {
    marginTop: 4,
    color: '#B54745',
    fontSize: 13,
  },
  checkedBox: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#176B52',
  },
  uncheckedBox: {
    width: 26,
    height: 26,
    borderWidth: 1.8,
    borderColor: '#D8DCD6',
    borderRadius: 8,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  detailButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  detailText: {
    color: '#6E776F',
    fontSize: 13.5,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#176B52',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
  },
  disabledButton: { backgroundColor: '#C8CCD3' },
  pressed: {
    opacity: 0.55,
  },
});
