import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown, Sparkles } from 'lucide-react-native';

export default function AiHealthSummaryCard({ aiSummary }) {
  const [expanded, setExpanded] = useState(true);
  const animation = useRef(new Animated.Value(1)).current;

  if (!aiSummary) return null;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        scaleY: animation,
      },
    ],
  };

  const rotateChevron = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  const arrowAnimatedStyle = {
    transform: [
      {
        rotate: rotateChevron,
      },
    ],
  };

  let overallHealth = [];
  if (Array.isArray(aiSummary.simple_summary)) {
    overallHealth = aiSummary.simple_summary;
  } else if (typeof aiSummary.simple_summary === 'string') {
    overallHealth = [aiSummary.simple_summary];
  } else if (Array.isArray(aiSummary.overall_health_picture)) {
    overallHealth = aiSummary.overall_health_picture;
  } else if (typeof aiSummary.overall_health_picture === 'string') {
    overallHealth = [aiSummary.overall_health_picture];
  }
  const processedAt = aiSummary.last_processed_at
    ? new Date(aiSummary.last_processed_at).toLocaleString()
    : 'N/A';

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Sparkles size={20} color="#1B8380" />
          <Text style={styles.title}>AI Health Summary</Text>
        </View>
        <Animated.View style={arrowAnimatedStyle}>
          <ChevronDown size={20} color="#7F8E9D" />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View style={[styles.content, animatedStyle]}>
          {overallHealth.map((item, index) => (
            <View key={`health-point-${index}`} style={styles.pointRow}>
              <View style={styles.bullet} />
              <Text style={styles.pointText}>{item}</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>AI Summary Ready</Text>
            </View>
            <Text style={styles.processedText}>Processed: {processedAt}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2536',
    letterSpacing: 0.3,
  },
  content: {
    marginTop: 16,
    overflow: 'hidden',
  },
  pointRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1B8380',
    marginTop: 8,
    marginRight: 10,
  },
  pointText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#F0F4F8',
    paddingTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#319795',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#234E52',
  },
  processedText: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});
