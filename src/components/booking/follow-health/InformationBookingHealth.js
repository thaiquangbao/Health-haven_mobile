import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../../contexts/MenuContext';
import { payloadContext } from '../../../contexts/PayloadContext';
import { userContext } from '../../../contexts/UserContext';
import { convertDateToDayMonthYear } from '../../../utils/date';
import { formatMoney } from '../../../utils/other';
import Icon2 from 'react-native-vector-icons/Entypo';

import * as ImagePicker from 'expo-image-picker';
import ChoosePayment from '../ChoosePaymentHealth';
import Complete from '../CompleteHealth';

const InformationBookingHealth = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayInformationBookingHealth === true ? 0 : width));
    const scrollViewRef = useRef(null);
    const [step, setStep] = useState(0)

    //data
    const { userData } = useContext(userContext)
    const { payloadData, payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        setStep(0)
    }, [menuData.displayInformationBookingHealth])

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayInformationBookingHealth === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayInformationBookingHealth]);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: step * width, animated: true });
        }
    }, [step])

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
                <TouchableOpacity onPress={() => menuHandler.setDisplayInformationBookingHealth(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                scrollEnabled={false}
                style={{ flexDirection: 'row' }}>
                {payloadData.bookingHealth && (<>
                    <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 60 }}>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Thông Tin Đặt Khám</Text>
                        <View style={{ flexDirection: 'row', gap: 15, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                            <Image source={{ uri: userData.user?.image }} style={{ height: 55, width: 55, borderRadius: 55 }} />
                            <View style={{ flexDirection: 'column', gap: 1 }}>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Bệnh Nhân</Text>
                                <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{userData.user?.fullName}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                            <View style={{ alignItems: 'start', flexDirection: 'row', gap: 15, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                                <View style={{
                                    height: 55,
                                    width: 55,
                                    borderWidth: 1,
                                    borderColor: '#1dcbb6',
                                    overflow: 'hidden',
                                    borderRadius: 150
                                }}>
                                    <Image
                                        source={{ uri: payloadData.doctorRecord?.doctor?.image }}
                                        style={{
                                            height: 75,
                                            width: 55,
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, width: '65%' }}>Dịch Vụ Theo Dõi Sức Khỏe với bác sĩ {payloadData.doctorRecord?.doctor.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{payloadData.doctorRecord?.doctor.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 13, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#e0eff6', borderRadius: 5, marginVertical: 2 }}>{payloadData.doctorRecord?.doctor.specialize}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>{formatMoney(payloadData.bookingHealth.priceList.price)} đ/{payloadData.bookingHealth.priceList.type}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setStep(1)} style={{ borderRadius: 5, marginTop: 10, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Bước Tiếp Theo</Text>
                        </TouchableOpacity>
                    </View>
                    <ChoosePayment setStep={setStep} />
                    <Complete />
                </>)}
            </ScrollView>
        </Animated.View>
    )
}

export default InformationBookingHealth