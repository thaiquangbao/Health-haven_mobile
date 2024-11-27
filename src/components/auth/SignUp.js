import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import Icon from 'react-native-vector-icons/Feather';
import Sign from '../../../assets/sign.png'
import Logo from '../../../assets/logo.png'
import { api, TypeHTTP } from '../../utils/api'
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';
import { userContext } from '../../contexts/UserContext';
import { formatPhoneByFireBase } from '../../utils/phone';
import CompleteInformation from './CompleteInformation';

const SignUp = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { utilsHandler } = useContext(utilsContext)
    const { userHandler, userData } = useContext(userContext)
    const { width } = Dimensions.get('window'); // Lấy chiều rộng của màn hình
    const [translateX] = useState(new Animated.Value(menuData.displaySignUp === true ? 0 : width));
    const [step, setStep] = useState(0)
    const [otp, setOtp] = useState('')
    const scrollViewRef = useRef(null);
    const [info, setInfo] = useState({
        phone: '',
        password: '',
        confirmPassword: ''
    })

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displaySignUp === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displaySignUp]);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: step * width, animated: true });
        }
    }, [step])

    useEffect(() => {
        if (userData.user) {
            setStep(userData.user.processSignup)
        }
    }, [userData.user])

    const handleSubmitSignUp = () => {
        if (!/^0[0-9]{9}$/.test(info.phone)) {
            utilsHandler.notify(notifyType.WARNING, "Số điện thoại không hợp lệ")
            return
        }
        if (info.password.length < 6) {
            utilsHandler.notify(notifyType.WARNING, "Mật khẩu phải lớn hơn 6 ký tự")
            return
        }
        if (info.password !== info.confirmPassword) {
            utilsHandler.notify(notifyType.WARNING, "Mật khẩu xác nhận phải trùng khớp với mật khẩu")
            return
        }
        api({ sendToken: false, type: TypeHTTP.POST, body: { phone: info.phone, passWord: info.password }, path: '/auth/signup' })
            .then(res => {
                userHandler.setUser(res)
                utilsHandler.notify(notifyType.SUCCESS, 'Đăng Ký Tài Khoản Thành Công')
            })
            .catch(error => {
                utilsHandler.notify(notifyType.FAIL, error.message)
            })
    }


    const handleSubmitOTPWithPhoneNumber = () => {
        if (otp === '') {
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập OTP trước khi xác nhận");
            return;
        }
        setTimeout(() => {
            let user = { ...userData.user, processSignup: 2 };
            api({
                type: TypeHTTP.POST,
                body: { ...user },
                path: `/auth/update`,
                sendToken: false,
            })
                .then((res) => {
                    userHandler.setUser(res);
                    utilsHandler.notify(
                        notifyType.SUCCESS,
                        "Xác Thực Tài Khoản Thành Công"
                    );
                })
                .catch(() => {
                    utilsHandler.notify(
                        notifyType.FAIL,
                        "Xác minh thất bại, Vui lòng thử lại"
                    );
                });
        }, 1000);

    };

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
            <View style={{ position: 'absolute', right: 15, top: 30, zIndex: 1 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplaySignUp(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                ref={scrollViewRef}
                scrollEnabled={false}
                style={{ flexDirection: 'row' }}
            >
                <View style={{ width, flexDirection: 'column', alignItems: 'center' }}>
                    <Image source={Logo} style={{ width: 300, height: 300, marginTop: '20%' }} />
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 22 }}>Chào Mừng Đến Với HealthHaven</Text>
                    <TextInput value={info.phone} onChangeText={e => setInfo({ ...info, phone: e })} placeholder='Số Điện Thoại (+84)' style={{ color: 'black', marginTop: 20, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={info.password} onChangeText={e => setInfo({ ...info, password: e })} secureTextEntry={true} placeholder='Mật Khẩu' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={info.confirmPassword} onChangeText={e => setInfo({ ...info, confirmPassword: e })} secureTextEntry={true} placeholder='Xác Nhận Mật Khẩu' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                    <TouchableOpacity onPress={() => handleSubmitSignUp()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Ký</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        menuHandler.setDisplaySignUp(false)
                        menuHandler.setDisplaySignIn(true)
                    }} style={{ marginVertical: 15 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, }}>Đã có tài khoản?</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width, flexDirection: 'column', alignItems: 'center' }}>
                    <Image source={Logo} style={{ width: 300, height: 300, marginTop: '20%' }} />
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 22 }}>Xác Thực Tài Khoản</Text>
                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, width: '75%', textAlign: 'center', marginTop: 5 }}>Một mã xác minh đã được gửi đến số điện thoại 0902491471. Vui lòng nhập mã xác minh bên dưới</Text>
                    <TextInput value={otp} onChangeText={e => setOtp(e)} placeholder='Mã Xác Thực' style={{ color: 'black', marginTop: 20, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                    <TouchableOpacity onPress={() => handleSubmitOTPWithPhoneNumber()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Tiếp Tục</Text>
                    </TouchableOpacity>
                </View>
                <CompleteInformation />
            </ScrollView>
        </Animated.View>
    );
};

export default SignUp;
