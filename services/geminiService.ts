import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NutritionInfo {
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  totalCalories: number;
  nutritionalScore: number;
  healthTips: string[];
}

export interface Recipe {
  name: string;
  cuisineType: string;
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Array<{ item: string; amount: string }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tips: string[];
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  restrictions: string[];
}

export interface NutritionGoals {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  private async initializeFromStorage() {
    try {
      const storedKey = await AsyncStorage.getItem('gemini_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
        this.genAI = new GoogleGenerativeAI(storedKey);
      }
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
    }
  }

  async setApiKey(apiKey: string): Promise<boolean> {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Test the API key
      await this.testConnection();
      this.apiKey = apiKey;
      await AsyncStorage.setItem('gemini_api_key', apiKey);
      return true;
    } catch (error) {
      console.error('Invalid API key:', error);
      return false;
    }
  }

  async testConnection(): Promise<void> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent('Hello, test connection');
  }

  isInitialized(): boolean {
    return this.genAI !== null && this.apiKey !== null;
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image: ${error}`);
    }
  }

  async analyzeFoodImage(imageUri: string): Promise<NutritionInfo> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized. Please configure your API key in settings.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imageData = await this.convertImageToBase64(imageUri);
      
      const prompt = `
        Analyze this food image and provide detailed nutritional information in JSON format.
        
        Identify all food items visible, estimate portion sizes and weights, calculate total calories and macronutrients.
        
        Return ONLY valid JSON in this exact format:
        {
          "foods": [{"name": "food_name", "quantity": "amount", "calories": 150, "protein": 10, "carbs": 20, "fat": 5}],
          "totalCalories": 150,
          "nutritionalScore": 75,
          "healthTips": ["tip1", "tip2"]
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const responseText = result.response.text();
      return this.parseNutritionalResponse(responseText);
    } catch (error) {
      throw new Error(`Food analysis failed: ${error}`);
    }
  }

  async generateRecipes(ingredients: string[]): Promise<Recipe[]> {
    if (!this.genAI) {
      throw new Error('Gemini API not initialized. Please configure your API key in settings.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Create 3 healthy recipes using these available ingredients: ${ingredients.join(', ')}
        
        Return ONLY valid JSON array with this exact structure:
        [
          {
            "name": "recipe_name",
            "cuisineType": "type",
            "cookingTime": "30 min",
            "difficulty": "easy",
            "servings": 4,
            "ingredients": [{"item": "name", "amount": "1 cup"}],
            "instructions": ["step1", "step2"],
            "nutrition": {"calories": 350, "protein": 20, "carbs": 40, "fat": 15},
            "tips": ["tip1", "tip2"]
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return this.parseRecipeResponse(responseText);
    } catch (error) {
      throw new Error(`Recipe generation failed: ${error}`);
    }
  }

  private parseNutritionalResponse(responseText: string): NutritionInfo {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        foods: parsed.foods || [],
        totalCalories: parsed.totalCalories || 0,
        nutritionalScore: parsed.nutritionalScore || 0,
        healthTips: parsed.healthTips || []
      };
    } catch (error) {
      // Return mock data if parsing fails
      return {
        foods: [
          {
            name: 'Unknown Food',
            quantity: '1 serving',
            calories: 200,
            protein: 10,
            carbs: 30,
            fat: 8
          }
        ],
        totalCalories: 200,
        nutritionalScore: 50,
        healthTips: ['Consider adding more vegetables', 'Stay hydrated']
      };
    }
  }

  private parseRecipeResponse(responseText: string): Recipe[] {
    try {
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      // Return mock recipes if parsing fails
      return [
        {
          name: 'Simple Stir Fry',
          cuisineType: 'Asian',
          cookingTime: '15 min',
          difficulty: 'easy',
          servings: 2,
          ingredients: [
            { item: 'Mixed vegetables', amount: '2 cups' },
            { item: 'Oil', amount: '1 tbsp' },
            { item: 'Soy sauce', amount: '2 tbsp' }
          ],
          instructions: [
            'Heat oil in a wok or large skillet',
            'Add vegetables and stir-fry for 5-7 minutes',
            'Add soy sauce and cook for 2 more minutes'
          ],
          nutrition: {
            calories: 180,
            protein: 6,
            carbs: 20,
            fat: 8
          },
          tips: ['Use high heat for best results', 'Don\'t overcook vegetables']
        }
      ];
    }
  }
}

export const geminiService = new GeminiService();