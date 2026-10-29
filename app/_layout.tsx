import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#fffaf5" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="PlatsDetails" />
      <Stack.Screen name="Details" />
      <Stack.Screen name="VideoDetails" />
    </Stack>
  );
}
