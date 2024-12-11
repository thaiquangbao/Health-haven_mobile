import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton } from '../../auth/CompleteInformation';
import { utilsContext } from '../../../contexts/UtilsContext';
import { notifyType } from '../../../utils/notify';
import { api, TypeHTTP } from '../../../utils/api';

const InformationBookingNormal = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayInformationBookingNormal === true ? 0 : width));
    const scrollViewRef = useRef(null);
    const [step, setStep] = useState(0)
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const { utilsHandler } = useContext(utilsContext)
    const [customer, setCustomer] = useState()

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

    function checkIntegerString(value) {
        const parsedValue = Number(value);
        if (
            !isNaN(parsedValue) &&
            Number.isInteger(parsedValue)
        ) {
            return true;
        } else {
            return false;
        }
    }

    const handleNextStep = () => {
        if (!userData.user) {
            if (!payloadData.bookingNormal?.patient?.fullName) {
                utilsHandler.notify(notifyType.WARNING, "Họ Tên Không Hợp Lệ");
                return;
            } else {
                const name = payloadData.bookingNormal?.patient?.fullName.trim().replace(/\s+/g, ' ');
                if (!/^[A-ZÀ-Ỹ][a-zà-ỹ]*(\s[A-ZÀ-Ỹ][a-zà-ỹ]*)*$/.test(name)) {
                    utilsHandler.notify(notifyType.WARNING, "Họ Tên Không Hợp Lệ");
                    return;
                }
            }
            if (!/^0[0-9]{9}$/.test(payloadData.bookingNormal?.patient?.phone)) {
                utilsHandler.notify(notifyType.WARNING, "Số điện thoại không hợp lệ");
                return;
            }
            if (!payloadData.bookingNormal?.patient?.email) {
                utilsHandler.notify(notifyType.WARNING, "Email không hợp lệ");
                return;
            }
            if (
                !payloadData.bookingNormal?.patient?.dateOfBirth ||
                new Date().getFullYear() -
                new Date(payloadData.bookingNormal?.patient?.dateOfBirth).getFullYear() -
                (new Date().getMonth() < new Date(payloadData.bookingNormal?.patient?.dateOfBirth).getMonth() ||
                    (new Date().getMonth() ===
                        new Date(payloadData.bookingNormal?.patient?.dateOfBirth).getMonth() &&
                        new Date().getDate() <
                        new Date(payloadData.bookingNormal?.patient?.dateOfBirth).getDate())) <
                18
            ) {
                utilsHandler.notify(notifyType.WARNING, "Phải trên 18 tuổi");
                return;
            }
            if (payloadData.bookingNormal?.patient?.sex !== false && payloadData.bookingNormal?.patient?.sex !== true) {
                utilsHandler.notify(notifyType.WARNING, "Vui lòng chọn giới tính");
                return;
            }
            if (!/^[0-9]{9}$/.test(payloadData.bookingNormal?.patient?.cccd) && !/^[0-9]{12}$/.test(payloadData.bookingNormal?.patient?.cccd)) {
                utilsHandler.notify(notifyType.WARNING, "Căn cước công dân phải chứa 9 hoặc 12 số");
                return;
            }
            if (!payloadData.bookingNormal?.patient?.address) {
                utilsHandler.notify(notifyType.WARNING, "Địa chỉ không hợp lệ");
                return;
            }
            if (!payloadData.bookingNormal?.patient?.bank?.bankName || !/^[A-Za-z]+$/.test(payloadData.bookingNormal?.patient?.bank?.bankName)) {
                utilsHandler.notify(notifyType.WARNING, "Tên ngân hàng không hợp lệ");
                return;
            }
            if (!/^[A-Z]+$/.test(payloadData.bookingNormal?.patient?.bank?.accountName)) {
                utilsHandler.notify(notifyType.WARNING, "Tên tài khoản phải là chữ in hoa");
                return;
            }
            if (!/^[0-9]+$/.test(payloadData.bookingNormal?.patient?.bank?.accountNumber)) {
                utilsHandler.notify(notifyType.WARNING, "Số tài khoản phải là ký tự số");
                return;
            }
        }
        if (
            payloadData.bookingNormal?.weight !== "" &&
            payloadData.bookingNormal.weight
        )
            if (
                !checkIntegerString(payloadData.bookingNormal?.weight)
            ) {
                utilsHandler.notify(
                    notifyType.WARNING,
                    "Chỉ được nhập dữ liệu số cho cân nặng"
                );
                return;
            }
        if (
            payloadData.bookingNormal?.height !== "" &&
            payloadData.bookingNormal?.height
        )
            if (
                !checkIntegerString(payloadData.bookingNormal?.height)
            ) {
                utilsHandler.notify(
                    notifyType.WARNING,
                    "Chỉ được nhập dữ liệu số cho chiều cao"
                );
                return;
            }
        if (
            payloadData.bookingNormal?.healthRate !== "" &&
            payloadData.bookingNormal?.healthRate
        )
            if (
                !checkIntegerString(payloadData.bookingNormal?.healthRate)
            ) {
                utilsHandler.notify(
                    notifyType.WARNING,
                    "Chỉ được nhập dữ liệu số cho nhịp tim"
                );
                return;
            }
        if (
            payloadData.bookingNormal?.temperature !== "" &&
            payloadData.bookingNormal?.temperature
        )
            if (
                !checkIntegerString(
                    payloadData.bookingNormal?.temperature
                )
            ) {
                utilsHandler.notify(
                    notifyType.WARNING,
                    "Chỉ được nhập dữ liệu số cho nhiệt độ"
                );
                return;
            }
        if (
            payloadData.bookingNormal?.bloodPressure !== "" &&
            payloadData.bookingNormal?.bloodPressure
        )
            if (
                !checkIntegerString(
                    payloadData.bookingNormal?.bloodPressure.split("/")[0]
                ) ||
                !checkIntegerString(
                    payloadData.bookingNormal?.bloodPressure.split("/")[1]
                )
            ) {
                utilsHandler.notify(
                    notifyType.WARNING,
                    "Chỉ được nhập dữ liệu số (tâm thu/tâm trương) cho huyết áp"
                );
                return;
            }
        if (userData.user) {
            setStep(1)
        } else {
            api({
                body: payloadData.bookingNormal,
                type: TypeHTTP.POST,
                path: "/customers/save",
                sendToken: false,
            })
                .then((res) => {
                    setStep(1)
                    setCustomer(res)
                })
                .catch((err) => {
                    utilsHandler.notify(
                        notifyType.WARNING,
                        err.message
                    );
                    return;
                });
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
            {showPicker && (
                <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', backgroundColor: 'white', left: 50, zIndex: 50, borderRadius: 30 }}>
                    <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={new Date(date)}
                        onChange={({ type }, selectedDate) => {
                            if (type === "set") {
                                if (Platform.OS === 'android') {
                                    payloadHandler.setBookingNormal({
                                        ...payloadData.bookingNormal, patient: {
                                            ...payloadData.bookingNormal.patient,
                                            dateOfBirth: selectedDate
                                        },
                                    })
                                    setDate(selectedDate)
                                    setShowPicker(false)
                                }
                            } else {
                                setShowPicker(false)
                            }
                        }}
                    />
                    {Platform.OS === 'ios' && (
                        <View style={{ paddingVertical: 10, flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={{ fontSize: 17, fontWeight: 'bold' }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
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
                    <ScrollView>
                        <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 50, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Thông Tin Đặt Khám</Text>
                            {userData.user ? (
                                <View style={{ flexDirection: 'row', gap: 15, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Image source={{ uri: userData.user?.image }} style={{ height: 55, width: 55, borderRadius: 55 }} />
                                    <View style={{ flexDirection: 'column', gap: 1 }}>
                                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Bệnh Nhân</Text>
                                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{userData.user?.fullName}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Thông Tin Bệnh Nhân</Text>
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                fullName: e
                                            },
                                        })}
                                        placeholder='Họ và tên...' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                phone: e
                                            },
                                        })}
                                        placeholder='Số điện thoại' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                email: e
                                            },
                                        })}
                                        placeholder='Email' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, borderColor: '#bbb', height: 48, borderWidth: 1 }} onPress={() => setShowPicker(true)}>
                                        <Text style={{ color: '#999' }}>
                                            {new Date(date).getDate() + "/" + (new Date(date).getMonth() + 1) + "/" + new Date(date).getFullYear()}
                                        </Text>
                                    </TouchableOpacity>
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                cccd: e
                                            },
                                        })}
                                        placeholder='Căn cước công dân' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                address: e
                                            },
                                        })}
                                        placeholder='Địa chỉ' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                bank: {
                                                    ...payloadData.bookingNormal.patient?.bank,
                                                    bankName: e,
                                                },
                                            },
                                        })}
                                        placeholder='Tên ngân hàng' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                bank: {
                                                    ...payloadData.bookingNormal.patient?.bank,
                                                    accountName: e,
                                                },
                                            },
                                        })}
                                        placeholder='Tên chủ tài khoản' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <TextInput
                                        onChangeText={e => payloadHandler.setBookingNormal({
                                            ...payloadData.bookingNormal, patient: {
                                                ...payloadData.bookingNormal.patient,
                                                bank: {
                                                    ...payloadData.bookingNormal.patient?.bank,
                                                    accountNumber: e,
                                                },
                                            },
                                        })}
                                        placeholder='Số tài khoản' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
                                    <View style={{ flexDirection: 'row', gap: 10, height: 38, justifyContent: 'flex-start', width: '85%' }}>
                                        <RadioButton
                                            label="Nam"
                                            value={true}
                                            selected={payloadData.bookingNormal.patient?.sex === true}
                                            onSelect={() => payloadHandler.setBookingNormal({
                                                ...payloadData.bookingNormal, patient: {
                                                    ...payloadData.bookingNormal.patient,
                                                    sex: true
                                                },
                                            })}
                                        />
                                        <RadioButton
                                            label="Nữ"
                                            value={false}
                                            selected={payloadData.bookingNormal.patient?.sex === false}
                                            onSelect={() => payloadHandler.setBookingNormal({
                                                ...payloadData.bookingNormal, patient: {
                                                    ...payloadData.bookingNormal.patient,
                                                    sex: false
                                                },
                                            })}
                                        />
                                    </View>
                                </View>
                            )}
                            <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Text>Giờ Hẹn: </Text>
                                    <Text style={{ backgroundColor: 'blue', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{payloadData.bookingNormal?.appointment_date?.time}</Text>
                                    <Text style={{ backgroundColor: '#1dcbb6', color: 'white', fontFamily: 'Nunito-S', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>{convertDateToDayMonthYear(payloadData.bookingNormal?.appointment_date)}</Text>
                                </View>
                                <View style={{ alignItems: 'start', flexDirection: 'row', gap: 15, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 5 }}>
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
                            <View style={{ flexDirection: 'column', justifyContent: 'start', gap: 5, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 15, paddingHorizontal: 20, paddingVertical: 10 }}>
                                <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Chỉ số (nếu có)</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Cân Nặng (kg): </Text>
                                    <TextInput value={payloadData.bookingNormal?.weight} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, weight: e })} style={{ fontFamily: 'Nunito-R', width: 150, height: 40 }} placeholder='Nhập cân nặng' />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Chiều cao (cm): </Text>
                                    <TextInput value={payloadData.bookingNormal?.height} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, height: e })} style={{ fontFamily: 'Nunito-R', width: 150, height: 40 }} placeholder='Nhập chiều cao' />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Huyết áp (mmHg): </Text>
                                    <TextInput value={payloadData.bookingNormal?.bloodPressure} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, bloodPressure: e })} style={{ fontFamily: 'Nunito-R', width: 150, height: 40 }} placeholder='Nhập huyết áp' />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Nhịp tim (bpm): </Text>
                                    <TextInput value={payloadData.bookingNormal?.healthRate} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, healthRate: e })} style={{ fontFamily: 'Nunito-R', width: 150, height: 40 }} placeholder='Nhập nhịp tim' />
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Nhiệt độ (°C): </Text>
                                    <TextInput value={payloadData.bookingNormal?.temperature} onChangeText={e => payloadHandler.setBookingNormal({ ...payloadData.bookingNormal, temperature: e })} style={{ fontFamily: 'Nunito-R', width: 150, height: 40 }} placeholder='Nhập nhiệt độ' />
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
                            <TouchableOpacity onPress={() => handleNextStep()} style={{ borderRadius: 5, marginTop: 10, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
                                <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Bước Tiếp Theo</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <ChoosePayment step={step} setStep={setStep} customer={customer} />
                    <Complete />
                </>)}
            </ScrollView>
        </Animated.View>
    )
}

export default InformationBookingNormal