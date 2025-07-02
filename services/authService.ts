import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  height?: number; // in cm
  weight?: number; // in kg
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  dietaryRestrictions: string[];
  createdAt: Date;
  onboardingCompleted?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        user.createdAt = new Date(user.createdAt);
        
        // Check if user has completed onboarding
        if (user.onboardingCompleted !== false) {
          this.authState = {
            isAuthenticated: true,
            user,
            isLoading: false,
          };
        } else {
          // User exists but hasn't completed onboarding
          this.authState = {
            isAuthenticated: false,
            user: null,
            isLoading: false,
          };
        }
      } else {
        this.authState.isLoading = false;
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      this.authState.isLoading = false;
    }
    this.notifyListeners();
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already exists
      const existingUsers = await AsyncStorage.getItem('all_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Create new user
      const userId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        email + Date.now().toString()
      );

      const newUser: User = {
        id: userId,
        email,
        name,
        dailyCalorieGoal: 2000,
        proteinGoal: 150,
        carbsGoal: 250,
        fatGoal: 65,
        dietaryRestrictions: [],
        createdAt: new Date(),
        onboardingCompleted: false,
      };

      // Store password securely
      await SecureStore.setItemAsync(`password_${userId}`, password);

      // Store user data
      users.push({ id: userId, email, password: 'hashed' }); // Don't store actual password
      await AsyncStorage.setItem('all_users', JSON.stringify(users));
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));

      // Don't authenticate yet - user needs to complete onboarding
      this.authState = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };

      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingUsers = await AsyncStorage.getItem('all_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const user = users.find((u: any) => u.email === email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const storedPassword = await SecureStore.getItemAsync(`password_${user.id}`);
      if (storedPassword !== password) {
        return { success: false, error: 'Invalid password' };
      }

      // Load full user data
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const fullUser = JSON.parse(userData);
        fullUser.createdAt = new Date(fullUser.createdAt);
        
        // Check if onboarding is completed
        if (fullUser.onboardingCompleted === false) {
          // User needs to complete onboarding
          this.authState = {
            isAuthenticated: false,
            user: null,
            isLoading: false,
          };
          this.notifyListeners();
          return { success: false, error: 'Please complete your profile setup' };
        }
        
        this.authState = {
          isAuthenticated: true,
          user: fullUser,
          isLoading: false,
        };
      }

      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_data');
      this.authState = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async updateUser(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.authState.user) {
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser = { ...this.authState.user, ...updates };
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

      this.authState = {
        ...this.authState,
        user: updatedUser,
      };

      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Update user failed:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  async completeOnboarding(userData: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUserData = await AsyncStorage.getItem('user_data');
      if (!currentUserData) {
        return { success: false, error: 'No user data found' };
      }

      const user = JSON.parse(currentUserData);
      const updatedUser = { 
        ...user, 
        ...userData, 
        onboardingCompleted: true,
        createdAt: new Date(user.createdAt)
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

      this.authState = {
        isAuthenticated: true,
        user: updatedUser,
        isLoading: false,
      };

      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Complete onboarding failed:', error);
      return { success: false, error: 'Failed to complete onboarding' };
    }
  }
}

export const authService = AuthService.getInstance();