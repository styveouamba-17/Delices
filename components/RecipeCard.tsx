import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";
import { useTranslatedText } from "../lib/translate";
import { useFavoritesStore } from "../store/favorites";

interface RecipeCardProps {
  id: string;
  title: string;
  thumbnail: string;
  hasVideo?: boolean;
  onPress: () => void;
}

export const RecipeCardHorizontal: React.FC<RecipeCardProps> = ({
  id,
  title,
  thumbnail,
  hasVideo,
  onPress,
}) => {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const titleFr = useTranslatedText(title);

  return (
    <TouchableOpacity
      style={styles.hCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: thumbnail }} style={styles.hImage} resizeMode="cover" />
      <LinearGradient
        colors={["transparent", "rgba(17,24,39,0.82)"]}
        style={StyleSheet.absoluteFill}
      />
      {hasVideo && (
        <View style={styles.playBadge}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      )}
      <TouchableOpacity
        style={styles.heartBadge}
        activeOpacity={0.85}
        onPress={() => toggleFavorite(id)}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={16}
          color={isFavorite ? COLORS.primary : "#fff"}
        />
      </TouchableOpacity>
      <Text style={styles.hTitle} numberOfLines={2}>
        {titleFr}
      </Text>
    </TouchableOpacity>
  );
};

interface RecipeListRowProps extends RecipeCardProps {
  category?: string;
  area?: string;
}

export const RecipeListRow: React.FC<RecipeListRowProps> = ({
  id,
  title,
  thumbnail,
  category,
  area,
  hasVideo,
  onPress,
}) => {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const titleFr = useTranslatedText(title);
  const categoryFr = useTranslatedText(category);
  const areaFr = useTranslatedText(area);
  const subtitle = [categoryFr, areaFr].filter(Boolean).join(" • ");

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.rowImageWrap}>
        <Image source={{ uri: thumbnail }} style={styles.rowImage} resizeMode="cover" />
        {hasVideo && (
          <View style={styles.rowPlayBadge}>
            <Ionicons name="play" size={11} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {titleFr}
        </Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity
        style={styles.rowHeart}
        activeOpacity={0.85}
        onPress={() => toggleFavorite(id)}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={18}
          color={isFavorite ? COLORS.primary : COLORS.mutedLight}
        />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={18} color={COLORS.mutedLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hCard: {
    width: 220,
    height: 160,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  hImage: {
    width: "100%",
    height: "100%",
  },
  playBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(249,115,22,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(17,24,39,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  hTitle: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  rowImage: {
    width: "100%",
    height: "100%",
  },
  rowPlayBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  rowSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
  },
  rowHeart: {
    padding: 4,
  },
});
