import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { FoodScanner } from '@/components/FoodScanner';
import { MinimalCard } from '@/components/MinimalCard';
import { NutritionInfo } from '@/services/geminiService';

export default function ScannerScreen() {
  const [lastScan, setLastScan] = useState<NutritionInfo | null>(null);

  const handleFoodAnalyzed = (analysis: NutritionInfo) => {
    setLastScan(analysis);
    
    // Show analysis results
    Alert.alert(
      'Food Analysis Complete',
      `Found ${analysis.foods.length} food items with ${analysis.totalCalories} total calories`,
      [
        { text: 'Scan Another', style: 'default' },
        { 
          text: 'Add to Log', 
          style: 'default',
          onPress: () => {
            // In a real app, this would save to the user's food log
            Alert.alert('Success', 'Food added to your daily log!');
            router.push('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={zaraStyles.header}>
          <Text style={zaraStyles.title}>FOOD SCANNER</Text>
          <Text style={zaraStyles.subtitle}>
            Scan food to track calories and nutrition
          </Text>
        </View>

        <View style={styles.scannerContainer}>
          <FoodScanner onFoodAnalyzed={handleFoodAnalyzed} />
        </View>

        {lastScan && (
          <View style={styles.resultsContainer}>
            <MinimalCard>
              <Text style={styles.resultsTitle}>LAST SCAN RESULTS</Text>
              
              <View style={styles.calorieResult}>
                <Text style={styles.calorieNumber}>
                  {lastScan.totalCalories}
                </Text>
                <Text style={styles.calorieLabel}>CALORIES</Text>
              </View>

              <View style={styles.foodsList}>
                {lastScan.foods.map((food, index) => (
                  <View key={index} style={styles.foodItem}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodDetails}>
                      {food.quantity} • {food.calories} cal
                    </Text>
                  </View>
                ))}
              </View>

              {lastScan.healthTips.length > 0 && (
                <View style={styles.tips}>
                  <Text style={styles.tipsTitle}>HEALTH TIPS</Text>
                  {lastScan.healthTips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}
            </MinimalCard>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  scannerContainer: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.md,
    marginBottom: ZaraTheme.spacing.md,
  },
  resultsContainer: {
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingBottom: ZaraTheme.spacing.md,
  },
  resultsTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  calorieResult: {
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.lg,
  },
  calorieNumber: {
    ...ZaraTheme.typography.h1,
    fontSize: 36,
  },
  calorieLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    marginTop: ZaraTheme.spacing.xs,
  },
  foodsList: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  foodItem: {
    paddingVertical: ZaraTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
  },
  foodName: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  foodDetails: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  tips: {
    marginTop: ZaraTheme.spacing.md,
  },
  tipsTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  tipText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    marginBottom: ZaraTheme.spacing.xs,
  },
});