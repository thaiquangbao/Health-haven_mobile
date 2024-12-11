import React, { useContext } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native';
import { Image, Text, View } from 'react-native'
import { userContext } from '../../contexts/UserContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { api, TypeHTTP } from '../../utils/api';
import { utilsContext } from '../../contexts/UtilsContext';
import { menuContext } from '../../contexts/MenuContext';
import { notifyType } from '../../utils/notify';
import CompleteImage from '../../../assets/payment-successfully.png'

const Complete = ({ setStep }) => {
    const { userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { utilsHandler } = useContext(utilsContext)
    const { menuHandler } = useContext(menuContext)

    const handleGoBack = () => {
        payloadHandler.setBookingHealth()
        payloadHandler.setDoctorRecord()
        menuHandler.setDisplayInformationBookingHealth(false)
        payloadHandler.setReload(!payloadData.reload)
    }


    return (
        <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 60 }}>
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Hoàn thành đặt khám</Text>
            <Image source={CompleteImage} style={{ width: 300, height: 150 }} />
            <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, paddingHorizontal: 50, textAlign: 'center', marginTop: 10 }}>Cảm ơn bạn đã hoàn tất thủ tục đăng ký theo dõi sức khỏe với bác sĩ {payloadData.doctorRecord?.doctor?.fullName}, hãy chờ bác sĩ chấp nhận cuộc hẹn và bắt đầu hành trình theo dõi sức khỏe của bạn.</Text>

            <TouchableOpacity onPress={() => handleGoBack()} style={{ borderRadius: 5, width: 250, borderWidth: 2, borderColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
                <Text style={{ color: '#1dcbb6', fontFamily: 'Nunito-B' }}>Trở về</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Complete