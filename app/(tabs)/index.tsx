import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryPills from "../../components/CategoryPills";
import { RecipeCardHorizontal, RecipeListRow } from "../../components/RecipeCard";
import SearchBar from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";
import { Category, fetchAllMeals, fetchCategories, Meal } from "../../lib/mealdb";

const Accueil: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [categoriesData, mealsData] = await Promise.all([
          fetchCategories(),
          fetchAllMeals(),
        ]);
        setCategories(categoriesData);
        setMeals(mealsData);
      } catch (error) {
        console.error("Erreur lors du chargement de l'accueil:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pillOptions = useMemo(
    () => [
      { key: "all", label: "Tout" },
      ...categories.map((c) => ({ key: c.strCategory, label: c.strCategory })),
    ],
    [categories],
  );

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesCategory =
        selectedCategory === "all" || meal.strCategory === selectedCategory;
      const matchesSearch = meal.strMeal
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [meals, selectedCategory, search]);

  const populaires = filteredMeals.slice(0, 6);
  const recentes = filteredMeals.slice(6, 12);

  const goToRecipe = (id: string) =>
    router.push({ pathname: "/PlatsDetails", params: { id } });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>Bonjour</Text>
            <Text style={styles.title}>Délices Cuisine</Text>
            <Text style={styles.subtitle}>Recettes diverses et variées</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.85}>
            <Text style={styles.profileButtonText}>D</Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une recette..."
          style={styles.searchBar}
        />

        <CategoryPills
          options={pillOptions}
          selectedKey={selectedCategory}
          onSelect={setSelectedCategory}
          style={styles.pillsRow}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recettes populaires</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/recettes")}>
                <Text style={styles.linkText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {populaires.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
              >
                {populaires.map((meal) => (
                  <RecipeCardHorizontal
                    key={meal.idMeal}
                    id={meal.idMeal}
                    title={meal.strMeal}
                    thumbnail={meal.strMealThumb}
                    hasVideo={!!meal.strYoutube}
                    onPress={() => goToRecipe(meal.idMeal)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucune recette trouvée.</Text>
              </View>
            )}

            {recentes.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recettes récentes</Text>
                  <TouchableOpacity onPress={() => router.push("/(tabs)/recettes")}>
                    <Text style={styles.linkText}>Voir tout</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.list}>
                  {recentes.map((meal) => (
                    <RecipeListRow
                      key={meal.idMeal}
                      id={meal.idMeal}
                      title={meal.strMeal}
                      thumbnail={meal.strMealThumb}
                      category={meal.strCategory}
                      area={meal.strArea}
                      hasVideo={!!meal.strYoutube}
                      onPress={() => goToRecipe(meal.idMeal)}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  eyebrow: {
    fontSize: 13,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  searchBar: {
    marginBottom: 16,
    paddingHorizontal: 18,
  },
  pillsRow: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.text,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  hList: {
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  list: {
    gap: 10,
    paddingHorizontal: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    minHeight: 100,
    marginHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});

export default Accueil;
