import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { screenContext } from '../contexts/ScreenContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
const NotificationScreen = () => {
  const { width } = Dimensions.get('window');
  const { menuHandler } = useContext(menuContext)
  const { payloadHandler } = useContext(payloadContext)
  const { screenHandler } = useContext(screenContext)
  const { userData } = useContext(userContext)
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    if (userData.user) {
      api({ path: `/notices/get-by-user/${userData.user?._id}`, type: TypeHTTP.GET, sendToken: false })
        .then(res => {
          setNotifications(res)
        })
    }
  }, [userData.user])
  const navigate = (goal) => {
    menuHandler.setDisplay(false)
    screenHandler.navigate(goal)
  }
  const clickNotice = (item) => {
    if (item.category === "APPOINTMENT" && userData.user?.role === "USER") {
      api({
        type: TypeHTTP.POST,
        body: { _id: item._id, seen: true },
        sendToken: false,
        path: "/notices/update",
      }).then((res) => {
        if (item.title.toLowerCase().trim() === "lịch hẹn") {
          api({
            sendToken: false,
            path: `/appointments/get-one/${item.attached}`,
            type: TypeHTTP.GET,
          }).then((res1) => {
            // appointmentHandler.showFormDetailAppointment(
            //   res1,
            //   false
            // );
            navigate('appointments')
          });
        } else {
          navigate('appointments')
        }
      });
    } else if (item.category === "HEARTLOGBOOK" && userData.user?.role === "USER") {
      api({
        type: TypeHTTP.POST,
        body: { _id: item._id, seen: true },
        sendToken: false,
        path: "/notices/update",
      }).then((res) => {
        navigate('follow-health');
      });
    } else if (item.title.toLowerCase().trim() === "cảnh báo sức khỏe" && userData.user?.role === "DOCTOR") {
      api({
        type: TypeHTTP.POST,
        body: { _id: item._id, seen: true },
        sendToken: false,
        path: "/notices/update",
      }).then((res) => {
        navigate('my-patient');
      });
    } else if (item.category === "SCHEDULE" && userData.user?.role === "DOCTOR") {
      api({
        type: TypeHTTP.POST,
        body: { _id: item._id, seen: true },
        sendToken: false,
        path: "/notices/update",
      }).then((res) => {
        navigate('doctor-record')
      });
    } else {
      api({
        type: TypeHTTP.POST,
        body: { _id: item._id, seen: true },
        sendToken: false,
        path: "/notices/update",
      }).then((res) => {
        if (
          item.title.toLowerCase().trim() === "lịch hẹn") {
          api({
            sendToken: false,
            path: `/appointments/get-one/${item.attached}`,
            type: TypeHTTP.GET,
          }).then((res1) => {
            // appointmentHandler.showFormDetailAppointment(
            //   res1,
            //   false
            // );
            navigate('tickets')
          });
        } else {
          navigate('tickets')
        }
      });
    }

  }
  return (
    <ScrollView>
      {/* {screenData.currentScreen === 1 && ( */}
      <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 20, fontFamily: 'Nunito-B' }}>Danh sách thông báo</Text>
          <View style={{ width: 25, height: 25, backgroundColor: '#DD0000', borderRadius: 100, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, color: 'white', textAlign: 'center' }}>{notifications.filter(item => item.seen === false).length}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}>
          {notifications.length > 0 ? notifications.slice().reverse().map((item, index) => (
            <TouchableOpacity onPress={() => clickNotice(item)} key={index} style={{ flexDirection: 'column', width: '100%', padding: 10, backgroundColor: '#f8f9f9', backgroundColor: '#f8f9f9', borderBottomWidth: 2, borderBottomColor: 'white' }}>

              <Text style={{ fontSize: 17, color: '#0099FF', fontFamily: 'Nunito-B' }}>{item.title}</Text>
              <Text style={{ fontSize: 16, color: '#222222', fontFamily: 'Nunito-S' }}>{item.content}</Text>
              <Text style={{ fontSize: 15, color: '#222222', fontFamily: 'Nunito-S' }}> Ngày: {item.date.day}/{item.date.month}/{item.date.year}</Text>
              {item.seen === false && (
                <View style={{ position: 'absolute', top: 15, right: 12, width: 8, height: 8, backgroundColor: '#00FF00', borderRadius: 4 }}></View>
              )}
            </TouchableOpacity>
          )) : (
            <View>
              <Text style={{ fontSize: 16, color: '#222222', fontFamily: 'Nunito-S', marginTop: 20 }}>Chưa có thông báo</Text>
            </View>
          )}
        </View>
      </View>
      {/* )} */}
    </ScrollView>
  )
}

export default NotificationScreen