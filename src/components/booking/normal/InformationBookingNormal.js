import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../../contexts/MenuContext';
import { payloadContext } from '../../../contexts/PayloadContext';
import { userContext } from '../../../contexts/UserContext';
import { convertDateToDayMonthYear } from '../../../utils/date';
import { formatMoney } from '../../../utils/other';
import Icon2 from 'react-native-vector-icons/Entypo';
import ChoosePayment from '../ChoosePayment';
import Complete from '../Complete';
import * as ImagePicker from 'expo-image-picker';

const InformationBookingNormal = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayInformationBookingNormal === true ? 0 : width));
    const scrollViewRef = useRef(null);
    const [step, setStep] = useState(0)

    //data
    const { userData } = useContext(userContext)
    const { payloadData, payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        setStep(0)
    }, [menuData.displayInformationBookingNormal])

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayInformationBookingNormal === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayInformationBookingNormal]);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: step * width, animated: true });
        }
    }, [step])

    const openGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.cancelled) {
                const file = {
                    base64: result.assets[0].base64,
                    originalname: result.assets[0].fileName,
                    uri: result.assets[0].uri,
                    mimetype: result.assets[0].mimeType,
                    size: result.assets[0].fileSize
                }
                payloadHandler.setBookingImages([...payloadData.bookingImages, file])
            }
        } catch (error) {
            console.error('Lỗi khi mở thư viện ảnh:', error);
        }
    };

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
                <TouchableOpacity onPress={() => menuHandler.setDisplayInformationBookingNormal(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                scrollEnabled={false}
                style={{ flexDirection: 'row' }}>
                {payloadData.bookingNormal && (<>
                    <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 60 }}>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Thông Tin Đặt Khám</Text>
                        <View style={{ flexDirection: 'row', gap: 15, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                            <Image source={{ uri: userData.user?.image }} style={{ height: 55, width: 55, borderRadius: 55 }} />
                            <View style={{ flexDirection: 'column', gap: 1 }}>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Bệnh Nhân</Text>
                                <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{userData.user?.fullName}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                                <Text>Giờ Hẹn: </Text>
                                <Text style={{ backgroundColor: 'blue', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{payloadData.bookingNormal?.appointment_date?.time}</Text>
                                <Text style={{ backgroundColor: '#1dcbb6', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{convertDateToDayMonthYear(payloadData.bookingNormal?.appointment_date)}</Text>
                            </View>
                            <View style={{ alignItems: 'start', flexDirection: 'row', gap: 15, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                                <View style={{
                                    height: 55,
                                    width: 55,
                                    borderWidth: 1,
                                    borderColor: '#1dcbb6',
                                    overflow: 'hidden',
                                    borderRadius: 150
                                }}>
                                    <Image
                                        source={{ uri: payloadData.doctorRecord?.doctor?.image }}
                                        style={{
                                            height: 75,
                                            width: 55,
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Khám bệnh trực tuyến</Text>
                                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{payloadData.doctorRecord?.doctor.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 13, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#e0eff6', borderRadius: 5, marginVertical: 2 }}>{payloadData.doctorRecord?.doctor.specialize}</Text>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>{formatMoney(payloadData.bookingNormal?.priceList.price)} đ</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 5, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                            <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Mô tả triệu chứng của bạn</Text>
                            <TextInput value={payloadData.bookingNormal?.note} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, note: e })} style={{ fontFamily: 'Nunito-R', }} placeholder='Mô tả triệu chứng' />
                        </View>
                        <View style={{ flexDirection: 'column', gap: 5, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                            <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Chỉ số (nếu có)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Cân Nặng (kg): </Text>
                                <TextInput value={payloadData.bookingNormal?.weight} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, weight: e })} style={{ fontFamily: 'Nunito-R', width: '75%' }} placeholder='Nhập cân nặng' />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Huyết áp (mmHg): </Text>
                                <TextInput value={payloadData.bookingNormal?.bloodPressure} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, bloodPressure: e })} style={{ fontFamily: 'Nunito-R', width: '75%' }} placeholder='Nhập huyết áp' />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Nhịp tim (bpm): </Text>
                                <TextInput value={payloadData.bookingNormal?.healthRate} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, healthRate: e })} style={{ fontFamily: 'Nunito-R', width: '75%' }} placeholder='Nhập nhịp tim' />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 5, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                            <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Đính kèm hình ảnh mô tả (nếu có)
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', width: '80%', marginTop: 5 }}>
                                <TouchableOpacity onPress={() => openGallery()} style={{ flexDirection: 'column', gap: 5, borderRadius: 5, alignItems: 'center' }}>
                                    <Icon2 name='image' style={{ fontSize: 25 }} />
                                    <Text style={{ fontSize: 13, fontFamily: 'Nunito-S' }}>Thêm Ảnh</Text>
                                </TouchableOpacity>
                                {payloadData.bookingImages.map((image, index) => (
                                    <Image key={index} source={{ uri: image.uri }} style={{ width: 60, height: 60 }} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setStep(1)} style={{ borderRadius: 5, marginTop: 10, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Bước Tiếp Theo</Text>
                        </TouchableOpacity>
                    </View>
                    <ChoosePayment step={step} setStep={setStep} />
                    <Complete />
                </>)}
            </ScrollView>
        </Animated.View>
    )
}

export default InformationBookingNormal