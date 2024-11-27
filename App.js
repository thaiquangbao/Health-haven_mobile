
import { useFonts } from "expo-font";
import { ActivityIndicator, ScrollView, View } from "react-native";
import LandingScreen from './src/screens/LandingScreen';
import MenuArea from "./src/components/menu/MenuArea";
import MenuProvider from "./src/contexts/MenuContext";
import { Dimensions } from "react-native";
import UtilsProvider from "./src/contexts/UtilsContext";
import UserProvider from "./src/contexts/UserContext";
import AuthProvider from "./src/contexts/AuthContext";
import ScreenProvider from "./src/contexts/ScreenContext";
import Menu from "./src/components/menu/Menu";
import DoctorsScreen from "./src/screens/DoctorsScreen";
import { useEffect, useRef, useState } from "react";
import Index from "./src/screens";
import DataProvider from "./src/contexts/DataContext";
import PayLoadProvider from "./src/contexts/PayloadContext";
import BookingHomeProvider from "./src/contexts/BookingHomeContext";
import MyApp from "./MyApp";

export default function App() {
  const [reload, setReload] = useState(false)
  let [fontsLoaded] = useFonts({
    'Nunito-R': require('./assets/fonts/Nunito-Regular.ttf'),
    'Nunito-B': require('./assets/fonts/Nunito-Bold.ttf'),
    'Nunito-S': require('./assets/fonts/Nunito-SemiBold.ttf'),
  });

  // icons
  //https://oblador.github.io/react-native-vector-icons

  return (
    <>
      {fontsLoaded ? (
        <UtilsProvider>
          <MyApp />
        </UtilsProvider>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
      )}
    </>
  );
}
