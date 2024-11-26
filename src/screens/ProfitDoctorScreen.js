import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/EvilIcons";
import IconX from "react-native-vector-icons/Feather";
import Assessment from "../components/profit/Assessment";
import HenKham from "../components/profit/HenKham";
import TheoDoiSucKhoe from "../components/profit/TheoDoiSucKhoe";
import { menuContext } from "../contexts/MenuContext";
import { payloadContext } from "../contexts/PayloadContext";
import { screenContext } from "../contexts/ScreenContext";
import { userContext } from "../contexts/UserContext";
import { api, TypeHTTP } from "../utils/api";
import HenKhamTaiNha from "../components/profit/HenKhamTaiNha";
//Thống kê doanh thu
const ProfitDoctorScreen = () => {
  const { width, height } = Dimensions.get("window");
  const { menuHandler } = useContext(menuContext);
  const { payloadHandler } = useContext(payloadContext);
  const { userData } = useContext(userContext);
  const { screenData } = useContext(screenContext);
  const [display, setDisplay] = useState(false);
  const [displayTime, setDisplayTime] = useState(false);
  const [type, setType] = useState("1");
  const [ticketType, setTicketType] = useState("1");
  const [displayAssessment, setDisplayAssessment] = useState(false);
  const hiddenAssessment = () => {
    setDisplayAssessment(false)
  };
  return (
    <View>
      {/* {screenData.currentScreen === 1 && ( */}
      <View
        style={{
          flexWrap: "wrap",
          flexDirection: "column",
          width,
          gap: 10,
          paddingHorizontal: 20,
          paddingVertical: 10,
          height,

        }}
      >
        {screenData.currentScreen === 16 && (
          <>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Nunito-B",
                color: "black",
              }}
            >
              Chào Mừng {userData.user?.fullName}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Nunito-R",
                color: "black",
              }}
            >
              Doanh thu của bác sĩ.
            </Text>
            {/* toggle */}
            <View
              style={{
                flexDirection: "column",
                gap: 10,
              }}
            >

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => setDisplay(true)}
                  style={{
                    gap: 5,
                    backgroundColor: "#f0f0f0",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 40,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    width: 250
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "black",
                      fontFamily: "Nunito-S",
                    }}
                  >
                    {ticketType === '1' ? 'Doanh thu khám trực tuyến' : ticketType === '2' ? 'Doanh thu theo dõi sức khỏe' : 'Doanh thu khám tại nhà'}
                  </Text>
                  <Icon
                    name="chevron-down"
                    style={{ fontSize: 25, color: "black" }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDisplayTime(true)}
                  style={{
                    gap: 5,
                    backgroundColor: "#f0f0f0",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 40,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "black",
                      fontFamily: "Nunito-S",
                    }}
                  >
                    Tất cả
                  </Text>
                  <Icon
                    name="chevron-down"
                    style={{ fontSize: 25, color: "black" }}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setDisplayAssessment(true)}
                style={{
                  gap: 5,
                  backgroundColor: "#33FF33",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 45,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "black",
                    fontFamily: "Nunito-S",
                  }}
                >
                  Đánh giá của bệnh nhân
                </Text>

              </TouchableOpacity>
            </View>
            {ticketType === '1' ? (
              <HenKham type={type} setType={setType} />
            ) : ticketType === '2' ? (
              <TheoDoiSucKhoe type={type} setType={setType} />
            ) : (
              <HenKhamTaiNha type={type} setType={setType} />
            )}
          </>
        )}
      </View>
      {display && (
        <View
          style={{
            width,
            height,
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              width: "80%",
              position: "absolute",
              backgroundColor: "white",
              borderRadius: 10,
              zIndex: 4,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            <TouchableOpacity
              style={{
                alignItems: "flex-end",
                position: "absolute",
                top: 5,
                right: 5,
              }}
              onPress={() => setDisplay(false)}
            >
              <IconX name="x" style={{ fontSize: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTicketType("1");
                setDisplay(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Doanh thu hẹn khám
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTicketType("2");
                setDisplay(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Doanh thu theo dõi sức khỏe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTicketType("3");
                setDisplay(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Doanh thu khám tại nhà
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {displayTime && (
        <View
          style={{
            width,
            height,
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              width: "80%",
              position: "absolute",
              backgroundColor: "white",
              borderRadius: 10,
              top: "20%",
              zIndex: 4,
              padding: 20,
            }}
          >
            <TouchableOpacity
              style={{ alignItems: "flex-end" }}
              onPress={() => setDisplayTime(false)}
            >
              <IconX name="x" style={{ fontSize: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType("1"), setDisplayTime(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType("2"), setDisplayTime(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Tuần này
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType("3"), setDisplayTime(false);
              }}
              style={{
                marginTop: 10,
                backgroundColor: "#e5e7e9",
                paddingHorizontal: 10,
                borderRadius: 5,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "Nunito-S",
                }}
              >
                Tháng này
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {(display || displayTime) && (
        <Pressable
          onPress={() => {
            setDisplay(false)
            setDisplayTime(false)
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backgroundColor: "#00000053",
            zIndex: 1,
          }}
        />
      )}
      {/* )} */}
      {displayAssessment && (<Assessment hidden={hiddenAssessment} doctor={userData.user} />)}
    </View>

  );
};

export default ProfitDoctorScreen;
