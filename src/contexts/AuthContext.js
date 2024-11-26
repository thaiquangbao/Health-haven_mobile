import { createContext, useContext, useEffect } from "react";
import { Alert } from "react-native";
import { userContext } from "./UserContext";
import { screenContext } from "./ScreenContext";
import { api, TypeHTTP } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { utilsContext } from "./UtilsContext";
import { notifyType } from "../utils/notify";
export const authContext = createContext()

const AuthProvider = ({ children }) => {
    const { utilsHandler } = useContext(utilsContext)
    const { userData, userHandler } = useContext(userContext)
    const { screenData } = useContext(screenContext)

    useEffect(() => {
        api({
            type: TypeHTTP.GET,
            sendToken: true,
            path: "/auth/userByToken",
        })
            .then(async (user) => {
                if (user.role === "ADMIN") {
                    utilsHandler.notify(
                        notifyType.FAIL,
                        "Tài khoản của bạn không đủ quyền để truy cập"
                    );
                    await AsyncStorage.removeItem("accessToken");
                    await AsyncStorage.removeItem(
                        "refreshToken"
                    );
                } else {
                    userHandler.setUser(user);
                }
            })
            .catch(async (error) => {
                await AsyncStorage.removeItem("accessToken");
                await AsyncStorage.removeItem("refreshToken");
            });
    }, [screenData])

    const data = {

    }

    const handler = {

    }

    return (
        <authContext.Provider value={{ authData: data, authHandler: handler }}>
            {children}
        </authContext.Provider>
    )
}

export default AuthProvider
