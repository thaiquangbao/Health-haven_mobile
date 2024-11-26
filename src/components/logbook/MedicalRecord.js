import React, { useContext, useEffect, useState } from 'react'
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import { api, TypeHTTP } from '../../utils/api';
import { Image } from 'react-native';

const MedicalRecord = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayMedicalRecord === true ? 0 : width));
    const [medicalRecords, setMedicalRecords] = useState([]);
    const { payloadData, payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayMedicalRecord === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayMedicalRecord]);

    useEffect(() => {
        if (payloadData.patient) {
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/medicalRecords/findByPatient/${payloadData.patient._id}`,
            }).then((res) => setMedicalRecords(res));
        }
    }, [payloadData.patient]);


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
                <TouchableOpacity onPress={() => menuHandler.setDisplayMedicalRecord(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
                <Text style={{ fontFamily: 'Nunito-B', fontSize: 22, color: '#273746', textAlign: 'start' }}>Hồ sơ sức khỏe</Text>
                <ScrollView style={{ marginTop: 5, width: '97%', paddingHorizontal: 10 }}>
                    {medicalRecords.map(
                        (medicalRecord, index) => (
                            <View key={index} style={{ marginTop: 10, backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start' }}>
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
                                <View style={{ flexDirection: 'column', marginTop: 5 }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>BS. {medicalRecord.doctor?.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thời gian: {medicalRecord.date?.day}-{" "}{medicalRecord.date?.month}-{" "}{medicalRecord.date?.year}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Triệu chứng: {medicalRecord.symptoms === '' ? 'Không có' : medicalRecord.symptoms}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Chuẩn đoán: {medicalRecord.diagnosisDisease === '' ? 'Không có' : medicalRecord.diagnosisDisease}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thuốc: {medicalRecord.medical.map((medicine) => medicine.medicalName).join(", ")}</Text>
                                    <Text Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Ghi chú: {medicalRecord.note === '' ? 'Không có' : medicalRecord.note}</Text>
                                </View>
                            </View>
                        )
                    )}

                </ScrollView>
            </View>
        </Animated.View>
    )
}

export default MedicalRecord