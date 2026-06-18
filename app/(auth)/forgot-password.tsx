import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Text, View, Pressable, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, ScrollView, Animated, PanResponder, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { emailOnlySchema, EmailOnlyFormValues } from "../../src/auth/schemas";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

const TRIP_BLUE = "#3166ee";

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resendRotateAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef<TextInput[]>([]);

  // Modal Animation and Pan Logic
  const pan = useRef(new Animated.ValueXY()).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(500)).current;

  const otpPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) pan.y.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120) {
        Animated.timing(pan.y, { toValue: 1000, duration: 300, useNativeDriver: true }).start(() => setOtpModalVisible(false));
      } else {
        Animated.spring(pan.y, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }).start();
      }
    },
  })).current;

  useEffect(() => {
    if (otpModalVisible) {
      pan.setValue({ x: 0, y: 0 });
      Animated.parallel([
        Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalSlideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      modalSlideAnim.setValue(500);
    }
  }, [otpModalVisible]);

  // Native iPhone edge-swipe back navigation logic
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect left-to-right swipe starting from the left edge
        return gestureState.dx > 10 && gestureState.x0 < 50 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) router.back();
      },
    })
  ).current;

  const { control, handleSubmit } = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Timer effect for OTP resend
  useEffect(() => {
    if (otpModalVisible && !canResend) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (!otpModalVisible) {
      setResendTimer(60);
      setCanResend(false);
    }
  }, [otpModalVisible, canResend]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      await authService.resetPassword(userEmail);
      setResendTimer(60);
      setCanResend(false);
      setOtpValue(['', '', '', '', '', '', '', '']);
      
      Animated.timing(resendRotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => resendRotateAnim.setValue(0));
      
      Alert.alert("OTP Sent", "A new code has been sent to your email.");
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(async ({ email }) => {
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setUserEmail(email);
      setOtpModalVisible(true);
      Alert.alert(
        "OTP Sent",
        "Check your email for the verification code.",
      );
    } catch (error) {
      Alert.alert(
        "Recovery failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  const handleOtpChange = (val: string, index: number) => {
    const nextOtp = [...otpValue];
    nextOtp[index] = val;
    setOtpValue(nextOtp);
    if (val && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValue[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAndReset = async () => {
    const token = otpValue.join("").trim();
    
    if (token.length < 1) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyPasswordResetOtp(userEmail, token, newPassword);
      Alert.alert("Success", "Password reset successfully!");
      setOtpModalVisible(false);
      router.push("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Invalid code or password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header} {...panResponder.panHandlers}>
        <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="chevron-back" size={28} color={TRIP_BLUE} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Trip.com</Text>
        </View>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false} 
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.illustrationSection}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="mail-open-outline" size={40} color={TRIP_BLUE} />
            </Animated.View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.mainTitle}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Don't worry! Enter your email below and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <AuthTextField
              control={control}
              keyboardType="email-address"
              label="Email Address"
              name="email"
              placeholder="Enter your registered email"
            />

            <Pressable 
              style={[styles.actionButton, loading && styles.buttonDisabled]} 
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP & Password Reset Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOtpModalVisible(false)} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: Animated.add(modalSlideAnim, pan.y) }] }]}>
              <View style={styles.modalHandle} {...otpPan.panHandlers} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Pressable onPress={() => setOtpModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#111" />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm} bounces={false}>
                <Text style={styles.modalDescription}>
                  Enter the code sent to {userEmail}
                </Text>
                
                <View style={styles.otpInputContainer}>
                  {otpValue.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el!; }}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, i)}
                      onKeyPress={(e) => handleOtpKeyPress(e, i)}
                      autoFocus={i === 0}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <View style={styles.timerRow}>
                  {canResend ? (
                    <Pressable onPress={handleResendOtp} style={styles.resendBtn} disabled={loading}>
                      <Animated.View style={{
                        transform: [{
                          rotate: resendRotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }}>
                        <Ionicons name="refresh" size={18} color={TRIP_BLUE} />
                      </Animated.View>
                      <Text style={styles.resendText}>Resend Code</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.timerText}>Resend in {resendTimer}s</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter new password"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable 
                  style={[styles.actionButton, loading && styles.buttonDisabled]} 
                  onPress={handleVerifyAndReset}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Text>
                </Pressable>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    paddingVertical: 4,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 17,
    color: TRIP_BLUE,
    marginLeft: -6,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: TRIP_BLUE,
  },
  headerRightSpacer: {
    width: 80, // Matches back button width for perfect centering
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TRIP_BLUE,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: "80%",
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalForm: {
    paddingBottom: 24,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 6,
    flexWrap: "wrap",
  },
  otpInput: {
    width: 40,
    height: 52,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: TRIP_BLUE,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
