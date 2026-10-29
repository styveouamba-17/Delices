import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CategoryPills from "../../components/CategoryPills";
import { RecipeListRow } from "../../components/RecipeCard";
import SearchBar from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";
import { Category, fetchAllMeals, fetchCategories, Meal } from "../../lib/mealdb";
import { usePaginatedList } from "../../lib/usePaginatedList";

const Recettes: React.FC = () => {
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
        console.error("Erreur lors du chargement des recettes:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pillOptions = useMemo(
    () => [
      { key: "all", label: "Toutes" },
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

  const { visibleItems, hasMore, loadMore } = usePaginatedList(filteredMeals);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recettes</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucune recette trouvée.</Text>
            </View>
          }
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  filtersBlock: {
    paddingHorizontal: 18,
    gap: 14,
    marginBottom: 8,
  },
  pillsRow: {
    paddingRight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyState: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});

export default Recettes;
