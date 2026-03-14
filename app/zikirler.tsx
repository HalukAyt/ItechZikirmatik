import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; 
import { SafeAreaView } from "react-native-safe-area-context";

const ZIKIR_DATA = [
  { id: "1", ad: "Kelime-i Tevhid", okunus: "La İlahe İllallah", hedef: "100", anlam: "Allah'tan başka ilah yoktur." },
  { id: "2", ad: "İstighfar", okunus: "Estağfirullah", hedef: "100", anlam: "Allah'tan bağışlanma dilerim." },
  { id: "3", ad: "Salavat", okunus: "Allahümme Salli Ala Muhammed", hedef: "100", anlam: "Allah'ım, Efendimize rahmet et." },
  { id: "4", ad: "Sübhanallah", okunus: "Sübhanallah", hedef: "33", anlam: "Allah eksikliklerden uzaktır." },
];

export default function ZikirlerList() { // İSİM DEĞİŞTİ
  const router = useRouter();

  const selectZikir = async (zikir: any) => {
    try {
      await AsyncStorage.setItem("targetNumber", zikir.hedef);
      await AsyncStorage.setItem("currentZikirName", zikir.ad);
      await AsyncStorage.setItem("currentZikirAnlam", zikir.anlam);
      await AsyncStorage.setItem("count", zikir.hedef);
      
      // index'e geri dön ama loop olmaması için replace kullanıyoruz
      router.replace("/"); 
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 20}}>
        <Text style={{color: '#69acfa', fontSize: 18}}>← Vazgeç / Geri</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Zikir Seç</Text>
      <FlatList 
        data={ZIKIR_DATA} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => selectZikir(item)}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.zikirAd}>{item.ad}</Text>
              <Text style={{color: "#69acfa", fontWeight: "bold"}}>{item.hedef}</Text>
            </View>
            <Text style={{color: "#aaa", marginTop: 5}}>{item.okunus}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E", padding: 20 },
  header: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: "#2C2C2C", padding: 20, borderRadius: 15, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: "#69acfa" },
  zikirAd: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});