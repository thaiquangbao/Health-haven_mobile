import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { screenContext } from '../contexts/ScreenContext';
import { api, TypeHTTP } from '../utils/api';
import { utilsContext } from '../contexts/UtilsContext';
import { notifyType } from '../utils/notify';
import { eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns';
import { compareDate1GetterThanDate2, compareDateIsHaveInSchedule, convertDateToDayMonth, convertDateToDayMonthYearObject } from '../utils/date';
import Icon from 'react-native-vector-icons/AntDesign';

const DoctorRecordScreen = () => {
    const { width, height } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler, payloadData } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { screenData } = useContext(screenContext)
    const [doctorRecord, setDoctorRecord] = useState()
    const { utilsHandler } = useContext(utilsContext)
    const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const [days, setDays] = useState([])
    const [currentMonth, setCurrentMonth] = useState({
        month: 0,
        year: 0,
    });
    const [monthStart, setMonthStart] = useState()
    const [monthEnd, setMonthEnd] = useState()
    useEffect(() => {
        const currentDate = new Date();
        setCurrentMonth({
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
        })
    }, [])
    useEffect(() => {
        if (currentMonth.month && currentMonth.year) {
            const { month, year } = currentMonth;
            const date = new Date(year, month - 1); // Chuyển đổi về dạng Date
            setMonthStart(startOfMonth(date))
            setMonthEnd(endOfMonth(date))
        }
    }, [currentMonth])

    useEffect(() => {
        if (monthStart && monthEnd) {
            const formatDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
            if (formatDays[0].toString().includes('Tue'))
                for (let i = 0; i <= 0; i++)
                    formatDays.unshift('')
            else if (formatDays[0].toString().includes('Wed'))
                for (let i = 0; i <= 1; i++)
                    formatDays.unshift('')
            else if (formatDays[0].toString().includes('Thu'))
                for (let i = 0; i <= 2; i++)
                    formatDays.unshift('')
            else if (formatDays[0].toString().includes('Fri'))
                for (let i = 0; i <= 3; i++)
                    formatDays.unshift('')
            else if (formatDays[0].toString().includes('Sat'))
                for (let i = 0; i <= 4; i++)
                    formatDays.unshift('')
            else if (formatDays[0].toString().includes('Sun'))
                for (let i = 0; i <= 5; i++)
                    formatDays.unshift('')
            const remain = formatDays.length % 7
            for (let i = remain; i < 7; i++) {
                formatDays.push('')
            }
            setDays(formatDays)
        }
    }, [monthStart, monthEnd])

    useEffect(() => {
        setDoctorRecord(payloadData.doctorRecord)
    }, [payloadData.doctorRecord])

    useEffect(() => {
        if (userData.user) {
            api({ path: `/doctorRecords/getById/${userData.user._id}`, type: TypeHTTP.GET, sendToken: false })
                .then(record => {
                    payloadHandler.setDoctorRecord(record)
                })
        }
    }, [userData.user])

    const handleUpdateRecord = () => {
        const body = {
            ...doctorRecord, doctor: doctorRecord.doctor.id
        }
        api({ type: TypeHTTP.POST, path: '/doctorRecords/update', sendToken: false, body })
            .then(res => {
                utilsHandler.notify(notifyType.SUCCESS, "Cập Nhật Thông Tin Thành Công")
                setDoctorRecord({ ...res, doctor: doctorRecord.doctor })
            })
    }

    const handleOpenSchedule = (day) => {
        menuHandler.setDisplaySchedule(true)
        payloadHandler.setDay(day)
    }

    const handleNextMonth = () => {
        setCurrentMonth((prev) => {
            let nextMonth = prev.month + 1;
            let nextYear = prev.year;
            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear += 1;
            }
            return { month: nextMonth, year: nextYear };
        });
    }

    const handlePrevMonth = () => {
        setCurrentMonth((prev) => {
            let prevMonth = prev.month - 1;
            let prevYear = prev.year;

            if (prevMonth < 1) {
                prevMonth = 12;
                prevYear -= 1;
            }

            return { month: prevMonth, year: prevYear };
        });
    };

    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 15, minHeight: height, paddingHorizontal: 20, paddingVertical: 10 }}>
                {(screenData.currentScreen === 14 && doctorRecord) && (<>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '60%' }}>
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
                                        uri: doctorRecord.doctor?.image
                                    }}
                                    style={{
                                        height: 100,
                                        width: 70,
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'column', gap: 5 }}>
                                <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>{doctorRecord.doctor?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, backgroundColor: '#eeeeee', textAlign: 'center', paddingVertical: 5, borderRadius: 5 }}>{doctorRecord.doctor?.specialize}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Nunito-S' }}>Gọi Khám: {doctorRecord?.examination_call}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Nunito-S' }}>Đánh Giá: {doctorRecord?.assessment}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>Lịch Khám Bệnh (Tháng {currentMonth.month}/{currentMonth.year})</Text>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => handlePrevMonth()}>
                            <Icon name='arrowleft' style={{ fontSize: 25, color: '#999' }} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10, width: '90%', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {daysName.map((day, index) => (
                                <View key={index} style={{ width: '11%', height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 16 }}>{day}</Text>
                                </View>
                            ))}
                            {days.map((day, index) => (
                                <View style={{ width: '10%', height: 33 }} key={index}>
                                    {(day + '') !== '' && (
                                        <>
                                            {compareDate1GetterThanDate2(convertDateToDayMonthYearObject(day + ''), convertDateToDayMonthYearObject(new Date().toISOString())) ? (
                                                <TouchableOpacity style={{ height: '100%', width: '100%', flexDirection: 'column', borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) === 0 ? '#f2f3f4' : '#d1f2eb' }} onPress={() => { userData.user?.email === null ? utilsHandler.notify(notifyType.WARNING, "Bác sĩ hãy cập nhật địa chỉ email trước khi đăng ký lịch khám !!!") : handleOpenSchedule(convertDateToDayMonthYearObject(day + '')) }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 12 }}>{convertDateToDayMonth(day + '').split('/')[0]}</Text>
                                                    {compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) !== 0 && (
                                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 12 }}>{`(${compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules)})`}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={{ backgroundColor: '#d7dbdd', height: '100%', width: '100%', borderRadius: 5, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 12 }}>{convertDateToDayMonth(day + '').split('/')[0]}</Text>
                                                    {compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) !== 0 && (
                                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 12 }}>{`(${compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules)})`}</Text>
                                                    )}
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={() => handleNextMonth()}>
                            <Icon name='arrowright' style={{ fontSize: 25, color: '#999' }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>Thông Tin Chi Tiết</Text>
                    <TextInput value={doctorRecord?.area} onChangeText={e => setDoctorRecord({ ...doctorRecord, area: e })} placeholder='Nơi làm việc' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={doctorRecord?.certificate + ''} onChangeText={e => setDoctorRecord({ ...doctorRecord, certificate: [e] })} placeholder='Bằng Cấp' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={doctorRecord?.language + ''} onChangeText={e => setDoctorRecord({ ...doctorRecord, language: [e] })} placeholder='Ngôn ngữ' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={doctorRecord?.trainingPlace} onChangeText={e => setDoctorRecord({ ...doctorRecord, trainingPlace: e })} placeholder='Nơi đào tạo' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                    <TextInput value={doctorRecord?.description} onChangeText={e => setDoctorRecord({ ...doctorRecord, description: e })} multiline={true} textAlignVertical="top" numberOfLines={4} placeholder='Mô Tả Thêm' style={{ color: 'black', height: 108, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>Kinh Nghiệm Làm Việc</Text>
                    <TextInput value={doctorRecord?.experience_work} onChangeText={e => setDoctorRecord({ ...doctorRecord, experience_work: e })} multiline={true} textAlignVertical="top" numberOfLines={15} placeholder='Mô Tả Thêm' style={{ color: 'black', height: 250, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    <TouchableOpacity onPress={() => handleUpdateRecord()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Cập Nhật Hồ Sơ</Text>
                    </TouchableOpacity>
                </>)}
            </View>
        </ScrollView>
    )
}

export default DoctorRecordScreen