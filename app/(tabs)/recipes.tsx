import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { RecipeCard } from '@/components/RecipeCard';
import { MinimalCard } from '@/components/MinimalCard';
import { geminiService, Recipe } from '@/services/geminiService';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    if (!geminiService.isInitialized()) {
      return;
    }

    setLoading(true);
    try {
      // Mock pantry ingredients - in a real app, this would come from the user's actual pantry
      const pantryIngredients = [
        'chicken breast', 'rice', 'broccoli', 'garlic', 'onion', 
        'olive oil', 'tomatoes', 'spinach', 'cheese', 'eggs'
      ];
      
      const generatedRecipes = await geminiService.generateRecipes(pantryIngredients);
      setRecipes(generatedRecipes);
    } catch (error) {
      Alert.alert(
        'Recipe Generation Failed',
        'Unable to generate recipes. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe: Recipe) => {
    const ingredientsList = recipe.ingredients
      .map(ing => `• ${ing.amount} ${ing.item}`)
      .join('\n');
    
    const instructionsList = recipe.instructions
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n\n');

    Alert.alert(
      recipe.name,
      `Cooking Time: ${recipe.cookingTime}\nServings: ${recipe.servings}\n\nIngredients:\n${ingredientsList}\n\nInstructions:\n${instructionsList}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Add to Meal Plan', 
          onPress: () => {
            Alert.alert('Success', 'Recipe added to your meal plan!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={zaraStyles.header}>
          <Text style={zaraStyles.title}>RECIPES</Text>
          <Text style={zaraStyles.subtitle}>
            AI-generated recipes from your pantry
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[zaraStyles.buttonOutline, styles.refreshButton]} 
            onPress={loadRecipes}
            disabled={loading || !geminiService.isInitialized()}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.black} />
            ) : (
              <RefreshCw size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            )}
            <Text style={[zaraStyles.buttonTextOutline, { marginLeft: ZaraTheme.spacing.sm }]}>
              {loading ? 'GENERATING...' : 'NEW RECIPES'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.recipesList} showsVerticalScrollIndicator={false}>
          {!geminiService.isInitialized() ? (
            <MinimalCard>
              <Text style={styles.configureTitle}>AI Configuration Required</Text>
              <Text style={styles.configureText}>
                Configure your Gemini API key in Settings to generate personalized recipes from your pantry ingredients.
              </Text>
              <TouchableOpacity 
                style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.md }]}
                onPress={() => Alert.alert('Settings', 'Navigate to Settings tab to configure AI')}
              >
                <Text style={zaraStyles.buttonText}>CONFIGURE AI</Text>
              </TouchableOpacity>
            </MinimalCard>
          ) : loading ? (
            <MinimalCard>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
                <Text style={styles.loadingText}>
                  Generating personalized recipes...
                </Text>
              </View>
            </MinimalCard>
          ) : recipes.length === 0 ? (
            <MinimalCard>
              <Text style={styles.emptyTitle}>No Recipes Available</Text>
              <Text style={styles.emptyText}>
                Add items to your pantry or tap "New Recipes" to generate recipe suggestions.
              </Text>
            </MinimalCard>
          ) : (
            recipes.map(recipe => (
              <RecipeCard
                key={recipe.name}
                recipe={recipe}
                onPress={() => handleRecipePress(recipe)}
              />
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
  actions: {
    paddingHorizontal: ZaraTheme.spacing.md,
    marginBottom: ZaraTheme.spacing.lg,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipesList: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  configureTitle: {
    ...ZaraTheme.typography.h3,
    textAlign: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  configureText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.lg,
  },
  loadingText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    marginTop: ZaraTheme.spacing.md,
    textAlign: 'center',
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
});