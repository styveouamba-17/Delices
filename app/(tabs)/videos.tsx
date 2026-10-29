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
import { RecipeListRow } from "../../components/RecipeCard";
import SearchBar from "../../components/SearchBar";
import { COLORS } from "../../constants/theme";
import { fetchAllMeals, Meal } from "../../lib/mealdb";
import { usePaginatedList } from "../../lib/usePaginatedList";

const Videos: React.FC = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAllMeals();
        setMeals(data.filter((meal) => !!meal.strYoutube));
      } catch (error) {
        console.error("Erreur lors du chargement des vidéos:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMeals = useMemo(
    () =>
      meals.filter((meal) =>
        meal.strMeal.toLowerCase().includes(search.toLowerCase()),
      ),
    [meals, search],
  );

  const { visibleItems, hasMore, loadMore } = usePaginatedList(filteredMeals);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vidéos recettes</Text>
      </View>

      <View style={styles.searchBlock}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une vidéo..."
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
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
              hasVideo
              onPress={() =>
                router.push({ pathname: "/VideoDetails", params: { id: item.idMeal } })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Aucune vidéo trouvée.</Text>
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
  searchBlock: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
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

export default Videos;
