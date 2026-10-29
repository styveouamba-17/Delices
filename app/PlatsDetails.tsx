import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../constants/theme";
import { useTranslatedText } from "../lib/translate";
import { useFavoritesStore } from "../store/favorites";

interface Ingredient {
  ingredient: string;
  measure: string;
}

const IngredientRow: React.FC<{ item: Ingredient }> = ({ item }) => {
  const nameFr = useTranslatedText(item.ingredient);
  const measureFr = useTranslatedText(item.measure);

  return (
    <View style={styles.ingredientItem}>
      <View style={styles.ingredientIconContainer}>
        <Text style={styles.ingredientIcon}>•</Text>
      </View>
      <View style={styles.ingredientTextContainer}>
        <Text style={styles.ingredientName}>{nameFr}</Text>
        <Text style={styles.ingredientMeasure}>{measureFr}</Text>
      </View>
    </View>
  );
};

const InstructionStepRow: React.FC<{ step: string; index: number }> = ({
  step,
  index,
}) => {
  const stepFr = useTranslatedText(step);

  return (
    <View style={styles.instructionStep}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <Text style={styles.stepText}>{stepFr}</Text>
    </View>
  );
};

interface RecipeDetails {
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube: string;
  [key: string]: any;
}

const PlatsDetails: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions">(
    "ingredients",
  );

  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
      );
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        setRecipeDetails(data.meals[0]);
      } else {
        setError("Aucune recette trouvée.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de la recette :",
        error,
      );
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const handleShare = async () => {
    if (!recipeDetails) return;

    try {
      await Share.share({
        message: `Découvrez cette délicieuse recette : ${recipeDetails.strMeal}`,
        url: recipeDetails.strYoutube || recipeDetails.strMealThumb,
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  const openVideoPlayer = () => {
    router.push({ pathname: "/VideoDetails", params: { id } });
  };

  const titleFr = useTranslatedText(recipeDetails?.strMeal);
  const categoryFr = useTranslatedText(recipeDetails?.strCategory);
  const areaFr = useTranslatedText(recipeDetails?.strArea);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
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
        <Text style={styles.errorText}>
          Détails de la recette non disponibles.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
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
    const ingredient = recipeDetails[ingredientKey];
    const measure = recipeDetails[measureKey];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({
        ingredient,
        measure: measure || "",
      });
    }
  }

  const instructionSteps = recipeDetails.strInstructions
    .split(/\r\n|\n|\r/)
    .filter((step) => step.trim() !== "")
    .map((step) => step.trim());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Image
          source={{ uri: recipeDetails.strMealThumb }}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={["rgba(17,24,39,0.15)", "rgba(17,24,39,0.7)"]}
          style={styles.headerOverlay}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(id)}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>⇪</Text>
        </TouchableOpacity>

        {recipeDetails.strYoutube && (
          <TouchableOpacity style={styles.playButton} onPress={openVideoPlayer}>
            <Ionicons name="play" size={26} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.recipeInfo}>
          <Text style={styles.title}>{titleFr}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={18} color={COLORS.primary} />
              <Text style={styles.metaLabel}>Catégorie</Text>
              <Text style={styles.metaValue}>{categoryFr}</Text>
            </View>

            {recipeDetails.strArea && (
              <View style={styles.metaItem}>
                <Ionicons name="earth-outline" size={18} color={COLORS.primary} />
                <Text style={styles.metaLabel}>Origine</Text>
                <Text style={styles.metaValue}>{areaFr}</Text>
              </View>
            )}
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "ingredients" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("ingredients")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ingredients" && styles.activeTabText,
                ]}
              >
                Ingrédients
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "instructions" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("instructions")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "instructions" && styles.activeTabText,
                ]}
              >
                Préparation
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "ingredients" ? (
            <View style={styles.ingredientsContainer}>
              {ingredients.map((item, index) => (
                <IngredientRow key={`${item.ingredient}-${index}`} item={item} />
              ))}
            </View>
          ) : (
            <View style={styles.instructionsContainer}>
              {instructionSteps.map((step, index) => (
                <InstructionStepRow key={`${step}-${index}`} step={step} index={index} />
              ))}
            </View>
          )}

          {recipeDetails.strYoutube && (
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={openVideoPlayer}
            >
              <Ionicons name="logo-youtube" size={18} color="#fff" />
              <Text style={styles.youtubeButtonText}>Voir la vidéo YouTube</Text>
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
    backgroundColor: "#fffaf5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffaf5",
  },
  loadingText: {
    marginTop: 18,
    color: "#6b7280",
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fffaf5",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  header: {
    position: "relative",
    height: 260,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(17,24,39,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 62,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(17,24,39,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  shareButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(17,24,39,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  playButton: {
    position: "absolute",
    bottom: 44,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(249,115,22,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#fffaf5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
  },
  recipeInfo: {
    padding: 20,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 14,
  },
  metaInfo: {
    flexDirection: "row",
    marginBottom: 22,
    gap: 18,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  metaLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#f97316",
  },
  tabText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#111827",
    fontWeight: "800",
  },
  ingredientsContainer: {
    marginBottom: 18,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  ingredientIconContainer: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  ingredientIcon: {
    color: "#f97316",
    fontSize: 20,
    fontWeight: "800",
  },
  ingredientTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  ingredientName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  ingredientMeasure: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
  },
  instructionsContainer: {
    marginBottom: 18,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    lineHeight: 24,
  },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  youtubeButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});

export default PlatsDetails;
