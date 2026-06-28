import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import type { ExploreCategory } from "@/src/shared/constants/exploreCategories";
import { spacing } from "@/src/shared/theme";
import { ExploreCategoryChips } from "@/src/features/explore/components/ExploreCategoryChips";
import { ExploreGrid } from "@/src/features/explore/components/ExploreGrid";
import { ExploreSearchBar } from "@/src/features/explore/components/ExploreSearchBar";

export function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<ExploreCategory>("Untukmu");

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <AppText variant="titleLarge">Explore</AppText>
        <AppText tone="secondary" style={styles.subtitle}>
          Temukan inspirasi, rider, dan topik menarik.
        </AppText>
      </View>

      <View style={styles.searchSection}>
        <ExploreSearchBar />
        <ExploreCategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <ExploreGrid />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  subtitle: {
    maxWidth: 280,
  },
  searchSection: {
    marginTop: spacing.xl,
  },
});
