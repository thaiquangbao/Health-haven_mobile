import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton } from '../auth/CompleteInformation';

const UserInformation = ({ user, setUser }) => {
  const { userData } = useContext(userContext);
  const { width } = Dimensions.get('window');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user) {
      setDate(user.
        dateOfBirth
      )
    }
  }, [user])

  return (
    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center', gap: 10, paddingVertical: 10, gap: 10, position: 'relative' }}>
      {showPicker && (
        <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', backgroundColor: 'white', left: 50, zIndex: 50, borderRadius: 30 }}>
          <DateTimePicker
            mode="date"
            display="spinner"
            value={new Date(date)}
            onChange={({ type }, selectedDate) => {
              if (type === "set") {
                if (Platform.OS === 'android') {
                  setUser({ ...user, dateOfBirth: selectedDate })
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
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Họ và tên: </Text>
        <TextInput onChangeText={e => setUser({ ...user, fullName: e })} value={user?.fullName} placeholder='Họ và tên...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Ngày sinh: </Text>
        <TouchableOpacity style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, fontSize: 16, backgroundColor: 'white', borderRadius: 7, width: '85%', borderColor: '#bbb', height: 48, borderWidth: 1 }} onPress={() => setShowPicker(true)}>
          <Text style={{ color: '#999' }}>
            {new Date(user?.dateOfBirth).getDate() + "/" + (new Date(user?.dateOfBirth).getMonth() + 1) + "/" + new Date(user?.dateOfBirth).getFullYear()}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Email: </Text>
        <TextInput value={user?.email} onChangeText={e => setUser({ ...user, email: e })} placeholder='Địa chỉ email...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Số điện thoại: </Text>
        <TextInput editable={false} value={user?.phone} placeholder='Số điện thoại...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: '#eeeeee', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Địa chỉ: </Text>
        <TextInput value={user?.address} onChangeText={e => setUser({ ...user, address: e })} placeholder='Địa chỉ...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Căn cước công dân: </Text>
        <TextInput value={user?.cccd} onChangeText={e => setUser({ ...user, cccd: e })} placeholder='Căn cước công dân' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      {userData.user?.role === 'DOCTOR' && (
        <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
          <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Chuyên khoa: </Text>
          <TextInput value={user?.specialize} onChangeText={e => setUser({ ...user, specialize: e })} placeholder='Chuyên khoa...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
        </View>
      )}
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Giới tính: </Text>
        <View style={{ flexDirection: 'row', gap: 10, height: 38, justifyContent: 'flex-start', width: '85%' }}>
          <RadioButton
            label="Nam"
            value={true}
            selected={user?.sex === true}
            onSelect={() => setUser({ ...user, sex: true })}
          />
          <RadioButton
            label="Nữ"
            value={false}
            selected={user?.sex === false}
            onSelect={() => setUser({ ...user, sex: false })}
          />
        </View>
      </View>
    </View>
  )
}
export default UserInformation;