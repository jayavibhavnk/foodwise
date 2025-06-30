import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { PantryItem, PantryItemData } from '@/components/PantryItem';
import { MinimalCard } from '@/components/MinimalCard';

export default function PantryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pantryItems, setPantryItems] = useState<PantryItemData[]>([
    {
      id: '1',
      name: 'Chicken Breast',
      quantity: 2,
      unit: 'lbs',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      category: 'Meat',
    },
    {
      id: '2',
      name: 'Greek Yogurt',
      quantity: 1,
      unit: 'container',
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      category: 'Dairy',
    },
    {
      id: '3',
      name: 'Broccoli',
      quantity: 2,
      unit: 'heads',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      category: 'Vegetables',
    },
    {
      id: '4',
      name: 'Whole Wheat Bread',
      quantity: 1,
      unit: 'loaf',
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired yesterday
      category: 'Grains',
    },
  ]);

  const filteredItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseItem = (itemId: string) => {
    Alert.alert(
      'Use Item',
      'Mark this item as used?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use',
          onPress: () => {
            setPantryItems(items => items.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const handleAddItem = () => {
    Alert.alert(
      'Add Item',
      'This would open a form to add new pantry items. In a complete app, you could also scan barcodes or use voice input.',
      [{ text: 'OK' }]
    );
  };

  // Sort items by expiry date (expired first, then by days remaining)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aExpiry = a.expiryDate.getTime();
    const bExpiry = b.expiryDate.getTime();
    const now = Date.now();
    
    // If both expired or both not expired, sort by date
    if ((aExpiry < now && bExpiry < now) || (aExpiry >= now && bExpiry >= now)) {
      return aExpiry - bExpiry;
    }
    
    // Put expired items first
    return aExpiry < now ? -1 : 1;
  });

  const expiredCount = pantryItems.filter(item => item.expiryDate < new Date()).length;
  const expiringCount = pantryItems.filter(item => {
    const daysUntilExpiry = Math.ceil((item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 3;
  }).length;

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={zaraStyles.header}>
          <Text style={zaraStyles.title}>PANTRY</Text>
          <View style={styles.stats}>
            <Text style={zaraStyles.subtitle}>
              {pantryItems.length} items
              {expiredCount > 0 && ` • ${expiredCount} expired`}
              {expiringCount > 0 && ` • ${expiringCount} expiring soon`}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pantry items..."
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity style={zaraStyles.button} onPress={handleAddItem}>
            <Plus size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Alerts Summary */}
        {(expiredCount > 0 || expiringCount > 0) && (
          <MinimalCard style={styles.alertCard}>
            <Text style={styles.alertTitle}>ATTENTION REQUIRED</Text>
            {expiredCount > 0 && (
              <Text style={styles.alertText}>
                {expiredCount} item{expiredCount > 1 ? 's' : ''} expired
              </Text>
            )}
            {expiringCount > 0 && (
              <Text style={styles.alertText}>
                {expiringCount} item{expiringCount > 1 ? 's' : ''} expiring within 3 days
              </Text>
            )}
          </MinimalCard>
        )}

        {/* Pantry Items */}
        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {sortedItems.length === 0 ? (
            <MinimalCard>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No items match your search' : 'Your pantry is empty'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={[zaraStyles.buttonOutline, { marginTop: ZaraTheme.spacing.md }]}
                  onPress={handleAddItem}
                >
                  <Text style={zaraStyles.buttonTextOutline}>ADD FIRST ITEM</Text>
                </TouchableOpacity>
              )}
            </MinimalCard>
          ) : (
            sortedItems.map(item => (
              <PantryItem
                key={item.id}
                item={item}
                onUse={handleUseItem}
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
  stats: {
    marginTop: ZaraTheme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: ZaraTheme.spacing.md,
    marginBottom: ZaraTheme.spacing.lg,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
    marginRight: ZaraTheme.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: ZaraTheme.spacing.md,
    paddingLeft: ZaraTheme.spacing.sm,
    ...ZaraTheme.typography.body,
  },
  alertCard: {
    marginHorizontal: ZaraTheme.spacing.md,
    marginBottom: ZaraTheme.spacing.md,
    borderColor: ZaraTheme.colors.black,
  },
  alertTitle: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
    marginBottom: ZaraTheme.spacing.sm,
  },
  alertText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.darkGray,
    marginBottom: ZaraTheme.spacing.xs,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  emptyText: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
  },
});