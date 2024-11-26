import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { userContext } from "./UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { payloadContext } from "./PayloadContext";
import { api, TypeHTTP } from "../utils/api";
export const dataContext = createContext()

const DataProvider = ({ children }) => {

    const [doctorRecords, setDoctorRecords] = useState([])
    const [sicks, setSicks] = useState([])
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const { userData } = useContext(userContext)
    const { payloadData } = useContext(payloadContext)

    useEffect(() => {
        api({ type: TypeHTTP.GET, path: '/doctorRecords/getAll', sendToken: false })
            .then(res => {
                setDoctorRecords(res)
            })
        api({ path: '/sicks/get-all', sendToken: false, type: TypeHTTP.GET })
            .then(res => {
                setSicks(res)
            })
    }, [payloadData.reload])

    useEffect(() => {

        const getTokens = async () => {
            const accessToken = await AsyncStorage.getItem('accessToken')
            const refreshToken = await AsyncStorage.getItem('refreshToken')
            setAccessToken(accessToken)
            setRefreshToken(refreshToken)
        }
        if (userData.user) {
            getTokens()
        }
    }, [userData.user])

    const data = {
        doctorRecords,
        sicks,
        accessToken,
        refreshToken
    }

    const handler = {
        setDoctorRecords,
        setSicks
    }

    return (
        <dataContext.Provider value={{ data: data, handler: handler }}>
            {children}
        </dataContext.Provider>
    )
}

export default DataProvider