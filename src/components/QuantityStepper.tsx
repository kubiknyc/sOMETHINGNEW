import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  value: number;
  onChange: (next: number) => void;
};

/**
 * A +/- stepper with an editable number in the middle for entering an item
 * quantity. Clamps to a minimum of 1.
 */
export function QuantityStepper({ value, onChange }: Props) {
  const dec = () => onChange(Math.max(1, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={dec}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        hitSlop={6}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <TextInput
        value={String(value)}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
          onChange(Number.isFinite(n) && n > 0 ? n : 1);
        }}
        keyboardType="number-pad"
        style={styles.input}
        selectTextOnFocus
      />
      <Pressable
        onPress={inc}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        hitSlop={6}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  pressed: { opacity: 0.6 },
  btnText: { fontSize: 24, color: colors.text, fontWeight: '600' },
  input: {
    width: 52,
    height: 44,
    textAlign: 'center',
    fontSize: 18,
    color: colors.text,
  },
});
