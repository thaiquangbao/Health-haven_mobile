import React, { useContext, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import Logo from '../../../assets/logo.png'
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import { menuContext } from '../../contexts/MenuContext';
import { userContext } from '../../contexts/UserContext';
import { default as Icon5, default as Icon8 } from 'react-native-vector-icons/MaterialCommunityIcons';
import { screenContext } from '../../contexts/ScreenContext';
import { api, TypeHTTP } from '../../utils/api';
import { utilsContext } from '../../contexts/UtilsContext';

const Menu = () => {
    const { userData } = useContext(userContext)
    const { menuHandler, menuData } = useContext(menuContext)
    const { screenHandler } = useContext(screenContext)
    const { utilsHandler } = useContext(utilsContext)
    const navigate = (goal) => {
        menuHandler.setDisplay(false)
        screenHandler.navigate(goal)
    }

    const [notifications, setNotifications] = useState([])
    useEffect(() => {
        if (userData.user) {
            api({ path: `/notices/get-by-user/${userData.user?._id}`, type: TypeHTTP.GET, sendToken: false })
                .then(res => {
                    setNotifications(res)
                })
        }
    }, [userData.user])

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={Logo} style={{ height: 50, width: 50 }} />
                <Text style={{ fontSize: 22, fontFamily: 'Nunito-B', color: '#229bff' }}>HealthHaven</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {!userData.user && (
                    <>
                        <TouchableOpacity onPress={() => utilsHandler.setReload(true)}>
                            <Icon1 name='reload' style={{ fontSize: 30, color: '#566573' }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => menuHandler.setDisplaySignIn(true)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', paddingVertical: 8, paddingHorizontal: 15 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Nhập</Text>
                        </TouchableOpacity>
                    </>
                )}
                {userData.user && (
                    <>
                        <TouchableOpacity onPress={() => utilsHandler.setReload(true)}>
                            <Icon1 name='reload' style={{ fontSize: 30, color: '#566573' }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigate('notify')} style={{ gap: 10, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
                            <Icon8 name='bell' style={{ fontSize: 30, color: '#a6acaf' }} />
                            <View style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, backgroundColor: '#DD0000', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, color: 'white', textAlign: 'center', fontFamily: 'Nunito-B' }}>{notifications.filter(item => item.seen === false).length}</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity onPress={() => menuHandler.setDisplay(true)}>
                    <Icon name='bars' style={{ fontSize: 30, color: '#566573' }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Menu