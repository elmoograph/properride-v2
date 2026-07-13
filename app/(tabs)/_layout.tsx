import { Tabs } from "expo-router";
import { Bike, Compass, Home, Plus, User } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";

import { CreateActionSheet } from "@/src/features/create/components/CreateActionSheet";
import { TabBarIcon } from "@/src/shared/navigation/TabBarIcon";
import { theme } from "@/src/shared/theme";

export default function TabsLayout() {
  const [createSheetVisible, setCreateSheetVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: {
            height: 76,
            paddingTop: 8,
            paddingBottom: 14,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.borderSoft,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            lineHeight: 14,
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color }) => (
              <TabBarIcon>
                <Home color={color} size={24} />
              </TabBarIcon>
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <TabBarIcon>
                <Compass color={color} size={24} />
              </TabBarIcon>
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: "",
            tabBarLabel: () => null,
            tabBarButton: ({ children, style, accessibilityState }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={accessibilityState}
                style={style}
                onPress={() => setCreateSheetVisible(true)}
              >
                {children}
              </Pressable>
            ),
            tabBarIcon: () => (
              <TabBarIcon isCenter>
                <Plus color="#FFFFFF" size={30} strokeWidth={2.4} />
              </TabBarIcon>
            ),
          }}
        />

        <Tabs.Screen
          name="garage"
          options={{
            title: "Build",
            tabBarIcon: ({ color }) => (
              <TabBarIcon>
                <Bike color={color} size={24} />
              </TabBarIcon>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <TabBarIcon>
                <User color={color} size={24} />
              </TabBarIcon>
            ),
          }}
        />
      </Tabs>

      <CreateActionSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
      />
    </>
  );
}
