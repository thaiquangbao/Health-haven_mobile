import React, { useContext, useEffect, useState } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { bookingHomeContext } from '../../contexts/BookingHomeContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { convertDateToDayMonthYearVietNam } from '../../utils/date';
import { formatMoney } from '../../utils/other';

const FormNotificationPayment = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width, height } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayNotificationPayment === true ? 0 : width));
    const { payloadData, payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayNotificationPayment === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayNotificationPayment]);


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
                <TouchableOpacity onPress={() => menuHandler.setDisplayNotificationPayment(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', height, paddingTop: 40, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 600, width: '100%', marginBottom: 5 }}>Hẹn khám tại nhà</Text>
                <Text style={{ fontSize: 16, fontWeight: 400, width: '100%', marginBottom: 10 }}>Bác sĩ đã chấp nhận, hãy thanh toán để xác nhận cuộc hẹn</Text>
                {payloadData.paymentBookingHome.map((home, index) => (
                    <TouchableOpacity onPress={() => {
                        payloadHandler.setBookingHome(home)
                        menuHandler.setDisplayNotificationPayment(false)
                        menuHandler.setDisplayInformationBookingHome(true)
                    }} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderRadius: 6, borderWidth: 1, borderColor: '#999', width: '100%', paddingVertical: 10 }}>
                        <View style={{ flexDirection: 'column', gap: 5 }}>
                            <Text style={{ fontSize: 15, fontWeight: 600 }}>{convertDateToDayMonthYearVietNam(home.appointment_date)}</Text>
                            <Text>Hẹn khám tại nhà</Text>
                        </View>
                        <Text>{formatMoney(home.price_list.price)} đ</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
    )
}

export default FormNotificationPayment