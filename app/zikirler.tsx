import React, { useState, useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; 
import { SafeAreaView } from "react-native-safe-area-context";

// Daha önce hazırladığımız 60+ zikir verisi burada duracak
const ZIKIR_DATA = [
  // --- TEMEL GÜNLÜK ZİKİRLER ---
  { id: "1", ad: "Kelime-i Tevhid", okunus: "La İlahe İllallah", hedef: "100", anlam: "Allah'tan başka ilah yoktur." },
  { id: "2", ad: "İstighfar", okunus: "Estağfirullah", hedef: "100", anlam: "Allah'tan bağışlanma dilerim." },
  { id: "3", ad: "Salavat-ı Şerife", okunus: "Allahümme Salli Ala Muhammed", hedef: "100", anlam: "Allah'ım, Efendimize rahmet et." },
  { id: "4", ad: "Sübhanallah", okunus: "Sübhanallah", hedef: "33", anlam: "Allah her türlü eksiklikten uzaktır." },
  { id: "5", ad: "Elhamdülillah", okunus: "Elhamdülillah", hedef: "33", anlam: "Hamd (övgü) Allah'adır." },
  { id: "6", ad: "Allahu Ekber", okunus: "Allahu Ekber", hedef: "33", anlam: "Allah en büyüktür." },
  { id: "7", ad: "Lâ havle ve lâ kuvvete", okunus: "Lâ havle ve lâ kuvvete illâ billâhil aliyyil azîm", hedef: "100", anlam: "Güç ve kuvvet ancak yüce Allah'ındır." },
  { id: "8", ad: "Hasbünallah", okunus: "Hasbünallâhu ve ni'mel vekîl", hedef: "100", anlam: "Allah bize yeter, O ne güzel vekildir." },
  { id: "9", ad: "Sübhanallahi ve bihamdihi", okunus: "Sübhanallahi ve bihamdihi", hedef: "100", anlam: "Allah'ı hamd ile tesbih ederim." },
  { id: "10", ad: "Lâ ilâhe illâ ente", okunus: "Lâ ilâhe illâ ente sübhâneke innî küntü minez-zâlimîn", hedef: "100", anlam: "Senden başka ilah yoktur, Seni tenzih ederim. Ben zalimlerden oldum." },

  // --- 99 ESMAÜL HÜSNA (Tam Liste ve Ebced Değerleri) ---
  { id: "11", ad: "Ya Allah", okunus: "Ya Allah", hedef: "66", anlam: "Her şeyin gerçek sahibi ve tek yaratıcısı." },
  { id: "12", ad: "Ya Rahman", okunus: "Ya Rahman", hedef: "298", anlam: "Dünyada her canlıya merhamet eden." },
  { id: "13", ad: "Ya Rahim", okunus: "Ya Rahim", hedef: "258", anlam: "Ahirette sadece müminlere merhamet eden." },
  { id: "14", ad: "Ya Melik", okunus: "Ya Melik", hedef: "90", anlam: "Kainatın mutlak sultanı." },
  { id: "15", ad: "Ya Kuddüs", okunus: "Ya Kuddüs", hedef: "170", anlam: "Eksikliklerden münezzeh, tertemiz." },
  { id: "16", ad: "Ya Selam", okunus: "Ya Selam", hedef: "131", anlam: "Selamete çıkaran." },
  { id: "17", ad: "Ya Mü'min", okunus: "Ya Mü'min", hedef: "136", anlam: "Güven veren, koruyan." },
  { id: "18", ad: "Ya Müheymin", okunus: "Ya Müheymin", hedef: "145", anlam: "Gözetleyici ve koruyucu." },
  { id: "19", ad: "Ya Aziz", okunus: "Ya Aziz", hedef: "94", anlam: "Mağlup edilmesi imkansız olan." },
  { id: "20", ad: "Ya Cebbar", okunus: "Ya Cebbar", hedef: "206", anlam: "Dilediğini yapan, kırılanları onaran." },
  { id: "21", ad: "Ya Mütekebbir", okunus: "Ya Mütekebbir", hedef: "662", anlam: "Büyüklükte eşi benzeri olmayan." },
  { id: "22", ad: "Ya Halık", okunus: "Ya Halık", hedef: "731", anlam: "Yaratan, yoktan var eden." },
  { id: "23", ad: "Ya Bari", okunus: "Ya Bari", hedef: "213", anlam: "Kusursuz yaratan." },
  { id: "24", ad: "Ya Musavvir", okunus: "Ya Musavvir", hedef: "336", anlam: "Şekil veren." },
  { id: "25", ad: "Ya Gaffar", okunus: "Ya Gaffar", hedef: "1281", anlam: "Günahları örten, çok bağışlayan." },
  { id: "26", ad: "Ya Kahhar", okunus: "Ya Kahhar", hedef: "306", anlam: "Her şeye galip gelen." },
  { id: "27", ad: "Ya Vehhab", okunus: "Ya Vehhab", hedef: "14", anlam: "Karşılıksız veren." },
  { id: "28", ad: "Ya Rezzak", okunus: "Ya Rezzak", hedef: "308", anlam: "Rızık veren." },
  { id: "29", ad: "Ya Fettah", okunus: "Ya Fettah", hedef: "489", anlam: "Kapıları açan, fetheden." },
  { id: "30", ad: "Ya Alim", okunus: "Ya Alim", hedef: "150", anlam: "Her şeyi bilen." },
  { id: "31", ad: "Ya Kabiz", okunus: "Ya Kabiz", hedef: "903", anlam: "Dilediğine rızkı daraltan." },
  { id: "32", ad: "Ya Basit", okunus: "Ya Basit", hedef: "72", anlam: "Dilediğine rızkı genişleten." },
  { id: "33", ad: "Ya Hafid", okunus: "Ya Hafid", hedef: "1481", anlam: "Dereceleri alçaltan." },
  { id: "34", ad: "Ya Rafi", okunus: "Ya Rafi", hedef: "351", anlam: "Dereceleri yükselten." },
  { id: "35", ad: "Ya Muiz", okunus: "Ya Muiz", hedef: "117", anlam: "İzzet veren, ağırlayan." },
  { id: "36", ad: "Ya Muzil", okunus: "Ya Muzil", hedef: "770", anlam: "Zelil eden." },
  { id: "37", ad: "Ya Semi", okunus: "Ya Semi", hedef: "180", anlam: "Her şeyi işiten." },
  { id: "38", ad: "Ya Basir", okunus: "Ya Basir", hedef: "302", anlam: "Her şeyi gören." },
  { id: "39", ad: "Ya Hakem", okunus: "Ya Hakem", hedef: "68", anlam: "Mutlak hakim." },
  { id: "40", ad: "Ya Adl", okunus: "Ya Adl", hedef: "104", anlam: "Mutlak adil." },
  { id: "41", ad: "Ya Latif", okunus: "Ya Latif", hedef: "129", anlam: "Lütfeden, incelik gösteren." },
  { id: "42", ad: "Ya Habir", okunus: "Ya Habir", hedef: "812", anlam: "Her şeyden haberdar." },
  { id: "43", ad: "Ya Halim", okunus: "Ya Halim", hedef: "88", anlam: "Yumuşak davranan." },
  { id: "44", ad: "Ya Azim", okunus: "Ya Azim", hedef: "1020", anlam: "Yüce, azametli." },
  { id: "45", ad: "Ya Gafur", okunus: "Ya Gafur", hedef: "1286", anlam: "Mağfireti çok olan." },
  { id: "46", ad: "Ya Şekür", okunus: "Ya Şekür", hedef: "526", anlam: "Şükre bol karşılık veren." },
  { id: "47", ad: "Ya Aliyy", okunus: "Ya Aliyy", hedef: "110", anlam: "En yüce." },
  { id: "48", ad: "Ya Kebir", okunus: "Ya Kebir", hedef: "232", anlam: "En büyük." },
  { id: "49", ad: "Ya Hafiz", okunus: "Ya Hafiz", hedef: "998", anlam: "Koruyan." },
  { id: "50", ad: "Ya Mukit", okunus: "Ya Mukit", hedef: "550", anlam: "Rızık veren, besleyen." },
  { id: "51", ad: "Ya Hasib", okunus: "Ya Hasib", hedef: "80", anlam: "Hesaba çeken." },
  { id: "52", ad: "Ya Celil", okunus: "Ya Celil", hedef: "73", anlam: "Azamet sahibi." },
  { id: "53", ad: "Ya Kerim", okunus: "Ya Kerim", hedef: "270", anlam: "Çok cömert." },
  { id: "54", ad: "Ya Rakib", okunus: "Ya Rakib", hedef: "312", anlam: "Gözetleyen." },
  { id: "55", ad: "Ya Mucib", okunus: "Ya Mucib", hedef: "55", anlam: "Duaları kabul eden." },
  { id: "56", ad: "Ya Vasi", okunus: "Ya Vasi", hedef: "137", anlam: "İlmi ve merhameti geniş." },
  { id: "57", ad: "Ya Hakim", okunus: "Ya Hakim", hedef: "78", anlam: "Hikmet sahibi." },
  { id: "58", ad: "Ya Vedüd", okunus: "Ya Vedüd", hedef: "20", anlam: "Seven ve sevilen." },
  { id: "59", ad: "Ya Mecid", okunus: "Ya Mecid", hedef: "57", anlam: "Şanı yüce." },
  { id: "60", ad: "Ya Bais", okunus: "Ya Bais", hedef: "573", anlam: "Ölüleri dirilten." },
  { id: "61", ad: "Ya Şehid", okunus: "Ya Şehid", hedef: "319", anlam: "Her şeye şahit olan." },
  { id: "62", ad: "Ya Hakk", okunus: "Ya Hakk", hedef: "108", anlam: "Gerçeğin ta kendisi." },
  { id: "63", ad: "Ya Vekil", okunus: "Ya Vekil", hedef: "66", anlam: "Güvenilen, vekil." },
  { id: "64", ad: "Ya Kavi", okunus: "Ya Kavi", hedef: "116", anlam: "En güçlü." },
  { id: "65", ad: "Ya Metin", okunus: "Ya Metin", hedef: "500", anlam: "Sarsılmaz, sağlam." },
  { id: "66", ad: "Ya Veli", okunus: "Ya Veli", hedef: "46", anlam: "Dost ve yardımcı." },
  { id: "67", ad: "Ya Hamid", okunus: "Ya Hamid", hedef: "62", anlam: "Övülmeye layık." },
  { id: "68", ad: "Ya Muhsi", okunus: "Ya Muhsi", hedef: "148", anlam: "Sayıp döken, bilen." },
  { id: "69", ad: "Ya Mübdi", okunus: "Ya Mübdi", hedef: "56", anlam: "Örneksiz yaratan." },
  { id: "70", ad: "Ya Müid", okunus: "Ya Müid", hedef: "124", anlam: "Yeniden yaratan." },
  { id: "71", ad: "Ya Muhyi", okunus: "Ya Muhyi", hedef: "68", anlam: "Can veren." },
  { id: "72", ad: "Ya Mümit", okunus: "Ya Mümit", hedef: "490", anlam: "Öldüren." },
  { id: "73", ad: "Ya Hayy", okunus: "Ya Hayy", hedef: "18", anlam: "Daima diri." },
  { id: "74", ad: "Ya Kayyum", okunus: "Ya Kayyum", hedef: "156", anlam: "Her şeyi ayakta tutan." },
  { id: "75", ad: "Ya Vacid", okunus: "Ya Vacid", hedef: "14", anlam: "İstediğini bulan." },
  { id: "76", ad: "Ya Macid", okunus: "Ya Macid", hedef: "48", anlam: "Şerefi yüce." },
  { id: "77", ad: "Ya Vahid", okunus: "Ya Vahid", hedef: "19", anlam: "Tek olan." },
  { id: "78", ad: "Ya Samed", okunus: "Ya Samed", hedef: "134", anlam: "Muhtaç olmayan." },
  { id: "79", ad: "Ya Kadir", okunus: "Ya Kadir", hedef: "305", anlam: "Güç sahibi." },
  { id: "80", ad: "Ya Muktedir", okunus: "Ya Muktedir", hedef: "744", anlam: "İktidar sahibi." },
  { id: "81", ad: "Ya Mukaddim", okunus: "Ya Mukaddim", hedef: "184", anlam: "Öne geçiren." },
  { id: "82", ad: "Ya Muahhir", okunus: "Ya Muahhir", hedef: "846", anlam: "Geriye bırakan." },
  { id: "83", ad: "Ya Evvel", okunus: "Ya Evvel", hedef: "37", anlam: "Başlangıcı olmayan." },
  { id: "84", ad: "Ya Ahir", okunus: "Ya Ahir", hedef: "801", anlam: "Sonu olmayan." },
  { id: "85", ad: "Ya Zahir", okunus: "Ya Zahir", hedef: "1106", anlam: "Varlığı aşikar." },
  { id: "86", ad: "Ya Batin", okunus: "Ya Batin", hedef: "62", anlam: "Varlığı gizli." },
  { id: "87", ad: "Ya Vali", okunus: "Ya Vali", hedef: "47", anlam: "İdare eden." },
  { id: "88", ad: "Ya Müteali", okunus: "Ya Müteali", hedef: "551", anlam: "En yüce." },
  { id: "89", ad: "Ya Berr", okunus: "Ya Berr", hedef: "202", anlam: "İyiliği bol." },
  { id: "90", ad: "Ya Tevvab", okunus: "Ya Tevvab", hedef: "409", anlam: "Tövbeleri kabul eden." },
  { id: "91", ad: "Ya Müntakim", okunus: "Ya Müntakim", hedef: "630", anlam: "İntikam alan." },
  { id: "92", ad: "Ya Afüvv", okunus: "Ya Afüvv", hedef: "156", anlam: "Affeden." },
  { id: "93", ad: "Ya Rauf", okunus: "Ya Rauf", hedef: "286", anlam: "Şefkatli." },
  { id: "94", ad: "Ya Malik-ül Mülk", okunus: "Ya Malik-ül Mülk", hedef: "212", anlam: "Mülkün ebedi sahibi." },
  { id: "95", ad: "Ya Zül-Celali vel İkram", okunus: "Ya Zül-Celali vel İkram", hedef: "1100", anlam: "Celal ve ikram sahibi." },
  { id: "96", ad: "Ya Muksit", okunus: "Ya Muksit", hedef: "209", anlam: "Adaletle yapan." },
  { id: "97", ad: "Ya Cami", okunus: "Ya Cami", hedef: "114", anlam: "Toplayan." },
  { id: "98", ad: "Ya Gani", okunus: "Ya Gani", hedef: "1060", anlam: "Zengin." },
  { id: "99", ad: "Ya Mugni", okunus: "Ya Mugni", hedef: "1100", anlam: "Zengin eden." },
  { id: "100", ad: "Ya Mani", okunus: "Ya Mani", hedef: "161", anlam: "Engelleyen." },
  { id: "101", ad: "Ya Darr", okunus: "Ya Darr", hedef: "1001", anlam: "Zarar veren." },
  { id: "102", ad: "Ya Nafi", okunus: "Ya Nafi", hedef: "201", anlam: "Fayda veren." },
  { id: "103", ad: "Ya Nur", okunus: "Ya Nur", hedef: "256", anlam: "Nurlandıran." },
  { id: "104", ad: "Ya Hadi", okunus: "Ya Hadi", hedef: "20", anlam: "Hidayet veren." },
  { id: "105", ad: "Ya Bedi", okunus: "Ya Bedi", hedef: "86", anlam: "Eşsiz yaratan." },
  { id: "106", ad: "Ya Baki", okunus: "Ya Baki", hedef: "113", anlam: "Ebedi olan." },
  { id: "107", ad: "Ya Varis", okunus: "Ya Varis", hedef: "707", anlam: "Her şeyin son sahibi." },
  { id: "108", ad: "Ya Reşid", okunus: "Ya Reşid", hedef: "514", anlam: "Yol gösteren." },
  { id: "109", ad: "Ya Sabur", okunus: "Ya Sabur", hedef: "298", anlam: "Çok sabırlı." },

  // --- ÖZEL SALAVATLAR VE DUALAR ---
  { id: "110", ad: "Salat-ı Tefriciye", okunus: "Allahümme salli salaten kamileten...", hedef: "4444", anlam: "Sıkıntılardan kurtulmak için." },
  { id: "111", ad: "Salat-ı Münciye", okunus: "Allahümme salli ala seyyidina...", hedef: "100", anlam: "Kurtuluş salavatı." },
  { id: "112", ad: "Salat-ı Fethiye", okunus: "Allahümme salli ala seyyidina...", hedef: "100", anlam: "Fethin kapılarını açan salavat." },
  { id: "113", ad: "Ya Şafi", okunus: "Ya Şafi", hedef: "391", anlam: "Hastalara şifa veren." },
  { id: "114", ad: "Ya Fettah (Rızık için)", okunus: "Ya Fettah Ya Rezzak", hedef: "797", anlam: "Bol kazanç ve hayırlı kapılar için." },
  { id: "115", ad: "İhlas Suresi", okunus: "Kul hüvallahü ehad...", hedef: "11", anlam: "Allah'ın birliği." },
  { id: "116", ad: "Fatiha Suresi", okunus: "Elhamdülillahi rabbil alemin...", hedef: "7", anlam: "Kur'an'ın başlangıcı." },
  { id: "117", ad: "Ayete'l Kürsi", okunus: "Allahü la ilahe illa hüvel hayyül kayyum...", hedef: "7", anlam: "Korunma ve azamet ayeti." },
  { id: "118", ad: "İnşirah Suresi", okunus: "Elem neşrah leke sadrak...", hedef: "7", anlam: "Kalp ferahlığı için." },
  { id: "119", ad: "Felak Suresi", okunus: "Kul euzü birabbil felak...", hedef: "7", anlam: "Kötülüklerden korunma." },
  { id: "120", ad: "Nas Suresi", okunus: "Kul euzü birabbin nas...", hedef: "7", anlam: "Vesveseden korunma." }
];

export default function ZikirlerList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Arama filtresi: Hem isme hem de okunuşa göre filtreleme yapar
  const filteredData = useMemo(() => {
    return ZIKIR_DATA.filter((item) => {
      const itemAd = item.ad.toLowerCase();
      const itemOkunus = item.okunus.toLowerCase();
      const query = searchQuery.toLowerCase();
      return itemAd.includes(query) || itemOkunus.includes(query);
    });
  }, [searchQuery]);

  const selectZikir = async (zikir: any) => {
    try {
      await AsyncStorage.setItem("targetNumber", zikir.hedef);
      await AsyncStorage.setItem("currentZikirName", zikir.ad);
      await AsyncStorage.setItem("currentZikirAnlam", zikir.anlam);
      await AsyncStorage.setItem("count", zikir.hedef);
      await AsyncStorage.setItem("currentZikirOkunus", zikir.okunus);
      router.replace("/"); 
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zikir Seç</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* ARAMA BARİ */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Zikir veya okunuş ara..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* LİSTE */}
      <FlatList 
        data={filteredData} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>Sonuç bulunamadı...</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => selectZikir(item)}>
            <View style={styles.cardContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.zikirAd}>{item.ad}</Text>
                <Text style={styles.okunusText}>{item.okunus}</Text>
              </View>
              <View style={styles.targetBadge}>
                <Text style={styles.targetText}>{item.hedef}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E", paddingHorizontal: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  backBtn: { padding: 5 },
  backBtnText: { color: '#69acfa', fontSize: 16, fontWeight: '600' },
  searchContainer: { marginBottom: 15 },
  searchInput: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  card: { 
    backgroundColor: "#2C2C2C", 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10, 
    borderLeftWidth: 4, 
    borderLeftColor: "#69acfa" 
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  zikirAd: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  okunusText: { color: "#aaa", fontSize: 14, fontStyle: 'italic', marginTop: 3 },
  targetBadge: { backgroundColor: "#1E1E1E", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 10 },
  targetText: { color: "#69acfa", fontWeight: "bold", fontSize: 12 }
});