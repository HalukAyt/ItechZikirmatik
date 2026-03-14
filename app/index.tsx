import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Purchases from "react-native-purchases";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__ ? TestIds.BANNER : Platform.select({
  ios: "ca-app-pub-7283360706215445/5430418789",
  android: "ca-app-pub-7283360706215445/4184795463",
}) || TestIds.BANNER;

const APIKeys = {
  apple: "appl_qEFXXOMwlHMcBkGQPbvVsNueqQr",
  google: "goog_buraya_android_key_gelecek",
};

export default function ZikirmatikMain() { // İSİM DEĞİŞTİ
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [targetNumber, setTargetNumber] = useState("");
  const [intervalNumber, setIntervalNumber] = useState("");
  const [currentZikirName, setCurrentZikirName] = useState("");
  const [currentZikirAnlam, setCurrentZikirAnlam] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showAds, setShowAds] = useState(true);

  const loadData = async () => {
    try {
      const savedTarget = await AsyncStorage.getItem("targetNumber");
      const savedInterval = await AsyncStorage.getItem("intervalNumber");
      const savedCount = await AsyncStorage.getItem("count");
      const savedName = await AsyncStorage.getItem("currentZikirName");
      const savedAnlam = await AsyncStorage.getItem("currentZikirAnlam");

      setCurrentZikirName(savedName || "");
      setCurrentZikirAnlam(savedAnlam || "");
      setTargetNumber(savedTarget || "");
      setIntervalNumber(savedInterval || "");

      if (savedCount !== null) {
        setCount(parseInt(savedCount));
      } else if (savedTarget !== null) {
        setCount(parseInt(savedTarget));
      } else {
        setCount(0);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const setup = async () => {
      await loadData();
      try {
        const key = Platform.OS === "ios" ? APIKeys.apple : APIKeys.google;
        if (key !== "key_gelecek") { // Key girilmemişse hata vermesin
          Purchases.configure({ apiKey: key });
          const customerInfo = await Purchases.getCustomerInfo();
          if (customerInfo.entitlements.active["premium"]) setShowAds(false);
        }
      } catch (e) { console.log("RevenueCat/Ads Ready"); }
    };
    setup();
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handlePress = async () => {
    const target = parseInt(targetNumber);
    let newCount = target > 0 ? count - 1 : count + 1;

    if (target > 0 && newCount < 0) {
      Vibration.vibrate(500);
      Alert.alert("Zikir Bitti", "Zikriniz tamamlandı.");
      return;
    }

    setCount(newCount);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
    await AsyncStorage.setItem("count", newCount.toString());

    if (newCount === 0 && target > 0) {
      Vibration.vibrate([0, 500, 100, 500]);
    } else {
      Platform.OS === "android" ? Vibration.vibrate(30) : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleReset = async () => {
    const val = targetNumber ? targetNumber : "0";
    setCount(parseInt(val));
    await AsyncStorage.setItem("count", val);
    Vibration.vibrate(50);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showAds && (
        <View style={styles.adBox}>
          <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />
        </View>
      )}

      {/* LİSTE BUTONU - pathname'i nesne olarak veriyoruz */}
      <TouchableOpacity 
        style={[styles.iconBtn, { right: 80 }]} 
        onPress={() => router.push({ pathname: "/zikirler" } as any)}
      >
        <Text style={{ fontSize: 24 }}>📜</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ fontSize: 24 }}>⚙️</Text>
      </TouchableOpacity>

      <View style={styles.mainArea}>
        <View style={styles.textWrap}>
          <Text style={styles.titleText}>{currentZikirName || "Genel Zikir"}</Text>
          {currentZikirAnlam ? <Text style={styles.subText}>{currentZikirAnlam}</Text> : null}
        </View>

        <View style={styles.counterBox}>
          <Text style={styles.countTxt}>{count}</Text>
          <Text style={styles.labelTxt}>{targetNumber ? "KALAN" : "TOPLAM"}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.pressBtn, isPressed && styles.pressBtnActive]} 
          onPress={handlePress} 
          activeOpacity={1}
        >
          <Text style={styles.pressBtnTxt}>BAS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnTxt}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {showAds && (
        <View style={styles.adBox}>
          <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
        </View>
      )}

      {/* AYARLAR MODALI */}
      <Modal animationType="fade" transparent visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={styles.modalBody}>
              <Text style={styles.modalHeader}>Ayarlar</Text>
              
              <TextInput style={styles.input} keyboardType="numeric" value={targetNumber} onChangeText={setTargetNumber} placeholder="Hedef Sayı" placeholderTextColor="#666" />
              
              <TouchableOpacity style={styles.saveBtn} onPress={async () => {
                  await AsyncStorage.setItem("targetNumber", targetNumber);
                  setCount(parseInt(targetNumber || "0"));
                  setModalVisible(false);
                }}>
                <Text style={styles.btnText}>Kaydet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearBtn} onPress={async () => {
                  await AsyncStorage.multiRemove(["currentZikirName", "currentZikirAnlam", "targetNumber", "count"]);
                  setCurrentZikirName(""); setCurrentZikirAnlam(""); setTargetNumber(""); setCount(0);
                  setModalVisible(false);
                }}>
                <Text style={styles.btnText}>Zikri Temizle / Kaldır</Text>
              </TouchableOpacity>

              

              <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#aaa" }}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E" },
  adBox: { width: "100%", alignItems: "center", justifyContent: "center", minHeight: 60 },
  mainArea: { flex: 1, alignItems: "center", justifyContent: "space-evenly" },
  iconBtn: { position: "absolute", top: 80, right: 20, zIndex: 10, padding: 10, backgroundColor: "#2C2C2C", borderRadius: 10 },
  textWrap: { alignItems: "center", paddingHorizontal: 20 },
  titleText: { color: "#69acfa", fontSize: 26, fontWeight: "bold", textAlign: "center" },
  subText: { color: "#aaa", fontSize: 16, fontStyle: "italic", textAlign: "center", marginTop: 8 },
  counterBox: { backgroundColor: "#2C2C2C", padding: 30, borderRadius: 25, borderWidth: 2, borderColor: "#69acfa", minWidth: 220, alignItems: "center" },
  countTxt: { fontSize: 80, fontWeight: "bold", color: "#fff" },
  labelTxt: { color: "#69acfa", fontSize: 14, fontWeight: "800", marginTop: 5 },
  pressBtn: { width: 220, height: 220, backgroundColor: "#69acfa", borderRadius: 110, alignItems: "center", justifyContent: "center", elevation: 10 },
  pressBtnActive: { backgroundColor: "#8ec5fc", transform: [{ scale: 0.95 }] },
  pressBtnTxt: { fontSize: 45, fontWeight: "bold", color: "#fff" },
  resetBtn: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: "#E53935", borderRadius: 30 },
  resetBtnTxt: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.9)" },
  modalBody: { width: "85%", backgroundColor: "#222", padding: 25, borderRadius: 25, alignItems: "center", borderWidth: 1, borderColor: "#444" },
  modalHeader: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", backgroundColor: "#111", color: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#69acfa" },
  saveBtn: { backgroundColor: "#69acfa", paddingVertical: 15, width: "100%", alignItems: "center", borderRadius: 12 },
  clearBtn: { backgroundColor: "#444", paddingVertical: 15, width: "100%", alignItems: "center", borderRadius: 12, marginTop: 10 },
  premiumBtn: { backgroundColor: "#FF9800", paddingVertical: 15, width: "100%", alignItems: "center", borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  restoreTxt: { color: "#aaa", textDecorationLine: "underline", fontSize: 14, textAlign: 'center' }
});