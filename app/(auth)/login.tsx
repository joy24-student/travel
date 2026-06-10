import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Text, View, Pressable, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, ScrollView, Image, Modal, TextInput, Animated, NativeSyntheticEvent, TextInputKeyPressEventData, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../src/utils/supabase";
import { loginSchema, LoginFormValues } from "../../src/auth/schemas";
import { AuthTextField } from "../../src/components/AuthTextField";
import { authService } from "../../src/services/auth";

WebBrowser.maybeCompleteAuthSession();

const TRIP_BLUE = "#3166ee";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  // Modal Pan/Drag logic
  const pan = useRef(new Animated.ValueXY()).current;
  const otpFadeAnim = useRef(new Animated.Value(0)).current;
  const otpSlideAnim = useRef(new Animated.Value(500)).current;
  const iconPulseAnim = useRef(new Animated.Value(1)).current;
  const emailIconPulseAnim = useRef(new Animated.Value(1)).current;
  const referralIconPulseAnim = useRef(new Animated.Value(1)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const resendRotateAnim = useRef(new Animated.Value(0)).current;

  const createPanResponder = (closeHandler: () => void) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        pan.y.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120) {
        Animated.timing(pan.y, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }).start(closeHandler);
      } else {
        Animated.spring(pan.y, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  });

  const emailPan = useRef(createPanResponder(() => setEmailModalVisible(false))).current;
  const otpPan = useRef(createPanResponder(() => setOtpModalVisible(false))).current;
  const couponPan = useRef(createPanResponder(() => setCouponModalVisible(false))).current;

  useEffect(() => { pan.setValue({ x: 0, y: 0 }); }, [emailModalVisible, otpModalVisible, couponModalVisible]);

  useEffect(() => {
    if (!emailModalVisible) {
      setUserExists(null);
      setCheckingUser(false);
    }
  }, [emailModalVisible]);

  const otpRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (otpModalVisible) {
      const anim = Animated.parallel([
        Animated.timing(otpFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(otpSlideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(iconPulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
            Animated.timing(iconPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
          ])
        )
      ]);
      anim.start();

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
      return () => {
        clearInterval(interval);
        anim.stop();
      };
    } else {
      otpFadeAnim.setValue(0);
      otpSlideAnim.setValue(500);
      setResendTimer(30);
      setCanResend(false);
    }
  }, [otpModalVisible]);

  useEffect(() => {
    if (emailModalVisible) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(emailIconPulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(emailIconPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [emailModalVisible]);

  useEffect(() => {
    if (couponModalVisible) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(referralIconPulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(referralIconPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [couponModalVisible]);

  const animateSuccess = () => {
    successScaleAnim.setValue(0);
    Animated.spring(successScaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    setOtpValue(['', '', '', '']);
    Animated.timing(resendRotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => resendRotateAnim.setValue(0));
  };

  const handleOtpChange = (val: string, index: number) => {
    const nextOtp = [...otpValue];
    nextOtp[index] = val;
    setOtpValue(nextOtp);
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValue[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleApplyReferral = () => {
    if (!referralCode.trim()) {
      setReferralError("Please enter a referral code.");
      return;
    }
    // Simulated validation logic
    setReferralError(null);
    setReferralSuccess(true);
    animateSuccess();
    
    setTimeout(() => {
      setCouponModalVisible(false);
      // Reset for next time
      setTimeout(() => {
        setReferralSuccess(false);
        setReferralCode("");
      }, 500);
    }, 1500);
  };

  const [otpEmail, setOtpEmail] = useState("");

  const handleOtpVerify = async () => {
    const token = otpValue.join("");
    if (token.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit code.");
      return;
    }
    try {
      await authService.verifyOtp(otpEmail || "", token, "email");
      setOtpSuccess(true);
      animateSuccess();
      setTimeout(() => {
        router.replace("/(tabs)");
        setOtpModalVisible(false);
        setOtpSuccess(false);
      }, 1500);
    } catch (error) {
      Alert.alert("Verification failed", error instanceof Error ? error.message : "Invalid code.");
    }
  };

  // Check if user exists when email is entered
  const handleEmailCheck = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setCheckingUser(true);
    try {
      const exists = await authService.checkUserExists(email);
      setUserExists(exists);
      
      if (!exists) {
        // User doesn't exist, send OTP for signup
        setOtpEmail(email);
        await authService.sendOtp(email);
        setEmailModalVisible(false);
        setOtpModalVisible(true);
        Alert.alert(
          "New User Detected",
          "We've sent a verification code to your email. Please verify to create your account."
        );
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setCheckingUser(false);
    }
  };

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  });

  const onSocialSignIn = async (provider: "google" | "facebook") => {
    setLoading(true);
    try {
      const redirectTo = makeRedirectUri({ scheme: "converted-travel-ui", path: "auth/callback" });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error("No OAuth URL");
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success" && result.url) {
        const code = new URL(result.url).searchParams.get("code");
        if (code) {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Trip.com</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
        {/* Hero Illustration */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida/AP1WRLseZq6k8ayvAbicOBNrK6VocxD7OE2D5R6xDwc0jkE2HKbPoJqvEyuJiLIihX2TEyeX_pXZUYGVxHqTphSa_jZ93PUWEJamgtBwULNWJVLtqInIqFs5oMnl-zHYUGWZkyFjbBvDnfp8x1JkrILsjXdykJOS3NUBzno3T5s1mFRW8xfTtyW05GSGtYbsQdAGIP_9cUPlns_0rD1KrtBR2pYzfhU2CV9kssCaQ43ERgFTXBbjaMa7AiBNxRg" }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title Content */}
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>Sign in for member rewards</Text>
          <View style={styles.benefitRow}>
            <Ionicons name="pricetag" size={16} color="#fb923c" />
            <Text style={styles.benefitText}>Get Member Benefits</Text>
          </View>
        </View>

        {/* Auth Options */}
        <View style={styles.authOptions}>
          <View style={styles.buttonList}>
            <Pressable 
              style={[styles.actionButton, styles.googleButton]} 
              onPress={() => onSocialSignIn('google')}
            >
              <Ionicons name="logo-google" size={22} color="#000" style={styles.buttonIcon} />
              <Text style={[styles.actionButtonText, styles.googleButtonText]}>Continue with Google</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={() => {
              setUserExists(null);
              setCheckingUser(false);
              setEmailModalVisible(true);
            }}>
              <Ionicons name="mail-outline" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Continue with email</Text>
            </Pressable>

            <Pressable 
              style={[styles.actionButton, styles.facebookButton]} 
              onPress={() => onSocialSignIn('facebook')}
            >
              <Ionicons name="logo-facebook" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Continue with Facebook</Text>
            </Pressable>
          </View>
        </View>

        {/* Referral Link */}
        <Pressable style={styles.referralLink} onPress={() => setCouponModalVisible(true)}>
          <Text style={styles.referralText}>I have a referral code for registration</Text>
          <Ionicons name="chevron-forward" size={16} color={TRIP_BLUE} />
        </Pressable>

        {/* Legal Footer */}
        <View style={styles.footer}>
          <Text style={styles.legalText}>
            By proceeding, I acknowledge that I have read and agree to Trip.com's{" "}
            <Text style={styles.legalLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.legalLink}>Privacy Statement</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Email Login Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={emailModalVisible}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEmailModalVisible(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: pan.y }] }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign In</Text>
                <Pressable onPress={() => setEmailModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#111" />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScrollView} bounces={false}>
                <View style={styles.modalIllustrationContainer}>
                  <Animated.View style={{ transform: [{ scale: emailIconPulseAnim }] }}>
                    <View style={styles.modalIconCircle}>
                      <MaterialCommunityIcons name="email-lock" size={42} color={TRIP_BLUE} />
                    </View>
                  </Animated.View>
                </View>
                <AuthTextField
                  control={control}
                  keyboardType="email-address"
                  label="Email"
                  name="email"
                  placeholder="Enter your email"
                  leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" />}
                  onBlur={(e: any) => {
                    const email = e.nativeEvent.text;
                    handleEmailCheck(email);
                  }}
                />

                {userExists !== null && (
                  <>
                    {userExists ? (
                      <>
                        <AuthTextField
                          control={control}
                          label="Password"
                          name="password"
                          secureTextEntry={!showPassword}
                          placeholder="Enter your password"
                          leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color="#9ca3af" />}
                          rightIcon={
                            <Pressable
                              onPress={() => setShowPassword(!showPassword)}
                              hitSlop={8}
                            >
                              <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#9ca3af"
                              />
                            </Pressable>
                          }
                        />
                        <Pressable 
                          onPress={() => {
                            setEmailModalVisible(false);
                            router.push("/(auth)/forgot-password");
                          }} 
                          style={styles.forgotPasswordBtn}
                        >
                          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.actionButton, loading && styles.buttonDisabled]} 
                          onPress={onSubmit}
                          disabled={loading}
                        >
                          <Text style={styles.actionButtonText}>
                            {loading ? "Signing in..." : "Sign In"}
                          </Text>
                        </Pressable>
                      </>
                    ) : (
                      <View style={styles.newUserMessage}>
                        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                        <Text style={styles.newUserText}>Verification code sent!</Text>
                        <Text style={styles.newUserSubtext}>Check your email to verify and create your account.</Text>
                      </View>
                    )}
                  </>
                )}

                {userExists === null && checkingUser && (
                  <View style={styles.checkingMessage}>
                    <Text style={styles.checkingText}>Checking email...</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOtpModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
            <Animated.View 
              style={[styles.modalContent, { opacity: otpFadeAnim, transform: [{ translateY: Animated.add(otpSlideAnim, pan.y) }] }]}
            >
              <View style={styles.modalHandle} {...otpPan.panHandlers} />
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <Animated.View style={{ transform: [{ scale: iconPulseAnim }] }}>
                    <Ionicons name="shield-checkmark" size={20} color={TRIP_BLUE} style={{ marginRight: 8 }} />
                  </Animated.View>
                  <Text style={styles.modalTitle}>Verify Email</Text>
                </View>
                <Pressable onPress={() => setOtpModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#111" />
                </Pressable>
              </View>
              <View style={styles.modalBodyContent}>
                {otpSuccess ? (
                  <View style={styles.successContainer}>
                    <Animated.View style={{ transform: [{ scale: successScaleAnim }] }}>
                      <View style={[styles.modalIconCircle, styles.successCircle]}>
                        <Ionicons name="checkmark-sharp" size={48} color="#22c55e" />
                      </View>
                    </Animated.View>
                    <Text style={styles.successText}>Verification Successful!</Text>
                  </View>
                ) : (
                  <>
                <View style={styles.modalIllustrationContainer}>
                  <Animated.View style={{ transform: [{ scale: iconPulseAnim }] }}>
                    <View style={[styles.modalIconCircle, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}>
                      <MaterialCommunityIcons name="shield-check" size={42} color="#22c55e" />
                    </View>
                  </Animated.View>
                </View>
                <Text style={styles.modalDescription}>Enter the 6-digit code sent to your email address to continue.</Text>
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
                    />
                  ))}
                </View>
                
                <View style={styles.timerRow}>
                  {canResend ? (
                    <Pressable onPress={handleResend} style={styles.resendBtn}>
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

                <Pressable 
                  style={styles.actionButton} 
                  onPress={handleOtpVerify}
                >
                  <Text style={styles.actionButtonText}>Verify & Continue</Text>
                </Pressable>
                  </>)}
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Coupon / Referral Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={couponModalVisible}
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCouponModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: pan.y }] }]}>
              <View style={styles.modalHandle} {...couponPan.panHandlers} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Referral Code</Text>
                <Pressable onPress={() => setCouponModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#111" />
                </Pressable>
              </View>
              <View style={styles.modalBodyContent}>
                {referralSuccess ? (
                  <View style={styles.successContainer}>
                    <Animated.View style={{ transform: [{ scale: successScaleAnim }] }}>
                      <View style={[styles.modalIconCircle, styles.successCircle]}>
                        <Ionicons name="checkmark-sharp" size={48} color="#22c55e" />
                      </View>
                    </Animated.View>
                    <Text style={styles.successText}>Code Applied Successfully!</Text>
                  </View>
                ) : (
                  <>
                <View style={styles.modalIllustrationContainer}>
                  <Animated.View style={{ transform: [{ scale: referralIconPulseAnim }] }}>
                    <View style={[styles.modalIconCircle, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                      <MaterialCommunityIcons name="ticket-percent" size={42} color="#f97316" />
                    </View>
                  </Animated.View>
                </View>
                <Text style={styles.modalDescription}>Enter your referral code below to unlock exclusive member rewards.</Text>
                <TextInput
                  style={[styles.modalInput, referralError && styles.modalInputError]}
                  placeholder="e.g. TRIP2024"
                  value={referralCode}
                  onChangeText={(text) => {
                    setReferralCode(text);
                    if (referralError) setReferralError(null);
                  }}
                  autoCapitalize="characters"
                />
                {referralError && <Text style={styles.errorText}>{referralError}</Text>}
                <Pressable style={styles.actionButton} onPress={handleApplyReferral}>
                  <Text style={styles.actionButtonText}>Apply Code</Text>
                </Pressable>
                  </>)}
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Home Indicator Spacer */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: TRIP_BLUE,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  heroImage: {
    width: 300,
    height: 200,
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
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#6b7280",
  },
  authOptions: {
    marginBottom: 30,
  },
  buttonList: {
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TRIP_BLUE,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  googleButtonText: {
    color: "#1f2937",
    fontWeight: "500",
  },
  facebookButton: {
    backgroundColor: "#1877f2",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginLeft: 12,
  },
  referralLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  referralText: {
    fontSize: 14,
    color: TRIP_BLUE,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 20,
  },
  legalText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  underline: {
    textDecorationLine: "underline",
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: "80%",
    width: '100%',
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
  closeButton: {
    padding: 8,
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  checkboxText: {
    color: TRIP_BLUE,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: TRIP_BLUE,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  otpModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#6b7280",
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resendButtonText: {
    color: TRIP_BLUE,
    fontWeight: "500",
  },
  successCheckmark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -12 },
      { translateY: -12 },
    ],
  },
  // Add all missing styles
  legalLink: {
    textDecorationLine: "underline",
    color: TRIP_BLUE,
  },
  modalContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalScrollView: {
    flexGrow: 1, // Allows the ScrollView to expand and enable scrolling
  },
  modalIllustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: TRIP_BLUE,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#166534',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: [{ translateX: -25 }],
    width: 50,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  modalInputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  modalBodyContent: {
    paddingBottom: 24,
  },
  newUserMessage: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  newUserText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
  },
  newUserSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  checkingMessage: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkingText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
