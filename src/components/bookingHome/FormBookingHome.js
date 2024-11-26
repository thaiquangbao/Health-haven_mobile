import React, { useContext, useEffect, useState } from 'react'
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        Animated.timing(translateX, {
            toValue: menuData.displayBookingHome === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayBookingHome]);

    const handleCreateAppointment = () => {
        if (userData.user) {
            axios.get(`https://photon.komoot.io/api?q=${userData.user.address.replaceAll(',', '-')}`)
                .then(res => {
                    const lon = res.data.features[0].geometry.coordinates[0]
                    const lat = res.data.features[0].geometry.coordinates[1]
                    const address = userData.user.address + '(' + lon + '-' + lat + ')'
                    const body = {
                        doctor_record_id: payloadData.doctorRecord._id,
                        patient: userData.user ? userData.user._id : null,
                        appointment_date: { day: 0, month: 0, year: 0, time: '' },
                        address,
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
            <View style={{ width: '100%', justifyContent: 'center', gap: 5, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 20, height }}>
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
                <TouchableOpacity onPress={() => handleCreateAppointment()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Đặt Khám</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

export default FormBookingHome