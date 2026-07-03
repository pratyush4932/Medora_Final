import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Shield, Brain, TrendingUp, Info } from 'lucide-react-native';

export default function ClinicalInsightsCard({ aiSummary }) {
  if (!aiSummary) return null;

  const patterns = aiSummary.identified_patterns || [];
  const signals = aiSummary.clinical_signals || [];
  const diagnosis = aiSummary.diagnosis || [];
  const findings = aiSummary.findings || [];

  const hasPatternsOrSignals = patterns.length > 0 || signals.length > 0;
  const hasDiagnosisOrFindings = diagnosis.length > 0 || findings.length > 0;

  if (!hasPatternsOrSignals && !hasDiagnosisOrFindings) return null;

  const [activeTab, setActiveTab] = useState(hasPatternsOrSignals ? 'patterns' : 'diagnosis');

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return { bg: '#EDFDFD', text: '#234E52', border: '#E2E8F0', indicator: '#319795' };
      case 'medium':
        return { bg: '#FFF5F5', text: '#742A2A', border: '#FED7D7', indicator: '#E53E3E' };
      default:
        return { bg: '#F7FAFC', text: '#2D3748', border: '#E2E8F0', indicator: '#A0AEC0' };
    }
  };

  const renderPatterns = () => {
    if (patterns.length === 0) {
      return <Text style={styles.emptyText}>No clinical patterns identified.</Text>;
    }

    return patterns.map((p, idx) => {
      const colors = getConfidenceColor(p.confidence);
      return (
        <View key={`pattern-${idx}`} style={[styles.itemCard, { borderColor: colors.border }]}>
          <View style={styles.itemHeader}>
            <View style={styles.badgeRow}>
              <View style={[styles.confidenceBadge, { backgroundColor: colors.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: colors.indicator }]} />
                <Text style={[styles.confidenceText, { color: colors.text }]}>
                  {p.confidence?.toUpperCase()} CONFIDENCE
                </Text>
              </View>
              <View style={styles.frequencyBadge}>
                <Text style={styles.frequencyText}>{p.frequency} Occurrences</Text>
              </View>
            </View>
            <View style={styles.trendRow}>
              <TrendingUp size={14} color="#7F8E9D" />
              <Text style={styles.trendText}>Trend: {p.trend}</Text>
            </View>
          </View>
          
          <Text style={styles.itemTitle}>{p.pattern}</Text>
          <Text style={styles.itemDesc}>{p.evidence_summary}</Text>
        </View>
      );
    });
  };

  const renderSignals = () => {
    if (signals.length === 0) {
      return <Text style={styles.emptyText}>No clinical signals identified.</Text>;
    }

    return signals.map((s, idx) => {
      const colors = getConfidenceColor(s.confidence);
      return (
        <View key={`signal-${idx}`} style={[styles.itemCard, { borderColor: colors.border }]}>
          <View style={styles.itemHeader}>
            <View style={styles.badgeRow}>
              <View style={[styles.confidenceBadge, { backgroundColor: colors.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: colors.indicator }]} />
                <Text style={[styles.confidenceText, { color: colors.text }]}>
                  {s.confidence?.toUpperCase()} CONFIDENCE
                </Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{s.type?.replace('_', ' ')}</Text>
              </View>
            </View>
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>{s.occurrences} Occurrences</Text>
            </View>
          </View>

          <Text style={styles.itemTitle}>{s.signal}</Text>
          <Text style={styles.itemDesc}>{s.note}</Text>
        </View>
      );
    });
  };

  const renderDiagnoses = () => {
    if (diagnosis.length === 0) {
      return <Text style={styles.emptyText}>No diagnoses identified.</Text>;
    }

    return diagnosis.map((d, idx) => (
      <View key={`diagnosis-${idx}`} style={[styles.itemCard, { borderColor: '#FED7D7' }]}>
        <View style={styles.itemHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.confidenceBadge, { backgroundColor: '#FFF5F5' }]}>
              <View style={[styles.badgeDot, { backgroundColor: '#E53E3E' }]} />
              <Text style={[styles.confidenceText, { color: '#742A2A' }]}>
                DIAGNOSIS
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.itemTitle}>{d}</Text>
      </View>
    ));
  };

  const renderFindings = () => {
    if (findings.length === 0) {
      return <Text style={styles.emptyText}>No findings identified.</Text>;
    }

    return findings.map((f, idx) => {
      const parts = f.split(':');
      const title = parts[0]?.trim();
      const desc = parts.slice(1).join(':')?.trim();

      return (
        <View key={`finding-${idx}`} style={[styles.itemCard, { borderColor: '#F0F4F8' }]}>
          <View style={styles.itemHeader}>
            <View style={styles.badgeRow}>
              <View style={[styles.confidenceBadge, { backgroundColor: '#F0F4F8' }]}>
                <View style={[styles.badgeDot, { backgroundColor: '#7F8E9D' }]} />
                <Text style={[styles.confidenceText, { color: '#4A5568' }]}>
                  CLINICAL FINDING
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.itemTitle}>{title}</Text>
          {desc && <Text style={styles.itemDesc}>{desc}</Text>}
        </View>
      );
    });
  };

  const renderContent = () => {
    if (activeTab === 'patterns') return renderPatterns();
    if (activeTab === 'signals') return renderSignals();
    if (activeTab === 'diagnosis') return renderDiagnoses();
    if (activeTab === 'findings') return renderFindings();
    return null;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Shield size={20} color="#1B8380" />
        <Text style={styles.title}>Clinical Insights</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {hasPatternsOrSignals ? (
          <>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'patterns' && styles.activeTabButton]}
              onPress={() => setActiveTab('patterns')}
            >
              <Brain size={16} color={activeTab === 'patterns' ? '#1B8380' : '#7F8E9D'} />
              <Text style={[styles.tabText, activeTab === 'patterns' && styles.activeTabText]}>
                Identified Patterns
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'signals' && styles.activeTabButton]}
              onPress={() => setActiveTab('signals')}
            >
              <Info size={16} color={activeTab === 'signals' ? '#1B8380' : '#7F8E9D'} />
              <Text style={[styles.tabText, activeTab === 'signals' && styles.activeTabText]}>
                Clinical Signals
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'diagnosis' && styles.activeTabButton]}
              onPress={() => setActiveTab('diagnosis')}
            >
              <Brain size={16} color={activeTab === 'diagnosis' ? '#1B8380' : '#7F8E9D'} />
              <Text style={[styles.tabText, activeTab === 'diagnosis' && styles.activeTabText]}>
                Diagnoses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'findings' && styles.activeTabButton]}
              onPress={() => setActiveTab('findings')}
            >
              <Info size={16} color={activeTab === 'findings' ? '#1B8380' : '#7F8E9D'} />
              <Text style={[styles.tabText, activeTab === 'findings' && styles.activeTabText]}>
                Key Findings
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
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
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2536',
    letterSpacing: 0.3,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7F8E9D',
  },
  activeTabText: {
    color: '#1B8380',
  },
  content: {},
  emptyText: {
    fontSize: 13,
    color: '#7F8E9D',
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '600',
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#F0F4F8',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 9,
    fontWeight: '800',
  },
  frequencyBadge: {
    backgroundColor: '#F0F6FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  typeBadge: {
    backgroundColor: '#EDF9F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2F855A',
    textTransform: 'uppercase',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7F8E9D',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2536',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 18,
    fontWeight: '500',
  },
});
