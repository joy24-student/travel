  useEffect(() => {
    if (otpModalVisible) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
