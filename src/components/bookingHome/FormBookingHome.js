import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';
import { payloadContext } from '../../contexts/PayloadContext';
import WebView from 'react-native-webview';

const FormBookingHome = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width, height } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayBookingHome === true ? 0 : width));
    const [equipments, setEquipments] = useState({
        thermometer: false,
        bloodPressureMonitor: false,
        heartRateMonitor: false,
        bloodGlucoseMonitor: false
    })
    const { payloadData } = useContext(payloadContext)
    const { utilsHandler } = useContext(utilsContext)
    const { userData } = useContext(userContext)
    const [note, setNote] = useState('')
    const [currentStep, setCurrentStep] = useState(0)
    const scrollViewRef = useRef(null);
    const [address, setAddress] = useState('')
    const [location, setLocation] = useState()

    const reset = () => {
        setEquipments({
            thermometer: false,
            bloodPressureMonitor: false,
            heartRateMonitor: false,
            bloodGlucoseMonitor: false
        })
        setNote('')
    }

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: currentStep * width, animated: true });
        }
    }, [currentStep])

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayBookingHome === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayBookingHome]);

    const handleSubmitLocation = () => {
        axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=WtdxK69dyg08YMxtcak_FJtsg7Hdp1PzcKcxFLIQlCA`)
            .then(res => {
                if (res.data.items.length > 0) {
                    setLocation({
                        lon: res.data.items[0].position.lng,
                        lat: res.data.items[0].position.lat
                    })
                } else {
                    utilsHandler.notify(notifyType.FAIL, "Không tìm thấy vị trí trên bản đồ")
                }
            })
    }

    const handleCreateAppointment = () => {
        if (userData.user) {
            const address1 = address + '(' + location.lon + '-' + location.lat + ')'
            const body = {
                doctor_record_id: payloadData.doctorRecord._id,
                patient: userData.user ? userData.user._id : null,
                appointment_date: { day: 0, month: 0, year: 0, time: '' },
                address: address1,
                status: {
                    status_type: 'QUEUE',
                    message: 'Đang chờ bác sĩ xác nhận'
                },
                note,
                price_list: payloadData.priceList._id,
                equipment: equipments
            }
            api({ sendToken: true, type: TypeHTTP.POST, body, path: '/appointmentHomes/save' })
                .then(res => {
                    utilsHandler.notify(notifyType.SUCCESS, "Đặt Khám Thành Công! Đang chờ bác sĩ xác nhận")
                    reset()
                    menuHandler.setDisplayBookingHome(false)
                })
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
                <TouchableOpacity onPress={() => menuHandler.setDisplayBookingHome(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView ref={scrollViewRef} horizontal scrollEnabled={false} style={{ flexDirection: 'row' }}>
                <View style={{ width, justifyContent: 'center', gap: 5, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 20, height }}>
                    <Text style={{ fontSize: 20, fontWeight: 600, width: '100%', marginBottom: 10 }}>Đặt Khám Tại Nhà</Text>

                    <View style={{ paddingHorizontal: 10, borderRadius: 10, paddingVertical: 10, backgroundColor: '#33007d', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Icon1 name='check' style={{ fontSize: 20, color: 'white' }} />
                            <Text style={{ color: 'white' }}>Bạn đã có nhiệt kế tại nhà?</Text>
                        </View>
                        <TouchableOpacity onPress={() => setEquipments({ ...equipments, thermometer: !equipments.thermometer })} style={{ height: 30, width: 30, borderRadius: 40, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {equipments.thermometer && (
                                <Icon1 name='check' style={{ fontSize: 20, color: 'black' }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 10, borderRadius: 10, paddingVertical: 10, backgroundColor: '#533094', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Icon1 name='check' style={{ fontSize: 20, color: 'white' }} />
                            <Text style={{ color: 'white' }}>Bạn đã có máy đo nhịp tim tại nhà?</Text>
                        </View>
                        <TouchableOpacity onPress={() => setEquipments({ ...equipments, bloodPressureMonitor: !equipments.bloodPressureMonitor })} style={{ height: 30, width: 30, borderRadius: 40, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {equipments.bloodPressureMonitor && (
                                <Icon1 name='check' style={{ fontSize: 20, color: 'black' }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 10, borderRadius: 10, paddingVertical: 10, backgroundColor: '#33007d', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Icon1 name='check' style={{ fontSize: 20, color: 'white' }} />
                            <Text style={{ color: 'white' }}>Bạn đã có máy đo huyết áp tại nhà?</Text>
                        </View>
                        <TouchableOpacity onPress={() => setEquipments({ ...equipments, heartRateMonitor: !equipments.heartRateMonitor })} style={{ height: 30, width: 30, borderRadius: 40, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {equipments.heartRateMonitor && (
                                <Icon1 name='check' style={{ fontSize: 20, color: 'black' }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 10, borderRadius: 10, paddingVertical: 10, backgroundColor: '#533094', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Icon1 name='check' style={{ fontSize: 20, color: 'white' }} />
                            <Text style={{ color: 'white' }}>
                                Bạn đã có máy đo đường huyết tại nhà</Text>
                        </View>
                        <TouchableOpacity onPress={() => setEquipments({ ...equipments, bloodGlucoseMonitor: !equipments.bloodGlucoseMonitor })} style={{ height: 30, width: 30, borderRadius: 40, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {equipments.bloodGlucoseMonitor && (
                                <Icon1 name='check' style={{ fontSize: 20, color: 'black' }} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput value={note} onChangeText={e => setNote(e)} multiline={true} textAlignVertical="top" numberOfLines={15} placeholder='Lời nhắn với bác sĩ...' style={{ color: 'black', height: 150, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đặt Khám</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width, flexDirection: 'column', paddingHorizontal: 20, paddingVertical: 30 }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <TouchableOpacity>
                            <Icon1 name='arrowleft' style={{ fontSize: 30 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontFamily: 'Nunito-S' }}>Trở về</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontFamily: 'Nunito-S', marginTop: 10 }}>Vị trí của bạn</Text>
                    <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', marginTop: 5 }}>Hãy cung cấp chi tiết về thông tin địa chỉ của bạn để bác sĩ có thể tìm kiếm một cách dễ dàng</Text>
                    <TextInput value={address} onChangeText={e => setAddress(e)} multiline={true} textAlignVertical="top" numberOfLines={15} placeholder='Vị trí của bạn' style={{ marginTop: 10, color: 'black', height: 150, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    {location && (
                        <WebView source={{ uri: `https://health-haven-iuh.vercel.app/location/${location.lon}-${location.lat}` }} javaScriptEnabled={true} style={{ width: '100%', height: 300, marginTop: 10 }} />
                    )}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {location && (
                            <TouchableOpacity onPress={() => handleCreateAppointment()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 130 }}>
                                <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đặt Khám</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleSubmitLocation()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 130 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Xác nhận vị trí</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    )
}

export default FormBookingHome