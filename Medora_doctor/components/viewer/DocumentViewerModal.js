import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  NativeModules,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { X, FileText, ExternalLink } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

// Safely detect if react-native-pdf native bindings exist (custom dev client vs Expo Go)
const isNativePdfSupported = !!NativeModules.RNPDFPdfViewManager;

let Pdf = null;
if (isNativePdfSupported) {
  try {
    Pdf = require('react-native-pdf').default;
  } catch (e) {
    // Fail silently
  }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DocumentViewerModal({ visible, onClose, fileUrl, fileType, title }) {
  const [pdfError, setPdfError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPdf = fileType === 'application/pdf' || fileUrl?.toLowerCase().endsWith('.pdf');

  const handleOpenSystemViewer = async () => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Error", "Cannot open system viewer for this link.");
      }
    } catch (e) {
      Alert.alert("Error", "Error opening document: " + e.message);
    }
  };

  const renderContent = () => {
    if (isPdf) {
      if (pdfError || !Pdf) {
        const uri = Platform.OS === 'android'
          ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`
          : fileUrl;

        return (
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri }}
              style={styles.webview}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => setPdfError(true)}
            />
            {Platform.OS === 'android' && (
              <View style={styles.inlineHeaderFallback}>
                <TouchableOpacity
                  style={styles.inlineOpenButton}
                  onPress={handleOpenSystemViewer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.inlineOpenButtonText}>Trouble viewing? Open in System</Text>
                  <ExternalLink size={12} color="#1B8380" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }

      return (
        <Pdf
          trustAllCerts={false}
          source={{ uri: fileUrl, cache: true }}
          style={styles.pdf}
          onLoadComplete={() => setLoading(false)}
          onError={(error) => {
            setPdfError(true);
          }}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.imageScrollContainer}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: fileUrl }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Medical Document'}
            </Text>
            <Text style={styles.subtitle}>
              {isPdf ? 'PDF Document' : 'Image Preview'}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#1A2536" />
          </TouchableOpacity>
        </View>

        {/* Content Viewer */}
        <View style={styles.viewerContainer}>
          {renderContent()}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1A827F" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F4F8',
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2536',
  },
  subtitle: {
    fontSize: 12,
    color: '#7F8E9D',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 80,
    backgroundColor: '#F8F9FC',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  imageScrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 252, 0.8)',
  },
  inlineHeaderFallback: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineOpenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineOpenButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B8380',
  },
});
