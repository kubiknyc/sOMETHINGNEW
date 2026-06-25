import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLists } from '../src/store/ListsProvider';
import { colors, radius, spacing } from '../src/theme';
import type { MaterialList } from '../src/types';

export default function ListsScreen() {
  const { lists, loading, createList, deleteList } = useLists();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  const submit = () => {
    const created = createList(name);
    setName('');
    setModalVisible(false);
    router.push(`/list/${created.id}`);
  };

  const confirmDelete = (list: MaterialList) => {
    Alert.alert('Delete list?', `"${list.name}" and its items will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteList(list.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No lists yet</Text>
              <Text style={styles.emptyText}>
                Tap “New list” to start a materials list for a job site.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const total = item.items.length;
          const got = item.items.filter((i) => i.checked).length;
          return (
            <Link href={`/list/${item.id}`} asChild>
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onLongPress={() => confirmDelete(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardSub}>
                    {total === 0
                      ? 'Empty'
                      : `${got}/${total} got · ${total - got} to buy`}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          );
        }}
      />

      {/* Disabled until storage has hydrated, so a list created mid-load
          can't be clobbered when the saved lists arrive. */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          (pressed || loading) && styles.pressed,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        <Text style={styles.fabText}>+ New list</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>New list</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. 123 Main St — framing"
              placeholderTextColor={colors.textMuted}
              style={styles.sheetInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <View style={styles.sheetButtons}>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnGhost]}
                onPress={() => {
                  setName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.sheetBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.sheetBtn, styles.sheetBtnPrimary]} onPress={submit}>
                <Text style={styles.sheetBtnPrimaryText}>Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: spacing.lg, paddingBottom: 96 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  cardSub: { marginTop: 2, fontSize: 14, color: colors.textMuted },
  chevron: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.text },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: colors.primaryText, fontSize: 16, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: spacing.lg,
  },
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
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sheetBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius,
  },
  sheetBtnGhost: { backgroundColor: colors.bg },
  sheetBtnGhostText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  sheetBtnPrimary: { backgroundColor: colors.primary },
  sheetBtnPrimaryText: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
});
