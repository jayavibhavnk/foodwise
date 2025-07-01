import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { foodLogService } from '@/services/foodLogService';
import { mealPlanService } from '@/services/mealPlanService';
import { Calendar, Plus, Target, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [todayMeals, setTodayMeals] = useState<any[]>([]);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const meals = await foodLogService.getMealsForDate(today);
      const stats = await foodLogService.getDailyStats(today);
      
      setTodayMeals(meals);
      setTodayStats(stats);
    } catch (error) {
      console.error('Failed to load today data:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCalorieProgress = () => {
    if (!user) return 0;
    return Math.min((todayStats.calories / user.dailyCalorieGoal) * 100, 100);
  };

  const getMacroProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          
          {/* Calorie Progress */}
          <View style={styles.calorieCard}>
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieTitle}>Calories</Text>
              <Text style={styles.calorieCount}>
                {todayStats.calories} / {user?.dailyCalorieGoal || 2000}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getCalorieProgress()}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getCalorieProgress())}% of daily goal
            </Text>
          </View>

          {/* Macro Progress */}
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {Math.round(todayStats.protein)}g
              </Text>
              <View style={styles.macroBar}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getMacroProgress(todayStats.protein, user?.proteinGoal || 150)}%`,
                      backgroundColor: '#FF6B6B'
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {Math.round(todayStats.carbs)}g
              </Text>
              <View style={styles.macroBar}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getMacroProgress(todayStats.carbs, user?.carbsGoal || 250)}%`,
                      backgroundColor: '#4ECDC4'
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>
                {Math.round(todayStats.fat)}g
              </Text>
              <View style={styles.macroBar}>
                <View 
                  style={[
                    styles.macroFill, 
                    { 
                      width: `${getMacroProgress(todayStats.fat, user?.fatGoal || 65)}%`,
                      backgroundColor: '#FFE66D'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/add-food')}
            >
              <Plus size={24} color="#007AFF" />
              <Text style={styles.actionText}>Log Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/meal-planner')}
            >
              <Target size={24} color="#007AFF" />
              <Text style={styles.actionText}>Meal Plan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/scanner')}
            >
              <TrendingUp size={24} color="#007AFF" />
              <Text style={styles.actionText}>Scan Food</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {todayMeals.length > 0 ? (
            todayMeals.slice(0, 3).map((meal, index) => (
              <View key={index} style={styles.mealItem}>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.mealType}</Text>
                </View>
                <Text style={styles.mealCalories}>
                  {Math.round(meal.calories)} cal
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyText}>No meals logged today</Text>
              <TouchableOpacity 
                style={styles.addMealButton}
                onPress={() => router.push('/add-food')}
              >
                <Text style={styles.addMealText}>Add your first meal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  calendarButton: {
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  calorieCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calorieCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  macroBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  macroFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginTop: 8,
  },
  mealsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyMeals: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  addMealButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addMealText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});