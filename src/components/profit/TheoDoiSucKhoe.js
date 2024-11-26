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

const TheoDoiSucKhoe = ({ type, setType }) => {
  const { menuData, menuHandler } = useContext(menuContext);
  const { width } = Dimensions.get("window");
  const [translateX] = useState(
    new Animated.Value(
      menuData.displayDetailQuestion === true ? 0 : width
    )
  );
  const [doctorRecord, setDoctorRecord] = useState();
  const [logBooks, setLogBooks] = useState([]);
  const { userData } = useContext(userContext);
  const { utilsHandler } = useContext(utilsContext);
  const { payloadHandler } = useContext(payloadContext);
  const [time, setTime] = useState(
    new Date().getHours() + ":" + new Date().getMinutes()
  );
  const [displayConnect, setDisplayConnect] =
    useState(false);
  const intervalRef = useRef();
  const [sumLogBook, setSumLogBook] = useState([]);
  const [sumLogBookWeek, setSumLogBookWeek] = useState([]);
  const [sumLogBookMonth, setSumLogBookMonth] = useState([]);

  const typeTime = {
    1: "tổng",
    2: "tuần này",
    3: "tháng này",
  };
  useEffect(() => {
    if (userData.user) {

      if (type === "1") {
        api({
          path: "/healthLogBooks/get-all",
          type: TypeHTTP.GET,
          sendToken: true,
        }).then((logBooks) => {
          setLogBooks(
            logBooks.filter(
              (item) =>
                item.doctor?._id === userData.user._id &&
                item.status.status_type === "COMPLETED"
            )
          );

        });
      } else {
        api({
          path: `/healthLogBooks/findBy${type === "2" ? "Week" : "Month"
            }`,
          type: TypeHTTP.POST,
          sendToken: true,
          body: {
            doctor: userData.user._id,
          },
        }).then((logBooks) => {
          setLogBooks(
            logBooks.filter(
              (item) =>
                item.doctor?._id === userData.user._id &&
                item.status.status_type === "COMPLETED"
            )
          );

        });
      }
    }
  }, [type, userData.user]);
  const calculator = (logBooks) => {
    let logBookPrice = 0;
    logBooks.forEach((logBook) => {
      if (logBook.priceList?.price === 1350000) {
        logBookPrice += 945000;
      } else if (logBook.priceList?.price === 2300000) {
        logBookPrice += 1610000;
      } else {
        logBookPrice += 2800000;
      }
    });
    return logBookPrice;
  };
  useEffect(() => {
    api({
      path: "/healthLogBooks/get-all",
      type: TypeHTTP.GET,
      sendToken: true,
    }).then((logBooks) => {
      setSumLogBook(
        logBooks.filter(
          (item) =>
            item.doctor?._id === userData.user._id &&
            item.status.status_type === "COMPLETED"
        )
      );
    });
    api({
      path: "/healthLogBooks/findByWeek",
      type: TypeHTTP.POST,
      body: {
        doctor: userData.user._id,
      },
      sendToken: true,
    }).then((logBooks) => {
      setSumLogBookWeek(
        logBooks.filter(
          (item) =>
            item.doctor?._id === userData.user._id &&
            item.status.status_type === "COMPLETED"
        )
      );
    });
    api({
      path: "/healthLogBooks/findByMonth",
      type: TypeHTTP.POST,
      body: {
        doctor: userData.user._id,
      },
      sendToken: true,
    }).then((logBooks) => {
      setSumLogBookMonth(
        logBooks.filter(
          (item) =>
            item.doctor?._id === userData.user._id &&
            item.status.status_type === "COMPLETED"
        )
      );
    });
  }, [userData.user]);
  return (
    <>
      <View style={{ flexDirection: "column", width: "100%" }}>
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
                {returnNumber(sumLogBook.length)}
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
                {sumLogBook.length === 0
                  ? 0
                  : formatMoney(calculator(sumLogBook))}{" "}
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
                {sumLogBookWeek.length === 0
                  ? 0
                  : formatMoney(
                    calculator(sumLogBookWeek)
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
                {sumLogBookMonth.length === 0
                  ? 0
                  : formatMoney(
                    calculator(sumLogBookMonth)
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
          const logBookCount = {};
          const logBookPrice = {};
          // Duyệt qua danh sách logBooks và cập nhật đối tượng
          logBooks.forEach((item) => {
            const date = `${item.date.day}/${item.date.month}/${item.date.year}`;
            if (logBookCount[date]) {
              logBookCount[date]++;
              logBookPrice[date] += item.priceList.price;
            } else {
              logBookCount[date] = 1;
              logBookPrice[date] = item.priceList.price;
            }
          });

          // Chuyển đổi đối tượng thành mảng để sử dụng trong biểu đồ
          const labels = Object.keys(logBookCount);
          const data = labels.map((date) => ({
            count: logBookCount[date],
            totalPrice: logBookPrice[date],
          }));
          return labels.map((label, index) => ({
            value: data[index].totalPrice, // Assuming you want to show totalPrice
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
      <ScrollView style={{ height: 100 }} >
        {logBooks.map((logBook, index) => (
          <View key={index} style={{ backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start', paddingBottom: index === logBooks.length - 1 ? 30 : 0 }}>
            <View style={{ height: 60, width: 60, borderWidth: 1, borderColor: '#1dcbb6', overflow: 'hidden', borderRadius: 150 }}>
              <Image source={{ uri: logBook.patient.image }} style={{ height: 90, width: 60 }} />
            </View>
            <View style={{ flexDirection: 'column', marginTop: 5, paddingBottom: 10 }}>
              <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Bệnh nhân: {logBook.patient.fullName}</Text>
              <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thời gian: {convertDateToDayMonthYearVietNam(logBook.date)}</Text>
              <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, color: 'blue', }}>Trạng thái: {logBook.status.message}</Text>
              <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Loại phiếu: {logBook.priceList.price === 1350000
                ? formatMoney(945000)
                : logBook.priceList.price === 2300000
                  ? formatMoney(1610000)
                  : formatMoney(2800000)}
                đ/
                {logBook.priceList.type}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  )
}

export default TheoDoiSucKhoe