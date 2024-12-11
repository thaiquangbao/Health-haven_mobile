import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
import { screenContext } from '../contexts/ScreenContext';

const MedicalRecordScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [medicalRecords, setMedicalRecords] = useState([]);
    const { screenData } = useContext(screenContext)
    useEffect(() => {
        if (userData.user) {
            api({
                type: TypeHTTP.GET,
                sendToken: false,
                path: `/medicalRecords/findByPatient/${userData?.user?._id}`,
            }).then((res) => setMedicalRecords(res.reverse()));
        }
    }, [userData.user]);

    return (
        <ScrollView>
            <View style={{ flexDirection: 'column', alignItems: 'center', width, gap: 10, paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: 'Nunito-B', fontSize: 22, color: '#273746', width: '100%', textAlign: 'start' }}>Hồ sơ sức khỏe</Text>
            </View>
            <ScrollView style={{ marginTop: 5, paddingHorizontal: 10, marginBottom: 30 }}>
                {screenData.currentScreen === 8 && (<>
                    {medicalRecords.map(
                        (medicalRecord, index) => (
                            <View key={index} style={{ marginTop: 10, width: width * 0.95, backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start' }}>
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
                                <View style={{ flexDirection: 'column', marginTop: 5, width: '90%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3, width: '90%' }}>BS. {medicalRecord.doctor?.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '90%' }}>Thời gian: {medicalRecord.date?.day}-{" "}{medicalRecord.date?.month}-{" "}{medicalRecord.date?.year}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '90%' }}>Triệu chứng: {medicalRecord.symptoms === '' ? 'Không có' : medicalRecord.symptoms}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '90%' }}>Chuẩn đoán: {medicalRecord.diagnosisDisease === '' ? 'Không có' : medicalRecord.diagnosisDisease}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '90%' }}>Thuốc: {medicalRecord.medical.map((medicine) => medicine.medicalName).join(", ")}</Text>
                                    <Text Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, width: '90%' }}>Ghi chú: {medicalRecord.note === '' ? 'Không có' : medicalRecord.note}</Text>
                                </View>
                            </View>
                        )
                    )}
                </>)}

            </ScrollView>
            {/* )} */}
        </ScrollView>
    )
}

export default MedicalRecordScreen