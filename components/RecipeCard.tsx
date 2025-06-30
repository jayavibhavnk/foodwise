import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, User, ChefHat } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { Recipe } from '@/services/geminiService';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return ZaraTheme.colors.black;
      case 'medium': return ZaraTheme.colors.darkGray;
      case 'hard': return ZaraTheme.colors.mediumGray;
      default: return ZaraTheme.colors.black;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.cuisine}>{recipe.cuisineType}</Text>
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Clock size={14} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
          <Text style={styles.infoText}>{recipe.cookingTime}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <User size={14} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
          <Text style={styles.infoText}>{recipe.servings}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <ChefHat size={14} color={getDifficultyColor(recipe.difficulty)} strokeWidth={1.5} />
          <Text style={[styles.infoText, { color: getDifficultyColor(recipe.difficulty) }]}>
            {recipe.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={zaraStyles.divider} />

      <View style={styles.nutrition}>
        <Text style={styles.calories}>{recipe.nutrition.calories} cal</Text>
        <Text style={styles.macros}>
          P: {recipe.nutrition.protein}g | C: {recipe.nutrition.carbs}g | F: {recipe.nutrition.fat}g
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...zaraStyles.card,
    marginHorizontal: 0,
  },
  header: {
    marginBottom: ZaraTheme.spacing.sm,
  },
  title: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  cuisine: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...ZaraTheme.typography.caption,
    marginLeft: ZaraTheme.spacing.xs,
  },
  nutrition: {
    alignItems: 'center',
  },
  calories: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  macros: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
});