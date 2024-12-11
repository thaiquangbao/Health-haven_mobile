import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { screenContext } from '../contexts/ScreenContext';
import { api, TypeHTTP } from '../utils/api';
import { convertDateToDayMonthYearVietNam, sortByAppointmentDate } from '../utils/date';
import { color, status } from './AppointmentsScreen';
import { utilsContext } from '../contexts/UtilsContext';
import { notifyType } from '../utils/notify';

const AppointmentHomesScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { screenData } = useContext(screenContext)
    const [appointmentHomes, setAppointmentHomes] = useState([])
    const [doctorRecords, setDoctorRecords] = useState([])
    const { utilsHandler } = useContext(utilsContext)
    useEffect(() => {
        if (userData.user) {
            api({
                type: TypeHTTP.GET,
                path: `/appointmentHomes/findByPatient/${userData.user._id}`,
                sendToken: true,
            }).then((logBooks) => {
                setAppointmentHomes(logBooks.reverse());
            });
            api({
                type: TypeHTTP.GET,
                path: "/doctorRecords/getAll",
                sendToken: false,
            }).then((res) => {
                setDoctorRecords(res);
            });
        }
    }, [userData.user]);

    const handleCancelAppointmentHome = (appointment) => {
        const body = {
            _id: appointment._id,

            status: {
                status_type: "CANCELED",
                message: "Bệnh nhân đã hủy cuộc hẹn",
            },
            note: ''
        }
        api({ sendToken: true, path: '/appointmentHomes/patient-cancel', type: TypeHTTP.POST, body: body })
            .then(res => {
                setAppointmentHomes(prev => prev.map(item => {
                    if (item._id === res._id) {
                        return res
                    }
                    return item
                }))
                utilsHandler.notify(notifyType.SUCCESS, 'Đã hủy cuộc hẹn')
            })
    }

    return (
        <ScrollView>
            {screenData.currentScreen === 17 && (<View style={{ flexDirection: 'column', alignItems: 'flex-start', paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 20, fontFamily: 'Nunito-B', width: '100%' }}>Chào {userData.user?.fullName}</Text>
                <Text style={{ fontFamily: 'Nunito-R', width: '70%' }}>Đăng ký khám sức khỏe tại nhà với các bác sĩ để nhận được lời khuyên tốt nhất.</Text>
                <View style={{ flexDirection: 'column', width: '70%', marginTop: 10, gap: 10 }}>
                    {appointmentHomes.map((home, index) => (
                        <TouchableOpacity onPress={() => {
                            menuHandler.setDisplayDetailAppointmentHome(true)
                            payloadHandler.setAppointmentHome(home)
                        }} key={index} style={{ flexDirection: 'row', gap: 10, backgroundColor: '#f8f9f9', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'flex-start', borderRadius: 8 }}>
                            <View style={{
                                height: 60,
                                width: 60,
                                borderWidth: 1,
                                borderColor: '#1dcbb6',
                                overflow: 'hidden',
                                borderRadius: 150
                            }}>
                                <Image
                                    source={{
                                        uri: home.doctor.image
                                    }}
                                    style={{
                                        height: 90,
                                        width: 60,
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'column', gap: 3 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 600 }}>Bác sĩ:</Text>
                                    <Text style={{ fontSize: 16 }}>{home.doctor.fullName}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    {/* <Text style={{ fontSize: 15, fontWeight: 600 }}>Thời gian:</Text> */}
                                    <Text style={{ fontSize: 15 }}>{['ACCEPTED', 'COMPLETED'].includes(home.status?.status_type) ? `${convertDateToDayMonthYearVietNam(
                                        home.appointment_date
                                    )}` : 'Chưa rõ thời gian'}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    {/* <Text style={{ fontSize: 16, fontWeight: 600 }}>Trạng thái:</Text> */}
                                    <Text style={{
                                        fontSize: 16, color:
                                            home.status?.status_type === "QUEUE"
                                                ? "black"
                                                : home.status?.status_type ===
                                                    "ACCEPTED"
                                                    ? "green"
                                                    : home?.status.status_type === "COMPLETED" ? 'blue' : "red",
                                    }}>{home.status?.message}</Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    width: '60%'
                                }}>{home.note}</Text>
                                {userData.user.role === 'USER' ?
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        {home.status?.status_type === "QUEUE" && (
                                            <>
                                                <TouchableOpacity onPress={() => handleCancelAppointmentHome(home)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Hủy</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                    :
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        {home.status?.status_type === "QUEUE" && (
                                            <>
                                                <TouchableOpacity onPress={() => {
                                                    payloadHandler.setAppointmentHome(home)
                                                    menuHandler.setDisplayScheduleAppoimentHome(true)
                                                }} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Chấp nhận</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleRejectAppointmentHome(home)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Từ chối</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                }
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>)
            }
        </ScrollView >
    )
}

export default AppointmentHomesScreen