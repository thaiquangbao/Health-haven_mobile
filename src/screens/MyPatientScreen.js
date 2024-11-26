import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import StatusEach from '../components/mypatient/StatusEach';
import StatusPatient from '../components/mypatient/StatusPatient';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { screenContext } from '../contexts/ScreenContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';

const MyPatientScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { screenData } = useContext(screenContext)
    const [logBooks, setLogBooks] = useState([]);

    useEffect(() => {
        if (userData.user) {
            api({ type: TypeHTTP.GET, path: `/healthLogBooks/findByDoctor/${userData.user._id}`, sendToken: true })
                .then(logBooks => {
                    if (logBooks) {
                        setLogBooks(logBooks)
                    }

                })
        }
    }, [userData.user])


    return (
        <View>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', justifyContent: 'center', width, gap: 10, paddingHorizontal: 20, paddingTop: 5 }}>
                {(screenData.currentScreen === 13 && logBooks) && (<>
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 20, width: '100%', textAlign: 'center' }}>Bệnh Nhân Của Tôi</Text>
                    <StatusEach logBooks={logBooks} />
                    <StatusPatient logBooks={logBooks} />
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 17, width: '100%', marginTop: 10 }}>Bệnh Nhân:</Text>
                    <ScrollView style={{ width: '100%', height: 210 }}>
                        {logBooks.filter((item) => item.status.status_type === "ACCEPTED").map((logbook, index) => (
                            <TouchableOpacity onPress={() => {
                                menuHandler.setDisplayDetailLogbook(true)
                                payloadHandler.setLogbook(logbook)
                            }} key={index} style={{ marginBottom: 10, flexDirection: 'row', gap: 10, backgroundColor: '#f9f9f9', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 }}>
                                <Image source={{ uri: logbook.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                                <View style={{ flexDirection: 'column', gap: 2 }}>
                                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 17, width: '100%' }}>{logbook.patient.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 15, width: '100%' }}>Tình Trạng Sức Khỏe: {logbook.status_bloodPressure ===
                                        null &&
                                        logbook.status_temperature ===
                                        null &&
                                        logbook.status_heartRate ===
                                        null &&
                                        logbook.status_bmi === null
                                        ? "Bình thường"
                                        : "Báo động"}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                    </ScrollView>
                </>)}
            </View>
        </View>
    )
}

export default MyPatientScreen