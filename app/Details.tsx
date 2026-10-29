import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryPills from "../components/CategoryPills";
import { RecipeListRow } from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { COLORS } from "../constants/theme";
import { Category, fetchCategories, fetchMealsByCategory, Meal } from "../lib/mealdb";
import { useTranslatedText } from "../lib/translate";
import { usePaginatedList } from "../lib/usePaginatedList";

const Details: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory =
    typeof params.category === "string" ? params.category : "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadMeals();
  }, [selectedCategory]);

  const loadMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMealsByCategory(selectedCategory);
      if (data.length > 0) {
        setMeals(data);
      } else {
        setMeals([]);
        setError("Aucune recette trouvée pour cette sélection.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des plats.");
    } finally {
      setLoading(false);
    }
  };

  const pillOptions = useMemo(
    () => [
      { key: "all", label: "Toutes" },
      ...categories.map((c) => ({ key: c.strCategory, label: c.strCategory })),
    ],
    [categories],
  );

  const filteredMeals = useMemo(
    () =>
      meals.filter((meal) =>
        meal.strMeal.toLowerCase().includes(search.toLowerCase()),
      ),
    [meals, search],
  );

  const { visibleItems, hasMore, loadMore } = usePaginatedList(filteredMeals);
  const selectedCategoryFr = useTranslatedText(
    selectedCategory !== "all" ? selectedCategory : undefined,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedCategory === "all" ? "Toutes les recettes" : selectedCategoryFr}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filtersBlock}>
        <SearchBar value={search} onChangeText={setSearch} />
        <CategoryPills
          options={pillOptions}
          selectedKey={selectedCategory}
          onSelect={setSelectedCategory}
          style={styles.pillsRow}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMeals}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          renderItem={({ item }) => (
            <RecipeListRow
              id={item.idMeal}
              title={item.strMeal}
              thumbnail={item.strMealThumb}
              category={item.strCategory}
              area={item.strArea}
              hasVideo={!!item.strYoutube}
              onPress={() =>
                router.push({ pathname: "/PlatsDetails", params: { id: item.idMeal } })
              }
            />
          )}
          ListFooterComponent={
            hasMore ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color={COLORS.primary}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  filtersBlock: {
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 8,
  },
  pillsRow: {
    paddingRight: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});

export default Details;
