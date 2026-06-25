import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { QuantityStepper } from '../../src/components/QuantityStepper';
import { useLists } from '../../src/store/ListsProvider';
import { exportListPdf, shareList } from '../../src/share';
import { colors, radius, spacing } from '../../src/theme';
import type { MaterialItem } from '../../src/types';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = String(id);
  const { getList, addItem, updateItem, toggleItem, deleteItem } = useLists();
  const list = getList(listId);

  // Add-item form state.
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('');

  // Edit modal state.
  const [editing, setEditing] = useState<MaterialItem | null>(null);

  const ordered = useMemo(() => {
    if (!list) return [];
    // Unchecked first (in insertion order), checked sink to the bottom.
    return [...list.items].sort((a, b) => Number(a.checked) - Number(b.checked));
  }, [list]);

  if (!list) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'List' }} />
        <Text style={styles.missingText}>This list no longer exists.</Text>
      </View>
    );
  }

  const remaining = list.items.filter((i) => !i.checked).length;

  const onAdd = () => {
    if (!name.trim()) return;
    addItem(listId, { name, quantity: qty, unit });
    setName('');
    setQty(1);
    setUnit('');
  };

  const onShare = () => {
    Alert.alert('Share list', undefined, [
      { text: 'Send as text', onPress: () => shareList(list) },
      { text: 'Export PDF', onPress: () => exportListPdf(list) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: list.name,
          headerRight: () => (
            <Pressable onPress={onShare} hitSlop={10}>
              <Text style={styles.headerBtn}>Share</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={ordered}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          list.items.length > 0 ? (
            <Text style={styles.summary}>
              {remaining} to buy · {list.items.length - remaining} got
            </Text>
          ) : (
            <Text style={styles.summary}>Add your first item below.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.itemRow,
              item.checked && styles.itemRowChecked,
              pressed && styles.pressed,
            ]}
            onPress={() => setEditing(item)}
          >
            <Pressable
              hitSlop={10}
              onPress={() => toggleItem(listId, item.id)}
              style={[styles.checkbox, item.checked && styles.checkboxOn]}
            >
              {item.checked ? <Text style={styles.checkmark}>✓</Text> : null}
            </Pressable>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText} numberOfLines={1}>
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ''}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.itemName, item.checked && styles.itemNameChecked]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
            </View>
          </Pressable>
        )}
      />

      {/* Add-item bar */}
      <View style={styles.addBar}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Material (e.g. 2x4 studs)"
          placeholderTextColor={colors.textMuted}
          style={styles.addName}
          returnKeyType="done"
          onSubmitEditing={onAdd}
        />
        <View style={styles.addBarRow}>
          <QuantityStepper value={qty} onChange={setQty} />
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="unit"
            placeholderTextColor={colors.textMuted}
            style={styles.unitInput}
            autoCapitalize="none"
          />
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={onAdd}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      {editing ? (
        <EditItemModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateItem(listId, editing.id, patch);
            setEditing(null);
          }}
          onDelete={() => {
            deleteItem(listId, editing.id);
            setEditing(null);
          }}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function EditItemModal({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: MaterialItem;
  onClose: () => void;
  onSave: (patch: Partial<MaterialItem>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit);
  const [note, setNote] = useState(item.note ?? '');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>Edit item</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Material"
            placeholderTextColor={colors.textMuted}
            style={styles.sheetInput}
          />
          <View style={[styles.addBarRow, { marginTop: spacing.md }]}>
            <QuantityStepper value={qty} onChange={setQty} />
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder="unit"
              placeholderTextColor={colors.textMuted}
              style={styles.unitInput}
              autoCapitalize="none"
            />
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor={colors.textMuted}
            style={[styles.sheetInput, { marginTop: spacing.md }]}
          />
          <View style={styles.sheetButtons}>
            <Pressable style={[styles.sheetBtn]} onPress={onDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={[styles.sheetBtn, styles.sheetBtnGhost]} onPress={onClose}>
              <Text style={styles.sheetBtnGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.sheetBtn, styles.sheetBtnPrimary]}
              onPress={() =>
                onSave({
                  name: name.trim() || item.name,
                  quantity: qty,
                  unit: unit.trim(),
                  note: note.trim() || undefined,
                })
              }
            >
              <Text style={styles.sheetBtnPrimaryText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerBtn: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.lg },
  summary: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemRowChecked: { backgroundColor: colors.checkedBg },
  pressed: { opacity: 0.7 },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontSize: 18, fontWeight: '800' },
  qtyBadge: {
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bg,
    borderRadius: 8,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  qtyBadgeText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  itemName: { fontSize: 17, color: colors.text },
  itemNameChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  itemNote: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addName: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  unitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    height: 44,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.primaryText, fontWeight: '700', fontSize: 16 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  missingText: { color: colors.textMuted, fontSize: 16 },
  // Shared modal styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: { backgroundColor: colors.card, borderRadius: radius, padding: spacing.lg },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sheetInput: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  sheetButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sheetBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius },
  sheetBtnGhost: { backgroundColor: colors.bg },
  sheetBtnGhostText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  sheetBtnPrimary: { backgroundColor: colors.primary },
  sheetBtnPrimaryText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
  deleteText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
});
