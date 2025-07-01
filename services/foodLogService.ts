import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  userId: string;
  isCustom?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface CustomDish {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  userId: string;
  createdAt: Date;
}

class FoodLogService {
  private static instance: FoodLogService;

  static getInstance(): FoodLogService {
    if (!FoodLogService.instance) {
      FoodLogService.instance = new FoodLogService();
    }
    return FoodLogService.instance;
  }

  private async getUserId(): Promise<string | null> {
    const authState = authService.getAuthState();
    return authState.user?.id || null;
  }

  async addFoodEntry(entry: Omit<FoodEntry, 'id' | 'userId' | 'timestamp'>): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const foodEntry: FoodEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId,
        timestamp: new Date(),
      };

      const dateKey = new Date().toISOString().split('T')[0];
      const dailyLog = await this.getDailyLog(dateKey);

      const updatedLog: DailyLog = {
        date: dateKey,
        entries: [...dailyLog.entries, foodEntry],
        totalCalories: dailyLog.totalCalories + entry.calories,
        totalProtein: dailyLog.totalProtein + entry.protein,
        totalCarbs: dailyLog.totalCarbs + entry.carbs,
        totalFat: dailyLog.totalFat + entry.fat,
      };

      await AsyncStorage.setItem(`food_log_${userId}_${dateKey}`, JSON.stringify(updatedLog));
      return { success: true };
    } catch (error) {
      console.error('Failed to add food entry:', error);
      return { success: false, error: 'Failed to log food' };
    }
  }

  async getDailyLog(date: string): Promise<DailyLog> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return this.getEmptyDailyLog(date);
      }

      const stored = await AsyncStorage.getItem(`food_log_${userId}_${date}`);
      if (stored) {
        const log = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        log.entries = log.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        return log;
      }

      return this.getEmptyDailyLog(date);
    } catch (error) {
      console.error('Failed to get daily log:', error);
      return this.getEmptyDailyLog(date);
    }
  }

  private getEmptyDailyLog(date: string): DailyLog {
    return {
      date,
      entries: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  }

  async getWeeklyLogs(startDate: Date): Promise<DailyLog[]> {
    const logs: DailyLog[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const log = await this.getDailyLog(dateKey);
      logs.push(log);
    }

    return logs;
  }

  async deleteFoodEntry(entryId: string, date: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const dailyLog = await this.getDailyLog(date);
      const entryToDelete = dailyLog.entries.find(e => e.id === entryId);
      
      if (!entryToDelete) {
        return { success: false, error: 'Entry not found' };
      }

      const updatedEntries = dailyLog.entries.filter(e => e.id !== entryId);
      const updatedLog: DailyLog = {
        date,
        entries: updatedEntries,
        totalCalories: dailyLog.totalCalories - entryToDelete.calories,
        totalProtein: dailyLog.totalProtein - entryToDelete.protein,
        totalCarbs: dailyLog.totalCarbs - entryToDelete.carbs,
        totalFat: dailyLog.totalFat - entryToDelete.fat,
      };

      await AsyncStorage.setItem(`food_log_${userId}_${date}`, JSON.stringify(updatedLog));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete food entry:', error);
      return { success: false, error: 'Failed to delete entry' };
    }
  }

  async addCustomDish(dish: Omit<CustomDish, 'id' | 'userId' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const customDish: CustomDish = {
        ...dish,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId,
        createdAt: new Date(),
      };

      const existingDishes = await this.getCustomDishes();
      const updatedDishes = [...existingDishes, customDish];

      await AsyncStorage.setItem(`custom_dishes_${userId}`, JSON.stringify(updatedDishes));
      return { success: true };
    } catch (error) {
      console.error('Failed to add custom dish:', error);
      return { success: false, error: 'Failed to add custom dish' };
    }
  }

  async getCustomDishes(): Promise<CustomDish[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) return [];

      const stored = await AsyncStorage.getItem(`custom_dishes_${userId}`);
      if (stored) {
        const dishes = JSON.parse(stored);
        return dishes.map((dish: any) => ({
          ...dish,
          createdAt: new Date(dish.createdAt),
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get custom dishes:', error);
      return [];
    }
  }

  async deleteCustomDish(dishId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const existingDishes = await this.getCustomDishes();
      const updatedDishes = existingDishes.filter(dish => dish.id !== dishId);

      await AsyncStorage.setItem(`custom_dishes_${userId}`, JSON.stringify(updatedDishes));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete custom dish:', error);
      return { success: false, error: 'Failed to delete custom dish' };
    }
  }
}

export const foodLogService = FoodLogService.getInstance();