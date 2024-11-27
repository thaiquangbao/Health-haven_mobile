import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import IconCamera from 'react-native-vector-icons/AntDesign';
import Password from '../components/profile/Password';
import UserInformation from '../components/profile/UserInformation';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { utilsContext } from '../contexts/UtilsContext';
import { api, TypeHTTP } from '../utils/api';
import { convertDateToDayMonthYear } from '../utils/date';
import { notifyType } from '../utils/notify';
import { screenContext } from '../contexts/ScreenContext';
import PaymentDoctor from '../components/profile/PaymentDoctor';
import PaymentPatient from '../components/profile/PaymentPatient';
const ProfileScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData, userHandler } = useContext(userContext)
    const [user, setUser] = useState()
    const [choose, setChoose] = useState(1);
    const [widths, setWidths] = useState({ width1: 0, width2: 0, width3: 0 });
    const indicatorLeft = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;
    const { utilsHandler } = useContext(utilsContext)
    const { screenData } = useContext(screenContext)
    useEffect(() => {
        setUser(userData.user);
    }, [userData.user]);
    useEffect(() => {
        let width = 0;
        let remainWidth = 0;
        if (choose === 1) {
            width = widths.width1;
            remainWidth = 0;
        } else if (choose === 2) {
            width = widths.width2;
            remainWidth = widths.width1 + 16;
        } else if (choose === 3) {
            width = widths.width3;
            remainWidth = widths.width1 + widths.width2 + 32;
        }
        Animated.timing(indicatorLeft, {
            toValue: remainWidth,
            duration: 300,
            useNativeDriver: false,
        }).start();
        Animated.timing(indicatorWidth, {
            toValue: width,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [choose, widths]);
    const handleUpdateUser = () => {

        api({
            type: TypeHTTP.POST,
            body: { ...user },
            path: `/auth/update/${userData.user?.role === "DOCTOR" ? "doctor" : "User"
                }`,
            sendToken: true,
        })
            .then((res) => {

                userHandler.setUser(res);
                utilsHandler.notify(
                    notifyType.SUCCESS,
                    "Cập nhật thông tin thành công !!!"
                );
            })
            .catch((error) => {
                utilsHandler.notify(
                    notifyType.FAIL,
                    error.message
                );
            });
    }
    const uploadImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.cancelled) {
                const file = {
                    base64: result.assets[0].base64,
                    originalname: result.assets[0].fileName,
                    uri: result.assets[0].uri,
                    mimetype: result.assets[0].mimeType,
                    size: result.assets[0].fileSize
                }
                api({ sendToken: false, body: [file], path: '/upload-image/mobile/upload', type: TypeHTTP.POST })
                    .then(listImage => {
                        setUser({ ...user, image: listImage[0] });
                        api({
                            type: TypeHTTP.POST,
                            body: { ...user, image: listImage[0] },
                            path: `/auth/update/${userData.user?.role === "DOCTOR" ? "doctor" : "User"}`,
                            sendToken: true,
                        })
                            .then((res) => {
                                userHandler.setUser(res);
                                utilsHandler.notify(
                                    notifyType.SUCCESS,
                                    "Đăng tải ảnh thành công !!!"
                                );
                            })
                    })
            }
        } catch (error) {
            console.error('Lỗi khi mở thư viện ảnh:', error);
        }
    }
    return (
        <ScrollView style={{ position: 'relative' }}>
            <View style={{ alignItems: 'center', flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                {screenData.currentScreen === 12 && (<>
                    <View style={{ flexDirection: 'row', width: '100%', gap: 5, position: 'relative' }}>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                            {userData.user?.role === 'USER' ? (
                                <Image source={{ uri: userData.user?.image }} style={{ height: 70, width: 70, borderRadius: 35 }} />
                            ) : (
                                <View style={{
                                    height: 70,
                                    width: 70,
                                    borderWidth: 1,
                                    borderColor: '#1dcbb6',
                                    overflow: 'hidden',
                                    borderRadius: 150
                                }}>
                                    <Image
                                        source={{
                                            uri: userData.user?.image
                                        }}
                                        style={{
                                            height: 100,
                                            width: 70,
                                        }}
                                    />
                                </View>
                            )}
                            <TouchableOpacity onPress={() => { uploadImage() }} style={{ right: -10, position: 'absolute', bottom: 0 }}>
                                <IconCamera name='camerao' style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'center', fontSize: 25, color: '#999', bottom: 0 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'start', marginLeft: 10 }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Nunito-B', color: 'black' }}>{userData.user?.fullName}</Text>
                            <Text style={{ fontSize: 15, color: 'black' }}>{userData.user?.phone}</Text>
                        </View>
                        {(choose === 1 || choose === 3) && (
                            <TouchableOpacity onPress={() => handleUpdateUser()} style={{ borderRadius: 10, backgroundColor: '#1dcbb6', height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 80, position: 'absolute', right: 0, top: 20 }}>
                                <Text style={{ color: 'white', fontFamily: 'Nunito-B', fontSize: 14 }}>Cập nhật</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 15, marginTop: 2, width: '100%' }}>
                        <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width1: e.nativeEvent.layout.width })} onPress={() => setChoose(1)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 1 ? 2 : 0, borderColor: choose === 1 ? 'blue' : 'black' }} className="item-1">
                            <Text style={{ fontSize: 16, color: choose === 1 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Thông tin cá nhân</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width2: e.nativeEvent.layout.width })} onPress={() => setChoose(2)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 2 ? 2 : 0, borderColor: choose === 2 ? 'blue' : 'black' }} className="item-2">
                            <Text style={{ fontSize: 16, color: choose === 2 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Bảo mật</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width3: e.nativeEvent.layout.width })} onPress={() => setChoose(3)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 3 ? 2 : 0, borderColor: choose === 3 ? 'blue' : 'black' }} className="item-3">
                            <Text style={{ fontSize: 16, color: choose === 3 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>

                    {choose === 1 ? (
                        <UserInformation user={user} setUser={setUser} />
                    ) : choose === 2 ? (
                        <Password />
                    ) : userData.user?.role === 'DOCTOR' ? (
                        <PaymentDoctor user={user} setUser={setUser} />
                    ) : (
                        <PaymentPatient user={user} setUser={setUser} />
                    )}
                </>)}
            </View>
            {/* )} */}
        </ScrollView>
    )
}

export default ProfileScreen