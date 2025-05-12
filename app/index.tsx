import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
  ScrollView
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

interface FeaturedItem {
  id: string;
  source: any;
  title: string;
}

type RootStackParamList = {
  Index: undefined;
  PlatsDetails: { category: string };
  Details: { category: string };
  SearchScreen: undefined;
  FavoriteScreen: undefined;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 10;

const Acceuil: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const images: FeaturedItem[] = [
    { id: '1', source: require('../assets/images/1.jpeg'), title: 'Plat savoureux' },
    { id: '2', source: require('../assets/images/2.jpeg'), title: 'Cuisine raffinée' },
    { id: '3', source: require('../assets/images/3.jpeg'), title: 'Délices sucrés' },
    { id: '4', source: require('../assets/images/4.jpeg'), title: 'Cuisine du monde' },
    { id: '5', source: require('../assets/images/5.jpeg'), title: 'Fraîcheur estivale' },
    { id: '6', source: require('../assets/images/6.jpeg'), title: 'Recettes de saison' },
    { id: '7', source: require('../assets/images/7.jpeg'), title: 'Expérience gourmande' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const apiURL = 'https://www.themealdb.com/api/json/v1/1/categories.php';

    try {
      setLoading(true);
      const response = await fetch(apiURL);
      const responseJson = await response.json();
      setCategories(responseJson.categories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllCategories = () => {
    // Navigation vers une page qui montre toutes les catégories
    navigation.navigate('Details', { category: 'all' });
  };
  
  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / (CARD_WIDTH + SPACING));
      setActiveIndex(index);
    });

    return () => {
      scrollX.removeListener(listener);
    };
  }, []);

  const renderCarouselItem = ({ item, index }: { item: FeaturedItem; index: number }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}>
        <Animated.View style={[styles.carouselCard, { transform: [{ scale }], opacity }]}>
          <Image source={item.source} style={styles.carouselImage} />
          <View style={styles.overlayGradient} />
          <View style={styles.carouselTextContainer}>
            <Text style={styles.carouselTitle}>{item.title}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Details', { category: item.strCategory })}
        style={styles.categoryCard}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.strCategoryThumb }} 
          style={styles.categoryImage} 
          resizeMode="cover"
        />
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{item.strCategory}</Text>
          {item.strCategoryDescription && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.strCategoryDescription.slice(0, 80)}
              {item.strCategoryDescription.length > 80 ? '...' : ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDotIndicator = () => {
    return (
      <View style={styles.paginationContainer}>
        {images.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.3, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                { opacity, transform: [{ scale }] },
                activeIndex === index && styles.activeDot,
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderPopularRecipes = () => {
    // Ici vous pourriez implémenter une liste horizontale de recettes populaires
    // Ceci est un exemple minimal
    return (
      <View style={styles.popularRecipesContainer}>
        <Text style={styles.comingSoonText}>Nouvelles recettes à venir bientôt...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Délices Cuisine</Text>
          <Text style={styles.headerText}>Découvrez des recettes savoureuses</Text>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>À découvrir</Text>
          
          <Animated.FlatList
            data={images}
            keyExtractor={(item) => item.id}
            renderItem={renderCarouselItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
          />
          
          {renderDotIndicator()}
        </View>
        
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <TouchableOpacity onPress={handleViewAllCategories}>
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
            </View>
          ) : (
            <FlatList
              data={categories.slice(0, 6)} // Limiter l'affichage à 6 catégories sur l'accueil
              keyExtractor={(item) => item.idCategory}
              renderItem={renderCategoryItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryListContainer}
              numColumns={2}
              columnWrapperStyle={styles.categoryColumnWrapper}
              scrollEnabled={false} // Désactiver le défilement car on est déjà dans un ScrollView
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
    fontFamily: 'System',
  },
  headerText: {
    fontSize: 16,
    color: '#555555',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
  },
  featuredSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 16,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  carouselContent: {
    paddingLeft: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: SPACING,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'transparent',
    borderTopWidth: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  carouselTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginHorizontal: 5,
    opacity: 0.4,
  },
  activeDot: {
    opacity: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  categorySection: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryListContainer: {
    paddingHorizontal: 8,
  },
  categoryColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: (width - 40) / 2,
    height: 210,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryContent: {
    padding: 14,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  popularSection: {
    marginVertical: 16,
  },
  popularRecipesContainer: {
    height: 120,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  }
});

export default Acceuil;