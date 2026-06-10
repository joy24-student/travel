import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '../services/oauth';

interface GoogleLoginButtonProps {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onLoading?: (isLoading: boolean) => void;
  size?: 'standard' | 'wide' | 'icon';
  color?: 'light' | 'dark';
  style?: object;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  onLoading,
  size = 'wide',
  color = 'dark',
  style,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);
      if (onLoading) onLoading(true);

      const result = await signInWithGoogle();

      if (result.error) {
        if (onError) onError(result.error);
      } else {
        if (onSuccess) onSuccess(result.data);
      }
    } catch (error) {
      if (onError) onError(error);
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  // Map the size prop to the GoogleSigninButton.Size enum
  const getSize = () => {
    switch (size) {
      case 'standard':
        return GoogleSigninButton.Size.Standard;
      case 'icon':
        return GoogleSigninButton.Size.Icon;
      case 'wide':
      default:
        return GoogleSigninButton.Size.Wide;
    }
  };

  // Map the color prop to the GoogleSigninButton.Color enum
  const getColor = () => {
    switch (color) {
      case 'light':
        return GoogleSigninButton.Color.Light;
      case 'dark':
      default:
        return GoogleSigninButton.Color.Dark;
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      disabled={loading}
      style={[styles.container, style]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      ) : (
        <GoogleSigninButton
          size={getSize()}
          color={getColor()}
          onPress={handlePress}
          disabled={loading}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4285F4',
    borderRadius: 4,
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default GoogleLoginButton;