import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns';
import { compare2Date, compareDate1GetterThanDate2, compareDateIsHaveInSchedule, convertDateToDayMonth, convertDateToDayMonthYearObject, formatVietnameseDate, generateTimes } from '../../utils/date';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { notifyType } from '../../utils/notify';
import { payloadContext } from '../../contexts/PayloadContext';
import { utilsContext } from '../../contexts/UtilsContext';

const FormSchedule = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayScheduleAppoimentHome === true ? 0 : width));
    const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const [days, setDays] = useState([])
    const [doctorRecord, setDoctorRecord] = useState()
    const { userData } = useContext(userContext)
    const wrapperRef = useRef()
    const [currentDay, setCurrentDay] = useState()
    let times = generateTimes('08:00', '20:00', 60);
    const [timeTarget, setTimeTarget] = useState()
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { utilsHandler } = useContext(utilsContext)
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

    const checkSchedule = (time) => {
        for (let i = 0; i < doctorRecord?.schedules.length; i++) {
            const scheduleItem = doctorRecord?.schedules[i]
            const date = scheduleItem.date
            if (date.month === currentDay?.month && date.year === currentDay?.year && date.day === currentDay?.day) {
                for (let j = 0; j < scheduleItem.times.length; j++) {
                    const timeItem = scheduleItem.times[j]
                    if (timeItem.time === time) {
                        if (timeItem.status !== '') {
                            if (timeItem.status === 'home') {
                                return 4
                            }
                            else if (timeItem.status === 'health') {
                                return 3
                            } else {
                                return 2
                            }
                        } else
                            return 1
                    }
                }
            }
        }
        return 0
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

    useEffect(() => {
        if (userData.user) {
            api({
                type: TypeHTTP.GET,
                path: `/doctorRecords/getById/${userData.user?._id}`,
                sendToken: false,
            }).then((res) => {
                setDoctorRecord(res);
            })
        }
    }, [userData])

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayScheduleAppoimentHome === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayScheduleAppoimentHome]);

    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ x: (currentDay ? 1 : 0) * width, animated: true });
        }
    }, [currentDay])


    const handleSubmit = () => {
        if (timeTarget) {
            // set Time limit
            const currentDate1 = new Date();
            const vietnamTimeOffset = 7 * 60; // GMT+7 in minutes
            const localTimeOffset = currentDate1.getTimezoneOffset(); // Local timezone offset in minutes
            const vietnamTime = new Date(currentDate1.getTime() + (vietnamTimeOffset + localTimeOffset) * 60000);
            const timeLimit = {
                day: vietnamTime.getDate(),
                month: vietnamTime.getMonth() + 1,
                year: vietnamTime.getFullYear(),
                time: `${vietnamTime.getHours() + 2}:${vietnamTime.getMinutes()}`
            }
            // data là AppointmentHome á nha
            const body = {
                ...payloadData.appointmentHome,
                appointment_date: {
                    day: currentDay.day,
                    month: currentDay.month,
                    year: currentDay.year,
                    time: timeTarget
                },
                timeLimit: timeLimit,
                processAppointment: 1,
                status: {
                    status_type: "ACCEPTED",
                    message: "Chờ bệnh nhân thanh toán"
                }
            }
            api({ path: '/appointmentHomes/doctor-accept', body, sendToken: true, type: TypeHTTP.POST })
                .then((res => {
                    payloadHandler.setAppointmentHomes(prev => prev.map(item => {
                        if (item._id === res._id) {
                            return res
                        }
                        return item
                    }))

                    // handleTime Of DoctorRecord
                    let currentDay1 = {
                        day: currentDay.day,
                        month: currentDay.month,
                        year: currentDay.year,
                        time: timeTarget
                    }
                    let record = JSON.parse(JSON.stringify(doctorRecord))
                    let bodyUpdate = {}
                    const schedule = record.schedules.filter(item => (item.date.month === currentDay1.month && item.date.day === currentDay1.day && item.date.year === currentDay1.year))[0]
                    if (schedule) {
                        bodyUpdate = {
                            ...record, schedules: record.schedules.map(item => {
                                if (item.date.month === currentDay1.month && item.date.day === currentDay1.day && item.date.year === currentDay1.year) {
                                    item.times.push({
                                        time: timeTarget,
                                        status: 'home',
                                        price: 0
                                    })
                                }
                                return item
                            })
                        }
                    } else {
                        bodyUpdate = {
                            ...record, schedules: [
                                ...record.schedules,
                                {
                                    date: currentDay,
                                    times: [
                                        {
                                            time: timeTarget,
                                            status: 'home',
                                            price: 0
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                    api({
                        type: TypeHTTP.POST, path: '/doctorRecords/update', body: bodyUpdate, sendToken: false
                    })
                        .then(res => {
                            setDoctorRecord(res)
                            setCurrentDay()
                            menuHandler.setDisplayScheduleAppoimentHome(false)
                            utilsHandler.notify(notifyType.SUCCESS, 'Đã Xác Nhận Lịch Hẹn')
                        })
                }))

            // khi then() xong thì nhớ hidden() nha (có hàm sẳn rồi)

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
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplayScheduleAppoimentHome(false)
                    setCurrentDay()
                }}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView scrollEnabled={false} ref={wrapperRef} horizontal style={{ width: '100%', flexDirection: 'row', paddingTop: 30 }}>
                <View style={{ width: width, flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: 600, width: '100%', paddingHorizontal: 20 }}>Lịch Khám Bệnh (Tháng {currentMonth.month}/{currentMonth.year})</Text>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => handlePrevMonth()}>
                            <Icon2 name='arrowleft' style={{ fontSize: 25, color: '#999' }} />
                        </TouchableOpacity>
                        <View style={{ width: '85%', flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {daysName.map((day, index) => (
                                <View key={index} style={{ width: '11%', height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 16 }}>{day}</Text>
                                </View>
                            ))}
                            {days.map((day, index) => (
                                <View style={{ width: '11%', height: 35 }} key={index}>
                                    {(day + '') !== '' && (
                                        <>
                                            {compareDate1GetterThanDate2(convertDateToDayMonthYearObject(day + ''), convertDateToDayMonthYearObject(new Date().toISOString())) ? (
                                                <TouchableOpacity style={{ height: '100%', width: '100%', flexDirection: 'column', borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) === 0 ? '#f2f3f4' : '#d1f2eb' }} onPress={() => { userData.user?.email === null ? utilsHandler.notify(notifyType.WARNING, "Bác sĩ hãy cập nhật địa chỉ email trước khi đăng ký lịch khám !!!") : setCurrentDay(convertDateToDayMonthYearObject(day + '')) }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}>{convertDateToDayMonth(day + '').split('/')[0]}</Text>
                                                    {compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) !== 0 && (
                                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}>{`(${compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules)})`}</Text>
                                                    )}
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={{ backgroundColor: '#d7dbdd', height: '100%', width: '100%', borderRadius: 5, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}>{convertDateToDayMonth(day + '').split('/')[0]}</Text>
                                                    {compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules) !== 0 && (
                                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}>{`(${compareDateIsHaveInSchedule(convertDateToDayMonthYearObject(day + ''), doctorRecord?.schedules)})`}</Text>
                                                    )}
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={() => handleNextMonth()}>
                            <Icon2 name='arrowright' style={{ fontSize: 25, color: '#999' }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ width: width, flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                    {currentDay && (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10, paddingHorizontal: 10 }}>
                                <TouchableOpacity onPress={() => setCurrentDay()}>
                                    <Icon1 name='arrow-back-ios-new' style={{ fontSize: 25, color: 'black' }} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 18, fontWeight: 600, width: '100%' }}>{formatVietnameseDate(currentDay)}</Text>
                            </View>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 16, width: '100%', paddingHorizontal: 20 }}>Giờ Hẹn</Text>
                            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingHorizontal: 20, width: '100%' }}>
                                {times.map((time, index) => {
                                    if (compare2Date(convertDateToDayMonthYearObject(new Date().toISOString()), currentDay)) {
                                        if (new Date(new Date().getTime() + 120 * 60000).getHours() >= Number(time.split(':')[0])) {
                                            // return <div key={index} className={`px-4 flex item-center justify-center py-2 transition-all border-[1px] border-[#999] text-[13px] font-medium bg-[#b7b7b7] rounded-md`}>{time}</div>
                                        } else {
                                            if (checkSchedule(time) === 0) {
                                                return <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: timeTarget === time ? '#dfdfdf' : '#f2f3f4' }}>
                                                    <TouchableOpacity onPress={() => {
                                                        setTimeTarget(time)
                                                    }} key={index}>
                                                        <Text>{time}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        }
                                    } else {
                                        if (checkSchedule(time) === 0) {
                                            return <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: timeTarget === time ? '#dfdfdf' : '#f2f3f4' }}>
                                                <TouchableOpacity onPress={() => {
                                                    setTimeTarget(time)
                                                }} key={index}>
                                                    <Text>{time}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    }
                                })}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, width: '100%' }}>
                                <TouchableOpacity onPress={() => handleSubmit()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Xác Nhận</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </Animated.View>
    )
}

export default FormSchedule