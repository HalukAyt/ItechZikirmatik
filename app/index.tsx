  import AsyncStorage from "@react-native-async-storage/async-storage";
  import * as Haptics from "expo-haptics";
  import React, { useEffect, useState } from "react";
  import {
    Keyboard,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Vibration,
    View,
  } from "react-native";

  // 1. REKLAM KÜTÜPHANESİ
  import {
    BannerAd,
    BannerAdSize,
    TestIds,
  } from "react-native-google-mobile-ads";

  // 2. REKLAM BİRİM KİMLİĞİ
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: "ca-app-pub-7283360706215445/5430418789",
        android: "ca-app-pub-7283360706215445/4184795463",
      }) || TestIds.BANNER;

  export default function Zikirmatik() {
    const [count, setCount] = useState(0);
    const [targetNumber, setTargetNumber] = useState("");
    const [intervalNumber, setIntervalNumber] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    // --- 1. UYGULAMA AÇILINCA VERİLERİ YÜKLE ---
    useEffect(() => {
      const loadData = async () => {
        try {
          const savedTarget = await AsyncStorage.getItem("targetNumber");
          const savedInterval = await AsyncStorage.getItem("intervalNumber");
          const savedCount = await AsyncStorage.getItem("count");

          if (savedTarget !== null) setTargetNumber(savedTarget);
          if (savedInterval !== null) setIntervalNumber(savedInterval);
          if (savedCount !== null) setCount(parseInt(savedCount));
        } catch (error) {
          console.error("Veriler yüklenemedi", error);
        }
      };
      loadData();
    }, []);

    // --- 2. AYARLARI KAYDETME VE MODALI KAPATMA ---
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem("targetNumber", targetNumber.toString());
        await AsyncStorage.setItem("intervalNumber", intervalNumber.toString());
        setModalVisible(false); // Modalı kapat
        console.log("Ayarlar kaydedildi.");
      } catch (error) {
        console.error("Ayarlar kaydedilemedi", error);
      }
    };

    // --- 3. SAYAÇ ARTIRMA (HER BASIŞTA KAYDET) ---
    const handlePress = async () => {
      const newCount = count + 1;
      setCount(newCount);
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 100);

      // Yeni sayıyı hafızaya kaydet
      try {
        await AsyncStorage.setItem("count", newCount.toString());
      } catch (e) {
        console.error("Sayaç kaydedilemedi", e);
      }

      const target = parseInt(targetNumber);
      const interval = parseInt(intervalNumber);

      if (target && newCount === target) {
        Vibration.vibrate([0, 500]);
      } else if (interval && newCount % interval === 0) {
        Vibration.vibrate(150);
      } else {
        if (Platform.OS === "android") {
          Vibration.vibrate(30);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    };

    // --- 4. SIFIRLAMA (HAFIZAYI DA SIFIRLA) ---
    const handleReset = async () => {
      setCount(0);
      try {
        await AsyncStorage.setItem("count", "0"); // Hafızayı sıfırla
      } catch (e) {
        console.error("Sıfırlama kaydedilemedi", e);
      }

      if (Platform.OS === "android") Vibration.vibrate(50);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    return(
      <SafeAreaView style={styles.container}>
        {/* Ayarlar İkonu (Reklamın altında kalmaması için top değerini artırdık) */}
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>

        {/* --- 1. REKLAM ALANI (EN ÜST) --- */}
        <View style={styles.topAdContainer}>
          <BannerAd
            unitId={adUnitId} // Canlıya çıkarken buraya 2. reklam kodunu girebilirsin
            size={BannerAdSize.BANNER} // Üstte çok yer kaplamaması için standart banner kullandık
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        {/* İçerik Alanı */}
        <View style={styles.content}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{count}</Text>
          </View>

          {/* ANA BUTON */}
          <TouchableOpacity
            style={[
              styles.mainButton,
              isPressed && {
                backgroundColor: "#8ec5fc",
                transform: [{ scale: 0.98 }],
              },
            ]}
            onPress={handlePress}
            activeOpacity={1}
          >
            <Text style={styles.buttonText}>BAS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* --- 2. REKLAM ALANI (EN ALT) --- */}
        <View style={styles.bottomAdContainer}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>

        {/* Ayarlar Modalı (Aynı Kalıyor) */}
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

                <Text style={styles.label}>Bitiş Hedefi</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={targetNumber}
                  onChangeText={setTargetNumber}
                  placeholder="Örn: 99"
                  placeholderTextColor="#666"
                />

                <Text style={styles.label}>Ara Uyarı</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={intervalNumber}
                  onChangeText={setIntervalNumber}
                  placeholder="Örn: 33"
                  placeholderTextColor="#666"
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={saveSettings}
                >
                  <Text style={styles.closeButtonText}>Kaydet</Text>
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
    },
    topAdContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1E1E1E",
      paddingTop: Platform.OS === "android" ? 30 : 0, // Android'de en üstteki saat/şarj çubuğunun altına inmesi için
    },
    content: {
      flex: 1, // Üst ve alt reklamlar hariç kalan tüm alanı kaplar
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingBottom: 10,
    },
    bottomAdContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: "#1E1E1E",
      paddingBottom: Platform.OS === "ios" ? 0 : 5,
    },
    settingsIcon: {
      position: "absolute",
      top: 90, // Üst reklamın altında kalması için aşağı kaydırdık
      right: 20,
      zIndex: 10,
      padding: 10,
      backgroundColor: "#2C2C2C",
      borderRadius: 10,
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
      elevation: 15, // Android gölge
      shadowColor: "#000", // iOS gölge
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    buttonText: { 
      fontSize: 40, 
      fontWeight: "bold", 
      color: "white" 
    },
    resetButton: {
      paddingVertical: 10,
      paddingHorizontal: 30,
      backgroundColor: "#E53935",
      borderRadius: 25,
    },
    resetText: { 
      fontSize: 18, 
      color: "white", 
      fontWeight: "bold" 
    },
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
      marginBottom: 5 
    },
    input: {
      width: "100%",
      backgroundColor: "#222",
      color: "white",
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 18,
      borderWidth: 1,
      borderColor: "#69acfa",
    },
    closeButton: {
      backgroundColor: "#69acfa",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginTop: 10,
    },
    closeButtonText: { 
      color: "white", 
      fontWeight: "bold", 
      fontSize: 16 
    },
  });
