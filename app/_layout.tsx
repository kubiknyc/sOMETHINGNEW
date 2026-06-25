import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ListsProvider } from '../src/store/ListsProvider';
import { colors } from '../src/theme';

/** Root navigator; wraps every screen in the gesture root and lists store. */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ListsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'My Sites' }} />
          <Stack.Screen name="list/[id]" options={{ title: '' }} />
        </Stack>
      </ListsProvider>
    </GestureHandlerRootView>
  );
}
