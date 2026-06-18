import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/context';
import { PaperProvider } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/locales/i18n';
import { LanguageProvider } from './src/context/LanguageContext';

// Import the global CSS file
import './global.css';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRootView}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <AuthProvider>
                <BottomSheetModalProvider>
                  <PortalHost />
                </BottomSheetModalProvider>
              </AuthProvider>
            </PaperProvider>
          </SafeAreaProvider>
        </LanguageProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRootView: {
    flex: 1,
  },
});