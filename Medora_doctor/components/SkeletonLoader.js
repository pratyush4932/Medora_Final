import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

export default function SkeletonLoader() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  const animatedStyle = {
    opacity: opacity,
  };

  return (
    <View style={styles.container}>
      {/* Patient Header Card Skeleton */}
      <Animated.View style={[styles.card, styles.headerCard, animatedStyle]}>
        <View style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <View style={styles.titleLine} />
          <View style={styles.subtitleLine} />
        </View>
      </Animated.View>

      {/* AI Summary Card Skeleton */}
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.sectionHeader} />
        <View style={styles.textLineLarge} />
        <View style={styles.textLineMedium} />
        <View style={styles.textLineSmall} />
      </Animated.View>

      {/* Timeline Card Skeleton */}
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.sectionHeader} />
        <View style={styles.timelineRow}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <View style={styles.textLineMedium} />
            <View style={styles.textLineSmall} />
          </View>
        </View>
        <View style={styles.timelineRow}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineContent}>
            <View style={styles.textLineMedium} />
            <View style={styles.textLineSmall} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EBF1F6',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  titleLine: {
    width: '60%',
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitleLine: {
    width: '40%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  sectionHeader: {
    width: '50%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 16,
  },
  textLineLarge: {
    width: '100%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 10,
  },
  textLineMedium: {
    width: '85%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 10,
  },
  textLineSmall: {
    width: '60%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },
});
