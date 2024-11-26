import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import Icon from 'react-native-vector-icons/Feather';
import Sign from '../../../assets/sign.png'
import Logo from '../../../assets/logo.png'
import { utilsContext } from '../../contexts/UtilsContext';
import { userContext } from '../../contexts/UserContext';
import { notifyType } from '../../utils/notify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, TypeHTTP } from '../../utils/api';

const SignIn = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { utilsHandler } = useContext(utilsContext)
    const { userHandler, userData } = useContext(userContext)
    const { width } = Dimensions.get('window'); // Lấy chiều rộng của màn hình
    const [translateX] = useState(new Animated.Value(menuData.displaySignIn === true ? 0 : width));
    const [info, setInfo] = useState({
        userName: '',
        passWord: ''
    })

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displaySignIn === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displaySignIn]);

    const handleSignIn = () => {
        if (!/^0[0-9]{9}$/.test(info.userName)) {
            utilsHandler.notify(notifyType.WARNING, "Số điện thoại không hợp lệ")
            return
        }
        if (info.passWord.length < 6) {
            utilsHandler.notify(notifyType.WARNING, "Mật khẩu phải lớn hơn 6 ký tự")
            return
        }
        api({ sendToken: false, type: TypeHTTP.POST, path: '/auth/login', body: { userName: info.userName, passWord: info.passWord } })
            .then(async (res) => {
                if (res.data?.processSignup === 3) {
                    if (res.data?.role === 'ADMIN') {
                        utilsHandler.notify(notifyType.FAIL, "Vui Lòng đăng nhập bằng tài khoản User")
                    } else {
                        userHandler.setUser(res.data)
                        await AsyncStorage.setItem('accessToken', res.token.accessToken)
                        await AsyncStorage.setItem('refreshToken', res.token.refreshToken)
                        utilsHandler.notify(notifyType.SUCCESS, "Đăng Nhập Thành Công")
                        menuHandler.setDisplaySignIn(false)
                        // xu ly neu nhu la doctor (copy ben FE)
                    }
                } else {
                    userHandler.setUser(res.data)
                    utilsHandler.notify(notifyType.WARNING, "Bạn cần hoàn tất thông tin đăng ký")
                    menuHandler.setDisplaySignIn(false)
                    menuHandler.setDisplaySignUp(true)
                }
            })
            .catch(error => {
                utilsHandler.notify(notifyType.FAIL, error.message)
            })
    }

    return (
        <Animated.View
            style={{
                transform: [{ translateX }],
                position: 'absolute',
                height: '100%',
                width: '100%', // Sử dụng chiều rộng của màn hình
                backgroundColor: 'white',
                zIndex: 3,
                top: 0,
                flexDirection: 'column',
                // alignItems: 'center',
                gap: 20,
                right: 0,
            }}
        >
            <View style={{ position: 'absolute', right: 15, top: 30 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplaySignIn(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                <Image source={Logo} style={{ width: 300, height: 300, marginTop: '20%' }} />
                <Text style={{ fontFamily: 'Nunito-B', fontSize: 22 }}>Đăng Nhập Tài Khoản</Text>
                <TextInput value={info.userName} onChangeText={e => setInfo({ ...info, userName: e })} placeholder='Số Điện Thoại (+84)' style={{ color: 'black', marginTop: 20, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                <TextInput value={info.passWord} onChangeText={e => setInfo({ ...info, passWord: e })} secureTextEntry={true} placeholder='Mật Khẩu' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                <TouchableOpacity style={{ marginVertical: 10, width: '75%' }}>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 13, }}>Quên Mật Khẩu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSignIn()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplaySignIn(false)
                    menuHandler.setDisplaySignUp(true)
                }} style={{ marginVertical: 15 }}>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, }}>Chưa có tài khoản?</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default SignIn;
