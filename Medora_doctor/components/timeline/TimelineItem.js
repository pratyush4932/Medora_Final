import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FileText, FileImage, ExternalLink, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import DocumentViewerModal from '../viewer/DocumentViewerModal';

export default function TimelineItem({ record }) {
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { created_at, source, file_type, file_url, ai_summary } = record;
  const dateStr = created_at ? new Date(created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'N/A';

  const hasDoc = !!file_url;
  const isPdf = file_type === 'application/pdf' || file_url?.toLowerCase().endsWith('.pdf');

  const complaints = ai_summary?.complaints || [];
  const medications = ai_summary?.medications || [];
  const findings = ai_summary?.findings || [];
  const reports = ai_summary?.reports || [];
  const diagnoses = ai_summary?.diagnosis || [];
  const rawSummary = ai_summary?.simple_summary;
  const simpleSummary = Array.isArray(rawSummary)
    ? rawSummary.join(' ')
    : rawSummary || '';

  return (
    <View style={styles.container}>
      <View style={styles.leftLineContainer}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <View style={styles.calendarRow}>
              <Calendar size={14} color="#7F8E9D" />
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.sourceBadge, source === 'hospital' ? styles.hospitalBadge : styles.patientBadge]}>
                <Text style={[styles.sourceText, source === 'hospital' ? styles.hospitalText : styles.patientText]}>
                  {source?.toUpperCase()}
                </Text>
              </View>
              {diagnoses.length > 0 && (
                <View style={styles.diagnosisBadge}>
                  <Text style={styles.diagnosisText} numberOfLines={1}>{diagnoses[0]}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            {expanded ? <ChevronUp size={18} color="#7F8E9D" /> : <ChevronDown size={18} color="#7F8E9D" />}
          </View>
        </TouchableOpacity>

        <View style={styles.shortInfo}>
          {complaints.length > 0 && (
            <Text style={styles.complaintPreview} numberOfLines={1}>
              Complaints: <Text style={styles.bold}>{complaints.join(', ')}</Text>
            </Text>
          )}
          {simpleSummary ? (
            <Text style={styles.simpleSummaryText} numberOfLines={expanded ? undefined : 2}>
              {simpleSummary}
            </Text>
          ) : null}
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            {diagnoses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diagnoses</Text>
                <View style={styles.chipRow}>
                  {diagnoses.map((d, i) => (
                    <View key={`diag-${i}`} style={styles.diagnosisChip}>
                      <Text style={styles.diagnosisChipText}>{d}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {findings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clinical Findings</Text>
                {findings.map((f, i) => (
                  <View key={`find-${i}`} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}

            {medications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medications Prescribed</Text>
                <View style={styles.medicationRow}>
                  {medications.map((m, i) => (
                    <View key={`med-${i}`} style={styles.medCard}>
                      <Text style={styles.medName}>{m.name}</Text>
                      <View style={styles.medDetailsRow}>
                        <Text style={styles.medDetail}>{m.dosage}</Text>
                        <Text style={styles.medDivider}>•</Text>
                        <Text style={styles.medDetail}>{m.frequency}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {reports.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Referenced Reports</Text>
                <View style={styles.chipRow}>
                  {reports.map((r, i) => (
                    <View key={`rep-${i}`} style={styles.reportChip}>
                      <Text style={styles.reportChipText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasDoc && (
              <View style={styles.attachmentSection}>
                <View style={styles.attachmentInfo}>
                  {isPdf ? (
                    <FileText size={20} color="#EF4444" />
                  ) : (
                    <FileImage size={20} color="#3B82F6" />
                  )}
                  <View style={styles.attachmentMeta}>
                    <Text style={styles.attachmentName}>
                      {isPdf ? 'Medical_Report.pdf' : 'Medical_Image.png'}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {isPdf ? 'PDF Report Document' : 'Attachment Image'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.openDocButton}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.openDocText}>Open View</Text>
                  <ExternalLink size={14} color="#1B8380" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {hasDoc && (
        <DocumentViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          fileUrl={file_url}
          fileType={file_type}
          title={diagnoses.length > 0 ? diagnoses[0] : 'Medical Document'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  leftLineContainer: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1B8380',
    borderWidth: 2,
    borderColor: '#E6FFFA',
    zIndex: 2,
    marginTop: 18,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: -8,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    padding: 16,
    marginBottom: 16,
    marginLeft: 8,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#F8F9FC',
  },
  headerLeft: {
    flex: 1,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#7F8E9D',
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hospitalBadge: {
    backgroundColor: '#E6FFFA',
  },
  patientBadge: {
    backgroundColor: '#EDF4FC',
  },
  sourceText: {
    fontSize: 9,
    fontWeight: '800',
  },
  hospitalText: {
    color: '#1B8380',
  },
  patientText: {
    color: '#2B6CB0',
  },
  diagnosisBadge: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 150,
  },
  diagnosisText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4A5568',
  },
  headerRight: {
    marginLeft: 12,
  },
  shortInfo: {
    marginTop: 10,
  },
  complaintPreview: {
    fontSize: 13,
    color: '#4A5568',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#1A2536',
  },
  simpleSummaryText: {
    fontSize: 13,
    color: '#7F8E9D',
    lineHeight: 18,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#F8F9FC',
    paddingTop: 14,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7F8E9D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  diagnosisChip: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  diagnosisChipText: {
    fontSize: 12,
    color: '#E53E3E',
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7F8E9D',
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '500',
  },
  medicationRow: {
    gap: 8,
  },
  medCard: {
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  medName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A2536',
    marginBottom: 4,
  },
  medDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medDetail: {
    fontSize: 11,
    color: '#7F8E9D',
    fontWeight: '600',
  },
  medDivider: {
    color: '#CBD5E0',
  },
  reportChip: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  reportChipText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '700',
  },
  attachmentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 4,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentMeta: {
    marginLeft: 10,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A2536',
  },
  attachmentSize: {
    fontSize: 10,
    color: '#7F8E9D',
    fontWeight: '600',
    marginTop: 1,
  },
  openDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F4F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  openDocText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B8380',
  },
});
