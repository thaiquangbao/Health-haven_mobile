// MenuArea.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Icon1 from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Feather';
import { default as Chart, default as Icon6 } from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/FontAwesome6';
import { default as Icon5, default as Icon8 } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Icon4, default as Icon7 } from 'react-native-vector-icons/MaterialIcons';
import { menuContext } from '../../contexts/MenuContext';
import { screenContext } from '../../contexts/ScreenContext';
import { userContext } from '../../contexts/UserContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';
import ChatBot from '../../../assets/chatbot.png'

const MenuArea = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { userData, userHandler } = useContext(userContext)
    const { screenHandler } = useContext(screenContext)
    const { utilsHandler } = useContext(utilsContext)
    const { width } = Dimensions.get('window'); // Lấy chiều rộng của màn hình
    const [translateX] = useState(new Animated.Value(menuData.display === true ? 0 : width));

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.display === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.display]);

    const navigate = (goal) => {
        menuHandler.setDisplay(false)
        screenHandler.navigate(goal)
    }

    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken')
        await AsyncStorage.removeItem('refreshToken')
        userHandler.setUser()
        utilsHandler.notify(notifyType.SUCCESS, 'Đăng Xuất Thành Công')
        screenHandler.navigate('landing')
    }

    return (
        <Animated.View
            style={{
                transform: [{ translateX }],
                position: 'absolute',
                height: '100%',
                width: '80%', // Sử dụng chiều rộng của màn hình
                backgroundColor: 'white',
                zIndex: 2,
                top: 0,
                flexDirection: 'column',
                gap: 20,
                right: 0,
                paddingTop: 20,
                paddingLeft: 25,
                paddingRight: 10
            }}
        >
            <TouchableOpacity onPress={() => menuHandler.setDisplay(false)} style={{ zIndex: 10 }}>
                <Icon name="x" style={{ fontSize: 30, position: 'absolute', right: 10, top: 10 }} />
            </TouchableOpacity>

            {(userData.user && userData.user.role === 'USER') && (
                <TouchableOpacity onPress={() => navigate('profile')} style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 7, width: '90%' }}>
                    <Image source={{ uri: userData.user.image }} style={{ height: 46, width: 46, borderRadius: 23 }} />
                    <Text style={{ fontSize: 20, fontFamily: 'Nunito-B', }}>{userData.user.fullName}</Text>
                </TouchableOpacity>
            )}

            {(userData.user && userData.user.role === 'DOCTOR') && (
                <TouchableOpacity onPress={() => navigate('profile')} style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center', gap: 7, width: '90%' }}>
                    <View style={{
                        height: 50,
                        width: 50,
                        borderWidth: 1,
                        borderColor: '#1dcbb6',
                        overflow: 'hidden',
                        borderRadius: 150
                    }}>
                        <Image
                            source={{
                                uri: userData.user.image
                            }}
                            style={{
                                height: 70,
                                width: 50,
                            }}
                        />
                    </View>
                    <Text style={{ fontSize: 20, fontFamily: 'Nunito-B' }}>{userData.user.fullName}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigate('landing')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon1 name='home' style={{ fontSize: 30, color: '#567fea' }} />
                <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Trang Chủ</Text>
            </TouchableOpacity>

            {userData.user?.role === 'DOCTOR' && (<>
                <TouchableOpacity onPress={() => navigate('profit')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Chart name='bar-chart' style={{ fontSize: 30, color: '#e6e635' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Thống kê doanh thu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('my-profit')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon8 name='google-analytics' style={{ fontSize: 30, color: '#e53df3' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Doanh Thu Của Tôi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('tickets')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon1 name='circle-with-plus' style={{ fontSize: 30, color: '#ed4c4c' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Phiếu Đăng Ký</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('my-patient')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon2 name='user-doctor' style={{ fontSize: 30, color: '#4ce1c6' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Bệnh Nhân Của Tôi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('chat-message')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon7 name='message' style={{ fontSize: 30, color: '#567fea' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Trò Chuyện</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('doctor-record')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon5 name='file-document' style={{ fontSize: 30, color: '#f5b041' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Hồ Sơ Bác Sĩ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplay(false)
                    menuHandler.setDisplayChatBot(true)
                }} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={ChatBot} style={{ height: 30, width: 30 }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>HealthHaven ChatBot</Text>
                </TouchableOpacity>
            </>)}


            {userData.user?.role !== 'DOCTOR' && (<>
                <TouchableOpacity onPress={() => navigate('services')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon1 name='circle-with-plus' style={{ fontSize: 30, color: '#ed4c4c' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Các Dịch Vụ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('doctors')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon2 name='user-doctor' style={{ fontSize: 30, color: '#4ce1c6' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Đội Ngũ Bác Sĩ</Text>
                </TouchableOpacity>
            </>)}

            {userData.user?.role === 'USER' && (<>
                <TouchableOpacity onPress={() => navigate('medical-record')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon5 name='file-document' style={{ fontSize: 30, color: '#ff3359' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Hồ Sơ Sức Khỏe</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('follow-health')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon6 name='heartbeat' style={{ fontSize: 30, color: '#ff3359' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Theo Dõi Sức Khỏe</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('appointments')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon6 name='calendar' style={{ fontSize: 30, color: '#e53df3' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Cuộc Hẹn Trực Tuyến</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('appointment-homes')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon3 name='calendar-check' style={{ fontSize: 30, color: '#ebd400' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Cuộc Hẹn Tại Nhà</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('chat-message')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Icon7 name='message' style={{ fontSize: 30, color: '#567fea' }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Trò Chuyện</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplay(false)
                    menuHandler.setDisplayChatBot(true)
                }} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={ChatBot} style={{ height: 30, width: 30 }} />
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>HealthHaven ChatBot</Text>
                </TouchableOpacity>
            </>)}
            {userData.user?.role !== 'DOCTOR' && (<>
            <TouchableOpacity onPress={() => { menuHandler.setDisplay(false); menuHandler.setDisplaySmartSearching(true) }} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon name='search' style={{ fontSize: 30, color: '#ff3359' }} />
                <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Tìm Kiếm Thông Minh</Text>
            </TouchableOpacity>
            </>)}
            <TouchableOpacity onPress={() => navigate('forums')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon1 name='message' style={{ fontSize: 30, color: '#fb3997' }} />
                <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Thảo Luận</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate('blogs')} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Icon3 name='blog' style={{ fontSize: 30, color: '#ff7834' }} />
                <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Cẩm Nang</Text>
            </TouchableOpacity>
            {!userData.user ? (
                <View style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => menuHandler.setDisplaySignUp(true)} style={{ borderRadius: 5, backgroundColor: 'blue', paddingVertical: 8, paddingHorizontal: 20 }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Ký</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => menuHandler.setDisplaySignIn(true)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', paddingVertical: 8, paddingHorizontal: 20 }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đăng Nhập</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <TouchableOpacity onPress={() => handleLogout()} style={{ width: '100%', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <Icon4 name='logout' style={{ fontSize: 30, color: 'black' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 17 }}>Đăng Xuất</Text>
                    </TouchableOpacity>
                </>
            )}
        </Animated.View>
    );
};

export default MenuArea;
