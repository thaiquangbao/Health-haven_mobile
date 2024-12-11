import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../contexts/MenuContext';
import { userContext } from '../../contexts/UserContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { compare2Date, compareDate1GetterThanDate2, convertDateToDayMonthYearObject, convertDateToDayMonthYearVietNam2, sortDates, sortTimes } from '../../utils/date';
import { api, TypeHTTP } from '../../utils/api';

const FormBookingNormal = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayFormBookingNormal === true ? 0 : width));
    const [display, setDisplay] = useState(-1)

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayFormBookingNormal === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayFormBookingNormal]);

    // handle
    const { payloadHandler, payloadData } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [schedules, setSchedules] = useState([])
    const [priceList, setPriceList] = useState(0)
    const [appointmentDate, setAppointmentDate] = useState()
    const timeRef = useRef()
    const today = {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    }

    useEffect(() => {
        setSchedules([])
        if (payloadData.doctorRecord?.schedules) {
            api({
                type: TypeHTTP.POST, path: '/appointments/findByRecords', body: {
                    doctor_record_id: payloadData.doctorRecord?._id
                }, sendToken: false
            })
                .then(res => {
                    setSchedules(() => {
                        let schedules = JSON.parse(JSON.stringify(payloadData.doctorRecord.schedules)).filter(item => compareDate1GetterThanDate2(item.date, today) === true)
                        // là những cuộc hẹn có ngày sau ngày hôm nay trở đi
                        schedules = schedules.map((item) => {
                            item.times = item.times.filter((item1) => item1.status === "");
                            return { ...item, times: item.times };
                        });
                        return schedules;
                    })
                })
        }
    }, [payloadData.doctorRecord?.schedules])

    const handleCreateAppointment = () => {
        if (payloadData.doctorRecord) {
            const body = {
                doctor_record_id: payloadData.doctorRecord._id,
                patient: userData.user ? userData.user._id : null,
                appointment_date: appointmentDate,
                status: "QUEUE",
                note: "",
                status_message: 'Đang chờ bác sĩ xác nhận',
                priceList: payloadData.priceList,
                sick: payloadData.sick
            }

            // update data and reset form
            payloadHandler.setBookingNormal(body)
            menuHandler.setDisplayFormBookingNormal(false)
            payloadHandler.setPriceList()
            setDisplay(-1)
            setAppointmentDate()

            // chuyen sang screen Booking
            menuHandler.setDisplayInformationBookingNormal(true)
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
            <View style={{ position: 'absolute', right: 15, top: 30 }}>
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplayFormBookingNormal(false)
                    payloadHandler.setPriceList()
                    setDisplay(-1)
                    setAppointmentDate()
                }}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', gap: 5, paddingTop: 60 }}>
                {sortDates(schedules).map((schedule, index) => (
                    <View key={index} style={{ width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                        <Pressable onPress={() => setDisplay(display === index ? -1 : index)} style={{ width: '80%', backgroundColor: '#1dcbb6', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10 }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 16, color: 'white' }}>{convertDateToDayMonthYearVietNam2(schedule.date)}</Text>
                        </Pressable>
                        {display === index && (
                            <View style={{ width: '80%', flexDirection: 'column', gap: 5, paddingVertical: 5 }}>
                                {
                                    compare2Date(schedule.date, convertDateToDayMonthYearObject(new Date().toISOString())) ? (
                                        <>
                                            {sortTimes(schedule.times).filter(time => new Date(new Date().getTime() + 120 * 60000).getHours() < Number(time.time.split(':')[0])).map((time, indexTime) => (
                                                <TouchableOpacity onPress={() => setAppointmentDate({
                                                    day: schedule.date.day,
                                                    month: schedule.date.month,
                                                    year: schedule.date.year,
                                                    time: time.time
                                                })} key={indexTime} style={{ width: '100%', backgroundColor: appointmentDate?.time === time.time ? '#35a4ff2a' : '#f2f3f4', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 15 }}>
                                                    <Text style={{ fontFamily: 'Nunito-S' }}>{time.time}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {sortTimes(schedule.times).map((time, indexTime) => (
                                                <TouchableOpacity onPress={() => setAppointmentDate({
                                                    day: schedule.date.day,
                                                    month: schedule.date.month,
                                                    year: schedule.date.year,
                                                    time: time.time
                                                })} key={indexTime} style={{ width: '100%', backgroundColor: appointmentDate?.time === time.time ? '#35a4ff2a' : '#f2f3f4', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 15 }}>
                                                    <Text style={{ fontFamily: 'Nunito-S' }}>{time.time}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </>
                                    )
                                }
                            </View>
                        )}
                    </View>
                ))}
            </View>
            {appointmentDate && (
                <TouchableOpacity onPress={() => handleCreateAppointment()} style={{ position: 'absolute', right: 15, bottom: 30, backgroundColor: '#1dcbb6', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5 }}>
                    <Text style={{ fontFamily: 'Nunito-B', color: 'white', fontSize: 17 }}>Đặt Hẹn</Text>
                </TouchableOpacity>
            )}
        </Animated.View >
    )
}

export default FormBookingNormal