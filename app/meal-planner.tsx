import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, RefreshCw, Calendar, Plus } from 'lucide-react-native';
import { format, startOfWeek, addDays } from 'date-fns';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { mealPlanService, MealPlan, DailyMealPlan } from '@/services/mealPlanService';

export default function MealPlannerScreen() {
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyMealPlan | null>(null);

  useEffect(() => {
    loadCurrentMealPlan();
  }, []);

  const loadCurrentMealPlan = async () => {
    setLoading(true);
    try {
      const mealPlan = await mealPlanService.getCurrentMealPlan();
      setCurrentMealPlan(mealPlan);
      
      if (mealPlan) {
        // Select today's plan if available
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = mealPlan.dailyPlans.find(plan => plan.date === today);
        setSelectedDay(todayPlan || mealPlan.dailyPlans[0]);
      }
    } catch (error) {
      console.error('Failed to load meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewMealPlan = async () => {
    setGenerating(true);
    try {
      const startDate = startOfWeek(new Date());
      const result = await mealPlanService.generateWeeklyMealPlan(startDate);
      
      if (result.success && result.mealPlan) {
        setCurrentMealPlan(result.mealPlan);
        setSelectedDay(result.mealPlan.dailyPlans[0]);
        Alert.alert('Success', 'New meal plan generated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to generate meal plan');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const addMealToLog = (meal: any) => {
    Alert.alert(
      'Add to Food Log',
      `Add "${meal.name}" to your food log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // Navigate to add food screen with pre-filled data
            router.push({
              pathname: '/add-food',
              params: {
                name: meal.name,
                calories: meal.calories.toString(),
                protein: meal.protein.toString(),
                carbs: meal.carbs.toString(),
                fat: meal.fat.toString(),
                quantity: meal.servingSize,
              }
            });
          }
        }
      ]
    );
  };

  const renderMealSection = (title: string, meals: any[]) => (
    <View style={styles.mealSection}>
      <Text style={styles.mealSectionTitle}>{title}</Text>
      {meals.length > 0 ? (
        meals.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealItem}
            onPress={() => addMealToLog(meal)}
          >
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDetails}>
                {meal.servingSize} • {meal.calories} cal
              </Text>
            </View>
            <Plus size={16} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noMealsText}>No meals planned</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={zaraStyles.safeArea}>
        <View style={zaraStyles.centerContent}>
          <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
          <Text style={[ZaraTheme.typography.bodySmall, { marginTop: ZaraTheme.spacing.md }]}>
            Loading meal plan...
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
          
          <Text style={zaraStyles.title}>MEAL PLANNER</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!currentMealPlan ? (
            <MinimalCard>
              <Text style={styles.noMealPlanTitle}>No Meal Plan Available</Text>
              <Text style={styles.noMealPlanText}>
                Generate a personalized weekly meal plan based on your nutrition goals and preferences.
              </Text>
              
              <TouchableOpacity 
                style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.lg }]}
                onPress={generateNewMealPlan}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
                ) : (
                  <>
                    <RefreshCw size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
                    <Text style={[zaraStyles.buttonText, { marginLeft: ZaraTheme.spacing.sm }]}>
                      GENERATE MEAL PLAN
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </MinimalCard>
          ) : (
            <>
              {/* Meal Plan Header */}
              <MinimalCard>
                <View style={styles.mealPlanHeader}>
                  <View>
                    <Text style={styles.mealPlanTitle}>{currentMealPlan.name}</Text>
                    <Text style={styles.mealPlanDates}>
                      {format(currentMealPlan.startDate, 'MMM d')} - {format(currentMealPlan.endDate, 'MMM d, yyyy')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={zaraStyles.buttonOutline}
                    onPress={generateNewMealPlan}
                    disabled={generating}
                  >
                    {generating ? (
                      <ActivityIndicator size="small" color={ZaraTheme.colors.black} />
                    ) : (
                      <>
                        <RefreshCw size={16} color={ZaraTheme.colors.black} strokeWidth={1.5} />
                        <Text style={[zaraStyles.buttonTextOutline, { marginLeft: ZaraTheme.spacing.xs }]}>
                          NEW
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </MinimalCard>

              {/* Day Selector */}
              <View style={styles.daySelector}>
                {currentMealPlan.dailyPlans.map((dayPlan, index) => {
                  const date = new Date(dayPlan.date);
                  const isSelected = selectedDay?.date === dayPlan.date;
                  
                  return (
                    <TouchableOpacity
                      key={dayPlan.date}
                      style={[
                        styles.dayButton,
                        isSelected && styles.dayButtonSelected
                      ]}
                      onPress={() => setSelectedDay(dayPlan)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected
                      ]}>
                        {format(date, 'EEE')}
                      </Text>
                      <Text style={[
                        styles.dayButtonDate,
                        isSelected && styles.dayButtonDateSelected
                      ]}>
                        {format(date, 'd')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Day Details */}
              {selectedDay && (
                <>
                  <MinimalCard>
                    <Text style={styles.selectedDayTitle}>
                      {format(new Date(selectedDay.date), 'EEEE, MMMM d')}
                    </Text>
                    
                    <View style={styles.dailyStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{selectedDay.totalCalories}</Text>
                        <Text style={styles.statLabel}>CALORIES</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{selectedDay.totalProtein}g</Text>
                        <Text style={styles.statLabel}>PROTEIN</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{selectedDay.totalCarbs}g</Text>
                        <Text style={styles.statLabel}>CARBS</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{selectedDay.totalFat}g</Text>
                        <Text style={styles.statLabel}>FAT</Text>
                      </View>
                    </View>
                  </MinimalCard>

                  <MinimalCard>
                    <Text style={styles.mealsTitle}>PLANNED MEALS</Text>
                    
                    {renderMealSection('BREAKFAST', selectedDay.meals.breakfast)}
                    {renderMealSection('LUNCH', selectedDay.meals.lunch)}
                    {renderMealSection('DINNER', selectedDay.meals.dinner)}
                    {renderMealSection('SNACKS', selectedDay.meals.snacks)}
                  </MinimalCard>
                </>
              )}
            </>
          )}

          {/* Quick Actions */}
          <MinimalCard>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/custom-dishes')}
            >
              <Text style={styles.actionButtonText}>Manage Custom Dishes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/add-food')}
            >
              <Text style={styles.actionButtonText}>Add Food to Log</Text>
            </TouchableOpacity>
          </MinimalCard>
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
  noMealPlanTitle: {
    ...ZaraTheme.typography.h3,
    textAlign: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  noMealPlanText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealPlanTitle: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  mealPlanDates: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.lg,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
  },
  dayButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  dayButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  dayButtonTextSelected: {
    color: ZaraTheme.colors.white,
  },
  dayButtonDate: {
    ...ZaraTheme.typography.body,
    marginTop: ZaraTheme.spacing.xs,
  },
  dayButtonDateSelected: {
    color: ZaraTheme.colors.white,
  },
  selectedDayTitle: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.md,
  },
  dailyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  statLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  mealsTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.lg,
    color: ZaraTheme.colors.black,
  },
  mealSection: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  mealSectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  mealDetails: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  noMealsText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  actionButton: {
    paddingVertical: ZaraTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
  },
  actionButtonText: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
  },
});