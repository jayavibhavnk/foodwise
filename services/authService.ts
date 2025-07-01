import AsyncStorage from '@react-native-async-storage/async-storage';
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
  onboardingCompleted: boolean;
  createdAt: Date;
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
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          user.createdAt = new Date(user.createdAt);
          this.authState = {
            isAuthenticated: true,
            user,
            isLoading: false,
          };
        } else {
          await AsyncStorage.removeItem('auth_token');
          this.authState.isLoading = false;
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

  private async generateSecureToken(email: string): Promise<string> {
    const timestamp = Date.now().toString();
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${email}:${timestamp}:${randomString}`
    );
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
        onboardingCompleted: false,
        createdAt: new Date(),
      };

      // Hash password
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + userId
      );

      // Store password securely
      await AsyncStorage.setItem(`password_${userId}`, hashedPassword);

      // Store user data
      users.push({ id: userId, email, hashedPassword });
      await AsyncStorage.setItem('all_users', JSON.stringify(users));
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));

      // Generate and store auth token
      const token = await this.generateSecureToken(email);
      await AsyncStorage.setItem('auth_token', token);

      this.authState = {
        isAuthenticated: true,
        user: newUser,
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

      // Hash provided password and compare
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + user.id
      );

      const storedPassword = await AsyncStorage.getItem(`password_${user.id}`);
      if (storedPassword !== hashedPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Load full user data
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const fullUser = JSON.parse(userData);
        fullUser.createdAt = new Date(fullUser.createdAt);
        
        // Generate and store new auth token
        const token = await this.generateSecureToken(email);
        await AsyncStorage.setItem('auth_token', token);
        
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
      await AsyncStorage.removeItem('auth_token');
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
    const result = await this.updateUser({ ...userData, onboardingCompleted: true });
    return result;
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingUsers = await AsyncStorage.getItem('all_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const user = users.find((u: any) => u.email === email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // In a real app, you would send an email with a reset link
      // For now, we'll just return success
      return { success: true };
    } catch (error) {
      console.error('Reset password failed:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }
}

export const authService = AuthService.getInstance();