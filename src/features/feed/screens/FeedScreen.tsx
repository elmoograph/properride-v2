import { Search, Bell } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import { feedPosts } from "@/src/shared/constants/mockData";
import type { FeedCategory } from "@/src/shared/constants/feedCategories";
import { spacing, theme } from "@/src/shared/theme";
import { FeedCategoryChips } from "@/src/features/feed/components/FeedCategoryChips";
import { FeedPost } from "@/src/features/feed/components/FeedPost";

export function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("All");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return feedPosts;
    }

    return feedPosts.filter((post) => post.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <View>
          <AppText variant="titleLarge">ProperRide</AppText>
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            Temukan inspirasi dari rider lain.
          </AppText>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} hitSlop={10}>
            <Search size={20} color={theme.textPrimary} />
          </Pressable>

          <Pressable style={styles.iconButton} hitSlop={10}>
            <Bell size={20} color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FeedCategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <View style={styles.feedList}>
        {filteredPosts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  feedList: {
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
});
