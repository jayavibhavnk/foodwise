import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';
import { geminiService } from './geminiService';
import { foodLogService, CustomDish } from './foodLogService';

export interface MealPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  dailyPlans: DailyMealPlan[];
  userId: string;
  createdAt: Date;
}

export interface DailyMealPlan {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: PlannedMeal[];
    lunch: PlannedMeal[];
    dinner: PlannedMeal[];
    snacks: PlannedMeal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface PlannedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  isCustom?: boolean;
  customDishId?: string;
}

class MealPlanService {
  private static instance: MealPlanService;

  static getInstance(): MealPlanService {
    if (!MealPlanService.instance) {
      MealPlanService.instance = new MealPlanService();
    }
    return MealPlanService.instance;
  }

  private async getUserId(): Promise<string | null> {
    const authState = authService.getAuthState();
    return authState.user?.id || null;
  }

  async generateWeeklyMealPlan(startDate: Date): Promise<{ success: boolean; mealPlan?: MealPlan; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const user = authService.getAuthState().user;
      if (!user) {
        return { success: false, error: 'User data not found' };
      }

      if (!geminiService.isInitialized()) {
        return { success: false, error: 'AI service not configured' };
      }

      // Get user's custom dishes
      const customDishes = await foodLogService.getCustomDishes();

      // Generate meal plan using AI
      const mealPlan = await this.generateAIMealPlan(user, customDishes, startDate);

      // Save meal plan
      const savedPlan = await this.saveMealPlan(mealPlan);
      
      return { success: true, mealPlan: savedPlan };
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      return { success: false, error: 'Failed to generate meal plan' };
    }
  }

  private async generateAIMealPlan(user: any, customDishes: CustomDish[], startDate: Date): Promise<MealPlan> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const dailyPlans: DailyMealPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      const dailyPlan = await this.generateDailyMealPlan(user, customDishes, dateKey);
      dailyPlans.push(dailyPlan);
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `Meal Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      dailyPlans,
      userId: user.id,
      createdAt: new Date(),
    };
  }

  private async generateDailyMealPlan(user: any, customDishes: CustomDish[], date: string): Promise<DailyMealPlan> {
    try {
      const prompt = `
        Generate a daily meal plan for a user with the following profile:
        - Daily calorie goal: ${user.dailyCalorieGoal}
        - Protein goal: ${user.proteinGoal}g
        - Carbs goal: ${user.carbsGoal}g
        - Fat goal: ${user.fatGoal}g
        - Dietary restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}
        - Activity level: ${user.activityLevel || 'moderate'}

        Available custom dishes: ${customDishes.map(d => `${d.name} (${d.calories} cal)`).join(', ')}

        Create a balanced meal plan with breakfast, lunch, dinner, and snacks.
        
        Return ONLY valid JSON in this exact format:
        {
          "breakfast": [{"name": "meal_name", "calories": 300, "protein": 15, "carbs": 40, "fat": 10, "servingSize": "1 serving"}],
          "lunch": [{"name": "meal_name", "calories": 400, "protein": 25, "carbs": 45, "fat": 15, "servingSize": "1 serving"}],
          "dinner": [{"name": "meal_name", "calories": 500, "protein": 30, "carbs": 50, "fat": 20, "servingSize": "1 serving"}],
          "snacks": [{"name": "snack_name", "calories": 150, "protein": 5, "carbs": 20, "fat": 6, "servingSize": "1 serving"}]
        }
      `;

      const result = await geminiService.generateMealPlan(prompt);
      
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      const meals = {
        breakfast: this.convertToPlannedMeals(result.breakfast || [], customDishes),
        lunch: this.convertToPlannedMeals(result.lunch || [], customDishes),
        dinner: this.convertToPlannedMeals(result.dinner || [], customDishes),
        snacks: this.convertToPlannedMeals(result.snacks || [], customDishes),
      };

      // Calculate totals
      Object.values(meals).forEach(mealArray => {
        mealArray.forEach(meal => {
          totalCalories += meal.calories;
          totalProtein += meal.protein;
          totalCarbs += meal.carbs;
          totalFat += meal.fat;
        });
      });

      return {
        date,
        meals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    } catch (error) {
      console.error('Failed to generate daily meal plan:', error);
      // Return a basic meal plan if AI fails
      return this.getBasicDailyMealPlan(date, user);
    }
  }

  private convertToPlannedMeals(meals: any[], customDishes: CustomDish[]): PlannedMeal[] {
    return meals.map(meal => {
      const customDish = customDishes.find(d => d.name.toLowerCase() === meal.name.toLowerCase());
      
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        servingSize: meal.servingSize,
        isCustom: !!customDish,
        customDishId: customDish?.id,
      };
    });
  }

  private getBasicDailyMealPlan(date: string, user: any): DailyMealPlan {
    const targetCalories = user.dailyCalorieGoal;
    
    return {
      date,
      meals: {
        breakfast: [{
          id: '1',
          name: 'Oatmeal with Berries',
          calories: Math.round(targetCalories * 0.25),
          protein: Math.round(user.proteinGoal * 0.2),
          carbs: Math.round(user.carbsGoal * 0.3),
          fat: Math.round(user.fatGoal * 0.2),
          servingSize: '1 bowl',
        }],
        lunch: [{
          id: '2',
          name: 'Grilled Chicken Salad',
          calories: Math.round(targetCalories * 0.35),
          protein: Math.round(user.proteinGoal * 0.4),
          carbs: Math.round(user.carbsGoal * 0.3),
          fat: Math.round(user.fatGoal * 0.3),
          servingSize: '1 serving',
        }],
        dinner: [{
          id: '3',
          name: 'Salmon with Vegetables',
          calories: Math.round(targetCalories * 0.3),
          protein: Math.round(user.proteinGoal * 0.3),
          carbs: Math.round(user.carbsGoal * 0.25),
          fat: Math.round(user.fatGoal * 0.4),
          servingSize: '1 serving',
        }],
        snacks: [{
          id: '4',
          name: 'Greek Yogurt',
          calories: Math.round(targetCalories * 0.1),
          protein: Math.round(user.proteinGoal * 0.1),
          carbs: Math.round(user.carbsGoal * 0.15),
          fat: Math.round(user.fatGoal * 0.1),
          servingSize: '1 cup',
        }],
      },
      totalCalories: targetCalories,
      totalProtein: user.proteinGoal,
      totalCarbs: user.carbsGoal,
      totalFat: user.fatGoal,
    };
  }

  private async saveMealPlan(mealPlan: MealPlan): Promise<MealPlan> {
    const userId = await this.getUserId();
    if (!userId) throw new Error('User not authenticated');

    const existingPlans = await this.getMealPlans();
    const updatedPlans = [...existingPlans, mealPlan];

    await AsyncStorage.setItem(`meal_plans_${userId}`, JSON.stringify(updatedPlans));
    return mealPlan;
  }

  async getMealPlans(): Promise<MealPlan[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) return [];

      const stored = await AsyncStorage.getItem(`meal_plans_${userId}`);
      if (stored) {
        const plans = JSON.parse(stored);
        return plans.map((plan: any) => ({
          ...plan,
          startDate: new Date(plan.startDate),
          endDate: new Date(plan.endDate),
          createdAt: new Date(plan.createdAt),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get meal plans:', error);
      return [];
    }
  }

  async deleteMealPlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingPlans = await this.getMealPlans();
      const updatedPlans = existingPlans.filter(plan => plan.id !== planId);

      await AsyncStorage.setItem(`meal_plans_${userId}`, JSON.stringify(updatedPlans));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete meal plan:', error);
      return { success: false, error: 'Failed to delete meal plan' };
    }
  }

  async getCurrentMealPlan(): Promise<MealPlan | null> {
    const plans = await this.getMealPlans();
    const today = new Date();
    
    return plans.find(plan => 
      plan.startDate <= today && plan.endDate >= today
    ) || null;
  }
}

export const mealPlanService = MealPlanService.getInstance();