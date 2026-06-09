import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Particle component
const Particle = ({ index, delay }: { index: number; delay: number }) => {
  const posX = useRef(new Animated.Value(0)).current;
  const posY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(posY, {
          toValue: -200,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(posX, {
          toValue: Math.random() * 100 - 50,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const randomX = Math.random() * (width - 20);
  const randomY = height / 2 + Math.random() * 100;
  const randomSize = Math.random() * 8 + 4;
  const randomColor = [
    '#003399',
    '#FF5722',
    '#00AA00',
    '#0099FF',
  ][Math.floor(Math.random() * 4)];

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: randomX,
          top: randomY,
          width: randomSize,
          height: randomSize,
          backgroundColor: randomColor,
          transform: [
            { translateY: posY },
            { translateX: posX },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

export default function AdvancedSplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [particles, setParticles] = useState<number[]>([]);
  const birdScale = useRef(new Animated.Value(0)).current;
  const birdY = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Generate particles
    setParticles(Array.from({ length: 8 }, (_, i) => i));

    const animationSequence = () => {
      // Bird pop-in animation
      Animated.parallel([
        Animated.spring(birdScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(birdY, {
            toValue: -15,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(birdY, {
            toValue: 15,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Title fade in
      setTimeout(() => {
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 400);

      // Subtitle fade in
      setTimeout(() => {
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 900);

      // Finish splash
      setTimeout(() => {
        onFinish?.();
      }, 3500);
    };

    animationSequence();
  }, []);

  return (
    <View style={styles.container}>
      {/* Particle background */}
      {particles.map((index) => (
        <Particle key={index} index={index} delay={index * 200} />
      ))}

      {/* Main content */}
      <View style={styles.content}>
        {/* Animated Bird */}
        <Animated.View
          style={[
            styles.birdContainer,
            {
              transform: [
                { scale: birdScale },
                { translateY: birdY },
              ],
            },
          ]}
        >
          <Image
              source={require('../../app/screens/ChatGPT Image Jun 3, 2026, 01_07_18 AM.png')}
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
            },
          ]}
        >
          <Text style={styles.subtitle}>Your Journey Awaits</Text>
          <View style={styles.underline} />
        </Animated.View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        <ProgressBar />
      </View>
    </View>
  );
}

// Progress bar component
function ProgressBar() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: progressWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  birdContainer: {
    marginBottom: 50,
  },
  bird: {
    width: 140,
    height: 140,
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#003399',
    letterSpacing: 2,
    lineHeight: 58,
  },
  titleAccent: {
    color: '#FF5722',
  },
  subtitleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: '#FF5722',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    bottom: 40,
    width: '80%',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#FF5722',
    borderRadius: 2,
  },
});
