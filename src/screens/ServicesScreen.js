import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { dataContext } from '../contexts/DataContext';
import { api, TypeHTTP } from '../utils/api';
import { formatMoney } from '../utils/other';
import { screenContext } from '../contexts/ScreenContext';

const ServicesScreen = () => {
    const { width } = Dimensions.get('window');
    const { data } = useContext(dataContext)
    const [priceList, setPriceList] = useState(0);
    const { screenData } = useContext(screenContext)
    useEffect(() => {
        api({
            path: "/price-lists/getAll",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setPriceList(
                res.filter((item) => item.type === "Online")[0]
            );
        });
    }, [data.sicks]);
    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', width, gap: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
                {screenData.currentScreen === 3 && (
                    <>
                        <View style={{ width: '100%', overflow: 'hidden', position: 'relative', flexDirection: 'row', height: 130, backgroundColor: '#1dcbb6', borderRadius: 8, paddingVertical: 10 }}>
                            <ImageBackground style={{ width: '100%', height: 130 }} source={{ uri: 'https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/general-care-person.png' }}>
                                <View style={{ width: '40%', marginLeft: 10, gap: 10, flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-B', color: 'white', fontSize: 14 }}>Khám Tổng Quát Tim Mạch ({formatMoney(priceList.price)} đ)</Text>
                                    <TouchableOpacity style={{ borderRadius: 5, backgroundColor: 'white', paddingVertical: 8, width: 120, flexDirection: 'row', justifyContent: 'center' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Nunito-B', fontSize: 13 }}>Đặt Khám Ngay</Text>
                                    </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                            {data.sicks.map((sick, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        paddingVertical: 15,
                                        // aspectRatio: 1,
                                        width: '48.5%',
                                        backgroundColor: '#f7f7f7',
                                        borderRadius: 8,
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
                        </View>
                    </>
                )}
            </View>
            {/* )} */}
        </ScrollView>
    )
}

export default ServicesScreen