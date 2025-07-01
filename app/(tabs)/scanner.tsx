import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { FoodScanner } from '@/components/FoodScanner';
import { MinimalCard } from '@/components/MinimalCard';
import { NutritionInfo } from '@/services/geminiService';
import { foodLogService } from '@/services/foodLogService';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export default function ScannerScreen() {
  const [lastScan, setLastScan] = useState<NutritionInfo | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const handleFoodAnalyzed = (analysis: NutritionInfo) => {
    setLastScan(analysis);
    
    // Show analysis results with option to add to log
    Alert.alert(
      'Food Analysis Complete',
      `Found ${analysis.foods.length} food items with ${analysis.totalCalories} total calories`,
      [
        { text: 'Scan Another', style: 'default' },
        { 
          text: 'Add to Log', 
          style: 'default',
          onPress: () => addToFoodLog(analysis)
        }
      ]
    );
  };

  const addToFoodLog = async (analysis: NutritionInfo) => {
    if (analysis.foods.length === 0) {
      Alert.alert('Error', 'No food items to add');
      return;
    }

    try {
      // Add each food item to the log
      for (const food of analysis.foods) {
        await foodLogService.addFoodEntry({
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          mealType: selectedMealType,
        });
      }

      Alert.alert(
        'Success', 
        'Food added to your daily log!',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add food to log');
    }
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

        {/* Meal Type Selector */}
        <View style={styles.mealTypeSelector}>
          <Text style={styles.mealTypeLabel}>MEAL TYPE</Text>
          <View style={styles.mealTypeButtons}>
            {MEAL_TYPES.map((meal) => (
              <TouchableOpacity
                key={meal.key}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.key && styles.mealTypeButtonSelected
                ]}
                onPress={() => setSelectedMealType(meal.key as any)}
              >
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === meal.key && styles.mealTypeTextSelected
                ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

              <TouchableOpacity 
                style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.md }]}
                onPress={() => addToFoodLog(lastScan)}
              >
                <Plus size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
                <Text style={[zaraStyles.buttonText, { marginLeft: ZaraTheme.spacing.sm }]}>
                  ADD TO {selectedMealType.toUpperCase()}
                </Text>
              </TouchableOpacity>

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

        {/* Manual Add Option */}
        <View style={styles.manualAddContainer}>
          <TouchableOpacity 
            style={zaraStyles.buttonOutline}
            onPress={() => router.push('/add-food')}
          >
            <Plus size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={[zaraStyles.buttonTextOutline, { marginLeft: ZaraTheme.spacing.sm }]}>
              ADD FOOD MANUALLY
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  mealTypeSelector: {
    paddingHorizontal: ZaraTheme.spacing.md,
    marginBottom: ZaraTheme.spacing.md,
  },
  mealTypeLabel: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mealTypeButton: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.sm,
    marginBottom: ZaraTheme.spacing.sm,
  },
  mealTypeButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  mealTypeText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  mealTypeTextSelected: {
    color: ZaraTheme.colors.white,
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
    marginTop: ZaraTheme.spacing.lg,
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
  manualAddContainer: {
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingBottom: ZaraTheme.spacing.md,
  },
});