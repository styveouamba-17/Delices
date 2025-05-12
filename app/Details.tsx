import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

type DetailsRouteProp = RouteProp<{ Details: { category: string } }, 'Details'>;

const Details: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<DetailsRouteProp>();
  const { category } = route.params;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMealsByCategory();
  }, []);

  const fetchMealsByCategory = async () => {
    setLoading(true);
    const apiURL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    try {
      const response = await fetch(apiURL);
      const responseJson = await response.json();
      if (responseJson.meals) {
        setMeals(responseJson.meals);
      } else {
        setError("Aucun plat trouvé pour cette catégorie");
      }
    } catch (error) {
      console.error(error);
      setError("Erreur lors du chargement des plats");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Meal }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PlatsDetails', { id: item.idMeal })}
        style={styles.itemContainer}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Image 
            source={{ uri: item.strMealThumb }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.strMeal}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>{category}</Text>
      <View style={styles.placeholderButton} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement des délices culinaires...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchMealsByCategory}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      <Text style={styles.resultCount}>
        {meals.length} {meals.length > 1 ? 'recettes trouvées' : 'recette trouvée'}
      </Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.idMeal}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  placeholderButton: {
    width: 30,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize:12, 
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Details;