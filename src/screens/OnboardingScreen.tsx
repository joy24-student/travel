import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTfdo4CqPdaV2Gn3lAauQNk9meSVVUkJ-d_weunhuIEPYcduVl1uRgoH9roRhp4FsRf9Ff2RROeBaQCLp3Nvh9ju-jObXvDMXqEUXWLGMgXoNe9AXaENCphyOw0cWdKMirTXCSDwC9-MjAMwscElr5EY01ecIdu75xSd-qQa96lo4iIc1XRw_2MEnW-wz5lgNKrcACWm1C_f0ZHfi18_ZBI2gvDisq8aDpvm8V4b_X8GtlIHToosseHTVa-7-ehjrMRCeHl_uUk5Sc",
    title: "Your trip starts here",
    features: [
      {
        icon: "lightning-bolt",
        iconColor: "#00C896",
        subIcon: "clock-outline",
        subIconColor: "#FF9500",
        text: "Support in approx. 30s"
      },
      {
        icon: "tag-outline",
        iconColor: "#FF9500",
        text: "Daily flight & hotel deals"
      }
    ]
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?w=800",
    title: "Fly anywhere with ease",
    features: [
      {
        icon: "airplane-takeoff",
        iconColor: "#3662D8",
        text: "Real-time flight status"
      },
      {
        icon: "currency-usd",
        iconColor: "#00C896",
        text: "Best price guaranteed"
      }
    ]
  },
  {
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    title: "The best stays await",
    features: [
      {
        icon: "home-city-outline",
        iconColor: "#FF9500",
        text: "Wide range of hotels"
      },
      {
        icon: "shield-check-outline",
        iconColor: "#00C896",
        text: "Safe & secure booking"
      }
    ]
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const data = ONBOARDING_DATA[step];
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(width * 0.1); // subtle slide from 10% of width
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleNext = () => {
    if (step < ONBOARDING_DATA.length - 1) {
      setStep(step + 1);
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {step > 0 && ( // Back button appears on steps 2 and 3 (index 1 and 2)
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(step - 1)}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      )}

      {/* Illustration Section */}
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
        <LinearGradient
          colors={["#A1D9FF", "#E3F2FD"]}
          style={styles.illustrationSection}
        >
          <Image
            source={{ uri: data.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "#FFFFFF"]}
            style={styles.fadeBottom}
          />
        </LinearGradient>

        {/* Branding Content */}
        <View style={styles.content}>
          <View style={styles.branding}>
            <Text style={styles.brandName}>Swapnajatra</Text>
            <Text style={styles.brandTagline}>{data.title}</Text>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            {data.features.map((feature, index) => (
              <React.Fragment key={index}>
                <View style={styles.featureItem}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={feature.icon as any}
                      size={32}
                      color={feature.iconColor}
                    />
                    {feature.subIcon && (
                      <View style={styles.subIconBadge}>
                        <MaterialCommunityIcons
                          name={feature.subIcon as any}
                          size={14}
                          color={feature.subIconColor}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
                {index === 0 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Trustpilot Section */}
          <View style={styles.trustpilotRow}>
            <Text style={styles.trustpilotTitle}>Excellent</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.starBox}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                </View>
              ))}
              <View style={[styles.starBox, { backgroundColor: "#CCCCCC" }]}>
                <View style={styles.halfStarOverlay}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                </View>
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.trustpilotBrand}>
              <Ionicons name="star" size={16} color="#00B67A" style={{ marginRight: 4 }} />
              <Text style={styles.trustpilotText}>Trustpilot</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Action Area */}
      <View style={styles.footer}>
        {/* Progress Indicator Dots */}
        <View style={styles.paginationDots}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, step === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* System Nav Bar Simulation */}
      <View style={styles.systemNav}>
        <View style={styles.backIndicator} />
        <View style={styles.homeIndicator} />
        <View style={styles.recentIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  illustrationSection: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: "100%", top: 0, position: "absolute" },
  fadeBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 96 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  branding: { marginBottom: 8, alignItems: "center" },
  brandName: { color: "#3662D8", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  brandTagline: { color: "#1A1A1A", fontSize: 22, fontWeight: "700", marginTop: 8, marginBottom: 32 },
  featuresRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 40 },
  featureItem: { flex: 1, alignItems: "center", paddingHorizontal: 16 },
  iconContainer: {
    width: 40,
    height: 40,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  subIconBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: 99 },
  featureText: { fontSize: 13, color: "#4A4A4A", fontWeight: "500", textAlign: "center", lineHeight: 16 },
  divider: { height: 40, width: 1, backgroundColor: "#E5E7EB" },
  trustpilotRow: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  trustpilotTitle: { color: "#1A1A1A", fontSize: 18, fontWeight: "700", marginRight: 8 },
  starsContainer: { flexDirection: "row", gap: 2 },
  starBox: { backgroundColor: "#00B67A", padding: 2, position: "relative", overflow: "hidden" },
  halfStarOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#00B67A",
    zIndex: 1,
    padding: 2,
  },
  trustpilotBrand: { flexDirection: "row", alignItems: "center", marginLeft: 4 },
  trustpilotText: { fontSize: 14, color: "#1A1A1A", fontWeight: "600" },
  footer: { paddingHorizontal: 24, paddingBottom: 24, backgroundColor: "#FFFFFF" },
  nextButton: { backgroundColor: "#3662D8", width: "100%", paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nextButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  systemNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  backIndicator: { width: 14, height: 14, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: "#9CA3AF", transform: [{ rotate: "45deg" }] },
  homeIndicator: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: "#9CA3AF" },
  recentIndicator: { width: 14, height: 14, borderWidth: 2, borderColor: "#9CA3AF", borderRadius: 2 },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { color: "#1A1A1A", fontSize: 14, fontWeight: "700" },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 8,
    borderRadius: 20,
  },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB', // Inactive dot color
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: '#3662D8' }, // Active dot color
});