import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import { calculateDetailedTimeDifference, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam } from '../../utils/date';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { color, status } from '../../screens/AppointmentsScreen';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import MedicalRecordHome from './MedicalRecordHome';
import { notifyType } from '../../utils/notify';
import { utilsContext } from '../../contexts/UtilsContext';
import WebView from 'react-native-webview';
import Icon2 from 'react-native-vector-icons/AntDesign';

const DetailAppoinmentHome = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayDetailAppointmentHome === true ? 0 : width));
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const wrapperRef = useRef()
    const { userData } = useContext(userContext)
    const [doctorRecord, setDoctorRecord] = useState();
    const [equipments, setEquipments] = useState('')
    const [finish, setFinish] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState([])
    const [medicalRecord, setMedicalRecord] = useState()
    const [currentLayout, setCurrentLayout] = useState(0)
    const { utilsHandler } = useContext(utilsContext)
    const [star, setStar] = useState(0)
    const [comments, setComments] = useState("");

    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollTo({ x: currentLayout * width, animated: true });
        }
    }, [currentLayout])

    useEffect(() => {
        if (payloadData.appointmentHome) {
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/doctorRecords/get-one/${payloadData.appointmentHome?.doctor_record_id}`,
            }).then((res) => setDoctorRecord(res));
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/medicalRecords/findByPatient/${payloadData.appointmentHome?.patient?._id}`,
            }).then((res) => {
                setMedicalRecords(res);
            });
            api({
                path: `/medicalRecords/check-appointment`,
                type: TypeHTTP.POST,
                body: { appointment: payloadData.appointmentHome._id },
                sendToken: false,
            }).then((res) => {
                if (res !== 0) {
                    setMedicalRecord(res);
                    setFinish(true);
                } else {
                    setFinish(false);
                }
            });
        }
    }, [payloadData.appointmentHome]);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayDetailAppointmentHome === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayDetailAppointmentHome]);

    useEffect(() => {
        if (payloadData.appointmentHome) {
            const arr = []
            if (payloadData.appointmentHome.equipment.thermometer) {
                arr.push('Nhiệt kế')
            }
            if (payloadData.appointmentHome.equipment.bloodPressureMonitor) {
                arr.push('Máy đo huyết áp')
            }
            if (payloadData.appointmentHome.equipment.heartRateMonitor) {
                arr.push('Máy đo nhịp tim')
            }
            if (payloadData.appointmentHome.equipment.bloodGlucoseMonitor) {
                arr.push('Máy đo đường huyết')
            }
            setEquipments(arr.join(', '))
        }
    }, [payloadData.appointmentHome])

    const finishAppointmentHome = () => {
        const body = {
            _id: payloadData.appointmentHome._id,
            status: {
                status_type: "COMPLETED",
                message: "Cuộc hẹn đã hoàn thành",
            },
        };
        api({
            type: TypeHTTP.POST,
            sendToken: false,
            path: `/appointmentHomes/complete`,
            body,
        }).then((res) => {
            payloadHandler.setAppointmentHome(res);
            payloadHandler.setAppointmentHomes((prev) =>
                prev.map((item) => {
                    if (item._id === res._id) {
                        return res;
                    }
                    return item;
                })
            );
            utilsHandler.notify(
                notifyType.SUCCESS,
                "Đã Hoàn thành cuộc hẹn"
            );
        });
    };

    const handleSubmitAssessment = () => {
        const data = {
            doctor_record_id: payloadData.appointmentHome?.doctor_record_id,
            assessment_list: {
                star,
                content: comments,
                fullName: payloadData.appointmentHome?.patient.fullName,
                image: payloadData.appointmentHome?.patient.image,
                date: {
                    day: payloadData.appointmentHome?.appointment_date?.day,
                    month: payloadData.appointmentHome?.appointment_date?.month,
                    year: payloadData.appointmentHome?.appointment_date?.year,
                },
            },
        };
        api({
            type: TypeHTTP.POST,
            path: `/assessments/save`,
            body: data,
            sendToken: false,
        }).then((res) => {
            utilsHandler.notify(
                notifyType.SUCCESS,
                "Đánh giá thành công, Cảm ơn bạn đã đánh giá!!!"
            );
            setCurrentLayout(0)
        });
    };

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
                <TouchableOpacity onPress={() => menuHandler.setDisplayDetailAppointmentHome(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView scrollEnabled={false} ref={wrapperRef} horizontal style={{ width: '100%', flexDirection: 'row', paddingTop: 30 }}>
                <View style={{ width: width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 20, gap: 5 }}>
                    {payloadData.appointmentHome && (<>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>THÔNG TIN CHI TIẾT CUỘC HẸN</Text>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Khám tại nhà</Text>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>{payloadData.appointmentHome.appointment_date.day !== 0 ? `${convertDateToDayMonthYearVietNam(payloadData.appointmentHome.appointment_date)}` : 'Chưa rõ giờ hẹn'}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 5, padding: 5, borderRadius: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
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
                                                : payloadData.appointmentHome?.patient?.image
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
                                        : payloadData.appointmentHome?.patient?.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{userData.user?.role !== "DOCTOR"
                                        ? doctorRecord?.doctor?.phone
                                        : payloadData.appointmentHome?.patient?.phone}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, color: color[payloadData.appointmentHome?.status?.status_type] }}>{status[payloadData.appointmentHome?.status?.status_type]}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{payloadData.appointmentHome?.status?.status_type === "ACCEPTED"
                                        ? calculateDetailedTimeDifference(
                                            convertDateToDayMonthYearTimeObject(
                                                new Date().toISOString()
                                            ),
                                            payloadData.appointmentHome?.appointment_date
                                        )
                                        : payloadData.appointmentHome?.status?.message}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 5, paddingHorizontal: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 600 }}>Lời Nhắn:</Text>
                            <Text style={{ fontSize: 16, width: '75%' }}>{payloadData.appointmentHome.note}</Text>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 5, paddingHorizontal: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 600 }}>Thiết bị có sẵn:</Text>
                            <Text style={{ fontSize: 15, width: '70%' }}>{equipments}</Text>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', marginTop: 10, gap: 5, paddingHorizontal: 10, flexWrap: 'wrap' }}>
                            {userData.user?._id ===
                                doctorRecord?.doctor?._id &&
                                finish &&
                                payloadData.appointmentHome?.status?.status_type !==
                                "COMPLETED" && (
                                    <TouchableOpacity onPress={() => finishAppointmentHome()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Hoàn thành cuộc hẹn</Text>
                                    </TouchableOpacity>
                                )}
                            {userData.user?._id ===
                                payloadData.appointmentHome?.patient?._id &&
                                payloadData.appointmentHome?.status.status_type ===
                                "COMPLETED" && (
                                    <TouchableOpacity onPress={() => setCurrentLayout(3)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Đánh giá bác sĩ</Text>
                                    </TouchableOpacity>
                                )}
                            {(userData.user?._id ===
                                payloadData.appointmentHome?.patient?._id &&
                                payloadData.appointmentHome?.status.status_type ===
                                "ACCEPTED" && payloadData.appointmentHome?.processAppointment === 1) && (
                                    <TouchableOpacity onPress={() => {
                                        payloadHandler.setBookingHome(payloadData.appointmentHome)
                                        menuHandler.setDisplayInformationBookingHome(true)
                                    }} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Thanh Toán</Text>
                                    </TouchableOpacity>
                                )}
                            {(userData.user?._id ===
                                doctorRecord?.doctor?._id ||
                                finish) &&
                                payloadData.appointmentHome?.processAppointment === 2 && (
                                    <TouchableOpacity onPress={() => setCurrentLayout(2)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Hồ sơ bệnh nhân</Text>
                                    </TouchableOpacity>
                                )}
                            <TouchableOpacity onPress={() => setCurrentLayout(1)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                <Text style={{ color: 'white' }}>Xem vị trí</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontFamily: 'Nunito-S', width: '100%', fontSize: 16, marginTop: 3 }}>Lịch sử khám: </Text>
                        {medicalRecords.length > 0 ? (
                            <ScrollView style={{ height: '50%', marginTop: 5, width: '100%', paddingHorizontal: 10 }}>
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
                        ) : (
                            <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 20 }}>Bệnh nhân chưa có lịch sử khám</Text>
                        )}
                    </>)}
                </View>
                {/* Location */}
                <View style={{ width: width, flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10, paddingHorizontal: 20 }}>
                        <TouchableOpacity onPress={() => setCurrentLayout(0)}>
                            <Icon1 name='arrow-back-ios-new' style={{ fontSize: 25, color: 'black' }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17, fontWeight: 400, width: '90%' }}>Vị trí của bệnh nhân</Text>
                    </View>
                    {/* <View style={{ width: '100%', height: '90%', backgroundColor: 'red' }}></View> */}
                    <WebView source={{ uri: 'https://health-haven-iuh.vercel.app/location/106.6882625-10.8223941' }} javaScriptEnabled={true} style={{ width, height: '100%' }} />
                </View>
                {/* Medical Record */}
                <MedicalRecordHome setMedicalRecord={setMedicalRecord} setCurrentLayout={setCurrentLayout} doctorRecord={doctorRecord} medicalRecord={medicalRecord} />
                {/* đánh giá bác sĩ*/}
                <View style={{ width: width, flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => setCurrentLayout(0)}>
                            <Icon1 name='arrow-back-ios-new' style={{ fontSize: 25, color: 'black' }} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3, width: '80%' }}>Bạn hãy đánh giá cho bác sĩ</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => setStar(1)}>
                            <Icon2 name='star' style={{ color: star >= 1 ? '#f4d03f' : '#999', fontSize: 35 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStar(2)}>
                            <Icon2 name='star' style={{ color: star >= 2 ? '#f4d03f' : '#999', fontSize: 35 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStar(3)}>
                            <Icon2 name='star' style={{ color: star >= 3 ? '#f4d03f' : '#999', fontSize: 35 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStar(4)}>
                            <Icon2 name='star' style={{ color: star >= 4 ? '#f4d03f' : '#999', fontSize: 35 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStar(5)}>
                            <Icon2 name='star' style={{ color: star >= 5 ? '#f4d03f' : '#999', fontSize: 35 }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, width: '90%', marginTop: 20 }}>Nội dung đánh giá:</Text>
                    <TextInput value={comments} onChangeText={e => setComments(e)} multiline={true} textAlignVertical="top" numberOfLines={15} placeholder='Mô Tả Thêm' style={{ color: 'black', height: 150, zIndex: 1, width: '90%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, paddingVertical: 10, borderColor: '#bbb' }} />
                    <TouchableOpacity onPress={() => handleSubmitAssessment()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 }}>
                        <Text style={{ color: 'white', fontFamily: 'Nunito-B', fontSize: 18, width: '90%', textAlign: 'center' }}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Animated.View>
    )
}

export default DetailAppoinmentHome