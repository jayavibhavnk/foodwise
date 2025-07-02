import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScanLine, Plus, Calendar, ChefHat, Settings } from 'lucide-react-native';
import { format } from 'date-fns';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { RecipeCard } from '@/components/RecipeCard';
import { geminiService, Recipe } from '@/services/geminiService';
import { foodLogService } from '@/services/foodLogService';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState({
    consumedCalories: 0,
    dailyGoal: user?.dailyCalorieGoal || 2000,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    loadTodayStats();
    loadSuggestedRecipes();
  }, []);

  const loadTodayStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyLog = await foodLogService.getDailyLog(today);
    
    setTodayStats({
      consumedCalories: dailyLog.totalCalories,
      dailyGoal: user?.dailyCalorieGoal || 2000,
      protein: dailyLog.totalProtein,
      carbs: dailyLog.totalCarbs,
      fat: dailyLog.totalFat,
    });
  };

  const loadSuggestedRecipes = async () => {
    if (!geminiService.isInitialized()) {
      return;
    }

    setLoadingRecipes(true);
    try {
      // Mock pantry ingredients for demo
      const pantryIngredients = ['chicken breast', 'rice', 'broccoli', 'garlic', 'onion'];
      const recipes = await geminiService.generateRecipes(pantryIngredients);
      setSuggestedRecipes(recipes.slice(0, 2)); // Show only 2 recipes on dashboard
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const calorieProgress = (todayStats.consumedCalories / todayStats.dailyGoal) * 100;

  // Get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <ScrollView style={zaraStyles.container} showsVerticalScrollIndicator={false}>
        <View style={zaraStyles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={zaraStyles.title}>FOODWISE</Text>
              {user && (
                <Text style={styles.greeting}>
                  Hi {getFirstName(user.name)}
                </Text>
              )}
              <Text style={zaraStyles.subtitle}>
                {format(new Date(), 'EEEE, MMMM do')}
              </Text>
            </View>
          </View>
        </View>

        {/* Calorie Progress */}
        <MinimalCard style={styles.progressCard}>
          <Text style={styles.sectionTitle}>TODAY'S INTAKE</Text>
          <View style={styles.calorieStats}>
            <View style={styles.calorieMain}>
              <Text style={styles.calorieNumber}>
                {todayStats.consumedCalories}
              </Text>
              <Text style={styles.calorieGoal}>
                / {todayStats.dailyGoal} cal
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(calorieProgress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(calorieProgress)}% of daily goal
            </Text>
          </View>
          
          <View style={styles.macros}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.protein}g</Text>
              <Text style={styles.macroLabel}>PROTEIN</Text>
              {user && (
                <Text style={styles.macroGoal}>/ {user.proteinGoal}g</Text>
              )}
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.carbs}g</Text>
              <Text style={styles.macroLabel}>CARBS</Text>
              {user && (
                <Text style={styles.macroGoal}>/ {user.carbsGoal}g</Text>
              )}
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.fat}g</Text>
              <Text style={styles.macroLabel}>FAT</Text>
              {user && (
                <Text style={styles.macroGoal}>/ {user.fatGoal}g</Text>
              )}
            </View>
          </View>
        </MinimalCard>

        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          <TouchableOpacity 
            style={[styles.primaryButton, styles.scanButton]} 
            onPress={() => router.push('/scanner')}
          >
            <ScanLine size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
            <Text style={[styles.primaryButtonText, { marginLeft: ZaraTheme.spacing.sm }]}>
              SCAN FOOD
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.primaryButton, styles.addButton]}
            onPress={() => router.push('/add-grocery')}
          >
            <Plus size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={[styles.primaryButtonTextOutline, { marginLeft: ZaraTheme.spacing.sm }]}>
              ADD GROCERY
            </Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={[styles.secondaryButtonText, { marginLeft: ZaraTheme.spacing.sm }]}>
              CALENDAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/meal-planner')}
          >
            <ChefHat size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={[styles.secondaryButtonText, { marginLeft: ZaraTheme.spacing.sm }]}>
              MEAL PLAN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personalized Insights */}
        {user && (
          <MinimalCard style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>YOUR PROGRESS</Text>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Daily Goal</Text>
                <Text style={styles.insightValue}>{user.dailyCalorieGoal} calories</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Activity Level</Text>
                <Text style={styles.insightValue}>
                  {user.activityLevel?.charAt(0).toUpperCase() + user.activityLevel?.slice(1).replace('_', ' ')}
                </Text>
              </View>
              {user.dietaryRestrictions && user.dietaryRestrictions.length > 0 && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>Dietary Preferences</Text>
                  <Text style={styles.insightValue}>
                    {user.dietaryRestrictions.slice(0, 2).join(', ')}
                    {user.dietaryRestrictions.length > 2 && ` +${user.dietaryRestrictions.length - 2} more`}
                  </Text>
                </View>
              )}
            </View>
          </MinimalCard>
        )}

        {/* Recipe Suggestions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SUGGESTED RECIPES</Text>
            <TouchableOpacity onPress={() => router.push('/recipes')}>
              <Text style={styles.seeAll}>SEE ALL</Text>
            </TouchableOpacity>
          </View>
          
          {!geminiService.isInitialized() ? (
            <MinimalCard>
              <Text style={styles.configureText}>
                Configure Gemini AI in Settings to get personalized recipe suggestions
              </Text>
              <TouchableOpacity 
                style={[zaraStyles.buttonOutline, { marginTop: ZaraTheme.spacing.md }]}
                onPress={() => router.push('/settings')}
              >
                <Text style={zaraStyles.buttonTextOutline}>CONFIGURE AI</Text>
              </TouchableOpacity>
            </MinimalCard>
          ) : loadingRecipes ? (
            <MinimalCard>
              <Text style={styles.loadingText}>Loading personalized recipes...</Text>
            </MinimalCard>
          ) : suggestedRecipes.length > 0 ? (
            suggestedRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.name}
                recipe={recipe} 
                onPress={() => {
                  Alert.alert(
                    recipe.name,
                    `${recipe.instructions.length} steps • ${recipe.cookingTime}`,
                    [{ text: 'OK' }]
                  );
                }}
              />
            ))
          ) : (
            <MinimalCard>
              <Text style={styles.noRecipesText}>
                Add items to your pantry to get recipe suggestions
              </Text>
            </MinimalCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...ZaraTheme.typography.h3,
    color: ZaraTheme.colors.mediumGray,
    marginTop: ZaraTheme.spacing.xs,
    marginBottom: ZaraTheme.spacing.xs,
  },
  progressCard: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  calorieStats: {
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.lg,
  },
  calorieMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: ZaraTheme.spacing.md,
  },
  calorieNumber: {
    ...ZaraTheme.typography.h1,
    fontSize: 42,
  },
  calorieGoal: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.mediumGray,
    marginLeft: ZaraTheme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: ZaraTheme.colors.lightGray,
    marginBottom: ZaraTheme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
  },
  progressText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  macroLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  macroGoal: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.lightGray,
    fontSize: 10,
    marginTop: 2,
  },
  primaryActions: {
    flexDirection: 'row',
    marginBottom: ZaraTheme.spacing.lg,
    gap: ZaraTheme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    paddingHorizontal: ZaraTheme.spacing.md,
    minHeight: 48,
    borderWidth: 1,
  },
  scanButton: {
    backgroundColor: ZaraTheme.colors.black,
    borderColor: ZaraTheme.colors.black,
  },
  addButton: {
    backgroundColor: ZaraTheme.colors.white,
    borderColor: ZaraTheme.colors.black,
  },
  primaryButtonText: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.white,
    fontSize: width < 375 ? 12 : 14,
  },
  primaryButtonTextOutline: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.black,
    fontSize: width < 375 ? 12 : 14,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginBottom: ZaraTheme.spacing.lg,
    gap: ZaraTheme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    paddingHorizontal: ZaraTheme.spacing.sm,
    backgroundColor: ZaraTheme.colors.white,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.black,
    minHeight: 48,
  },
  secondaryButtonText: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.black,
    fontSize: width < 375 ? 12 : 14,
  },
  insightsCard: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  insightsList: {
    gap: ZaraTheme.spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.mediumGray,
  },
  insightValue: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
    fontWeight: '500',
  },
  section: {
    marginBottom: ZaraTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  seeAll: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  configureText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
  },
  loadingText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
  },
  noRecipesText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
  },
});