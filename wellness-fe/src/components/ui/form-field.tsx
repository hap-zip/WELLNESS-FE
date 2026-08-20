import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { colors, layout, radius, spacing, typography } from '@/theme/tokens';

type Props = ComponentProps<typeof TextInput> & {
  error?: string;
  helper?: string;
  label: string;
  hideLabel?: boolean;
  showPasswordToggle?: boolean;
};

export function FormField({ error, helper, hideLabel = false, label, onBlur, onFocus, secureTextEntry, showPasswordToggle = false, style, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View style={styles.field}>
      {hideLabel ? null : <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputShell, focused && styles.inputFocused, error ? styles.inputError : null]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={showPasswordToggle ? !passwordVisible : secureTextEntry}
          style={[styles.input, style]}
        />
        {showPasswordToggle ? <Pressable accessibilityLabel={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'} accessibilityRole="button" hitSlop={4} onPress={() => setPasswordVisible((current) => !current)} style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}><AppIcon color={colors.textMuted} name={passwordVisible ? 'eye-off' : 'eye'} size={20}/></Pressable> : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { minWidth: 0, gap: spacing.sm },
  label: { color: colors.textSecondary, ...typography.label },
  inputShell: { minWidth: 0, minHeight: layout.controlHeight, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  inputFocused: { borderWidth: 1.5, borderColor: colors.primary },
  input: {
    minWidth: 0,
    minHeight: layout.controlHeight,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  visibilityButton: { width: 48, height: layout.controlHeight, alignItems: 'center', justifyContent: 'center' },
  inputError: { borderWidth: 1.5, borderColor: colors.danger },
  helper: { color: colors.textMuted, ...typography.caption },
  error: { color: colors.danger, ...typography.caption },
  pressed: { opacity: 0.55 },
});
