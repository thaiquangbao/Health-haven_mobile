import React, { useContext, useEffect, useState } from 'react'
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { RadioButton } from '../auth/CompleteInformation';
import { Image } from 'react-native';

const DetailTime = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayDetailTime === true ? 0 : width));

    const [logBooks, setLogBooks] = useState([]);
    const [priceList, setPriceList] = useState()
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { userHandler, userData } = useContext(userContext)
    const [doctorRecord, setDoctorRecord] = useState()
    const [follow, setFollow] = useState(0)

    useEffect(() => {
        setFollow(0)
    }, [menuData.displayDetailTime])

    useEffect(() => {
        setDoctorRecord(payloadData.doctorRecord)
    }, [payloadData.doctorRecord])


    useEffect(() => {
        api({
            path: "/price-lists/getAll",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setPriceList(
                res.filter((item) => item.type === "Theo Dõi Hàng Tuần")[0]
            );
        });
    }, []);

    useEffect(() => {
        if (userData.user) {
            api({ type: TypeHTTP.GET, path: `/healthLogBooks/findByDoctor/${userData.user._id}`, sendToken: true })
                .then(logBooks => {
                    setLogBooks(logBooks)
                })
        }
    }, [userData.user])


    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayDetailTime === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayDetailTime]);

    const checkSchedule = (time) => {
        for (let i = 0; i < doctorRecord?.schedules.length; i++) {
            const scheduleItem = doctorRecord?.schedules[i]
            const date = scheduleItem.date
            if (date.month === payloadData.day?.month && date.year === payloadData.day?.year && date.day === payloadData.day?.day) {
                for (let j = 0; j < scheduleItem.times.length; j++) {
                    const timeItem = scheduleItem.times[j]
                    if (timeItem.time === time) {
                        if (timeItem.status !== '') {
                            if (timeItem.status === 'health') {
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
                    payloadHandler.setDoctorRecord(record)
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
                payloadHandler.setDoctorRecord(record)
            }
        } else {
            payloadHandler.setDoctorRecord({
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


    const handleCreateLichTheoDoi = (time, patientId) => {
        let currentDay = payloadData.day
        let record = JSON.parse(JSON.stringify(doctorRecord))
        const body = {
            doctor_record_id: payloadData.doctorRecord._id,
            patient: patientId,
            appointment_date: {
                day: currentDay.day,
                month: currentDay.month,
                year: currentDay.year,
                time
            },
            status: "ACCEPTED",
            note: "Theo dõi sức khỏe hàng tuần",
            priceList: priceList,
            price_list: priceList._id,
            status_message: 'Đã xác nhận',
            sick: 'Theo dõi sức khỏe hàng tuần'
        }
        api({ type: TypeHTTP.POST, sendToken: true, path: '/appointments/create-appointment-logbook', body })
            .then(res => {
                let schedules = record.schedules
                const filter = record.schedules.filter(item => item.date.day === currentDay.day && item.date.month === currentDay.month && item.date.year === currentDay.year)[0]
                if (filter) {
                    schedules = schedules.map(item => {
                        if (item.date.day === currentDay.day && item.date.month === currentDay.month && item.date.year === currentDay.year) {
                            return {
                                ...item, times: [...item.times, {
                                    time: time,
                                    status: 'health',
                                    price: 0
                                }]
                            }
                        }
                        return item
                    })
                } else {
                    schedules = [...schedules, {
                        date: currentDay,
                        times: [
                            {
                                time: time,
                                status: 'health',
                                price: 0
                            }
                        ]
                    }]
                }
                api({
                    type: TypeHTTP.POST, path: '/doctorRecords/update', body: {
                        ...record, schedules
                    }, sendToken: false
                })
                    .then(res => {
                        payloadHandler.setDoctorRecord(res)
                        menuHandler.setDisplayDetailTime(false)
                    })
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
            <View style={{ position: 'absolute', right: 15, top: 30 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplayDetailTime(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>
                {/* <TouchableOpacity onPress={() => {
                    setType(1)
                    handleTime(payloadData.time, checkSchedule(payloadData.time) === 2 ? true : false)
                    menuHandler.setDisplayDetailTime(false)
                }} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 42, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Lịch Hẹn Khám</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 42, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Lịch Theo Dõi Sức Khỏe</Text>
                </TouchableOpacity> */}

                <Text style={{ fontFamily: 'Nunito-B', fontSize: 18, width: '100%' }}>Chọn Loại Khám</Text>
                <View style={{ flexDirection: 'column', gap: 10, alignItems: 'start', width: '100%', marginTop: 15 }}>
                    <RadioButton
                        label="Lịch Hẹn Khám"
                        value={1}
                        selected={follow === 1}
                        onSelect={() => {
                            setFollow(1)
                            handleTime(payloadData.time, checkSchedule(payloadData.time) === 2 ? true : false)
                            menuHandler.setDisplayDetailTime(false)
                        }}
                    />
                    <RadioButton
                        label='Lịch Theo Dõi Sức Khỏe'
                        value={2}
                        selected={follow === 2}
                        onSelect={() => setFollow(2)}
                    />
                </View>

                {follow === 2 && (
                    <ScrollView style={{ flexDirection: 'column', width: '100%', marginTop: 20 }}>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 18, width: '100%' }}>Bệnh Nhân Của Tôi</Text>
                        {logBooks.map((item, index) => {
                            if (item.status.status_type === 'ACCEPTED') {
                                return <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f2f3f4', borderRadius: 10, gap: 10, alignItems: 'center' }} onPress={() => handleCreateLichTheoDoi(payloadData.time, item.patient._id)} key={index}>
                                    <Image source={{ uri: item.patient.image }} style={{ height: 46, width: 46, borderRadius: 23 }} />
                                    <View style={{ flexDirection: 'column', gap: 1 }}>
                                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16 }}>{item.patient.fullName}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}>{item.patient.phone}</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        })}
                    </ScrollView>
                )}
            </View>
        </Animated.View>
    )
}

export default DetailTime