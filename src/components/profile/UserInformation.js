import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';

const UserInformation = ({ user, setUser }) => {
  const { userData } = useContext(userContext);
  const { width } = Dimensions.get('window');
  return (
    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center', gap: 10, paddingVertical: 10, gap: 10 }}>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Họ và tên: </Text>
        <TextInput onChangeText={e => setUser({ ...user, fullName: e })} value={user?.fullName} placeholder='Họ và tên...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Ngày sinh: </Text>
        <TextInput onChangeText={e => setUser({ ...user, dateOfBirth: e })} value={user?.dateOfBirth} placeholder='Ngày sinh...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Giới tính: </Text>
        <TextInput onChangeText={e => setUser({ ...user, sex: e === 'Nam' ? true : false })} value={user?.sex === true ? 'Nam' : 'Nữ'} placeholder='Giới tính...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />

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
      {userData.user?.role === 'DOCTOR' && (
        <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
          <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Chuyên khoa: </Text>
          <TextInput value={user?.specialize} onChangeText={e => setUser({ ...user, specialize: e })} placeholder='Chuyên khoa...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
        </View>
      )}
    </View>
  )
}
export default UserInformation;