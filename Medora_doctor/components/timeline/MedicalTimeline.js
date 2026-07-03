import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import TimelineItem from './TimelineItem';

export default function MedicalTimeline({ records = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const source = r.source?.toLowerCase() || '';
    const aiSummary = r.ai_summary || {};
    
    const complaints = (aiSummary.complaints || []).join(' ').toLowerCase();
    const diagnoses = (aiSummary.diagnosis || []).join(' ').toLowerCase();
    const findings = (aiSummary.findings || []).join(' ').toLowerCase();
    
    const rawSummary = aiSummary.simple_summary;
    const summaryText = Array.isArray(rawSummary) 
      ? rawSummary.join(' ') 
      : rawSummary || '';
    const simpleSummary = summaryText.toLowerCase();

    return (
      source.includes(query) ||
      complaints.includes(query) ||
      diagnoses.includes(query) ||
      findings.includes(query) ||
      simpleSummary.includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Medical Timeline</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#7F8E9D" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search timeline records..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Records list */}
      <View style={styles.timelineList}>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matching records</Text>
            <Text style={styles.emptySubtitle}>
              Try checking spelling or adjusting search filters
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <TimelineItem key={`record-${record.id}`} record={record} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A2536',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1A2536',
    fontWeight: '500',
    padding: 0,
  },
  timelineList: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7F8E9D',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
    textAlign: 'center',
  },
});
