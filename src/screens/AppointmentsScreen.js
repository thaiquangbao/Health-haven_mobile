import React, { useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
import { compare2Date, compareTimeDate1GreaterThanDate2, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam, isALargerWithin10Minutes, isALargerWithin60Minutes, sortByAppointmentDate } from '../utils/date';
import { screenContext } from '../contexts/ScreenContext';

export const status = {
    'CANCELED': 'Đã Hủy',
    'ACCEPTED': 'Chấp Nhận',
    'REJECTED': 'Từ Chối',
    'COMPLETED': 'Hoàn Thành',
    'QUEUE': 'Đang Chờ'
}

export const color = {
    'CANCELED': 'red',
    'ACCEPTED': 'green',
    'REJECTED': 'red',
    'COMPLETED': 'blue',
    'QUEUE': 'black'
}

const AppointmentScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [doctorRecords, setDoctorRecords] = useState([])
    const [appointments, setAppointments] = useState([])
    const tableHead = ['Bác Sĩ', 'Trạng Thái', 'Thời Gian'];
    const [tableData, setTableData] = useState([])
    const [time, setTime] = useState(new Date().getHours() + ':' + new Date().getMinutes())
    const [displayConnect, setDisplayConnect] = useState()
    const intervalRef = useRef()
    const { screenData } = useContext(screenContext)

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTime(new Date().getHours() + ':' + new Date().getMinutes())
        }, 60000);
    }, [])

    useEffect(() => {
        if (appointments.length > 0) {  /* sửa ở đây */
            sortByAppointmentDate(appointments.filter((item) => item.status === "ACCEPTED")).forEach((item) => {
                if (compare2Date(convertDateToDayMonthYearTimeObject(new Date().toISOString()), item.appointment_date)) {
                    if (isALargerWithin10Minutes(item.appointment_date.time, time) || isALargerWithin60Minutes(time, item.appointment_date.time)) {
                        setDisplayConnect(item._id);
                    }
                }
            })
        }
    }, [appointments, time]);

    useEffect(() => {
        if (userData.user) {
            api({ type: TypeHTTP.GET, path: '/appointments/getAll', sendToken: false })
                .then(res => {
                    setAppointments(res.filter(item => item.patient._id === userData.user._id).reverse())
                })
            api({ type: TypeHTTP.GET, path: '/doctorRecords/getAll', sendToken: false })
                .then(res => {
                    setDoctorRecords(res)
                })
        }
    }, [userData.user])



    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, paddingHorizontal: 10, paddingVertical: 10 }}>
                {screenData.currentScreen === 6 && (<>
                    <Text style={{ fontSize: 20, fontFamily: 'Nunito-B' }}>Chào {userData.user?.fullName}</Text>
                    <Text style={{ fontFamily: 'Nunito-R' }}>Tư vấn với các bác sĩ để nhận lời khuyên tốt nhất</Text>
                    <ScrollView style={{ flexDirection: 'column' }}>
                        {appointments.map((appointment, index) => (
                            <TouchableOpacity onPress={() => {
                                payloadHandler.setDetailAppointment(appointment)
                                payloadHandler.setDisplayConnect(displayConnect)
                                menuHandler.setDisplayDetailAppointment(true)
                            }} key={index} style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 5, backgroundColor: '#f8f9f9', padding: 5, borderRadius: 5 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <View style={{
                                        height: 60,
                                        width: 60,
                                        borderWidth: 1,
                                        borderColor: '#1dcbb6',
                                        overflow: 'hidden',
                                        borderRadius: 150
                                    }}>
                                        <Image
                                            source={{ uri: doctorRecords.filter(item => item._id === appointment.doctor_record_id)[0]?.doctor?.image }}
                                            style={{
                                                height: 90,
                                                width: 60,
                                            }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'column', gap: 2 }}>
                                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16 }}> BS. {doctorRecords.filter(item => item._id === appointment.doctor_record_id)[0]?.doctor?.fullName}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{`${convertDateToDayMonthYearVietNam(appointment.appointment_date)}`}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, color: color[appointment.status] }}>{status[appointment.status]}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}></Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>)}
            </View>
            {/* )} */}
        </ScrollView >
    )
}

export default AppointmentScreen