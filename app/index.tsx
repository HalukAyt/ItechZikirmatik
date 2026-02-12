import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View,
  Platform, // Platform kontrolü için ekledik
} from "react-native";

export default function Zikirmatik() {
  const [count, setCount] = useState(0);

  // Hedef Sayı (Örn: 512)
  const [targetNumber, setTargetNumber] = useState("");
  // Döngü Sayısı (Örn: 100)
  const [intervalNumber, setIntervalNumber] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    const newCount = count + 1;
    setCount(newCount);

    const target = parseInt(targetNumber);
    const interval = parseInt(intervalNumber);

    // --- 1. HEDEF KONTROLÜ (BİTİŞ) ---
    if (target && newCount === target) {
      // Android ve iOS için güçlü titreşim
      Vibration.vibrate([0, 500, 100, 500]); 
    }
    // --- 2. ARA UYARI KONTROLÜ ---
    else if (interval && newCount % interval === 0) {
      // 150ms belirgin titreşim
      Vibration.vibrate(150);
    }
    // --- 3. NORMAL BASIŞ ---
    else {
      if (Platform.OS === 'android') {
        // ANDROID İÇİN ÖZEL AYAR:
        // Haptics bazen Android'de çalışmaz, bu yüzden
        // 30 milisaniyelik çok kısa "Vibration" kullanıyoruz.
        // Bu "tık" hissini taklit eder.
        Vibration.vibrate(30);
      } else {
        // iOS'te Haptics harika çalışır
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    if (Platform.OS === 'android') {
        Vibration.vibrate(50);
    } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ayarlar İkonu */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 24 }}>⚙️</Text>
      </TouchableOpacity>

      {/* Logo Alanı */}
      <View style={styles.logoContainer}>
        <Image
          // Geçici internet resmi (Test için):
          source={require("../assets/images/ItechW.png")} 
          // Eğer hata alırsan üstteki satırı kapat, alttakini aç:
          // source={{ uri: "https://cdn-icons-png.flaticon.com/512/6063/6063620.png" }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{count}</Text>
      </View>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>BAS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Sıfırla</Text>
      </TouchableOpacity>

      {/* --- AYARLAR MODALI --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ayarlar</Text>

              <Text style={styles.label}>Bitiş Hedefi (Örn: 512)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Boş bırakılabilir"
                placeholderTextColor="#666"
                value={targetNumber}
                onChangeText={setTargetNumber}
              />

              <Text style={styles.label}>Ara Uyarı (Örn: Her 10 da)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Boş bırakılabilir"
                placeholderTextColor="#666"
                value={intervalNumber}
                onChangeText={setIntervalNumber}
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Kaydet ve Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  settingsIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
  },
  logoContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  counterContainer: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#69acfa",
    minWidth: 200,
    alignItems: "center",
  },
  counterText: {
    fontSize: 70,
    fontWeight: "bold",
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  mainButton: {
    width: 200,
    height: 200,
    backgroundColor: "#69acfa",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    elevation: 15,
    shadowColor: "#0a3152",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: { fontSize: 40, fontWeight: "bold", color: "white" },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#E53935",
    borderRadius: 25,
  },
  resetText: { fontSize: 18, color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },
  modalTitle: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    color: "#AAA",
    marginBottom: 5,
    marginLeft: 5,
    marginTop: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "#222",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#69acfa",
  },
  closeButton: {
    backgroundColor: "#69acfa",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});