import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ImageBackground, Pressable, ScrollView, SectionList, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import IconX from 'react-native-vector-icons/Feather';
import CalenderCheck from 'react-native-vector-icons/FontAwesome';
import CuocHen from '../components/appointments/CuocHen';
import PhieuTheoDoi from '../components/appointments/PhieuTheoDoi';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
import { convertDateToDayMonthYearVietNam } from '../utils/date';
import { returnNumber } from '../utils/other';
import { screenContext } from '../contexts/ScreenContext';
import CuocHenTaiNha from '../components/appointments/CuocHenTaiNha';
const TicketScreen = () => {
    const { width, height } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [display, setDisplay] = useState(false)
    const [displayTime, setDisplayTime] = useState(false)
    const [doctorRecord, setDoctorRecord] = useState()
    const [appointments, setAppointments] = useState([])
    const [type, setType] = useState("6");
    const [ticketType, setTicketType] = useState('1')
    const { screenData } = useContext(screenContext)

    const types = {
        '1': 'Hôm Nay',
        '2': 'Ngày Mai',
        '3': 'Tuần Này',
        '4': 'Tháng Này',
        '5': 'Tháng Sau',
        '6': 'Tất Cả',
    }

    const ticketTypes = {
        '1': 'Phiếu Đăng Ký Hẹn Khám',
        '2': 'Phiếu Theo Dõi Sức Khỏe',
        '3': 'Phiếu Hẹn Khám Tại Nhà'
    }

    // Phiếu đăng ký
    return (
        <>
            <ScrollView >
                <View style={{ flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10, minHeight: height }}>
                    {screenData.currentScreen === 10 && (<>
                        <Text style={{ fontSize: 20, fontFamily: 'Nunito-B', color: 'black' }}>Chào Mừng {userData.user?.fullName}</Text>
                        <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', color: 'black' }}>Bắt đầu ngày mới với những cuộc hẹn mới.</Text>
                        {/* toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setDisplay(true)} style={{ gap: 5, backgroundColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 10 }}>
                                <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>{ticketTypes[ticketType]}</Text>
                                <Icon name='chevron-down' style={{ fontSize: 25, color: 'black' }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDisplayTime(true)} style={{ gap: 5, backgroundColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 10 }}>
                                <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>{types[type]}</Text>
                                <Icon name='chevron-down' style={{ fontSize: 25, color: 'black' }} />
                            </TouchableOpacity>
                        </View>
                        {ticketType === '1' ? (
                            <CuocHen type={type} setType={setType} />
                        ) : ticketType === '2' ? (
                            <PhieuTheoDoi type={type} setType={setType} />
                        ) : (
                            <CuocHenTaiNha type={type} setType={setType} />
                        )}
                    </>)}

                </View>
                {display && (
                    <View style={{ width, height, justifyContent: 'center', position: 'absolute', top: 0, left: 0, alignItems: 'center', flexDirection: 'row' }}>
                        <View style={{ width: '80%', position: 'absolute', backgroundColor: 'white', borderRadius: 10, zIndex: 4, paddingHorizontal: 20, paddingVertical: 20 }}>
                            <TouchableOpacity style={{ alignItems: 'flex-end', position: 'absolute', top: 5, right: 5 }} onPress={() => setDisplay(false)}>
                                <IconX name="x" style={{ fontSize: 20 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setTicketType("1"); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Phiếu hẹn khám trực tuyến</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setTicketType("2"); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Phiếu theo dõi sức khỏe</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setTicketType("3"); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Phiếu Hẹn Khám Tại Nhà</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {displayTime && (
                    <View style={{ width, height, justifyContent: 'center', position: 'absolute', top: 0, left: 0, alignItems: 'center', flexDirection: 'row' }}>
                        <View style={{ width: '80%', position: 'absolute', backgroundColor: 'white', borderRadius: 10, top: '20%', zIndex: 4, padding: 20 }}>
                            <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={() => setDisplayTime(false)}>
                                <IconX name="x" style={{ fontSize: 20 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("6"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Tất Cả</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("1"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Hôm nay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("2"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Ngày mai</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("3"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Tuần này</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("4"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Tháng này</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setType("5"), setDisplayTime(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Tháng sau</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {(display || displayTime) && (
                    <Pressable onPress={() => setDisplay(false)} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, backgroundColor: '#00000053', zIndex: 1 }} />
                )}
                {/* )} */}

            </ScrollView>

        </>
    )
}

export default TicketScreen