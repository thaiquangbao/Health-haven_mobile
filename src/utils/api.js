import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
export let baseURL = 'https://shoeshop-backend.online'//https://shoeshop-backend.online
axios.defaults.baseURL = `${baseURL}`
export const deploy = 'https://health-haven-iuh.vercel.app'

export const TypeHTTP = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
}

export const api = async ({ path, body, type, sendToken, port }) => {
    if (port) {
        baseURL = 'http://192.168.1.7:' + port
        axios.defaults.baseURL = `${baseURL}`
    } else {
        baseURL = 'https://shoeshop-backend.online'
        // baseURL = 'http://192.168.88.206:8999'
        axios.defaults.baseURL = `${baseURL}`
    }
    const accessToken = await AsyncStorage.getItem('accessToken')
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    return new Promise((rejects, resolve) => {
        switch (type) {
            case TypeHTTP.GET:
                axios.get(path, { headers: sendToken ? { accessToken, refreshToken } : {} })
                    .then(res => {
                        if (sendToken) {
                            AsyncStorage.setItem('accessToken', res.data.token.accessToken)
                            AsyncStorage.setItem('refreshToken', res.data.token.refreshToken)
                            rejects(res.data.data)
                        } else {
                            rejects(res.data)
                        }
                    })
                    .catch(res => {
                        resolve({ status: res.response?.status, message: res.response?.data })
                    })
                break
            case TypeHTTP.POST:
                axios.post(path, body, { headers: sendToken ? { accessToken, refreshToken } : {} })
                    .then(res => {
                        if (sendToken) {
                            AsyncStorage.setItem('accessToken', res.data.token.accessToken)
                            AsyncStorage.setItem('refreshToken', res.data.token.refreshToken)
                            rejects(res.data.data)
                        } else {
                            rejects(res.data)
                        }
                    })
                    .catch(res => {
                        resolve({ status: res.response?.status, message: res.response?.data })
                    })
                break
            case TypeHTTP.PUT:
                axios.put(path, body, { headers: sendToken ? { accessToken, refreshToken } : {} })
                    .then(res => {
                        if (sendToken) {
                            AsyncStorage.setItem('accessToken', res.data.token.accessToken)
                            AsyncStorage.setItem('refreshToken', res.data.token.refreshToken)
                            rejects(res.data.data)
                        } else {
                            rejects(res.data)
                        }
                    })
                    .catch(res => {
                        resolve({ status: res.response?.status, message: res.response?.data })
                    })
                break
            case TypeHTTP.DELETE:
                axios.delete(path, { headers: sendToken ? { accessToken, refreshToken } : {} })
                    .then(res => {
                        if (sendToken) {
                            AsyncStorage.setItem('accessToken', res.data.token.accessToken)
                            AsyncStorage.setItem('refreshToken', res.data.token.refreshToken)
                            rejects(res.data.data)
                        } else {
                            rejects(res.data)
                        }
                    })
                    .catch(res => {
                        resolve({ status: res.response?.status, message: res.response?.data })
                    })
                break
        }
    })
}