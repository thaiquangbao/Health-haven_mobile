import React, { useContext, useEffect, useState } from 'react'
import { Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import Menu from '../components/menu/Menu';
import Family from '../../assets/family.png'
import Heart from '../../assets/heart.png'
import { api, TypeHTTP } from '../utils/api';
import { dataContext } from '../contexts/DataContext';
import { screenContext } from '../contexts/ScreenContext';
import { userContext } from '../contexts/UserContext';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/FontAwesome5';

const LandingScreen = () => {
    const { width } = Dimensions.get('window');
    const { data, handler } = useContext(dataContext)
    const { screenHandler } = useContext(screenContext)
    const { userData } = useContext(userContext)

    return (
        <ScrollView style={{ flexDirection: 'column', paddingHorizontal: 10, width, paddingVertical: 10, gap: 10, paddingBottom: 20 }}>
            <View style={{ width: '100%', overflow: 'hidden', position: 'relative', flexDirection: 'row', height: 180, backgroundColor: '#1dcbb6', borderRadius: 8, paddingVertical: 10 }}>
                <View style={{ width: '50%', paddingHorizontal: 12, flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', color: 'white', lineHeight: 20 }}>Tham khảo ý kiến sức khỏe về bệnh tim mạch tại HealthHaven.</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <TouchableOpacity onPress={() => screenHandler.navigate('doctors')} style={{ borderRadius: 5, backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 15 }}>
                            <Text style={{ color: 'black', fontFamily: 'Nunito-B', fontSize: 13 }}>Đặt Khám Ngay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Image source={Family} style={{ width: 210, height: 160, position: 'absolute', bottom: 0, right: 0 }} />
            </View>
            <ScrollView horizontal={true} style={{ width: '100%', flexDirection: 'row', paddingTop: 10, height: 270, borderRadius: 8, paddingVertical: 10 }}>
                {data.doctorRecords.map((doctorRecord, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            if (userData.user?.role !== 'DOCTOR') {
                                screenHandler.setCurrentDoctorRecord(doctorRecord)
                                screenHandler.navigate('detail-doctor')
                            }
                        }}
                        style={{
                            paddingVertical: 15,
                            shadowColor: '#1dcbb6', // Màu của bóng
                            shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                            shadowOpacity: 0.3, // Độ mờ của bóng
                            shadowRadius: 8, // Bán kính làm mờ của bóng
                            elevation: 8, // Shadow elevation cho Android
                            height: '90%',
                            width: 170,
                            backgroundColor: '#f0f3f4',
                            borderRadius: 8,
                            marginLeft: 10,
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
                        <View style={{ flexDirection: 'row', marginVertical: 6, gap: 10 }}>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Icon1 name='calendar-day' style={{ fontSize: 20, color: '#1dcbb6' }} />
                                <Text style={{ fontSize: 16, fontWeight: 500 }}>{doctorRecord?.examination_call}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Icon name='star' style={{ fontSize: 20, color: '#1dcbb6' }} />
                                <Text style={{ fontSize: 16, fontWeight: 500 }}>{doctorRecord?.assessment.toFixed(1)}</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: 15, marginTop: 10, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>BS {doctorRecord?.doctor?.fullName}</Text>
                        <Text style={{ fontFamily: 'Nunito-R' }} >{doctorRecord?.doctor.specialize}</Text>
                    </TouchableOpacity>

                ))}
            </ScrollView>
            <View style={{ width: '100%', overflow: 'hidden', position: 'relative', flexDirection: 'row', borderRadius: 8, paddingHorizontal: 10 }}>
                <View style={{ width: '65%' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Nunito-B' }}>Bệnh tim mạch?</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Nunito-R', marginTop: 10 }}>Tim mạch là một nhánh của y học, liên quan đến chẩn đoán và điều trị các rối loạn của tim và hệ thống mạch máu, bao gồm dị tật tim bẩm sinh, bệnh mạch vành, suy tim, bệnh van tim và rối loạn nhịp tim.</Text>
                </View>
                <Image source={Heart} style={{ width: '35%', aspectRatio: 1 }} />
            </View>
            <ScrollView horizontal={true} style={{ width: '100%', flexDirection: 'row', borderRadius: 8, paddingVertical: 10 }}>
                {data.sicks.map((sick, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            paddingVertical: 15,
                            aspectRatio: 1,
                            width: 150,
                            backgroundColor: '#f0f3f4',
                            borderRadius: 8,
                            marginLeft: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            gap: 12
                        }}
                    >
                        <Image
                            source={{ uri: sick.image }}
                            style={{
                                height: 70, // Đặt chiều cao bằng 100% của container
                                width: 70,  // Đặt chiều rộng bằng 100% của container
                                borderRadius: 50 // Đảm bảo hình ảnh được làm tròn cùng với container
                            }}
                        />
                        <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>{sick.title}</Text>
                    </TouchableOpacity>

                ))}
            </ScrollView>
        </ScrollView>
    )
}

export default LandingScreen