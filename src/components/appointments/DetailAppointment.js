import React, { useContext, useEffect, useState } from 'react'
import { Animated, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { api, deploy, TypeHTTP } from '../../utils/api';
import { calculateDetailedTimeDifference, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam } from '../../utils/date';
import { color, status } from '../../screens/AppointmentsScreen';
import { screenContext } from '../../contexts/ScreenContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'date-fns';

const DetailAppointment = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayDetailAppointment === true ? 0 : width));
    const [doctorRecord, setDoctorRecord] = useState();
    const { userData } = useContext(userContext);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const { screenHandler } = useContext(screenContext)
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()

    const navigate = (goal) => {
        menuHandler.setDisplay(false)
        screenHandler.navigate(goal)
        menuHandler.setDisplayDetailAppointment(false)
    }

    useEffect(() => {
        const getTokens = async () => {
            try {
                const access = await AsyncStorage.getItem('accessToken');
                const refresh = await AsyncStorage.getItem('refreshToken');

                // Chỉ set token sau khi nhận được
                setAccessToken(access);
                setRefreshToken(refresh);
            } catch (error) {
                console.log('Error fetching tokens:', error);
            }
        };

        if (userData.user) {
            getTokens(); // Gọi hàm async để lấy token
        }

        // Cleanup function
        return () => {
            setAccessToken(undefined); // Reset về giá trị hợp lý, ví dụ undefined
            setRefreshToken(undefined);
        };
    }, [userData.user]);


    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayDetailAppointment === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayDetailAppointment]);

    useEffect(() => {
        if (payloadData.detailAppointment) {
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/doctorRecords/get-one/${payloadData.detailAppointment?.doctor_record_id}`,
            }).then((res) => setDoctorRecord(res));
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/medicalRecords/findByPatient/${payloadData.detailAppointment?.patient?._id}`,
            }).then((res) => setMedicalRecords(res));
        }
    }, [payloadData.detailAppointment]);

    const handleGoToMeet = () => {
        if (accessToken && refreshToken) {
            const url = `${deploy}/meet/${payloadData.detailAppointment?._id}/${userData.user?.role === "USER"
                ? "patient"
                : "doctor"}?accesstoken=${accessToken}&refreshtoken=${refreshToken}`;
            Linking.openURL(url)
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
                <TouchableOpacity onPress={() => menuHandler.setDisplayDetailAppointment(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', paddingHorizontal: 10, alignItems: 'center', marginTop: 60 }}>
                {payloadData.detailAppointment && (<>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>THÔNG TIN CHI TIẾT CUỘC HẸN</Text>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.sick}</Text>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>{`${convertDateToDayMonthYearVietNam(payloadData.detailAppointment?.appointment_date)}`}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 5, padding: 5, borderRadius: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, width: '50%' }}>
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
                                        uri: userData.user?.role !== "DOCTOR"
                                            ? doctorRecord?.doctor?.image
                                            : payloadData.detailAppointment?.patient?.image
                                    }}
                                    style={{
                                        height: 90,
                                        width: 60,
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'column', gap: 2 }}>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 16 }}>{userData.user?.role !== "DOCTOR"
                                    ? doctorRecord?.doctor?.fullName
                                    : payloadData.detailAppointment?.patient?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{userData.user?.role !== "DOCTOR"
                                    ? doctorRecord?.doctor?.phone
                                    : payloadData.detailAppointment?.patient?.phone}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end', width: '50%' }}>
                            <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, color: color[payloadData.detailAppointment?.status] }}>{status[payloadData.detailAppointment?.status]}</Text>
                            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{payloadData.detailAppointment?.status === "ACCEPTED"
                                ? calculateDetailedTimeDifference(
                                    convertDateToDayMonthYearTimeObject(
                                        new Date().toISOString()
                                    ),
                                    payloadData.detailAppointment?.appointment_date
                                )
                                : payloadData.detailAppointment?.status_message}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Triệu Chứng: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.note === '' ? 'Không có' : payloadData.detailAppointment?.note}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Cân Nặng: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.weight === 0 ? 'Không có' : payloadData.detailAppointment?.weight + ' kg'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Chiều Cao: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.height === 0 ? 'Không có' : payloadData.detailAppointment?.height + " cm"}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Nhịp Tim: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.healthRate === 0 ? 'Không có' : payloadData.detailAppointment?.healthRate + ' nhịp/phút'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Huyết Áp: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.bloodPressure === '' ? 'Không có' : payloadData.detailAppointment?.bloodPressure + " mmHg"}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Huyết Áp: </Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16, marginTop: 3 }}>{payloadData.detailAppointment?.temperature === '' ? 'Không có' : payloadData.detailAppointment?.temperature + " °C"}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'flex-start', paddingHorizontal: 10, marginTop: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 18, marginTop: 3 }}>Lịch sử khám của bệnh nhân: </Text>
                    </View>
                    <ScrollView style={{ height: '42%', marginTop: 5, width: '100%', paddingHorizontal: 10 }}>
                        {medicalRecords.map(
                            (medicalRecord, index) => (
                                <View key={index} style={{ marginTop: 10, backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start', width: '100%' }}>
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
                                                uri: medicalRecord.doctor?.image
                                            }}
                                            style={{
                                                height: 90,
                                                width: 60,
                                            }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'column', marginTop: 5, width: '100%' }}>
                                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3, width: '80%' }}>BS. {medicalRecord.doctor?.fullName}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '80%' }}>Thời gian: {medicalRecord.date?.day}-{" "}{medicalRecord.date?.month}-{" "}{medicalRecord.date?.year}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '80%' }}>Triệu chứng: {medicalRecord.symptoms === '' ? 'Không có' : medicalRecord.symptoms}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '80%' }}>Chuẩn đoán: {medicalRecord.diagnosisDisease === '' ? 'Không có' : medicalRecord.diagnosisDisease}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '80%' }}>Thuốc: {medicalRecord.medical.map((medicine) => medicine.medicalName).join(", ")}</Text>
                                        <Text Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '80%' }}>Ghi chú: {medicalRecord.note === '' ? 'Không có' : medicalRecord.note}</Text>
                                    </View>
                                </View>
                            )
                        )}
                    </ScrollView>
                    {(payloadData.displayConnect === payloadData.detailAppointment?._id && userData.user?.role === 'USER') && (
                        <TouchableOpacity onPress={() => handleGoToMeet()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', paddingVertical: 11, marginTop: 12, paddingHorizontal: 20 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Tham Gia Cuộc Hẹn</Text>
                        </TouchableOpacity>
                    )}
                </>)}
            </View>
        </Animated.View >
    )
}

export default DetailAppointment