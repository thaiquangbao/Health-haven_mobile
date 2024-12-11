import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';
import ChiSoBMI from './ChiSoBMI';
import HuyetAp from './HuyetAp';
import NhietDo from './NhietDo';
import NhipTim from './NhipTim';
import TransferDoctor from './TransferDoctor';
import { api, TypeHTTP } from '../../utils/api';
import { userContext } from '../../contexts/UserContext';
const DetailLogbook = () => {
  const { menuData, menuHandler } = useContext(menuContext);
  const { width } = Dimensions.get('window');
  const [translateX] = useState(new Animated.Value(menuData.displayDetailLogbook === true ? 0 : width));
  const { payloadData, payloadHandler } = useContext(payloadContext)
  const [choose, setChoose] = useState(1);
  const [widths, setWidths] = useState({ width1: 0, width2: 0, width3: 0, width4: 0 });
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const [displayTransferDoctor, setDisplayTransferDoctor] = useState(false);
  const [selectedLogBook, setSelectedLogBook] = useState();
  const [room, setRoom] = useState();
  const { userData } = useContext(userContext)
  // goi logbook thi dung payloadData.logbook (đã chuyền dữ liệu vào khi bấm vào Detail Logbook, chỉ cần lấy ra xài thôi)
  // bieu do thì kham khảo trong components/health

  useEffect(() => {
    if (payloadData.logbook) {
      api({ type: TypeHTTP.GET, sendToken: true, path: `/rooms/get-room-doctor/${payloadData.logbook.doctor._id}` })
        .then(rooms => {
          setRoom(rooms.filter(item => item.status === "ACTIVE").filter(
            (item) =>
              item.doctor._id === payloadData.logbook.doctor._id &&
              item.patient._id === payloadData.logbook.patient._id
          )[0])
        })
    }
  }, [payloadData.logbook])

  useEffect(() => {
    if (selectedLogBook) {
      setSelectedLogBook(
        payloadData.logbook.filter(
          (item) => item._id === selectedLogBook._id
        )[0]
      );
    }
  }, [payloadData.logbook]);
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuData.displayDetailLogbook === true ? 0 : width,
      duration: 300, // Thời gian animation (ms)
      useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
    }).start();
  }, [menuData.displayDetailLogbook]);
  useEffect(() => {
    let width = 0;
    let remainWidth = 0;
    if (choose === 1) {
      width = widths.width1;
      remainWidth = 0;
    } else if (choose === 2) {
      width = widths.width2;
      remainWidth = widths.width1 + 16;
    } else if (choose === 3) {
      width = widths.width3;
      remainWidth = widths.width1 + widths.width2 + 32;
    } else if (choose === 4) {
      width = widths.width4;
      remainWidth = widths.width1 + widths.width2 + widths.width3 + 48;
    }
    Animated.timing(indicatorLeft, {
      toValue: remainWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(indicatorWidth, {
      toValue: width,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [choose, widths]);
  const hiddenTransferDoctor = () => {
    setDisplayTransferDoctor(false)
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
      <View style={{ position: 'absolute', right: 15, top: 30 }}>
        <TouchableOpacity onPress={() => menuHandler.setDisplayDetailLogbook(false)}>
          <Icon name="x" style={{ fontSize: 30 }} />
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', gap: 10, top: 40 }}>
        <View style={{ flexDirection: 'column', gap: 5, width: '100%' }}>
          <Text style={{ fontSize: 20, color: 'black', fontFamily: 'Nunito-B', textAlign: 'center' }}>Thông tin cá nhân </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R', paddingLeft: 20 }}>Trạng thái: {payloadData.logbook?.status?.status_type !== "CANCELED" ? "Đang theo dõi sức khỏe" : "Đã dừng theo dõi sức khỏe"}</Text> 
        </View>
        <View style={{ flexDirection: 'column', gap: 10, width, paddingLeft: 20 }}>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Họ và tên: {payloadData.logbook?.patient.fullName}</Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Ngày sinh: {payloadData.logbook?.patient.dateOfBirth}</Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Giới tính: {payloadData.logbook?.patient.sex === true ? 'Nam' : 'Nữ'} </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Số điện thoại: {payloadData.logbook?.patient.phone} </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Ghi chú: {""}
            {payloadData.logbook?.disMon?.filter((item) => item.note !== "").length > 0 ? payloadData.logbook?.disMon?.filter((item) => item.note !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.note !== "").length - 1].note + " " + `(${payloadData.logbook?.disMon?.filter((item) => item.note !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.note !== "").length - 1].date?.day}/${payloadData.logbook?.disMon?.filter((item) => item.note !== "")[payloadData.logbook?.disMon?.filter((item) => item.note !== "").length - 1].date?.month}/${payloadData.logbook?.disMon?.filter((item) => item.note !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.note !== "").length - 1].date?.year})` : "Không"}
          </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Triệu chứng: {""}
            {payloadData.logbook?.disMon?.filter((item) => item.symptom !== "").length > 0 ? payloadData.logbook?.disMon?.filter((item) => item.symptom !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.symptom !== "").length - 1].symptom + " " + `(${payloadData.logbook?.disMon?.filter((item) => item.symptom !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.symptom !== "").length - 1].date?.day}/${payloadData.logbook?.disMon?.filter((item) => item.symptom !== "")[payloadData.logbook?.disMon?.filter((item) => item.symptom !== "").length - 1].date?.month}/${payloadData.logbook?.disMon?.filter((item) => item.symptom !== "")
            [payloadData.logbook?.disMon?.filter((item) => item.symptom !== "").length - 1].date?.year})` : "Không"}
          </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Trạng thái sức khỏe: {""}
            {payloadData.logbook?.status_bloodPressure === null && payloadData.logbook?.status_temperature === null ? "Bình thường" : "Báo động"}
          </Text>
          <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Nunito-R' }}>Ngày tái khám: {""}
            {payloadData.logbook?.reExaminationDates.length > 0 ? payloadData.logbook?.reExaminationDates[payloadData.logbook?.reExaminationDates - 1] : "Không"}
          </Text>
        </View>
        <View style={{ flexDirection: 'column', gap: 5, width: '100%' }}>
          <View style={{ flexDirection: 'row', gap: 5, width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => { setDisplayTransferDoctor(true), setSelectedLogBook(payloadData.logbook); }} style={{ backgroundColor: '#1dcbb6', paddingHorizontal: '7%', paddingVertical: 10, borderRadius: 7 }}>
              <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: 'white' }}>Chuyển bác sĩ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              menuHandler.setDisplayMedicalRecord(true)
              payloadHandler.setPatient(payloadData.logbook?.patient)
            }} style={{ backgroundColor: '#3366FF', paddingHorizontal: '10%', paddingVertical: 10, borderRadius: 7 }}>
              <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: 'white' }}>Xem hồ sơ sức khỏe</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => {
              payloadHandler.setCurrentRoom(room)
              menuHandler.setDisplayChatArea(true)
            }} style={{ backgroundColor: '#FF3300', paddingHorizontal: '29%', paddingVertical: 10, borderRadius: 7 }}>
              <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: 'white' }}>Nhắc nhở bệnh nhân</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ width: '100%', paddingHorizontal: 20, flexDirection: 'column', paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 25, marginTop: 2, width: '100%', justifyContent: 'center' }}>
            <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width1: e.nativeEvent.layout.width })} onPress={() => setChoose(1)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 1 ? 2 : 0, borderColor: choose === 1 ? 'blue' : 'black' }} className="item-1">
              <Text style={{ fontSize: 16, color: choose === 1 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Huyết áp</Text>
            </TouchableOpacity>
            <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width2: e.nativeEvent.layout.width })} onPress={() => setChoose(2)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 2 ? 2 : 0, borderColor: choose === 2 ? 'blue' : 'black' }} className="item-2">
              <Text style={{ fontSize: 16, color: choose === 2 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Nhiệt độ</Text>
            </TouchableOpacity>
            <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width3: e.nativeEvent.layout.width })} onPress={() => setChoose(3)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 3 ? 2 : 0, borderColor: choose === 3 ? 'blue' : 'black' }} className="item-3">
              <Text style={{ fontSize: 16, color: choose === 3 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>BMI</Text>
            </TouchableOpacity>
            <TouchableOpacity onLayout={(e) => setWidths({ ...widths, width4: e.nativeEvent.layout.width })} onPress={() => setChoose(4)} style={{ gap: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: choose === 4 ? 2 : 0, borderColor: choose === 4 ? 'blue' : 'black' }} className="item-4">
              <Text style={{ fontSize: 16, color: choose === 4 ? 'blue' : 'black', fontFamily: 'Nunito-S' }}>Nhịp tim</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {choose === 1 ? (
          <HuyetAp logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
        ) : choose === 2 ? (
          <NhietDo logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />

        ) : choose === 3 ? (
          <ChiSoBMI logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
        ) : choose === 4 ? (
          <NhipTim logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />

        ) : (
          <></>
        )}

      </View>
      {displayTransferDoctor && (<TransferDoctor hidden={hiddenTransferDoctor} logBook={selectedLogBook} />)}
    </Animated.View>
  )
}

export default DetailLogbook