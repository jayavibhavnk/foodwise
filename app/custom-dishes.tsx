import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { foodLogService, CustomDish } from '@/services/foodLogService';

export default function CustomDishesScreen() {
  const [customDishes, setCustomDishes] = useState<CustomDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('');

  useEffect(() => {
    loadCustomDishes();
  }, []);

  const loadCustomDishes = async () => {
    setLoading(true);
    try {
      const dishes = await foodLogService.getCustomDishes();
      setCustomDishes(dishes);
    } catch (error) {
      console.error('Failed to load custom dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setServingSize('');
  };

  const handleSave = async () => {
    if (!name.trim() || !calories.trim() || !servingSize.trim()) {
      Alert.alert('Error', 'Please fill in at least name, calories, and serving size');
      return;
    }

    setSaving(true);
    try {
      const result = await foodLogService.addCustomDish({
        name: name.trim(),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        servingSize: servingSize.trim(),
      });

      if (result.success) {
        resetForm();
        setShowAddForm(false);
        loadCustomDishes();
        Alert.alert('Success', 'Custom dish added successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to add custom dish');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (dish: CustomDish) => {
    Alert.alert(
      'Delete Dish',
      `Are you sure you want to delete "${dish.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await foodLogService.deleteCustomDish(dish.id);
            if (result.success) {
              loadCustomDishes();
            } else {
              Alert.alert('Error', result.error || 'Failed to delete dish');
            }
          }
        }
      ]
    );
  };

  const addToFoodLog = (dish: CustomDish) => {
    Alert.alert(
      'Add to Food Log',
      `Add "${dish.name}" to your food log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            router.push({
              pathname: '/add-food',
              params: {
                name: dish.name,
                calories: dish.calories.toString(),
                protein: dish.protein.toString(),
                carbs: dish.carbs.toString(),
                fat: dish.fat.toString(),
                quantity: dish.servingSize,
              }
            });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={zaraStyles.safeArea}>
        <View style={zaraStyles.centerContent}>
          <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
          <Text style={[ZaraTheme.typography.bodySmall, { marginTop: ZaraTheme.spacing.md }]}>
            Loading custom dishes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          
          <Text style={zaraStyles.title}>CUSTOM DISHES</Text>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {showAddForm && (
            <MinimalCard>
              <Text style={styles.sectionTitle}>ADD NEW DISH</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DISH NAME</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter dish name"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SERVING SIZE</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={servingSize}
                  onChangeText={setServingSize}
                  placeholder="e.g., 1 cup, 1 piece, 100g"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                />
              </View>

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

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={[zaraStyles.buttonOutline, { marginRight: ZaraTheme.spacing.md }]}
                  onPress={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                >
                  <Text style={zaraStyles.buttonTextOutline}>CANCEL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[zaraStyles.button, { flex: 1 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
                  ) : (
                    <Text style={zaraStyles.buttonText}>SAVE DISH</Text>
                  )}
                </TouchableOpacity>
              </View>
            </MinimalCard>
          )}

          {customDishes.length === 0 ? (
            <MinimalCard>
              <Text style={styles.emptyTitle}>No Custom Dishes</Text>
              <Text style={styles.emptyText}>
                Create custom dishes for foods you eat regularly. This makes logging meals faster and more accurate.
              </Text>
              
              {!showAddForm && (
                <TouchableOpacity 
                  style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.lg }]}
                  onPress={() => setShowAddForm(true)}
                >
                  <Plus size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
                  <Text style={[zaraStyles.buttonText, { marginLeft: ZaraTheme.spacing.sm }]}>
                    ADD FIRST DISH
                  </Text>
                </TouchableOpacity>
              )}
            </MinimalCard>
          ) : (
            customDishes.map((dish) => (
              <MinimalCard key={dish.id}>
                <View style={styles.dishHeader}>
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    <Text style={styles.dishServing}>{dish.servingSize}</Text>
                  </View>
                  
                  <View style={styles.dishActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => addToFoodLog(dish)}
                    >
                      <Plus size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDelete(dish)}
                    >
                      <Trash2 size={20} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.dishNutrition}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{dish.calories}</Text>
                    <Text style={styles.nutritionLabel}>CALORIES</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{dish.protein}g</Text>
                    <Text style={styles.nutritionLabel}>PROTEIN</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{dish.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>CARBS</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{dish.fat}g</Text>
                    <Text style={styles.nutritionLabel}>FAT</Text>
                  </View>
                </View>
              </MinimalCard>
            ))
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingTop: ZaraTheme.spacing.lg,
    paddingBottom: ZaraTheme.spacing.md,
  },
  backButton: {
    padding: ZaraTheme.spacing.sm,
  },
  addButton: {
    padding: ZaraTheme.spacing.sm,
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
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.lg,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyTitle: {
    ...ZaraTheme.typography.h3,
    textAlign: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  emptyText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ZaraTheme.spacing.md,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  dishServing: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  dishActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: ZaraTheme.spacing.sm,
    marginLeft: ZaraTheme.spacing.sm,
  },
  dishNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  nutritionLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
});