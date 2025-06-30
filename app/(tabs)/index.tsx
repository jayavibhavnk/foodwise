import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScanLine, Plus, TrendingUp } from 'lucide-react-native';
import { format } from 'date-fns';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { RecipeCard } from '@/components/RecipeCard';
import { BoltBadge } from '@/components/BoltBadge';
import { geminiService, Recipe } from '@/services/geminiService';

interface DayStats {
  consumedCalories: number;
  dailyGoal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function DashboardScreen() {
  const [todayStats, setTodayStats] = useState<DayStats>({
    consumedCalories: 1247,
    dailyGoal: 2000,
    protein: 65,
    carbs: 140,
    fat: 45,
  });
  
  const [pantryAlerts, setPantryAlerts] = useState([
    'Tomatoes expire in 2 days',
    'Yogurt expires today',
  ]);
  
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    loadSuggestedRecipes();
  }, []);

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

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      {/* Bolt.new Badge - Required for hackathon */}
      <BoltBadge variant="light" position="topRight" />
      
      <ScrollView style={zaraStyles.container} showsVerticalScrollIndicator={false}>
        <View style={zaraStyles.header}>
          <Text style={zaraStyles.title}>FOODWISE</Text>
          <Text style={zaraStyles.subtitle}>
            {format(new Date(), 'EEEE, MMMM do')}
          </Text>
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
          </View>
          
          <View style={styles.macros}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.protein}g</Text>
              <Text style={styles.macroLabel}>PROTEIN</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.carbs}g</Text>
              <Text style={styles.macroLabel}>CARBS</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{todayStats.fat}g</Text>
              <Text style={styles.macroLabel}>FAT</Text>
            </View>
          </View>
        </MinimalCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={zaraStyles.button} 
            onPress={() => router.push('/scanner')}
          >
            <ScanLine size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
            <Text style={[zaraStyles.buttonText, { marginLeft: ZaraTheme.spacing.sm }]}>
              SCAN FOOD
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[zaraStyles.buttonOutline, { marginLeft: ZaraTheme.spacing.md }]}
            onPress={() => router.push('/pantry')}
          >
            <Plus size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={[zaraStyles.buttonTextOutline, { marginLeft: ZaraTheme.spacing.sm }]}>
              ADD GROCERY
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pantry Alerts */}
        {pantryAlerts.length > 0 && (
          <MinimalCard>
            <Text style={styles.sectionTitle}>PANTRY ALERTS</Text>
            {pantryAlerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <TrendingUp size={16} color={ZaraTheme.colors.black} strokeWidth={1.5} />
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
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
    height: 2,
    backgroundColor: ZaraTheme.colors.lightGray,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
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
  quickActions: {
    flexDirection: 'row',
    marginBottom: ZaraTheme.spacing.lg,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.sm,
  },
  alertText: {
    ...ZaraTheme.typography.bodySmall,
    marginLeft: ZaraTheme.spacing.sm,
    flex: 1,
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