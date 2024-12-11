import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native';
import { Image, Text, View } from 'react-native'
import { userContext } from '../../contexts/UserContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { formatMoney } from '../../utils/other';
import { compare2Date, convertDateToDayMonthYear } from '../../utils/date';
import { io } from 'socket.io-client'
import { api, baseURL, TypeHTTP } from '../../utils/api';
import { notifyType } from '../../utils/notify';
import { utilsContext } from '../../contexts/UtilsContext';
import { menuContext } from '../../contexts/MenuContext';
import { screenContext } from '../../contexts/ScreenContext';
const socket = io.connect(baseURL)
const ChoosePayment = ({ step, setStep, customer }) => {
    const { userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const [url, setUrl] = useState('')
    const { utilsHandler } = useContext(utilsContext)
    const { menuHandler } = useContext(menuContext)
    const { screenHandler } = useContext(screenContext)
    useEffect(() => {
        if (customer) {
            setUrl(`https://qr.sepay.vn/img?bank=MBBank&acc=0834885704&template=compact&amount=${payloadData.bookingNormal?.priceList.price}&des=MaKH${customer.user._id}2b`)
        } else {
            if (payloadData.bookingNormal && step === 1) {
                setUrl(`https://qr.sepay.vn/img?bank=MBBank&acc=0834885704&template=compact&amount=${payloadData.bookingNormal?.priceList.price}&des=MaKH${userData.user?._id}2b`)
            }
        }
    }, [payloadData.bookingNormal, userData.user?._id, step, customer])

    useEffect(() => {
        if (customer) {
            socket.on(`payment-appointment-online${customer.user._id}`, (data) => {
                if (data) {
                    handleSubmit()
                } else {
                    utilsHandler.notify(notifyType.WARNING, "Thanh Toán Thất Bại")
                }

            })
        } else {
            socket.on(`payment-appointment-online${userData.user?._id}`, (data) => {
                if (data) {
                    handleSubmit()
                } else {
                    utilsHandler.notify(notifyType.WARNING, "Thanh Toán Thất Bại")
                }

            })
        }
        return () => {
            if (customer) {
                socket.off(`payment-appointment-online${customer.user._id}`);
            } else {
                socket.off(`payment-appointment-online${userData.user?._id}`);
            }
        }
    }, [userData.user?._id, customer])

    const handleSubmit = () => {
        if (userData.user) {
            api({
                type: TypeHTTP.GET,
                path: `/doctorRecords/getById/${payloadData.doctorRecord.doctor._id}`,
                sendToken: false,
            })
                .then((res) => {
                    payloadHandler.setDoctorRecord(res);
                    const filter = res.schedules.filter(item => {
                        return compare2Date(item.date, payloadData.bookingNormal.appointment_date)
                    })[0]
                    const nestedFilter = filter.times.filter(item => item.time === payloadData.bookingNormal.appointment_date.time)[0]
                    if (nestedFilter.status !== '') {
                        utilsHandler.notify(notifyType.WARNING, "Cập nhật: Thời gian hẹn đã được đặt, vui lòng chọn thời gian khác")
                        setTimeout(() => {
                            screenHandler.navigate('doctors')
                        }, 2000);
                    } else {
                        api({ sendToken: false, body: payloadData.bookingImages, path: '/upload-image/mobile/upload', type: TypeHTTP.POST })
                            .then(listImage => {
                                api({ type: TypeHTTP.POST, sendToken: true, path: '/appointments/save', body: { ...payloadData.bookingNormal, price_list: payloadData.bookingNormal.priceList._id, images: listImage } })
                                    .then(res => {
                                        let record = JSON.parse(JSON.stringify(payloadData.doctorRecord))
                                        let schedule = record.schedules.filter(item => item.date.day === res.appointment_date.day && item.date.month === res.appointment_date.month && item.date.year === res.appointment_date.year)[0]
                                        let time = schedule.times.filter(item => item.time === res.appointment_date.time)[0]
                                        time.status = 'Queue'
                                        api({ type: TypeHTTP.POST, path: '/doctorRecords/update', sendToken: false, body: record })
                                            .then(res1 => {
                                                const currentDate = new Date();
                                                const vietnamTimeOffset = 7 * 60; // GMT+7 in minutes
                                                const localTimeOffset = currentDate.getTimezoneOffset(); // Local timezone offset in minutes
                                                const vietnamTime = new Date(
                                                    currentDate.getTime() +
                                                    (vietnamTimeOffset + localTimeOffset) * 60000
                                                );
                                                const time = {
                                                    day: vietnamTime.getDate(),
                                                    month: vietnamTime.getMonth() + 1,
                                                    year: vietnamTime.getFullYear(),
                                                    time: `${vietnamTime.getHours()}:${vietnamTime.getMinutes()}`,
                                                };
                                                const payment = {
                                                    patient_id: userData.user?._id,
                                                    doctor_id: payloadData.doctorRecord?.doctor._id,
                                                    category: res._id,
                                                    namePayment: "APPOINTMENT",
                                                    date: time,
                                                    status_payment: {
                                                        type: "SUCCESS",
                                                        messages: "Thanh toán thành công",
                                                    },
                                                    status_take_money: {
                                                        type: "WAITING",
                                                        messages: "Chưa rút tiền",
                                                    },
                                                    price: payloadData.bookingNormal?.priceList?.price,
                                                    description: `Thanh toán tư vấn sức khỏe trực tuyến HealthHaven - MaKH${userData.user?._id}.Lịch hẹn lúc (${res.appointment_date.time}) ngày ${res.appointment_date.day}/${res.appointment_date.month}/${res.appointment_date.year}.`,
                                                };
                                                api({
                                                    type: TypeHTTP.POST,
                                                    path: "/payments/save",
                                                    sendToken: false,
                                                    body: payment,
                                                }).then((pay) => {
                                                    utilsHandler.notify(notifyType.SUCCESS, "Đăng Ký Lịch Hẹn Thành Công")
                                                    setStep(2)
                                                });
                                            })
                                    })
                            })
                    }
                })
                .catch((error) => {
                    screenHandler.navigate('doctors')
                });
        } else {
            try {
                api({
                    type: TypeHTTP.GET,
                    path: `/doctorRecords/getById/${payloadData.doctorRecord.doctor._id}`,
                    sendToken: false,
                })
                    .then((res) => {
                        payloadHandler.setDoctorRecord(res);
                        const filter = res.schedules.filter(item => {
                            return compare2Date(item.date, payloadData.bookingNormal.appointment_date)
                        })[0]
                        const nestedFilter = filter.times.filter(item => item.time === payloadData.bookingNormal.appointment_date.time)[0]
                        if (nestedFilter.status !== '') {
                            utilsHandler.notify(notifyType.WARNING, "Cập nhật: Thời gian hẹn đã được đặt, vui lòng chọn thời gian khác")
                            setTimeout(() => {
                                screenHandler.navigate('doctors')
                            }, 2000);
                        } else {
                            api({ sendToken: false, body: payloadData.bookingImages, path: '/upload-image/mobile/upload', type: TypeHTTP.POST })
                                .then(listImage => {
                                    api({ type: TypeHTTP.POST, sendToken: false, path: '/appointments/save/customer', body: { ...payloadData.bookingNormal, price_list: payloadData.bookingNormal.priceList._id, images: listImage } })
                                        .then(res => {
                                            let record = JSON.parse(JSON.stringify(payloadData.doctorRecord))
                                            let schedule = record.schedules.filter(item => {
                                                return item.date.day === res.appointment_date.day && item.date.month === res.appointment_date.month && item.date.year === res.appointment_date.year
                                            })[0]
                                            let time = schedule.times.filter(item => item.time === res.appointment_date.time)[0]
                                            time.status = 'Queue'
                                            api({ type: TypeHTTP.POST, path: '/doctorRecords/update', sendToken: false, body: record })
                                                .then(res1 => {
                                                    const currentDate = new Date();
                                                    const vietnamTimeOffset = 7 * 60; // GMT+7 in minutes
                                                    const localTimeOffset = currentDate.getTimezoneOffset(); // Local timezone offset in minutes
                                                    const vietnamTime = new Date(
                                                        currentDate.getTime() +
                                                        (vietnamTimeOffset + localTimeOffset) * 60000
                                                    );
                                                    const time = {
                                                        day: vietnamTime.getDate(),
                                                        month: vietnamTime.getMonth() + 1,
                                                        year: vietnamTime.getFullYear(),
                                                        time: `${vietnamTime.getHours()}:${vietnamTime.getMinutes()}`,
                                                    };

                                                    const payment = {
                                                        patient_id: res.patient._id,
                                                        doctor_id: payloadData.doctorRecord?.doctor._id,
                                                        category: res._id,
                                                        namePayment: "APPOINTMENT",
                                                        date: time,
                                                        status_payment: {
                                                            type: "SUCCESS",
                                                            messages: "Thanh toán thành công",
                                                        },
                                                        status_take_money: {
                                                            type: "WAITING",
                                                            messages: "Chưa rút tiền",
                                                        },
                                                        price: payloadData.bookingNormal?.priceList?.price,
                                                        description: `Thanh toán tư vấn sức khỏe trực tuyến HealthHaven - MaKH${userData.user?._id}`,
                                                    };
                                                    api({
                                                        type: TypeHTTP.POST,
                                                        path: "/payments/save",
                                                        sendToken: false,
                                                        body: payment,
                                                    }).then((pay) => {
                                                        utilsHandler.notify(notifyType.SUCCESS, "Đăng Ký Lịch Hẹn Thành Công")
                                                        setStep(2)
                                                    });
                                                })
                                                .catch(error => console.log(error))
                                        })
                                        .catch(error => console.error(error))

                                })
                        }
                    })
                    .catch((error) => {
                        screenHandler.navigate('doctors')
                    });
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 60 }}>
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Phương Thức Thanh Toán</Text>

            <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-S' }}>Thanh Toán Qua Mã QR</Text>
                </View>
                <View style={{ alignItems: 'center', flexDirection: 'column', borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Image source={{ uri: url }} style={{ width: '70%', aspectRatio: 1 }} />
                    <Text>Tên chủ TK: THAI ANH THU</Text>
                    <Text>Số TK: 0834885704</Text>
                    <Text style={{ textAlign: 'center' }}>Sử dụng app Momo hoặc app Ngân hàng để thanh toán</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text>Giờ Hẹn: </Text>
                    <Text style={{ backgroundColor: 'blue', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{payloadData.bookingNormal?.appointment_date.time}</Text>
                    <Text style={{ backgroundColor: '#1dcbb6', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{convertDateToDayMonthYear(payloadData.bookingNormal?.appointment_date)}</Text>
                </View>
                <View style={{ alignItems: 'start', flexDirection: 'row', gap: 15, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <View style={{
                        height: 55,
                        width: 55,
                        borderWidth: 1,
                        borderColor: '#1dcbb6',
                        overflow: 'hidden',
                        borderRadius: 150
                    }}>
                        <Image
                            source={{ uri: payloadData.doctorRecord?.doctor?.image }}
                            style={{
                                height: 75,
                                width: 55,
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Khám bệnh trực tuyến</Text>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{payloadData.doctorRecord?.doctor.fullName}</Text>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 13, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#e0eff6', borderRadius: 5, marginVertical: 2 }}>{payloadData.doctorRecord?.doctor.specialize}</Text>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>{formatMoney(payloadData.bookingNormal?.priceList.price)} đ</Text>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', gap: 1, justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Giá dịch vụ</Text>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14 }}>{formatMoney(payloadData.bookingNormal?.priceList.price)} đ</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 1, justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Tổng Thanh Toán</Text>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, color: 'red' }}>{formatMoney(payloadData.bookingNormal?.priceList.price)} đ</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleSubmit()}>
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ChoosePayment