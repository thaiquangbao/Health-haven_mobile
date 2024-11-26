import React, { useContext, useEffect, useState } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { compare2Date, convertDateToDayMonthYearObject, formatVietnameseDate, generateTimes } from '../../utils/date';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';

const Schedule = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displaySchedule === true ? 0 : width));
    let times = generateTimes('08:00', '20:00', 60);

    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { userHandler, userData } = useContext(userContext)
    const [doctorRecord, setDoctorRecord] = useState()
    const { utilsHandler } = useContext(utilsContext)

    useEffect(() => {
        setDoctorRecord(payloadData.doctorRecord)
    }, [payloadData.doctorRecord])


    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displaySchedule === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displaySchedule]);

    const checkSchedule = (time) => {
        for (let i = 0; i < doctorRecord?.schedules.length; i++) {
            const scheduleItem = doctorRecord?.schedules[i]
            const date = scheduleItem.date
            if (date.month === payloadData.day?.month && date.year === payloadData.day?.year && date.day === payloadData.day?.day) {
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

    const handleTime = (time1, booked) => {
        let record = JSON.parse(JSON.stringify(doctorRecord))
        let currentDay = payloadData.day
        const schedule = record.schedules.filter(item => (item.date.month === currentDay.month && item.date.day === currentDay.day && item.date.year === currentDay.year))[0]
        if (schedule) {
            if (schedule.times.map(item => item.time).includes(time1)) {
                // remove
                if (booked === false) {
                    schedule.times = schedule.times.filter(item => item.time !== time1)
                    setDoctorRecord(record)
                } else {
                    userHandler.notify(notifyType.WARNING, 'Bạn không thể hủy giờ hẹn đã được bệnh nhân đặt')
                }
            } else {
                // add
                schedule.times.push(
                    {
                        time: time1,
                        status: '',
                        price: 0
                    }
                )
                setDoctorRecord(record)
            }
        } else {
            // add
            setDoctorRecord({
                ...record, schedules: [
                    ...record.schedules,
                    {
                        date: currentDay,
                        times: [
                            {
                                time: time1,
                                status: '',
                                price: 0
                            }
                        ]
                    }
                ]
            })
        }
    }

    const handleUpdate = () => {
        const body = {
            ...doctorRecord, doctor: payloadData.doctorRecord.doctor.id
        }
        api({ type: TypeHTTP.POST, path: '/doctorRecords/update', body, sendToken: false })
            .then(res => {
                payloadHandler.setDoctorRecord({ ...res, doctor: payloadData.doctorRecord.doctor })
                utilsHandler.notify(notifyType.SUCCESS, 'Cập nhật lịch khám bệnh thành công')
                menuHandler.setDisplaySchedule(false)
            })
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
                <TouchableOpacity onPress={() => menuHandler.setDisplaySchedule(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 10 }}>
                {payloadData.day && (<>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 18, width: '100%' }}>{formatVietnameseDate(payloadData.day)}</Text>
                    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <View style={{ width: 25, height: 25, backgroundColor: '#eaeded', borderRadius: 5 }} />
                            <Text style={{ fontSize: 15, fontWeight: 400 }}>Lịch Trống</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <View style={{ width: 25, height: 25, backgroundColor: '#abebc6', borderRadius: 5 }} />
                            <Text style={{ fontSize: 15, fontWeight: 400 }}>Lịch khám theo dõi sức khỏe</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <View style={{ width: 25, height: 25, backgroundColor: '#ffc1b4', borderRadius: 5 }} />
                            <Text style={{ fontSize: 15, fontWeight: 400 }}>Lịch khám tại nhà</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <View style={{ width: 25, height: 25, backgroundColor: '#fafac7', borderRadius: 5 }} />
                            <Text style={{ fontSize: 15, fontWeight: 400 }}>Lịch khám trực tuyến</Text>
                        </View>
                    </View>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 16, width: '100%' }}>Giờ Hẹn</Text>
                    <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                        {times.map((time, index) => {
                            if (compare2Date(convertDateToDayMonthYearObject(new Date().toISOString()), payloadData.day)) {
                                if (new Date().getHours() + 2 >= Number(time.split(':')[0])) {
                                    // return <div key={index} className={`px-4 flex item-center justify-center py-2 transition-all border-[1px] border-[#999] text-[13px] font-medium bg-[#b7b7b7] rounded-md`}>{time}</div>
                                } else {
                                    return <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: checkSchedule(time) === 0 ? '#f2f3f4' : checkSchedule(time) === 4 ? '#ffc1b4' : checkSchedule(time) === 3 ? '#abebc6' : checkSchedule(time) === 1 ? '#cacfd2' : '#ffffee' }}>
                                        <TouchableOpacity onPress={() => {
                                            if (checkSchedule(time) !== 4 && checkSchedule(time) !== 3) {
                                                if (checkSchedule(time) === 1) {
                                                    handleTime(time, checkSchedule(time) === 2 ? true : false)
                                                } else {
                                                    menuHandler.setDisplayDetailTime(true)
                                                    payloadHandler.setTime(time)
                                                }
                                            }
                                        }} key={index}>
                                            <Text>{time}</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                            } else {
                                return <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: checkSchedule(time) === 0 ? '#f2f3f4' : checkSchedule(time) === 4 ? '#ffc1b4' : checkSchedule(time) === 3 ? '#abebc6' : checkSchedule(time) === 1 ? '#cacfd2' : '#ffffee' }}>
                                    <TouchableOpacity onPress={() => {
                                        if (checkSchedule(time) !== 4 && checkSchedule(time) !== 3) {
                                            if (checkSchedule(time) === 1) {
                                                handleTime(time, checkSchedule(time) === 2 ? true : false)
                                            } else {
                                                menuHandler.setDisplayDetailTime(true)
                                                payloadHandler.setTime(time)
                                            }
                                        }
                                    }} key={index}>
                                        <Text>{time}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        })}
                    </View>
                    <TouchableOpacity onPress={() => handleUpdate()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 42, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Cập Nhật</Text>
                    </TouchableOpacity>
                </>)}
            </View>
        </Animated.View >
    )
}

export default Schedule