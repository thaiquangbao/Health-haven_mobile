import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';
import CalenderCheck from 'react-native-vector-icons/FontAwesome';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { api, TypeHTTP } from '../../utils/api';
import { compare2Date, compareTimeDate1GreaterThanDate2, convertDateToDayMonthYearObject, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam, isALargerWithin10Minutes, isALargerWithin60Minutes, sortByAppointmentDate } from '../../utils/date';
import { notifyType } from '../../utils/notify';
import { returnNumber } from '../../utils/other';
import IconX from 'react-native-vector-icons/Feather';
// CuocHen
const CuocHen = ({ type, setType }) => {
  const [doctorRecord, setDoctorRecord] = useState()
  const [appointments, setAppointments] = useState([])
  const { userData } = useContext(userContext)
  const { utilsHandler } = useContext(utilsContext)
  const { payloadHandler } = useContext(payloadContext)
  const { menuHandler } = useContext(menuContext)
  const [displayFormCancel, setDisplayFormCancel] = useState(false)
  const [dataSelected, setDataSelected] = useState();
  const [time, setTime] = useState(
    new Date().getHours() + ":" + new Date().getMinutes()
  );
  const [reason, setReason] = useState('')
  const [displayConnect, setDisplayConnect] = useState(false);
  const intervalRef = useRef();
  useEffect(() => {
    if (userData.user) {
      api({
        type: TypeHTTP.GET,
        path: `/doctorRecords/getById/${userData.user?._id}`,
        sendToken: false,
      }).then((res) => {
        setDoctorRecord(res);
        const data = {
          doctor_record_id: res._id,
        }
        api({
          type: TypeHTTP.POST,
          path: `/appointments/findByRecords`,
          sendToken: false,
          body: data,
        }).then((resAppointment) => {
          setAppointments(resAppointment);

        })
      })

    }
  }, [userData])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(
        new Date().getHours() +
        ":" +
        new Date().getMinutes()
      );
    }, 60000);
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      sortByAppointmentDate(appointments.filter((item) => item.status === "ACCEPTED")).forEach((item) => {
        if (compare2Date(convertDateToDayMonthYearTimeObject(new Date().toISOString()), item.appointment_date)) {
          if (isALargerWithin10Minutes(item.appointment_date.time, time) || isALargerWithin60Minutes(time, item.appointment_date.time)) {
            setDisplayConnect(item._id);
          }
        }
      })
    }
  }, [appointments, time]);

  useEffect(() => {
    if (doctorRecord) {
      if (type === "1" || type === "2") {
        let date = new Date();
        date.setDate(date.getDate() + (Number(type) - 1));
        const body = {
          doctor_record_id:
            doctorRecord._id,
          time: {
            ...convertDateToDayMonthYearObject(
              date.toISOString()
            ),
          },
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByDate",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      } else if (type === "3") {
        const body = {
          doctor_record_id: doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByWeek",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      } else if (type === "4") {
        const body = {
          doctor_record_id:
            doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByMonth",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      } else if (type === "5") {
        const body = {
          doctor_record_id:
            doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByNextMonth",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      } else if (type === '6') {
        const body = {
          doctor_record_id:
            doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByRecords",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      }
    }
  }, [type, doctorRecord]);

  const handleAcceptAppointment = (appointment) => {
    const body = {
      _id: appointment._id,
      status: "ACCEPTED",
      status_message: "Đã chấp nhận",
    };
    api({
      sendToken: true,
      path: "/appointments/doctor-accept",
      type: TypeHTTP.POST,
      body: body,
    }).then((res) => {
      let record = JSON.parse(
        JSON.stringify(doctorRecord)
      );
      let schedule = record.schedules.filter(
        (item) =>
          item.date.day ===
          appointment.appointment_date.day &&
          item.date.month ===
          appointment.appointment_date.month &&
          item.date.year ===
          appointment.appointment_date.year
      )[0];
      let time = schedule.times.filter(
        (item) =>
          item.time === appointment.appointment_date.time
      )[0];
      time.status = "Booked";
      api({
        type: TypeHTTP.POST,
        path: "/doctorRecords/update",
        sendToken: false,
        body: record,
      }).then((res1) => {
        setAppointments((prev) =>
          prev.map((item) => {
            if (item._id === res._id) {
              return res;
            }
            return item;
          })
        );
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã chấp nhận cuộc hẹn"
        );
      });
    });
  };

  const handleCancelAppointment = (appointment) => {
    setDisplayFormCancel(true);
    setDataSelected(appointment); // sửa chổ này
  };
  const handleCancel = () => { // sửa chổ này
    if (reason === "") {
      utilsHandler.notify(
        notifyType.WARNING,
        "Vui lòng nhập lý do hủy"
      );
    }
    const body = {
      _id: dataSelected._id,
      status: "CANCELED",
      status_message: "Bác sĩ đã hủy cuộc hẹn",
      note: "",
      reason: reason,
    };
    api({
      sendToken: true,
      path: "/appointments/doctor-cancel",
      type: TypeHTTP.POST,
      body: body,
    }).then((res) => {
      let record = JSON.parse(
        JSON.stringify(doctorRecord)
      );
      let schedule = record.schedules.filter(
        (item) =>
          item.date.day ===
          dataSelected.appointment_date.day &&
          item.date.month ===
          dataSelected.appointment_date.month &&
          item.date.year ===
          dataSelected.appointment_date.year
      )[0];
      let time = schedule.times.filter(
        (item) =>
          item.time === dataSelected.appointment_date.time
      )[0];
      time.status = "";
      api({
        type: TypeHTTP.POST,
        path: "/doctorRecords/update",
        sendToken: false,
        body: record,
      }).then((res1) => {
        setAppointments((prev) =>
          prev.map((item) => {
            if (item._id === res._id) {
              return res;
            }
            return item;
          })
        );
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã hủy cuộc hẹn"
        );
        setReason('')
        setDisplayFormCancel(false)
      });
    });
  }
  const handleRejectAppointment = (appointment) => {
    const body = {
      _id: appointment._id,
      status: "REJECTED",
      status_message: "Đã từ chối",
    };
    api({
      sendToken: true,
      path: "/appointments/doctor-reject",
      type: TypeHTTP.POST,
      body: body,
    }).then((res) => {
      let record = JSON.parse(
        JSON.stringify(doctorRecord)
      );
      let schedule = record.schedules.filter(
        (item) =>
          item.date.day ===
          appointment.appointment_date.day &&
          item.date.month ===
          appointment.appointment_date.month &&
          item.date.year ===
          appointment.appointment_date.year
      )[0];
      let time = schedule.times.filter(
        (item) =>
          item.time === appointment.appointment_date.time
      )[0];
      time.status = "";
      api({
        type: TypeHTTP.POST,
        path: "/doctorRecords/update",
        sendToken: false,
        body: record,
      }).then((res1) => {
        setAppointments((prev) =>
          prev.map((item) => {
            if (item._id === res._id) {
              return res;
            }
            return item;
          })
        );
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã từ chối cuộc hẹn"
        );
      });
    });
  };


  return (
    <>
      <View style={{ flexDirection: 'column', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center', height: 80 }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff7777', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, color: 'white', fontFamily: 'Nunito-S' }}>{returnNumber(appointments.length)}</Text>
              <Text style={{ fontSize: 13, fontFamily: 'Nunito-S', color: 'white' }}>Tất cả cuộc hẹn</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: 'orange', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-check-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, color: 'white', fontFamily: 'Nunito-S' }}>
                {returnNumber(
                  appointments.filter(
                    (item) => item.status === "ACCEPTED"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Nunito-S', color: 'white' }}>Đã chấp nhận</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#66cc66', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-plus-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, color: 'white', fontFamily: 'Nunito-S' }}>
                {returnNumber(
                  appointments.filter(
                    (item) => item.status === "QUEUE"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Nunito-S', color: 'white' }}>Đang chờ</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff2222', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-times-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, color: 'white', fontFamily: 'Nunito-S' }}>
                {returnNumber(
                  appointments.filter(
                    (item) => item.status === "REJECTED"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Nunito-S', color: 'white' }}>Đã từ chối</Text>
            </View>
          </View>
        </View>
      </View>

      {appointments.map((appointment, index) => (
        <TouchableOpacity onPress={() => {
          payloadHandler.setDetailAppointment(appointment)
          payloadHandler.setDisplayConnect(displayConnect)
          menuHandler.setDisplayDetailAppointment(true)
        }} key={index} style={{ backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start' }}>
          <View style={{ height: 60, width: 60, borderWidth: 1, borderColor: '#1dcbb6', overflow: 'hidden', borderRadius: 150 }}>
            <Image source={{ uri: appointment.patient.image }} style={{ height: 90, width: 60 }} />
          </View>
          <View style={{ flexDirection: 'column', marginTop: 5, paddingBottom: 10 }}>
            <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Bệnh nhân: {appointment.patient.fullName}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thời gian: {convertDateToDayMonthYearVietNam(appointment.appointment_date)}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, color: appointment.status === "QUEUE" ? "black" : appointment.status === "ACCEPTED" ? "green" : appointment?.status === "COMPLETED" ? 'blue' : "red", }}>Trạng thái: {appointment?.status_message}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Ghi chú: {appointment.note === "" ? "Không" : appointment.note}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Chức năng: </Text>
              {appointment.status === "QUEUE" ? (
                <>
                  <TouchableOpacity onPress={() => handleAcceptAppointment(appointment)} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRejectAppointment(appointment)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Từ chối</Text>
                  </TouchableOpacity>
                </>
              ) : (
                appointment.status === "ACCEPTED" && (
                  <TouchableOpacity onPress={() => handleCancelAppointment(appointment)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 5 }}>
                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Hủy</Text>
                  </TouchableOpacity>)
              )}
            </View>

          </View>

        </TouchableOpacity>

      ))}
      {displayFormCancel && (
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', position: 'absolute', top: 0, left: 0, alignItems: 'center', flexDirection: 'row' }}>
          <View style={{ width: '100%', position: 'absolute', backgroundColor: 'white', borderRadius: 10, zIndex: 4, paddingHorizontal: 30, paddingVertical: 30 }}>
            <TouchableOpacity style={{ alignItems: 'flex-end', position: 'absolute', top: 5, right: 5 }} onPress={() => { setDisplayFormCancel(false), setReason('') }}>
              <IconX name="x" style={{ fontSize: 20 }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontFamily: 'Nunito-S' }}>Lý do hủy cuộc hẹn</Text>
            <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Bệnh nhân: {dataSelected.patient.fullName}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thời gian: {convertDateToDayMonthYearVietNam(dataSelected.appointment_date)}</Text>
            <TextInput value={reason} onChangeText={e => setReason(e)} placeholder='Nhập lý do hủy...' style={{ width: '90%', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderColor: '#e5e7e9', height: 45 }} />
            <TouchableOpacity onPress={() => handleCancel()} style={{ marginTop: 10, backgroundColor: '#1dcbb6', paddingHorizontal: 3, borderRadius: 5, paddingVertical: 7, width: '47%', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontFamily: 'Nunito-S', color: 'white' }}>Xác nhận </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  )
};
export default CuocHen;