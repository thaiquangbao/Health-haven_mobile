import { createContext, useContext, useState } from "react";
import { Alert } from "react-native";
import { userContext } from "./UserContext";
export const screenContext = createContext()

const ScreenProvider = ({ children }) => {

    const [currentScreen, setCurrentScreen] = useState()
    const [currentDoctorRecord, setCurrentDoctorRecord] = useState()

    const navigate = (route) => {
        switch (route) {
            case 'landing':
                setCurrentScreen(0)
                break
            case 'doctors':
                setCurrentScreen(1)
                break
            case 'detail-doctor':
                setCurrentScreen(2)
                break
            case 'services':
                setCurrentScreen(3)
                break
            case 'forums':
                setCurrentScreen(4)
                break
            case 'blogs':
                setCurrentScreen(5)
                break
            case 'appointments':
                setCurrentScreen(6)
                break
            case 'zego':
                setCurrentScreen(7)
                break
            case 'medical-record':
                setCurrentScreen(8)
                break
            case 'chat-message':
                setCurrentScreen(9)
                break
            case 'tickets':
                setCurrentScreen(10)
                break
            case 'follow-health':
                setCurrentScreen(11)
                break
            case 'profile':
                setCurrentScreen(12)
                break
            case 'my-patient':
                setCurrentScreen(13)
                break
            case 'doctor-record':
                setCurrentScreen(14)
                break
            case 'notify':
                setCurrentScreen(15)
                break
            case "profit":
                setCurrentScreen(16)
                break
            case "appointment-homes":
                setCurrentScreen(17)
                break
            case 'my-profit':
                setCurrentScreen(18)
                break
        }
    }

    const data = {
        currentScreen,
        currentDoctorRecord
    }

    const handler = {
        navigate,
        setCurrentDoctorRecord
    }

    return (
        <screenContext.Provider value={{ screenData: data, screenHandler: handler }}>
            {children}
        </screenContext.Provider>
    )
}

export default ScreenProvider