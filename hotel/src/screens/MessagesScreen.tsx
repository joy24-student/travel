import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const filters = ['All', 'Unread', 'VIP', 'Archive'] as const;

type Conversation = {
  id: string;
  name: string;
  badge?: 'VIP';
  time: string;
  message: string;
  unread?: number;
};

const baseConversations: Conversation[] = [
  {
    id: 'robert',
    name: 'Robert Fox',
    badge: 'VIP',
    time: '10:30 AM',
    message: 'Thank you for the quick check-in!',
    unread: 5,
  },
  {
    id: 'jane',
    name: 'Jane Cooper',
    time: '09:15 AM',
    message: 'Is breakfast included in my current suite package?',
  },
  {
    id: 'wade',
    name: 'Wade Warren',
    time: 'Yesterday',
    message: 'The conference room setup was perfect. Thanks!',
  },
  {
    id: 'esther',
    name: 'Esther Howard',
    badge: 'VIP',
    time: 'Yesterday',
    message: 'I’ll be arriving late for check-in around 11 PM.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_X_PADDING = 20;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function MessagesScreen() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');

  const scrollY = useRef(new Animated.Value(0)).current;

  const conversations = useMemo(() => {
    if (activeFilter === 'All') return baseConversations;
    if (activeFilter === 'Unread') return baseConversations.filter((c) => (c.unread ?? 0) > 0);
    if (activeFilter === 'VIP') return baseConversations.filter((c) => c.badge === 'VIP');
    if (activeFilter === 'Archive') return baseConversations; // placeholder for now
    return baseConversations;
  }, [activeFilter]);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -12],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });

  const revenueParallax = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, -12],
    extrapolate: 'clamp',
  });

  const revenueScale = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [1, 0.985],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.page}>
      <Animated.View
        style={[
          styles.topBar,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <Text style={styles.topTitle}>Messages</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {}}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <MaterialIcons name="search" size={22} color="#94A3B8" />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        contentContainerStyle={styles.content}
      >
        <Animated.View style={[styles.revenueCardWrap, { transform: [{ translateY: revenueParallax }, { scale: revenueScale }] }]}>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <View>
                <Text style={styles.metaText}>Monthly Revenue</Text>
                <Text style={styles.revenueValue}>$24,850</Text>
                <Text style={styles.deltaText}>24.5% vs last month</Text>
              </View>

              <View style={styles.revenuePill}>
                <MaterialIcons name="trending-up" size={14} color="#A5B4FC" />
                <Text style={styles.revenuePillText}>+18.6%</Text>
              </View>
            </View>

            <View style={styles.breakdownRow}>
              {[
                { id: 'room', label: 'Room Revenue', value: '$18,250', color: '#818CF8' },
                { id: 'restaurant', label: 'Restaurant', value: '$4,850', color: '#F97316' },
                { id: 'services', label: 'Other Services', value: '$1,750', color: '#14B8A6' },
              ].map((item) => (
                <View key={item.id} style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color="#94A3B8" />
          <TextInput placeholder="Search messages..." placeholderTextColor="#94A3B8" style={styles.searchInput} />
          <MaterialIcons name="tune" size={20} color="#6B7280" />
        </View>

        {/* Chips */}
        <View style={styles.chipRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRowInner}>
            {filters.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={({ pressed }) => [
                    styles.chip,
                    isActive && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{filter}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        <View style={styles.list}>
          {conversations.map((c, index) => (
            <AnimatedConversationCard key={c.id} conversation={c} index={index} scrollY={scrollY} />
          ))}
        </View>

        <View style={{ height: 90 }} />
      </Animated.ScrollView>
    </View>
  );
}

function AnimatedConversationCard({
  conversation,
  index,
  scrollY,
}: {
  conversation: Conversation;
  index: number;
  scrollY: Animated.Value;
}) {
  const revealStart = 220 + index * 44;
  const revealProgress = scrollY.interpolate({
    inputRange: [revealStart - 120, revealStart + 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const translateY = revealProgress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const opacity = revealProgress;

  const avatarInitial = conversation.name.trim().charAt(0).toUpperCase();

  return (
    <Animated.View style={[styles.cardWrap, { opacity, transform: [{ translateY }] }]}>
      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [styles.conversationCard, pressed && styles.conversationCardPressed]}
      >
        <View style={styles.leftGlow} />

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>

          {typeof conversation.unread === 'number' ? (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadText}>{conversation.unread}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.rowBetween}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {conversation.name}
              </Text>
              {conversation.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{conversation.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.timeText}>{conversation.time}</Text>
          </View>

          <Text style={styles.messageText} numberOfLines={1}>
            {conversation.message}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0b1326',
  },
  content: {
    paddingTop: 92,
    paddingHorizontal: CONTENT_X_PADDING,
    paddingBottom: 140,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CONTENT_X_PADDING,
    paddingTop: 10,
    backgroundColor: 'rgba(11, 19, 38, 0.72)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topTitle: {
    color: '#dae2fd',
    fontSize: 22,
    fontWeight: '800',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#0f172a',
  },

  revenueCardWrap: {
    marginTop: 8,
    marginBottom: 18,
  },
  revenueCard: {
    borderRadius: 26,
    padding: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  revenueValue: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  deltaText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  revenuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(129, 140, 248, 0.
