import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { userContext } from '../../contexts/UserContext'
import { payloadContext } from '../../contexts/PayloadContext'
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import { utilsContext } from '../../contexts/UtilsContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconX from 'react-native-vector-icons/Feather';
import { notifyType } from '../../utils/notify';
import { api, TypeHTTP } from '../../utils/api';
import { convertDateToDayMonthYearObject } from '../../utils/date';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../contexts/MenuContext';

const MedicalRecordHome = ({ doctorRecord, medicalRecord, setCurrentLayout, setMedicalRecord }) => {
    const { userData } = useContext(userContext)
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { width, height } = Dimensions.get('window');
    const [showPicker, setShowPicker] = useState(false);
    const [medical, setMedical] = useState([]);
    const [nameMedical, setNameMedical] = useState("");
    const [quantity, setQuantity] = useState(0);
    const { utilsHandler } = useContext(utilsContext);
    const [display, setDisplay] = useState(false)
    const [diagnosisDisease, setDiagnosisDisease] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState(new Date())
    const [reAppointmentDate, setReAppointmentDate] = useState();
    const [temperature, setTemperature] = useState(0);
    const [bloodPressure, setBloodPressure] = useState("");
    const [healthRate, setHealthRate] = useState("");
    const [weight, setWeight] = useState(0);
    const [height1, setHeight1] = useState(0);
    const [unit, setUnit] = useState('1')
    const { menuHandler } = useContext(menuContext)
    const unitOptions = {
        '1': "Viên",
        '2': "Vỉ",
        '3': "Hộp",
        '4': "Ống",
        '5': "Gói",
        '6': "Chai/Lọ",
        '7': "Tuýp"
    };

    useEffect(() => {
        if (payloadData.currentMedical) {
            setMedical([...medical, payloadData.currentMedical]);
            payloadHandler.setCurrentMedical()
        }
    }, [payloadData.currentMedical])

    const updateMedicalRecord = () => {
        let splitDate = reAppointmentDate
            ? reAppointmentDate.split("-").map(item => Number(item))
            : [];
        // chổ này cần check xem có nhập đủ thông tin không
        if (symptoms === "") {
            utilsHandler.notify(notifyType.WARNING, "Chưa nhập triệu chứng")
            return
        }
        if (diagnosisDisease === "") {
            utilsHandler.notify(notifyType.WARNING, "Chưa nhập chẩn đoán bệnh")
            return
        }
        if (note === "") {
            utilsHandler.notify(notifyType.WARNING, "Chưa nhập ghi chú")
            return
        }
        if (medical.length === 0) {
            utilsHandler.notify(notifyType.WARNING, "Chưa nhập đơn thuốc")
            return
        }
        const body = {
            patient: payloadData.appointmentHome?.patient?._id,
            doctor: doctorRecord?.doctor?._id,
            diagnosisDisease: diagnosisDisease,
            symptoms: symptoms,
            note: note,
            reExaminationDate: {
                day: splitDate[2] || "",
                month: splitDate[1] || "",
                year: splitDate[0] || "",
            },
            temperature: temperature,
            bloodPressure: bloodPressure,
            healthRate: healthRate,
            weight: weight,
            height: height1,
            medical: medical,
            appointment: payloadData.appointmentHome?._id,
            date: payloadData.appointmentHome?.appointment_date,
        };
        api({
            path: "/medicalRecords/save",
            type: TypeHTTP.POST,
            sendToken: false,
            body,
        }).then(async (medicalRecord1) => {
            await api({
                path: `/medicalRecords/send-mail/${medicalRecord1._id}`,
                type: TypeHTTP.POST,
                sendToken: false,
            })
                .then(res => {
                    // thông báo thành công
                    setMedicalRecord(medicalRecord1)
                    setCurrentLayout(0)
                    utilsHandler.notify(notifyType.SUCCESS, "Đã lưu hồ sơ bệnh nhân")
                })
        });
    }

    useEffect(() => {
        if (medicalRecord) {
            setMedical(medicalRecord.medical)
            setDiagnosisDisease(medicalRecord.diagnosisDisease)
            setSymptoms(medicalRecord.symptoms)
            setNote(medicalRecord.note)
            if (medicalRecord.reExaminationDate?.day !== 0) {
                setReAppointmentDate(`${medicalRecord.reExaminationDate.year}-${medicalRecord.reExaminationDate.month}-${medicalRecord.reExaminationDate.day}`)
            }
            setTemperature(medicalRecord.temperature + '')
            setBloodPressure(medicalRecord.bloodPressure)
            setHealthRate(medicalRecord.healthRate + '')
            setWeight(medicalRecord.weight + '')
            setHeight1(medicalRecord.height + '')
            setDate(new Date())
        }
    }, [medicalRecord])

    return (
        <ScrollView style={{ width: width, flexDirection: 'column', paddingHorizontal: 20, gap: 5, position: 'relative' }}>
            {display && (
                <View style={{ width, height, justifyContent: 'center', position: 'absolute', top: -10, left: -20, alignItems: 'center', flexDirection: 'row', zIndex: 50, backgroundColor: '#e7e7e7b5' }}>
                    <View style={{ width: '80%', position: 'absolute', backgroundColor: 'white', borderRadius: 10, zIndex: 4, paddingHorizontal: 20, paddingVertical: 20 }}>
                        <TouchableOpacity style={{ alignItems: 'flex-end', position: 'absolute', top: 5, right: 5 }} onPress={() => setDisplay(false)}>
                            <IconX name="x" style={{ fontSize: 20 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('1'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['1']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('2'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['2']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('3'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['3']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('4'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['4']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('5'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['5']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('6'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['6']}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setUnit('7'); setDisplay(false) }} style={{ marginTop: 10, backgroundColor: '#e5e7e9', paddingHorizontal: 10, borderRadius: 5, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 17 }}>{unitOptions['7']}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {showPicker && (
                <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', backgroundColor: 'white', left: 50, zIndex: 50, borderRadius: 30 }}>
                    <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={date}
                        onChange={({ type }, selectedDate) => {
                            if (type === "set") {
                                setReAppointmentDate(`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`)
                                setDate(selectedDate)
                                if (Platform.OS === 'android') {
                                    setReAppointmentDate(`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`)
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

            <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10 }}>
                    <TouchableOpacity onPress={() => setCurrentLayout(0)}>
                        <Icon1 name='arrow-back-ios-new' style={{ fontSize: 25, color: 'black' }} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, fontWeight: 400, width: '100%' }}>Hồ Sơ Bệnh Án</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 5, padding: 5, borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <Text style={{ fontSize: 15 }}>Khám bệnh tại nhà</Text>
                        {!medicalRecord && (
                            <TouchableOpacity onPress={() => updateMedicalRecord()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                                <Text style={{ color: 'white' }}>Cập nhật hồ sơ</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {!medicalRecord ? (
                    <>
                        <TextInput value={symptoms} onChangeText={e => setSymptoms(e)} placeholder='Triệu chứng' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput value={bloodPressure} onChangeText={e => setBloodPressure(e)} placeholder='Huyết Áp' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            <TextInput value={healthRate} onChangeText={e => setHealthRate(e)} placeholder='Nhịp Tim' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '49%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput value={weight} onChangeText={e => setWeight(e)} placeholder='Cân Nặng' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            <TextInput value={height1} onChangeText={e => setHeight1(e)} placeholder='Chiều Cao' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '49%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput value={temperature} onChangeText={e => setTemperature(e)} placeholder='Nhiệt Độ' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ width: '40%', fontSize: 16, fontWeight: 600 }}>Ngày Tái Khám: </Text>
                            <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, width: '60%', borderColor: '#bbb', height: 48, borderWidth: 1 }} onPress={() => setShowPicker(true)}>
                                <Text style={{ color: '#999' }}>
                                    {reAppointmentDate ? reAppointmentDate.split('-')[2] + "/" + reAppointmentDate.split('-')[1] + "/" + reAppointmentDate.split('-')[0] : 'dd/mm/yyyy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput value={diagnosisDisease} onChangeText={e => setDiagnosisDisease(e)} placeholder='Chuẩn đoán bệnh' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <TextInput value={note} onChangeText={e => setNote(e)} placeholder='Lời dặn bác sĩ' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <Text style={{ fontSize: 17, fontWeight: 600, width: '100%', paddingHorizontal: 10, marginTop: 10 }}>Đơn thuốc</Text>
                        <TouchableOpacity onPress={() => menuHandler.setDisplayAddMedical(true)} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 5 }}>
                            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Thêm Thuốc</Text>
                        </TouchableOpacity>
                        {medical.length > 0 ? (
                            <View style={{ flexDirection: 'column', gap: 5, width: '95%', paddingVertical: 10 }}>
                                {medical.map((item, index) => (
                                    <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 10, paddingVertical: 15, borderRadius: 8, backgroundColor: '#f1f1f1', gap: 5, justifyContent: 'flex-start', alignItems: 'center' }} key={index}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ width: '60%', fontWeight: 500 }}>{item.medicalName}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '30%' }}>
                                                <Text>{item.quantity} {item.unitOfCalculation}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={{}} onPress={() => setMedical(prev => prev.filter(item1 => item1.medicalName !== item.medicalName))}>
                                            <Icon name="x" style={{ fontSize: 30 }} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                            </View>
                        ) : (
                            <>

                            </>
                        )}
                    </>
                ) : (
                    <>
                        <TextInput editable={false} value={symptoms} onChangeText={e => setSymptoms(e)} placeholder='Triệu chứng' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput editable={false} value={bloodPressure} onChangeText={e => setBloodPressure(e)} placeholder='Huyết Áp' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            <TextInput editable={false} value={healthRate} onChangeText={e => setHealthRate(e)} placeholder='Nhịp Tim' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '49%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput editable={false} value={weight} onChangeText={e => setWeight(e)} placeholder='Cân Nặng' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            <TextInput editable={false} value={height1} onChangeText={e => setHeight1(e)} placeholder='Chiều Cao' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '49%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput editable={false} value={temperature} onChangeText={e => setTemperature(e)} placeholder='Nhiệt Độ' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '48%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        </View>
                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ width: '40%', fontSize: 16, fontWeight: 600 }}>Ngày Tái Khám: </Text>
                            <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, width: '60%', borderColor: '#bbb', height: 48, borderWidth: 1 }}>
                                <Text style={{ color: '#999' }}>
                                    {reAppointmentDate ? reAppointmentDate.split('-')[2] + "/" + reAppointmentDate.split('-')[1] + "/" + reAppointmentDate.split('-')[0] : 'dd/mm/yyyy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput editable={false} value={diagnosisDisease} onChangeText={e => setDiagnosisDisease(e)} placeholder='Chuẩn đoán bệnh' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <TextInput editable={false} value={note} onChangeText={e => setNote(e)} placeholder='Lời dặn bác sĩ' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '95%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <Text style={{ fontSize: 17, fontWeight: 600, width: '100%', paddingHorizontal: 10, marginTop: 10 }}>Đơn thuốc</Text>
                        {medical.length > 0 ? (
                            <View style={{ flexDirection: 'column', gap: 5, width: '95%', paddingVertical: 10 }}>
                                {medical.map((item, index) => (
                                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15, borderRadius: 8, backgroundColor: '#f1f1f1', gap: 10, justifyContent: 'space-between' }} key={index}>
                                        <Text style={{ width: '65%', fontWeight: 500 }}>{item.medicalName}</Text>
                                        <Text>{item.quantity} {item.unitOfCalculation}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <>

                            </>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    )
}

export default MedicalRecordHome