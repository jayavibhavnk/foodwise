import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { foodLogService } from '@/services/foodLogService';
import { geminiService } from '@/services/geminiService';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export default function AddFoodScreen() {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchFood = async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    if (!geminiService.isInitialized()) {
      Alert.alert(
        'AI Not Configured',
        'Please configure your Gemini API key in Settings to use food search.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSearching(true);
    try {
      const nutritionInfo = await geminiService.searchFoodNutrition(foodName.trim());
      
      if (nutritionInfo.foods.length > 0) {
        const food = nutritionInfo.foods[0];
        setQuantity(food.quantity);
        setCalories(food.calories.toString());
        setProtein(food.protein.toString());
        setCarbs(food.carbs.toString());
        setFat(food.fat.toString());
      }
    } catch (error) {
      Alert.alert('Search Failed', 'Unable to find nutrition information for this food.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!foodName.trim() || !quantity.trim() || !calories.trim()) {
      Alert.alert('Error', 'Please fill in at least food name, quantity, and calories');
      return;
    }

    setLoading(true);
    try {
      const result = await foodLogService.addFoodEntry({
        name: foodName.trim(),
        quantity: quantity.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        mealType,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Food added to your log!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to add food');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={zaraStyles.title}>ADD FOOD</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <MinimalCard>
            <Text style={styles.sectionTitle}>FOOD INFORMATION</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={[zaraStyles.input, { flex: 1 }]}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="Enter food name"
                placeholderTextColor={ZaraTheme.colors.mediumGray}
                autoCapitalize="words"
              />
              
              <TouchableOpacity 
                style={[styles.searchButton, searching && styles.searchButtonDisabled]}
                onPress={searchFood}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
                ) : (
                  <Search size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>QUANTITY</Text>
              <TextInput
                style={zaraStyles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="e.g., 1 cup, 100g, 1 piece"
                placeholderTextColor={ZaraTheme.colors.mediumGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MEAL TYPE</Text>
              <View style={styles.mealTypeContainer}>
                {MEAL_TYPES.map((meal) => (
                  <TouchableOpacity
                    key={meal.key}
                    style={[
                      styles.mealTypeButton,
                      mealType === meal.key && styles.mealTypeButtonSelected
                    ]}
                    onPress={() => setMealType(meal.key as any)}
                  >
                    <Text style={[
                      styles.mealTypeText,
                      mealType === meal.key && styles.mealTypeTextSelected
                    ]}>
                      {meal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </MinimalCard>

          <MinimalCard>
            <Text style={styles.sectionTitle}>NUTRITION INFORMATION</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CALORIES</Text>
              <TextInput
                style={zaraStyles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="Enter calories"
                placeholderTextColor={ZaraTheme.colors.mediumGray}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroInput}>
                <Text style={styles.label}>PROTEIN (G)</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="Protein"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.macroInput}>
                <Text style={styles.label}>CARBS (G)</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="Carbs"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.macroInput}>
                <Text style={styles.label}>FAT (G)</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={fat}
                  onChangeText={setFat}
                  placeholder="Fat"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {geminiService.isInitialized() && (
              <View style={styles.aiNote}>
                <Text style={styles.aiNoteText}>
                  💡 Use the search button to automatically fill nutrition information using AI
                </Text>
              </View>
            )}
          </MinimalCard>

          <TouchableOpacity 
            style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.lg }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>ADD TO LOG</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingTop: ZaraTheme.spacing.lg,
    paddingBottom: ZaraTheme.spacing.md,
  },
  backButton: {
    padding: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: ZaraTheme.spacing.lg,
  },
  searchButton: {
    backgroundColor: ZaraTheme.colors.black,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.md,
    marginLeft: ZaraTheme.spacing.md,
    marginBottom: 1, // Align with input border
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  mealTypeContainer: {
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
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroInput: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  aiNote: {
    marginTop: ZaraTheme.spacing.md,
    padding: ZaraTheme.spacing.md,
    backgroundColor: ZaraTheme.colors.gray,
  },
  aiNoteText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
  },
});