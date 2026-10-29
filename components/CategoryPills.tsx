import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { COLORS } from "../constants/theme";
import { useTranslatedText } from "../lib/translate";

interface PillOption {
  key: string;
  label: string;
}

interface CategoryPillsProps {
  options: PillOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

const Pill: React.FC<{
  option: PillOption;
  active: boolean;
  onPress: () => void;
}> = ({ option, active, onPress }) => {
  const labelFr = useTranslatedText(option.key !== "all" ? option.label : undefined);
  const displayLabel = option.key === "all" ? option.label : labelFr;

  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
};

const CategoryPills: React.FC<CategoryPillsProps> = ({
  options,
  selectedKey,
  onSelect,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((option) => (
        <Pill
          key={option.key}
          option={option}
          active={option.key === selectedKey}
          onPress={() => onSelect(option.key)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingRight: 18,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 13,
  },
  pillTextActive: {
    color: "#fff",
  },
});

export default CategoryPills;
