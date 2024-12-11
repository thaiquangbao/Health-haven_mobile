import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
import { convertDateToDayMonthYearVietNam } from '../utils/date';
import { color, status } from './AppointmentsScreen';
import { screenContext } from '../contexts/ScreenContext';

const FollowHealthScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [logBooks, setLogBooks] = useState([])
    const { screenData } = useContext(screenContext)

    useEffect(() => {
        if (userData.user) {
            api({ type: TypeHTTP.GET, path: `/healthLogBooks/findByPatient/${userData.user._id}`, sendToken: true })
                .then(logBooks => {
                    setLogBooks(logBooks)
                })
        }
    }, [userData.user])

    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                {screenData.currentScreen === 11 && (<>
                    <Text style={{ fontSize: 20, fontFamily: 'Nunito-B' }}>Chào {userData.user?.fullName}</Text>
                    <Text style={{ fontFamily: 'Nunito-R', width: '100%' }}>Theo dõi sức khỏe với các bác sĩ để nhận lời khuyên tốt nhất</Text>
                    <ScrollView style={{ flexDirection: 'column' }}>
                        {logBooks.map((logBook, index) => (
                            <TouchableOpacity onPress={() => {
                                if (logBook.status.status_type === 'ACCEPTED') {
                                    menuHandler.setDisplayHealth(true)
                                    payloadHandler.setLogbook(logBook)
                                }
                            }} key={index} style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 5, backgroundColor: '#f8f9f9', padding: 5, borderRadius: 5 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <View style={{
                                        height: 60,
                                        width: 60,
                                        borderWidth: 1,
                                        borderColor: '#1dcbb6',
                                        overflow: 'hidden',
                                        borderRadius: 150
                                    }}>
                                        <Image
                                            source={{ uri: logBook.doctor?.image }}
                                            style={{
                                                height: 90,
                                                width: 60,
                                            }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'column', gap: 2 }}>
                                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 16 }}> BS. {logBook.doctor?.fullName}</Text>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginLeft: 5 }}>{logBook.doctor?.phone}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, color: color[logBook.status.status_type] }}>{status[logBook.status.status_type]}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}></Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>)}
            </View>
            {/* )} */}
        </ScrollView>
    )
}

export default FollowHealthScreen