import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Üstteki varsayılan başlığı kapatır
        animation: "slide_from_right", // Sayfa geçiş animasyonu ekler
      }}
    >
      {/* Ana Sayfa */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Zikirmatik" 
        }} 
      />
      
      {/* Zikirler Listesi */}
      <Stack.Screen 
        name="zikirler" 
        options={{ 
          title: "Zikir Seçin",
          presentation: "modal" // İstersen bu sayfayı aşağıdan yukarı açılan bir modal yapabilirsin
        }} 
      />
    </Stack>
  );
}