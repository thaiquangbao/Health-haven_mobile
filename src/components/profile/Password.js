import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { userContext } from '../../contexts/UserContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { api, TypeHTTP } from '../../utils/api';
import { notifyType } from '../../utils/notify';
const Password = () => {
  const { userData, userHandler } = useContext(userContext)
  const { width } = Dimensions.get('window');
  const { utilsHandler } = useContext(utilsContext)
  const [info, setInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const handleUpdatePassword = () => {
    if (info.oldPassword.length < 6) {
      utilsHandler.notify(
        notifyType.WARNING,
        "Mật khẩu cũ phải lớn hơn 6 ký tự !!!"
      );

      return
    }
    if (info.newPassword.length < 6) {
      utilsHandler.notify(
        notifyType.WARNING,
        "Mật khẩu mới phải lớn hơn 6 ký tự !!!"
      );

      return
    }
    if (info.newPassword !== info.confirmNewPassword) {
      utilsHandler.notify(
        notifyType.WARNING,
        "Mật khẩu mới xác nhận phải trùng khớp với mật khẩu mới !!!"
      );
      return
    }
    api({ sendToken: true, path: `/auth/update-password/${userData.user?.role === 'DOCTOR' ? 'doctor' : 'patient'}/${userData.user?._id}`, type: TypeHTTP.PUT, body: { newPassWord: info.newPassword, oldPassWord: info.oldPassword } })
      .then(res => {
        userHandler.setUser(res)
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Cập nhật mật khẩu thành công !!!"
        );
      })
      .catch(error => {
        utilsHandler.notify(
          notifyType.FAIL,
          error.message
        );
      })
  }
  return (
    <View style={{ flexDirection: 'column', width: '100%', gap: 10, paddingVertical: 10, gap: 10 }}>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Mật khẫu cũ: </Text>
        <TextInput value={info.oldPassword} onChangeText={e => setInfo({ ...info, oldPassword: e })} placeholder='Mật khẫu cũ...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Mật khẩu mới: </Text>
        <TextInput value={info.newPassword} onChangeText={e => setInfo({ ...info, newPassword: e })} placeholder='Mật khẩu mới...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <Text style={{ width: '85%', fontSize: 16, color: 'black', fontFamily: 'Nunito-S' }}>Xác nhận mật khẩu mới: </Text>
        <TextInput value={info.confirmNewPassword} onChangeText={e => setInfo({ ...info, confirmNewPassword: e })} placeholder='Xác nhận mật khẩu mới...' style={{ color: 'black', height: 45, zIndex: 1, width: '85%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
      </View>
      <View style={{ flexDirection: 'column', gap: 5, width: '100%', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => handleUpdatePassword()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '85%', marginTop: 10 }}>
          <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Cập nhật mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};
export default Password;