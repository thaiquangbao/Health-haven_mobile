import React, { useContext } from 'react'
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { dataContext } from '../contexts/DataContext';
import { screenContext } from '../contexts/ScreenContext';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/FontAwesome5';

const DoctorsScreen = () => {
    const { data } = useContext(dataContext)
    const { width } = Dimensions.get('window');
    const { screenData, screenHandler } = useContext(screenContext)

    return (
        <ScrollView style={{ flexDirection: 'column', gap: 10, width }}>
            {screenData.currentScreen === 1 && (<>
                <Text style={{ fontSize: 20, fontWeight: 600, marginLeft: 10 }}>Bác Sĩ Đề Xuất</Text>
                <View style={{ flexWrap: 'wrap', flexDirection: 'row', width, gap: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
                    {data.doctorSuggest.map((doctorRecord, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                screenHandler.setCurrentDoctorRecord(doctorRecord)
                                screenHandler.navigate('detail-doctor')
                            }}
                            style={{
                                paddingVertical: 15,
                                shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android
                                height: 220,
                                width: '48.5%',
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
                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>BS {doctorRecord?.doctor?.fullName}</Text>
                            <Text style={{ fontFamily: 'Nunito-R' }} >{doctorRecord?.doctor.specialize}</Text>
                        </TouchableOpacity>

                    ))}
                </View>
                <Text style={{ fontSize: 20, fontWeight: 600, marginLeft: 10, marginTop: 20 }}>Tất Cả Bác Sĩ</Text>
                <View style={{ flexWrap: 'wrap', flexDirection: 'row', width, gap: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
                    <>
                        {data.doctorRecords.map((doctorRecord, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    screenHandler.setCurrentDoctorRecord(doctorRecord)
                                    screenHandler.navigate('detail-doctor')
                                }}
                                style={{
                                    paddingVertical: 15,
                                    shadowColor: '#1dcbb6', // Màu của bóng
                                    shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                    shadowOpacity: 0.3, // Độ mờ của bóng
                                    shadowRadius: 8, // Bán kính làm mờ của bóng
                                    elevation: 8, // Shadow elevation cho Android
                                    height: 220,
                                    width: '48.5%',
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
                                <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>BS {doctorRecord?.doctor?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-R' }} >{doctorRecord?.doctor.specialize}</Text>
                            </TouchableOpacity>

                        ))}
                    </>
                </View>
            </>)}
        </ScrollView>
    )
}

export default DoctorsScreen