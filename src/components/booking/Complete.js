import React, { useContext } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native';
import { Image, Text, View } from 'react-native'
import { userContext } from '../../contexts/UserContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { api, TypeHTTP } from '../../utils/api';
import { utilsContext } from '../../contexts/UtilsContext';
import { menuContext } from '../../contexts/MenuContext';
import { notifyType } from '../../utils/notify';

const Complete = ({ setStep }) => {
    const { userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { utilsHandler } = useContext(utilsContext)
    const { menuHandler } = useContext(menuContext)

    const handleSubmit = () => {
        payloadHandler.setBookingNormal()
        payloadHandler.setDoctorRecord()
        menuHandler.setDisplayInformationBookingNormal(false)
        payloadHandler.setReload(!payloadData.reload)
    }

    return (
        <View style={{ width, flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 60 }}>
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Hoàn thành đặt khám</Text>

            <View style={{ flexDirection: 'column', gap: 10, borderRadius: 5, width: '85%', borderWidth: 1, borderColor: '#cacfd2', marginTop: 10 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-S' }}>Trạng Thái Thanh Toán</Text>
                </View>
                <View style={{ alignItems: 'start', flexDirection: 'column', gap: 15, borderRadius: 5, width: '100%', borderBottomWidth: 1, borderColor: '#cacfd2', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-B', borderRadius: 5 }}>Thanh Toán Thành Công</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => handleSubmit()} style={{ borderRadius: 5, marginTop: 10, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
                <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Hoàn Tất</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Complete