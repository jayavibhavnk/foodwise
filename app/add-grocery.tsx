import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';

const CATEGORIES = [
  'Fruits', 'Vegetables', 'Meat', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Other'
];

const UNITS = [
  'pieces', 'lbs', 'kg', 'oz', 'grams', 'cups', 'liters', 'ml', 'cans', 'boxes', 'bags'
];

export default function AddGroceryScreen() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('Other');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !quantity.trim()) {
      Alert.alert('Error', 'Please fill in item name and quantity');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would save to a pantry service
      // For now, we'll just show a success message
      Alert.alert(
        'Success',
        'Grocery item added to your pantry!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add grocery item');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(!showDatePicker);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={zaraStyles.title}>ADD GROCERY</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <MinimalCard>
            <Text style={styles.sectionTitle}>ITEM INFORMATION</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ITEM NAME</Text>
              <TextInput
                style={zaraStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                placeholderTextColor={ZaraTheme.colors.mediumGray}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.quantityRow}>
              <View style={styles.quantityInput}>
                <Text style={styles.label}>QUANTITY</Text>
                <TextInput
                  style={zaraStyles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Amount"
                  placeholderTextColor={ZaraTheme.colors.mediumGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.unitInput}>
                <Text style={styles.label}>UNIT</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.unitSelector}
                >
                  {UNITS.map((unitOption) => (
                    <TouchableOpacity
                      key={unitOption}
                      style={[
                        styles.unitButton,
                        unit === unitOption && styles.unitButtonSelected
                      ]}
                      onPress={() => setUnit(unitOption)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        unit === unitOption && styles.unitButtonTextSelected
                      ]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((categoryOption) => (
                  <TouchableOpacity
                    key={categoryOption}
                    style={[
                      styles.categoryButton,
                      category === categoryOption && styles.categoryButtonSelected
                    ]}
                    onPress={() => setCategory(categoryOption)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      category === categoryOption && styles.categoryButtonTextSelected
                    ]}>
                      {categoryOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EXPIRY DATE</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={showDatePickerModal}
              >
                <Calendar size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
                <Text style={styles.dateButtonText}>
                  {expiryDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
              />
            )}

            {Platform.OS === 'ios' && showDatePicker && (
              <TouchableOpacity 
                style={[zaraStyles.buttonOutline, { marginTop: ZaraTheme.spacing.md }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={zaraStyles.buttonTextOutline}>DONE</Text>
              </TouchableOpacity>
            )}
          </MinimalCard>

          <MinimalCard>
            <Text style={styles.sectionTitle}>STORAGE TIPS</Text>
            <Text style={styles.tipText}>
              • Store fruits and vegetables separately to prevent premature ripening
            </Text>
            <Text style={styles.tipText}>
              • Keep dairy products in the coldest part of your refrigerator
            </Text>
            <Text style={styles.tipText}>
              • Check expiry dates regularly and use items before they spoil
            </Text>
            <Text style={styles.tipText}>
              • Freeze items that are close to expiring if possible
            </Text>
          </MinimalCard>

          <TouchableOpacity 
            style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.lg }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>ADD TO PANTRY</Text>
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingTop: ZaraTheme.spacing.lg,
    paddingBottom: ZaraTheme.spacing.md,
  },
  backButton: {
    padding: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  quantityRow: {
    flexDirection: 'row',
    marginBottom: ZaraTheme.spacing.lg,
  },
  quantityInput: {
    flex: 1,
    marginRight: ZaraTheme.spacing.md,
  },
  unitInput: {
    flex: 2,
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButton: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.sm,
  },
  unitButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  unitButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  unitButtonTextSelected: {
    color: ZaraTheme.colors.white,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.sm,
    marginBottom: ZaraTheme.spacing.sm,
  },
  categoryButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  categoryButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  categoryButtonTextSelected: {
    color: ZaraTheme.colors.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.black,
    paddingVertical: ZaraTheme.spacing.md,
  },
  dateButtonText: {
    ...ZaraTheme.typography.body,
    marginLeft: ZaraTheme.spacing.sm,
  },
  iosDatePicker: {
    marginVertical: ZaraTheme.spacing.md,
  },
  tipText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    marginBottom: ZaraTheme.spacing.sm,
    lineHeight: 18,
  },
});