import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { formatMoney } from '../utils/other';
import { api, TypeHTTP } from '../utils/api';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/AntDesign';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { screenContext } from '../contexts/ScreenContext';

const ForumsScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { screenData } = useContext(screenContext)
    const [qas, setQAs] = useState([]);
    useEffect(() => {
        api({
            path: "/qas/get-all",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setQAs(res);
        });
    }, []);
    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                {screenData.currentScreen === 4 && (<>
                    {userData.user && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => menuHandler.setDisplayAddQuestion(true)} style={{ gap: 5, backgroundColor: 'green', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 10 }}>
                                <Icon name='plus' style={{ fontSize: 25, color: 'white' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Nunito-S', color: 'white' }}>Đặt câu hỏi</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ flexDirection: 'column', gap: 40, width: '100%', marginTop: 20 }}>
                        {qas.map((qa, index) => (
                            <Pressable onPress={() => {
                                menuHandler.setDisplayDetailQuestion(true)
                                payloadHandler.setQa(qa)
                            }} key={index} style={{ flexDirection: 'column', borderBottomWidth: 1, paddingBottom: 20, borderColor: '#e5e7e9', alignItems: 'flex-start', gap: 5, width: '100%' }}>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>{qa.patient.sex === true ? "Nam" : "Nữ"} , {qa.patient.dateOfBirth}</Text>
                                <Text style={{ fontFamily: 'Nunito-B', fontSize: 17, color: '#6567eb' }}>{qa.title}</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 16 }}>{qa.content}</Text>
                                <View style={{ backgroundColor: '#bfdbfe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>
                                    <Text style={{ color: '#6567eb', fontFamily: 'Nunito-B' }}>{qa.category}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 15 }}>
                                    <Text style={{ fontFamily: 'Nunito-S' }}><Icon name='clock' style={{ fontSize: 15 }} /> {qa.date.day}/{qa.date.month}/{qa.date.year}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S' }}><Icon name='eye' style={{ fontSize: 15 }} /> {qa.views}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S' }}><Icon1 name='like2' style={{ fontSize: 15 }} /> {qa.like.length}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S' }}><Icon1 name='message1' style={{ fontSize: 15 }} /> {qa.comment}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </>)}
            </View>
            {/* )} */}
        </ScrollView>
    )
}

export default ForumsScreen