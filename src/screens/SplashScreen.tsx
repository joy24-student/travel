import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  // Animations
  const birdScale = useRef(new Animated.Value(0)).current;
  const birdRotate = useRef(new Animated.Value(0)).current;
  const birdY = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animationSequence = () => {
      // Bird animation: scale in and float
      Animated.parallel([
        Animated.timing(birdScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(birdY, {
              toValue: -20,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(birdY, {
              toValue: 20,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(birdRotate, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(birdRotate, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();

      // Title animation: fade in and scale
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(titleScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // Subtitle animation: fade in and slide up
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 800);

      // Finish splash screen after delay
      setTimeout(() => {
        onFinish?.();
      }, 3500);
    };

    animationSequence();
  }, []);

  const birdRotateInterpolate = birdRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Bird */}
        <Animated.View
          style={[
            styles.birdContainer,
            {
              transform: [
                { scale: birdScale },
                { rotate: birdRotateInterpolate },
                { translateY: birdY },
              ],
            },
          ]}
        >
          <Image
            source={require("../../app/screens/ChatGPT Image Jun 3, 2026, 01_07_18 AM.png")}
            style={styles.bird}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ scale: titleScale }],
            },
          ]}
        >
          <Text style={styles.title}>SHOPNO</Text>
          <Text style={[styles.title, styles.titleAccent]}>JATRA</Text>
        </Animated.View>

        {/* Animated Subtitle */}
        <Animated.View
          style={[
            styles.subtitleContainer,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleY }],
            },
          ]}
        >
          <Text style={styles.subtitle}>Your Journey, Our Mission</Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View
          style={[
            styles.loadingDot,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <LoadingDots />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// Loading dots animation
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity: dot3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  birdContainer: {
    marginBottom: 40,
  },
  bird: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    color: "#003399",
    letterSpacing: 1,
  },
  titleAccent: {
    color: "#FF5722",
  },
  subtitleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  loadingDot: {
    marginTop: 60,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#003399",
  },
});
