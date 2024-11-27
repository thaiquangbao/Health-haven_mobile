import React, { useContext, useState } from 'react'
import { Dimensions, Platform } from 'react-native';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Sign from '../../../assets/sign.png'
import Logo from '../../../assets/logo.png'
import DateTimePicker from '@react-native-community/datetimepicker';
import { utilsContext } from '../../contexts/UtilsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import { menuContext } from '../../contexts/MenuContext';
import { notifyType } from '../../utils/notify';
const CompleteInformation = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { utilsHandler } = useContext(utilsContext)
    const { userHandler, userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [gender, setGender] = useState()
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [cccd, setCccd] = useState('')
    const [bankName, setBankName] = useState('')
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')

    const handleSelect = (value) => {
        setGender(Boolean(value))
    };

    const handleCompleteInfo = () => {
        if (!/^[A-ZÀ-Ỹ][a-zà-ỹ]+(\s[A-ZÀ-Ỹ][a-zà-ỹ]+)+$/.test(name)) {
            utilsHandler.notify(notifyType.WARNING, 'Họ Tên Không Hợp Lệ')
            return;
        }
        if (!dateOfBirth || new Date().getFullYear() - new Date(dateOfBirth).getFullYear() - (new Date().getMonth() < new Date(dateOfBirth).getMonth() || (new Date().getMonth() === new Date(dateOfBirth).getMonth() && new Date().getDate() < new Date(dateOfBirth).getDate())) < 18) {
            utilsHandler.notify(notifyType.WARNING, 'Phải trên 18 tuổi')
            return;
        }
        if (!/^[0-9]{9}$/.test(cccd) && !/^[0-9]{12}$/.test(cccd)) {
            utilsHandler.notify(notifyType.WARNING, "Căn cước công dân phải chứa 9 hoặc 12 số");
            return;
        }
        if (address === '') {
            utilsHandler.notify(notifyType.WARNING, "Vui lòng nhập địa chỉ");
            return;
        }
        if (!/^[A-Za-z]+$/.test(bankName)) {
            utilsHandler.notify(notifyType.WARNING, "Tên ngân hàng không hợp lệ");
            return;
        }
        if (!/^[A-Z]+$/.test(accountName)) {
            utilsHandler.notify(notifyType.WARNING, "Tên tài khoản phải là chữ in hoa");
            return;
        }
        if (!/^[0-9]+$/.test(accountNumber)) {
            utilsHandler.notify(notifyType.WARNING, "Tên tài khoản phải là ký tự số");
            return;
        }
        if (gender !== true && gender !== false) {
            utilsHandler.notify(notifyType.WARNING, 'Vui lòng chọn giới tính')
            return;
        }
        let user = {
            ...userData.user,
            processSignup: 3,
            image: 'https://th.bing.com/th/id/R.be953f29410b3d18ef0e5e0fbd8d3120?rik=Dm2iDRVLgVcpdA&pid=ImgRaw&r=0',
            fullName: name,
            address: address,
            dateOfBirth: dateOfBirth,
            bank: {
                accountNumber,
                bankName,
                accountName,
            },
            sex: gender,
            cccd: cccd
        }
        api({ type: TypeHTTP.POST, body: { ...user }, path: `/auth/update`, sendToken: false })
            .then(res => {
                api({ type: TypeHTTP.POST, body: { _id: res._id }, path: `/auth/generateToken`, sendToken: false })
                    .then(async (token) => {
                        await AsyncStorage.setItem('accessToken', token.accessToken)
                        await AsyncStorage.setItem('refreshToken', token.refreshToken)
                        userHandler.setUser(res)
                        utilsHandler.notify(notifyType.SUCCESS, 'Đã Hoàn Thành Thông Tin Tài Khoản')
                        menuHandler.setDisplaySignUp(false)
                    })
            })
    }

    return (
        <View style={{ width, flexDirection: 'column', alignItems: 'center' }}>

            {showPicker && (
                <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', backgroundColor: 'white', left: 50, zIndex: 50, borderRadius: 30 }}>
                    <DateTimePicker
                        mode="date"
                        display="spinner"
                        value={date}
                        onChange={({ type }, selectedDate) => {
                            if (type === "set") {
                                setDateOfBirth(selectedDate)
                                if (Platform.OS === 'android') {
                                    setDateOfBirth(selectedDate)
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


            <Image source={Logo} style={{ width: 200, height: 200, marginTop: '5%' }} />
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 22 }}>Hoàn Thành Thông Tin Cá Nhân</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center', marginTop: 5 }}>Hãy bổ sung thông tin cá nhân của bạn ở bên dưới.</Text>
            <TextInput value={name} onChangeText={e => setName(e)} placeholder='Họ Và Tên' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, width: '75%', borderColor: '#bbb', height: 48, borderWidth: 1 }} onPress={() => setShowPicker(true)}>
                <Text style={{ color: '#999' }}>
                    {dateOfBirth.getDate() + "/" + (dateOfBirth.getMonth() + 1) + "/" + dateOfBirth.getFullYear()}
                </Text>
            </TouchableOpacity>
            <TextInput value={cccd} onChangeText={e => setCccd(e)} placeholder='Căn Cước Công Dân' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={address} onChangeText={e => setAddress(e)} placeholder='Địa Chỉ' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={bankName} onChangeText={e => setBankName(e)} placeholder='Tên Ngân Hàng' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={accountName} onChangeText={e => setAccountName(e)} placeholder='Tên Tài Khoản Ngân Hàng' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={accountNumber} onChangeText={e => setAccountNumber(e)} placeholder='Số Tài Khoản' style={{ color: 'black', marginTop: 10, height: 48, zIndex: 1, width: '75%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <View style={{ flexDirection: 'row', gap: 10, height: 48, marginTop: 10, justifyContent: 'flex-start', width: '75%' }}>
                <RadioButton
                    label="Nam"
                    value={true}
                    selected={gender === true}
                    onSelect={handleSelect}
                />
                <RadioButton
                    label="Nữ"
                    value={false}
                    selected={gender === false}
                    onSelect={handleSelect}
                />
            </View>
            <TouchableOpacity onPress={() => handleCompleteInfo()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Hoàn Thành</Text>
            </TouchableOpacity>
        </View>
    )
}

export default CompleteInformation



export const RadioButton = ({ label, value, selected, onSelect }) => {
    return (
        <TouchableOpacity onPress={() => onSelect(value)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <View
                style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected ? '#2ecc71' : '#ccc',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {selected ? (
                    <View style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: '#2ecc71',
                    }} />
                ) : null}
            </View>
            <Text style={{ marginLeft: 10, color: 'black', fontFamily: 'Nunito-S' }}>{label}</Text>
        </TouchableOpacity>
    );
};