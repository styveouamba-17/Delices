import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Linking, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Share
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

interface Ingredient {
  ingredient: string;
  measure: string;
}

interface RecipeDetails {
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube: string;
  [key: string]: any;
}

interface DetailsParamList {
  PlatsDetails: { id: string };
  [key: string]: any;
}

type DetailsRouteProp = RouteProp<DetailsParamList, 'PlatsDetails'>;

const PlatsDetails: React.FC = () => {
  const route = useRoute<DetailsRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ingredients');

  const fetchRecipeDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        setRecipeDetails(data.meals[0]);
      } else {
        setError('Aucune recette trouvée.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la recette :', error);
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, []);

  const handleShare = async () => {
    if (!recipeDetails) return;
    
    try {
      await Share.share({
        message: `Découvrez cette délicieuse recette: ${recipeDetails.strMeal}`,
        url: recipeDetails.strYoutube
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const openYoutubeVideo = () => {
    if (recipeDetails?.strYoutube) {
      Linking.openURL(recipeDetails.strYoutube);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Préparation de la recette...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchRecipeDetails}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recipeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Détails de la recette non disponibles.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredientKey = `strIngredient${i}`;
    const measureKey = `strMeasure${i}`;
    if (recipeDetails[ingredientKey] && recipeDetails[ingredientKey].trim() !== '') {
      ingredients.push({ 
        ingredient: recipeDetails[ingredientKey], 
        measure: recipeDetails[measureKey] || '' 
      });
    }
  }

  // Diviser les instructions en étapes
  const instructionSteps = recipeDetails.strInstructions
    .split(/\r\n|\n|\r/)
    .filter(step => step.trim() !== '')
    .map(step => step.trim());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header avec image en arrière-plan */}
      <View style={styles.header}>
        <Image source={{ uri: recipeDetails.strMealThumb }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />
        
        {/* Bouton retour */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* Bouton partage */}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info recette */}
        <View style={styles.recipeInfo}>
          <Text style={styles.title}>{recipeDetails.strMeal}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Catégorie</Text>
              <Text style={styles.metaValue}>{recipeDetails.strCategory}</Text>
            </View>
            
            {recipeDetails.strArea && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Origine</Text>
                <Text style={styles.metaValue}>{recipeDetails.strArea}</Text>
              </View>
            )}
          </View>
          
          {/* Onglets */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
              onPress={() => setActiveTab('ingredients')}
            >
              <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
                Ingrédients
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
                Préparation
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Contenu des onglets */}
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientIconContainer}>
                    <Text style={styles.ingredientIcon}>•</Text>
                  </View>
                  <View style={styles.ingredientTextContainer}>
                    <Text style={styles.ingredientName}>{ing.ingredient}</Text>
                    <Text style={styles.ingredientMeasure}>{ing.measure}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              {instructionSteps.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Bouton vidéo YouTube */}
          {recipeDetails.strYoutube && (
            <TouchableOpacity 
              style={styles.youtubeButton}
              onPress={openYoutubeVideo}
            >
              <Text style={styles.youtubeButtonText}>Voir la vidéo de préparation</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  header: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  recipeInfo: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    marginRight: 24,
  },
  metaLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  ingredientsContainer: {
    marginBottom: 24,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientIconContainer: {
    width: 24,
    alignItems: 'center',
  },
  ingredientIcon: {
    fontSize: 20,
    color: '#FF6B6B',
  },
  ingredientTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ingredientMeasure: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  youtubeButton: {
    backgroundColor: '#FF0000', // Couleur YouTube
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  youtubeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PlatsDetails;