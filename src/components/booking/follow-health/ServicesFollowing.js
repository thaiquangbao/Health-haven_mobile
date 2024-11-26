import React, { useContext, useEffect, useState } from 'react'
import { Animated, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../../contexts/MenuContext';
import { userContext } from '../../../contexts/UserContext';
import BG from '../../../../assets/bg.png'
import { formatMoney } from '../../../utils/other';
import { payloadContext } from '../../../contexts/PayloadContext';
import { convertDateToDayMonthYearTimeObject } from '../../../utils/date';

const ServicesFollowing = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width, height } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayServicesFollowing === true ? 0 : width));
    const [serviceIndex, setServiceIndex] = useState(0)
    const { userData } = useContext(userContext)
    const [doctorRecord, setDoctorRecord] = useState()
    const { payloadHandler, payloadData } = useContext(payloadContext)

    useEffect(() => {
        setServiceIndex(0)
    }, [menuData.displayServicesFollowing])

    useEffect(() => {
        setDoctorRecord(payloadData.doctorRecord)
    }, [payloadData])

    const priceLists = [
        {
            type: '3 Tháng',
            price: 1350000
        },
        {
            type: '6 Tháng',
            price: 2300000
        },
        {
            type: '12 Tháng',
            price: 4000000
        }
    ]

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayServicesFollowing === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayServicesFollowing]);

    const handleSignUpService = () => {
        if (doctorRecord && userData?.user?.role === 'USER' && serviceIndex !== 0) {
            const body = {
                doctor: {
                    fullName: doctorRecord.doctor.fullName,
                    phone: doctorRecord.doctor.phone,
                    image: doctorRecord.doctor.image,
                    _id: doctorRecord.doctor._id,
                    specialize: doctorRecord.doctor.specialize,
                    email: doctorRecord.doctor.email
                },
                patient: {
                    fullName: userData.user.fullName,
                    phone: userData.user.phone,
                    image: userData.user.image,
                    _id: userData.user._id,
                    dateOfBirth: userData.user.dateOfBirth,
                    sex: userData.user.sex,
                    email: userData.user.email
                },
                priceList: priceLists[serviceIndex - 1],
                status: {
                    status_type: 'QUEUE',
                    message: 'Đang chờ bác sĩ xác nhận'
                },
                date: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                disMon: [],
                reExaminationDates: []
            }
            payloadHandler.setBookingHealth(body)
            menuHandler.setDisplayServicesFollowing(false)
            menuHandler.setDisplayInformationBookingHealth(true)
        }
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
            <View style={{ position: 'absolute', right: 15, top: 30, zIndex: 1 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplayServicesFollowing(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ImageBackground source={BG} style={{ width, height, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 60 }}>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {priceLists.map((item, index) => (
                        <TouchableOpacity onPress={() => setServiceIndex(index + 1)} key={index} style={{
                            height: 100, width: '48%', backgroundColor: serviceIndex - 1 === index ? '#530193' : 'white', borderRadius: 10, shadowColor: 'black', // Màu của bóng
                            shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                            shadowOpacity: 0.3, // Độ mờ của bóng
                            shadowRadius: 10, // Bán kính làm mờ của bóng
                            elevation: 8,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 5
                        }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Nunito-B', color: serviceIndex - 1 === index ? 'white' : '#530193' }}>{item.type}</Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Nunito-B', backgroundColor: serviceIndex - 1 === index ? 'rgb(241, 119, 128)' : '#530193', color: 'white', paddingHorizontal: 15, paddingVertical: 7, borderRadius: 20 }}>{formatMoney(item.price)} VNĐ</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity onPress={() => handleSignUpService()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', paddingVertical: 12, paddingHorizontal: 20, marginTop: 10 }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B', fontSize: 16 }}>Đăng Ký Theo Dõi Sức Khỏe</Text>
                </TouchableOpacity>
            </ImageBackground>
        </Animated.View >
    )
}

export default ServicesFollowing