import { ScrollView, StyleSheet, View } from "react-native";

import { AppChip } from "@/src/shared/components";
import {
  feedCategories,
  type FeedCategory,
} from "@/src/shared/constants/feedCategories";
import { spacing } from "@/src/shared/theme";

type FeedCategoryChipsProps = {
  selectedCategory: FeedCategory;
  onSelectCategory: (category: FeedCategory) => void;
};

export function FeedCategoryChips({
  selectedCategory,
  onSelectCategory,
}: FeedCategoryChipsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {feedCategories.map((category) => (
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
    marginTop: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
