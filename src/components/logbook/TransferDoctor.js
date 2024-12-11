import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { api, TypeHTTP } from '../../utils/api';
import { compare2Date, compareTimeDate1GreaterThanDate2, convertDateToDayMonthYearObject, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam, isALargerWithin10Minutes, isALargerWithin60Minutes, sortByAppointmentDate } from '../../utils/date';
import { notifyType } from '../../utils/notify';
const TransferDoctor = ({ hidden, logBook }) => {
  const { menuData, menuHandler } = useContext(menuContext);
  const { width } = Dimensions.get('window');
  const { payloadData, payloadHandler } = useContext(payloadContext)
  const [dsDoctors, setDsDoctors] = useState([]);
  const { utilsHandler } = useContext(utilsContext)
  useEffect(() => {
    if (logBook?.doctor) {
      api({ path: "/doctorRecords/getAll", type: TypeHTTP.GET, sendToken: false })
        .then((res) => {
          const filteredResults = res.filter((item) => {
            return item.doctor?._id !== logBook.doctor._id;
          });
          setDsDoctors(filteredResults)
        });

    }

  }, [logBook?.doctor]);
  const handleTransferToDoctor = (doctor) => {
    const doctorUpdate = {
      fullName: doctor.doctor.fullName,
      phone: doctor.doctor.phone,
      image: doctor.doctor.image,
      _id: doctor.doctor._id,
      specialize: doctor.doctor.specialize,
      email: doctor.doctor.email
    }
    const body = {
      _id: logBook._id,
      doctor: doctorUpdate,
      status: {
        status_type: "CANCELED",
        message: 'Chuyển sang bác sĩ khác'
      },
      statusNew: {
        status_type: "QUEUE",
        message: "Đang chờ bác sĩ xác nhận"
      }
    }
    // sửa chổ này
    api({ type: TypeHTTP.POST, sendToken: true, path: '/healthLogBooks/transfer-doctor', body })
      .then(res => {
        utilsHandler.notify(
          notifyType.SUCCESS,
          `Chuyển hồ sơ bệnh nhân cho bác sĩ ${doctor.doctor.fullName} thành công`
        );
        hidden();
        utilsHandler.setReload(true)
      })
  }
  return (
    <>
      <View style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: 'white', top: 30, flexDirection: 'column', gap: 20 }}>
        <View style={{ position: 'absolute', right: 15, top: 15, }}>
          <TouchableOpacity onPress={() => hidden()}>
            <Icon name="x" style={{ fontSize: 25 }} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 22, color: 'black', fontFamily: 'Nunito-B' }}>Danh sách bác sĩ</Text>
        </View>
        <ScrollView style={{ width: '100%', paddingHorizontal: 5, flexDirection: 'column' }}>
          <View style={{ flexDirection: 'column', paddingBottom: 50 }}>
            {dsDoctors.map((item, index) => (
              <View key={index} style={{ marginTop: 10, flexDirection: 'row', gap: 10, backgroundColor: 'white', justifyContent: 'flex-start', padding: 10, borderWidth: 2, borderColor: '#F5F5F5', borderRadius: 5 }}>
                <View style={{ height: 60, width: 60, borderWidth: 1, borderColor: '#1dcbb6', overflow: 'hidden', borderRadius: 150 }}>
                  <Image source={{ uri: item.doctor?.image }} style={{ height: 90, width: 60 }} />
                </View>
                <View style={{ gap: 3, marginLeft: 20, flexDirection: 'column', alignItems: 'start', justifyContent: 'start' }}>
                  <Text style={{ fontSize: 18, color: 'black', fontFamily: 'Nunito-S' }}>{item.doctor?.fullName}</Text>
                  <Text style={{ fontSize: 13, color: 'black', fontFamily: 'Nunito-S' }}>Khoa: {item.doctor?.specialize}</Text>
                  <Text style={{ fontSize: 13, color: 'black', fontFamily: 'Nunito-S' }}>Khu vực: {item.area}</Text>
                  <Text style={{ fontSize: 13, color: 'black', fontFamily: 'Nunito-S' }}>Số điện thoại: {item.doctor?.phone}</Text>
                  <TouchableOpacity onPress={() => handleTransferToDoctor(item)} style={{ backgroundColor: '#33CC00', width: 150, flexDirection: 'row', justifyContent: 'center', paddingVertical: 7, borderRadius: 7 }}>
                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 14, color: 'white' }}>Chuyển bác sĩ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>


  )
}
export default TransferDoctor;