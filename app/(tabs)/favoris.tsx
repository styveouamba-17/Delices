import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { COLORS } from "../../constants/theme";
import { fetchMealsByIds, Meal } from "../../lib/mealdb";
import { useFavoritesStore } from "../../store/favorites";

const Favoris: React.FC = () => {
  const router = useRouter();
  const favoriteIds = useFavoritesStore((state) => state.favorites);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (favoriteIds.length === 0) {
        setMeals([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchMealsByIds(favoriteIds);
        setMeals(data);
      } catch (error) {
        console.error("Erreur lors du chargement des favoris:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [favoriteIds]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={48} color={COLORS.mutedLight} />
          <Text style={styles.emptyText}>
            Vous n'avez pas encore de recette favorite.
          </Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
});

export default Favoris;
