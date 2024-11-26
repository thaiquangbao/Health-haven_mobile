import React, { useContext } from 'react'
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { dataContext } from '../contexts/DataContext';
import { screenContext } from '../contexts/ScreenContext';

const DoctorsScreen = () => {
    const { data } = useContext(dataContext)
    const { width } = Dimensions.get('window');
    const { screenData, screenHandler } = useContext(screenContext)

    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', width, gap: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
                {screenData.currentScreen === 1 && (
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
                                    height: 200,
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
                                <Text style={{ fontSize: 15, marginTop: 10, fontFamily: 'Nunito-B', lineHeight: 20, textAlign: 'center' }}>BS {doctorRecord?.doctor?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-R' }} >{doctorRecord?.doctor.specialize}</Text>
                            </TouchableOpacity>

                        ))}
                    </>
                )}
            </View>
        </ScrollView>
    )
}

export default DoctorsScreen