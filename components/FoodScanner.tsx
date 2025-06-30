import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image, Type } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { geminiService, NutritionInfo } from '@/services/geminiService';

const { width, height } = Dimensions.get('window');

interface FoodScannerProps {
  onFoodAnalyzed: (analysis: NutritionInfo) => void;
}

export const FoodScanner: React.FC<FoodScannerProps> = ({ onFoodAnalyzed }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={[zaraStyles.centerContent, { padding: ZaraTheme.spacing.lg }]}>
        <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
        <Text style={[ZaraTheme.typography.bodySmall, { marginTop: ZaraTheme.spacing.md }]}>
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[zaraStyles.centerContent, { padding: ZaraTheme.spacing.lg }]}>
        <Camera size={48} color={ZaraTheme.colors.mediumGray} strokeWidth={1} />
        <Text style={[ZaraTheme.typography.h3, { 
          marginTop: ZaraTheme.spacing.lg,
          marginBottom: ZaraTheme.spacing.md,
          textAlign: 'center'
        }]}>
          Camera Access Required
        </Text>
        <Text style={[ZaraTheme.typography.bodySmall, { 
          textAlign: 'center', 
          marginBottom: ZaraTheme.spacing.xl 
        }]}>
          We need camera permission to scan food items
        </Text>
        <TouchableOpacity style={zaraStyles.button} onPress={requestPermission}>
          <Text style={zaraStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureFood = async () => {
    if (cameraRef.current && !scanning) {
      if (!geminiService.isInitialized()) {
        Alert.alert(
          'AI Not Configured',
          'Please configure your Gemini API key in Settings to use food scanning.',
          [{ text: 'OK' }]
        );
        return;
      }

      setScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          const analysis = await geminiService.analyzeFoodImage(photo.uri);
          onFoodAnalyzed(analysis);
        }
      } catch (error) {
        Alert.alert(
          'Scanning Error',
          'Failed to analyze food. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setScanning(false);
      }
    }
  };

  const pickFromGallery = async () => {
    if (!geminiService.isInitialized()) {
      Alert.alert(
        'AI Not Configured',
        'Please configure your Gemini API key in Settings to use food scanning.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setScanning(true);
      try {
        const analysis = await geminiService.analyzeFoodImage(result.assets[0].uri);
        onFoodAnalyzed(analysis);
      } catch (error) {
        Alert.alert(
          'Analysis Error',
          'Failed to analyze image. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setScanning(false);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>
            Position food within the frame
          </Text>
          
          <View style={styles.scanFrame} />
          
          {scanning && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="large" color={ZaraTheme.colors.white} />
              <Text style={styles.scanningText}>Analyzing...</Text>
            </View>
          )}
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={pickFromGallery}
          disabled={scanning}
        >
          <Image size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          <Text style={styles.controlText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.captureButton, scanning && styles.captureButtonDisabled]} 
          onPress={captureFood}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator size="large" color={ZaraTheme.colors.white} />
          ) : (
            <Text style={styles.captureText}>Scan Food</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={toggleCameraFacing}
          disabled={scanning}
        >
          <Type size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ZaraTheme.spacing.lg,
  },
  instructionText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.white,
    position: 'absolute',
    top: ZaraTheme.spacing.xxl * 2,
    textAlign: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: ZaraTheme.colors.white,
    borderRadius: 8,
  },
  scanningIndicator: {
    position: 'absolute',
    alignItems: 'center',
  },
  scanningText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.white,
    marginTop: ZaraTheme.spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: ZaraTheme.colors.white,
    paddingVertical: ZaraTheme.spacing.lg,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  controlButton: {
    alignItems: 'center',
    padding: ZaraTheme.spacing.md,
  },
  controlText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
    marginTop: ZaraTheme.spacing.xs,
  },
  captureButton: {
    backgroundColor: ZaraTheme.colors.black,
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.white,
  },
});