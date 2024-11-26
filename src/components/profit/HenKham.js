import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Icon from "react-native-vector-icons/Feather";
import CalenderCheck from "react-native-vector-icons/FontAwesome";
import Icon5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/FontAwesome6";
import Octicons from "react-native-vector-icons/Octicons";
import { menuContext } from "../../contexts/MenuContext";
import { payloadContext } from "../../contexts/PayloadContext";
import { userContext } from "../../contexts/UserContext";
import { utilsContext } from "../../contexts/UtilsContext";
import { api, TypeHTTP } from "../../utils/api";
import {
  compare2Date,
  compareTimeDate1GreaterThanDate2,
  convertDateToDayMonthYearObject,
  convertDateToDayMonthYearTimeObject,
  convertDateToDayMonthYearVietNam,
  isALargerWithin10Minutes,
  isALargerWithin60Minutes,
  sortByAppointmentDate,
} from "../../utils/date";
import { notifyType } from "../../utils/notify";
import {
  formatMoney,
  returnNumber,
} from "../../utils/other";
const HenKham = ({ type, setType }) => {
  //Thống kê doanh thu
  const { menuData, menuHandler } = useContext(menuContext);
  const { width } = Dimensions.get("window");
  const [translateX] = useState(
    new Animated.Value(
      menuData.displayDetailQuestion === true ? 0 : width
    )
  );
  const [doctorRecord, setDoctorRecord] = useState();
  const [appointments, setAppointments] = useState([]);
  const { userData } = useContext(userContext);
  const { utilsHandler } = useContext(utilsContext);
  const { payloadHandler } = useContext(payloadContext);
  const [time, setTime] = useState(
    new Date().getHours() + ":" + new Date().getMinutes()
  );
  const [displayConnect, setDisplayConnect] =
    useState(false);
  const intervalRef = useRef();
  const [sumAppointment, setSumAppointment] = useState(0);
  const [sumAppointmentWeek, setSumAppointmentWeek] =
    useState(0);
  const [sumAppointmentMonth, setSumAppointmentMonth] =
    useState(0);

  const typeTime = {
    1: "tổng",
    2: "tuần này",
    3: "tháng này",
  };
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
    if (userData.user) {
      api({
        type: TypeHTTP.GET,
        path: `/doctorRecords/getById/${userData.user?._id}`,
        sendToken: false,
      }).then((res) => {
        setDoctorRecord(res);
        // const data = {
        //   doctor_record_id: res._id,
        // }
        // api({
        //   type: TypeHTTP.POST,
        //   path: `/appointments/findByRecords`,
        //   sendToken: false,
        //   body: data,
        // }).then((resAppointment) => {
        //   setAppointments(resAppointment);

        // })
      });
    }
  }, [userData]);
  useEffect(() => {
    if (appointments.length > 0) {
      const theFirstAppointment = sortByAppointmentDate(
        appointments.filter(
          (item) => item.status === "COMPLETED"
        )
      ).filter((item) =>
        compareTimeDate1GreaterThanDate2(
          item.appointment_date,
          convertDateToDayMonthYearTimeObject(
            new Date().toISOString()
          )
        )
      )[0];
      if (theFirstAppointment) {
        if (
          compare2Date(
            convertDateToDayMonthYearTimeObject(
              new Date().toISOString()
            ),
            theFirstAppointment.appointment_date
          )
        ) {
          if (
            isALargerWithin10Minutes(
              theFirstAppointment.appointment_date.time,
              time
            ) ||
            isALargerWithin60Minutes(
              time,
              theFirstAppointment.appointment_date.time
            )
          ) {
            setDisplayConnect(theFirstAppointment._id);
          }
        }
      }
    }
  }, [appointments, time]);
  useEffect(() => {
    const body = {
      doctor_record_id: doctorRecord?._id,
      status: "COMPLETED",
    };
    api({
      type: TypeHTTP.POST,
      path: "/appointments/findByStatus",
      body,
      sendToken: false,
    }).then((res) => {
      setSumAppointment(res.length);
    });
    const bodyWeek = {
      doctor_record_id: doctorRecord?._id,
    };
    api({
      type: TypeHTTP.POST,
      path: "/appointments/findByWeek",
      body: bodyWeek,
      sendToken: false,
    }).then((res) => {
      const app = res.filter(
        (item) => item.status === "COMPLETED"
      );

      setSumAppointmentWeek(app.length);
    });
    api({
      type: TypeHTTP.POST,
      path: "/appointments/findByMonth",
      body,
      sendToken: false,
    }).then((res) => {
      const app = res.filter(
        (item) => item.status === "COMPLETED"
      );

      setSumAppointmentMonth(app.length);
    });
  }, [doctorRecord?._id]);
  useEffect(() => {
    if (doctorRecord) {
      if (type === "1") {
        const body = {
          doctor_record_id: doctorRecord._id,
          status: "COMPLETED",
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByStatus",
          body,
          sendToken: false,
        }).then((res) => {
          setAppointments(res);
        });
      } else if (type === "2") {
        const body = {
          doctor_record_id: doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByWeek",
          body,
          sendToken: false,
        }).then((res) => {
          const app = res.filter(
            (item) => item.status === "COMPLETED"
          );

          setAppointments(app);
        });
      } else if (type === "3") {
        const body = {
          doctor_record_id: doctorRecord._id,
        };
        api({
          type: TypeHTTP.POST,
          path: "/appointments/findByMonth",
          body,
          sendToken: false,
        }).then((res) => {
          const app = res.filter(
            (item) => item.status === "COMPLETED"
          );

          setAppointments(app);
        });
      }
    }
  }, [type, doctorRecord]);
  return (
    <>
      <View
        style={{ flexDirection: "column", width: "100%" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-center",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            height: 80,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: "#e5e7e9",
              alignItems: "flex-start",
              backgroundColor: "#ff7777",
              borderRadius: 10,
              gap: 10,
              padding: 10,
              width: "48%",
            }}
          >
            <CalenderCheck
              name="calendar-check-o"
              style={{ fontSize: 35, color: "white" }}
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Nunito-S",
                }}
              >
                {returnNumber(sumAppointment)}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Nunito-S",
                  color: "white",
                }}
              >
                Cuộc hẹn hoàn tất
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: "#e5e7e9",
              alignItems: "flex-start",
              backgroundColor: "orange",
              borderRadius: 10,
              gap: 10,
              padding: 10,
              width: "48%",
            }}
          >
            <Icon5
              name="coins"
              style={{ fontSize: 34, color: "white" }}
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Nunito-S",
                }}
              >
                {sumAppointment === 0
                  ? 0
                  : formatMoney(
                    returnNumber(sumAppointment) * 140000
                  )}{" "}
                đ
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Nunito-S",
                  color: "white",
                }}
              >
                Tổng doanh thu
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-center",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            height: 80,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: "#e5e7e9",
              alignItems: "flex-start",
              backgroundColor: "#66cc66",
              borderRadius: 10,
              gap: 10,
              padding: 10,
              width: "48%",
            }}
          >
            <Octicons
              name="hourglass"
              style={{ fontSize: 35, color: "white" }}
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Nunito-S",
                }}
              >
                {sumAppointmentWeek === 0
                  ? 0
                  : formatMoney(
                    returnNumber(sumAppointmentWeek) *
                    140000
                  )}{" "}
                đ
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Nunito-S",
                  color: "white",
                }}
              >
                Doanh thu tuần
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: "#e5e7e9",
              alignItems: "flex-start",
              backgroundColor: "#ff2222",
              borderRadius: 10,
              gap: 10,
              padding: 10,
              width: "48%",
            }}
          >
            <MaterialCommunityIcons
              name="chart-line"
              style={{ fontSize: 35, color: "white" }}
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "white",
                  fontFamily: "Nunito-S",
                }}
              >
                {sumAppointmentMonth === 0
                  ? 0
                  : formatMoney(
                    returnNumber(sumAppointmentWeek) *
                    140000
                  )}{" "}
                đ
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Nunito-S",
                  color: "white",
                }}
              >
                Doanh thu tháng
              </Text>
            </View>
          </View>
        </View>
      </View>
      <BarChart
        data={(() => {
          const appointmentCounts = {};

          // Duyệt qua danh sách appointments và cập nhật đối tượng
          appointments.forEach((item) => {
            const date = `${item.appointment_date.day}/${item.appointment_date.month}/${item.appointment_date.year}`;
            if (appointmentCounts[date]) {
              appointmentCounts[date]++;
            } else {
              appointmentCounts[date] = 1;
            }
          });

          // Chuyển đổi đối tượng thành mảng để sử dụng trong biểu đồ
          const labels = Object.keys(appointmentCounts);
          const data = Object.values(appointmentCounts).map(
            (item) => item * 140000
          );

          return labels.map((label, index) => ({
            value: data[index],
            label: label,
          }));
        })()}
        height={200}
        showValuesAsDataPointsText
        frontColor={"#FF3366"}
        textColor1="green"
        dataPointsHeight={6}
        dataPointsWidth={6}
        xAxisLabelTextStyle={{
          color: "gray",
          fontSize: 10,
          transform: [{ rotate: "45deg" }], // Xoay nhãn 45 độ
          width: 100,
        }}
        textShiftY={-2}
        textShiftX={-5}
        textFontSize={13}
        width={width * 0.85}
      />
      <ScrollView style={{ height: 100 }}>
        {appointments.map((appointment, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#f8f9f9",
              padding: 5,
              borderRadius: 10,
              flexDirection: "row",
              gap: 10,
              alignItems: "start",
              paddingBottom: index === appointments.length - 1 ? 30 : 0
            }}
          >
            <View
              style={{
                height: 60,
                width: 60,
                borderWidth: 1,
                borderColor: "#1dcbb6",
                overflow: "hidden",
                borderRadius: 150,
              }}
            >
              <Image
                source={{ uri: appointment.patient.image }}
                style={{ height: 90, width: 60 }}
              />
            </View>
            <View
              style={{
                flexDirection: "column",
                marginTop: 5,
                paddingBottom: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito-S",
                  fontSize: 16,
                  marginTop: 3,
                }}
              >
                Bệnh nhân: {appointment.patient.fullName}
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito-R",
                  fontSize: 14,
                  marginTop: 3,
                }}
              >
                Thời gian:{" "}
                {convertDateToDayMonthYearVietNam(
                  appointment.appointment_date
                )}
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito-R",
                  fontSize: 14,
                  marginTop: 3,
                  color:
                    appointment.status === "QUEUE"
                      ? "black"
                      : appointment.status === "ACCEPTED"
                        ? "green"
                        : appointment?.status === "COMPLETED"
                          ? "blue"
                          : "red",
                }}
              >
                Trạng thái: {appointment?.status_message}
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito-R",
                  fontSize: 14,
                  marginTop: 3,
                }}
              >
                Ghi chú:{" "}
                {appointment.note === ""
                  ? "Không"
                  : appointment.note}
              </Text>
              <Text
                style={{
                  fontFamily: "Nunito-R",
                  fontSize: 14,
                  marginTop: 3,
                }}
              >
                Giá: 140.000 đ
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default HenKham;
