import { ScrollView, StyleSheet, View } from "react-native";

import { AppChip } from "@/src/shared/components";
import {
  exploreCategories,
  type ExploreCategory,
} from "@/src/shared/constants/exploreCategories";
import { spacing } from "@/src/shared/theme";

type ExploreCategoryChipsProps = {
  selectedCategory: ExploreCategory;
  onSelectCategory: (category: ExploreCategory) => void;
};

export function ExploreCategoryChips({
  selectedCategory,
  onSelectCategory,
}: ExploreCategoryChipsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {exploreCategories.map((category) => (
          <AppChip
            key={category}
            selected={selectedCategory === category}
            onPress={() => onSelectCategory(category)}
          >
            {category}
          </AppChip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
