import React, { useContext } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import Logo from '../../../assets/logo.png'
import Icon from 'react-native-vector-icons/FontAwesome6';
import { menuContext } from '../../contexts/MenuContext';
import { userContext } from '../../contexts/UserContext';

const Menu = () => {
    const { userData } = useContext(userContext)
    const { menuHandler, menuData } = useContext(menuContext)

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={Logo} style={{ height: 50, width: 50 }} />
                <Text style={{ fontSize: 22, fontFamily: 'Nunito-B', color: '#229bff' }}>HealthHaven</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {!userData.user && (
                    <TouchableOpacity onPress={() => menuHandler.setDisplaySignIn(true)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', paddingVertical: 8, paddingHorizontal: 15 }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Nhập</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => menuHandler.setDisplay(true)}>
                    <Icon name='bars' style={{ fontSize: 30, color: '#566573' }} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Menu