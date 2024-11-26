import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { compare2Date, convertDateInputToObject, convertDateToDayMonthYearVietNam, generateTimes } from '../../utils/date';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api, TypeHTTP } from '../../utils/api';
import { userContext } from '../../contexts/UserContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { notifyType } from '../../utils/notify';

const SmartSearching = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displaySmartSearching === true ? 0 : width));
    const [date, setDate] = useState(new Date());
    let times = generateTimes('08:00', '20:00', 60);
    const [time, setTime] = useState()
    const [des, setDes] = useState()
    const [showPicker, setShowPicker] = useState(false);
    const [currentStep, setCurrentStep] = useState(0)
    const [doctorRecords, setDoctorRecords] = useState([])
    const [filterDoctorRecords, setFilterDoctorRecords] = useState([])
    const [priceList, setPriceList] = useState()
    const wrapperRef = useRef()
    const { utilsHandler } = useContext(utilsContext)
    const { payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displaySmartSearching === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displaySmartSearching]);

    useEffect(() => {
        api({
            type: TypeHTTP.GET,
            path: "/doctorRecords/getAll",
            sendToken: false,
        }).then((res) => {
            setDoctorRecords(res);
        });
        api({
            path: "/price-lists/getAll",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setPriceList(
                res.filter((item) => item.type === "Online")[0]
            );
        });
    }, []);

    const checkInput = () => {
        if (!date)
            return false
        if (!time)
            return false
        if (!des)
            return false
        return true
    }

    const handleSearching = () => {
        console.log(date)
        const filter = doctorRecords.filter(item => item.schedules.length > 0).filter(item => item.schedules.filter(item1 => compare2Date(item1.date, convertDateInputToObject(date.toISOString()))).filter(item1 => item1.times.filter(item2 => item2.status === '').map(item2 => item2.time).includes(time)).length > 0)
        if (filter.length > 0) {
            setFilterDoctorRecords(filter)
            setCurrentStep(1)
        } else {
            utilsHandler.notify(notifyType.WARNING, 'Không có bác sĩ nào phù hợp với lịch hẹn của bạn')
        }
    }

    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ x: currentStep * width, animated: true });
        }
    }, [currentStep])

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
                <TouchableOpacity onPress={() => menuHandler.setDisplaySmartSearching(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView scrollEnabled={false} ref={wrapperRef} horizontal style={{ flexDirection: 'row', paddingVertical: 40 }}>

                {showPicker && (
                    <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', backgroundColor: 'white', left: 50, zIndex: 50, borderRadius: 30 }}>
                        <DateTimePicker
                            mode="date"
                            display="spinner"
                            value={date}
                            onChange={({ type }, selectedDate) => {
                                if (type === "set") {
                                    setDate(selectedDate)
                                    if (Platform.OS === 'android') {
                                        setDate(selectedDate)
                                        setShowPicker(false)
                                    }
                                } else {
                                    setShowPicker(false)
                                }
                            }}
                        />
                        {Platform.OS === 'ios' && (
                            <View style={{ paddingVertical: 10, flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={{ fontSize: 17, fontWeight: 'bold' }}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
                <View style={{ flexDirection: 'column', width, paddingHorizontal: 20 }}>
                    <Text style={{ width: '100%', fontSize: 20, fontWeight: 600 }}>Tìm Kiếm Thông Minh</Text>
                    <View style={{ width: '100%', flexDirection: 'column', padding: 10, marginTop: 20, borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: 600 }}>Chọn ngày</Text>
                        <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, width: '100%', borderColor: '#bbb', height: 48, borderWidth: 1 }} onPress={() => setShowPicker(true)}>
                            <Text style={{ color: '#999' }}>
                                {date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()}
                            </Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 15, fontWeight: 600, marginTop: 20 }}>Chọn thời gian</Text>
                        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                            {times.map((time1, index) => {
                                return <View key={index} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: time1 === time ? '#dadada' : '#f2f3f4' }}>
                                    <TouchableOpacity onPress={() => setTime(time1)} key={index}>
                                        <Text>{time1}</Text>
                                    </TouchableOpacity>
                                </View>
                            })}
                        </View>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'column', padding: 10, marginTop: 20, borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: 600 }}>Mô tả triệu chứng bệnh của bạn</Text>
                        <TextInput value={des} onChangeText={e => setDes(e)} multiline={true} textAlignVertical="top" numberOfLines={15} placeholder='Mô Tả Thêm' style={{ color: 'black', height: 150, marginTop: 10, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    </View>
                    {(checkInput() && currentStep === 0) && (
                        <TouchableOpacity onPress={() => handleSearching()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 15 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Tìm Kiếm</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ flexDirection: 'column', width, paddingHorizontal: 20 }}>
                    <Text style={{ width: '100%', fontSize: 20, fontWeight: 600 }}>Các Bác Sĩ Được Đề Xuất</Text>
                    <Text style={{ width: '100%', fontSize: 16, fontWeight: 600 }}>{(date && time) && convertDateToDayMonthYearVietNam({ ...convertDateInputToObject(date.toISOString()), time })}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 }}>
                        {filterDoctorRecords.map((doctorRecord, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    if (priceList) {
                                        if (userData.user) {
                                            if (userData.user?.email === "") {
                                                utilsHandler.notify(
                                                    notifyType.WARNING,
                                                    "Vui lòng cập nhật email để đặt khám !!!"
                                                );
                                                return;
                                            } else {
                                                const body = {
                                                    doctor_record_id: doctorRecord._id,
                                                    patient: userData.user ? userData.user._id : null,
                                                    appointment_date: { ...convertDateInputToObject(date.toISOString()), time },
                                                    status: "QUEUE",
                                                    note: "",
                                                    status_message: 'Đang chờ bác sĩ xác nhận',
                                                    priceList: priceList,
                                                    sick: des
                                                }
                                                payloadHandler.setBookingNormal(body)
                                                payloadHandler.setDoctorRecord(doctorRecord)
                                                menuHandler.setDisplayInformationBookingNormal(true)
                                                menuHandler.setDisplaySmartSearching(false)
                                                setFilterDoctorRecords([])
                                                setCurrentStep(0)
                                            }
                                        } else {
                                            utilsHandler.notify(
                                                notifyType.WARNING,
                                                "Vui lòng đăng nhập để đặt khám với bác sĩ!!!"
                                            );
                                        }
                                    }
                                }}
                                style={{
                                    paddingVertical: 20,
                                    shadowColor: '#1dcbb6', // Màu của bóng
                                    shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                    shadowOpacity: 0.3, // Độ mờ của bóng
                                    shadowRadius: 8, // Bán kính làm mờ của bóng
                                    elevation: 8, // Shadow elevation cho Android
                                    height: 190,
                                    width: '48%',
                                    backgroundColor: '#f0f3f4',
                                    borderRadius: 8,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    paddingHorizontal: 10,
                                }}
                            >
                                <View style={{
                                    height: 100,
                                    width: 100,
                                    borderWidth: 2,
                                    borderColor: '#1dcbb6',
                                    overflow: 'hidden',
                                    borderRadius: 50
                                }}>
                                    <Image
                                        source={{ uri: doctorRecord?.doctor?.image }}
                                        style={{
                                            height: 150, // Đặt chiều cao bằng 100% của container
                                            width: 100,  // Đặt chiều rộng bằng 100% của container
                                            borderRadius: 50 // Đảm bảo hình ảnh được làm tròn cùng với container
                                        }}
                                    />
                                </View>
                                <Text style={{ fontSize: 15, marginTop: 10, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>BS {doctorRecord?.doctor?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-R', marginBottom: 20 }} >{doctorRecord?.doctor.specialize}</Text>
                            </TouchableOpacity>

                        ))}
                    </View>
                </View>

            </ScrollView>
        </Animated.View >
    )
}

export default SmartSearching