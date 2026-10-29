import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { RecipeListRow } from "../components/RecipeCard";
import { COLORS } from "../constants/theme";
import { fetchAllMeals, fetchMealById, Meal } from "../lib/mealdb";
import { useTranslatedText } from "../lib/translate";

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const screenWidth = Dimensions.get("window").width;

const VideoDetails: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [meal, setMeal] = useState<Meal | null>(null);
  const [otherVideos, setOtherVideos] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [mealData, allMeals] = await Promise.all([
          fetchMealById(id),
          fetchAllMeals(),
        ]);
        setMeal(mealData);
        setOtherVideos(
          allMeals
            .filter((m) => !!m.strYoutube && m.idMeal !== id)
            .slice(0, 10),
        );
      } catch (error) {
        console.error("Erreur lors du chargement de la vidéo:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const titleFr = useTranslatedText(meal?.strMeal);
  const categoryFr = useTranslatedText(meal?.strCategory);
  const areaFr = useTranslatedText(meal?.strArea);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!meal || !meal.strYoutube) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Vidéo non disponible.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videoId = extractYoutubeId(meal.strYoutube);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Vidéo recette
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.playerWrap}>
          {videoId ? (
            <WebView
              style={styles.player}
              source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          ) : (
            <View style={[styles.player, styles.centered]}>
              <Text style={styles.errorText}>Vidéo indisponible.</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.title}>{titleFr}</Text>
          <Text style={styles.subtitle}>
            {[categoryFr, areaFr].filter(Boolean).join(" • ")}
          </Text>
        </View>

        {otherVideos.length > 0 && (
          <View style={styles.otherBlock}>
            <Text style={styles.sectionTitle}>Autres recettes vidéo</Text>
            <View style={styles.list}>
              {otherVideos.map((item) => (
                <RecipeListRow
                  key={item.idMeal}
                  id={item.idMeal}
                  title={item.strMeal}
                  thumbnail={item.strMealThumb}
                  category={item.strCategory}
                  area={item.strArea}
                  hasVideo
                  onPress={() =>
                    router.push({
                      pathname: "/VideoDetails",
                      params: { id: item.idMeal },
                    })
                  }
                />
              ))}
            </View>
          </View>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    gap: 12,
  },
  errorText: {
    color: COLORS.muted,
    fontSize: 15,
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
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  playerWrap: {
    width: screenWidth,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  player: {
    flex: 1,
  },
  infoBlock: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
  },
  otherBlock: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  list: {
    gap: 10,
    paddingHorizontal: 18,
  },
});

export default VideoDetails;
