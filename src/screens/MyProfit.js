import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import Icon from "react-native-vector-icons/EvilIcons";
import IconX from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/FontAwesome6";
import Octicons from "react-native-vector-icons/Octicons";
import Icon5 from "react-native-vector-icons/FontAwesome5";
import CalenderCheck from "react-native-vector-icons/FontAwesome";
import { api, TypeHTTP } from '../utils/api';
import { formatMoney } from '../utils/other';
import { utilsContext } from '../contexts/UtilsContext';
import { notifyType } from '../utils/notify';

const MyProfitScreen = () => {
    const { width, height } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const [ticketType, setTicketType] = useState("1");
    const [display, setDisplay] = useState(false);
    const { utilsHandler } = useContext(utilsContext)
    const [dsPayBack, setDsPayBack] = useState([]);
    const [sumAvailable, setSumAvailable] = useState(0);
    const [sumRequest, setSumRequest] = useState(0);
    const [sumAccept, setSumAccept] = useState(0);
    const [sumComplete, setSumComplete] = useState(0);

    useEffect(() => {
        if (userData.user) {
            api({
                type: TypeHTTP.POST,
                path: "/payBacks/get-by-type",
                sendToken: true,
                body: {
                    doctor_id: userData.user?._id,
                    type: ticketType === '1' ? "APPOINTMENT" : ticketType === '2' ? "HEALTHLOGBOOK" : "APPOINTMENTHOME",
                },
            }).then((res) => {
                setDsPayBack(
                    res.filter(
                        (item) =>
                            item.doctor?._id === userData.user?._id
                    )
                );
            });
        }
    }, [userData.user, ticketType]);

    useEffect(() => {
        if (userData.user) {
            api({
                path: "/payBacks/get-by-doctor",
                type: TypeHTTP.POST,
                body: { doctor_id: userData.user?._id },
                sendToken: true,
            }).then((res) => {
                const resultAvailable = (items) => {
                    let result = 0;
                    items
                        .filter(
                            (item) =>
                                item.status?.type === "AVAILABLE" ||
                                item.status?.type === "REFUSE"
                        )
                        .forEach((item) => {
                            result += item.price;
                        });
                    return result;
                };
                const resultRequest = (items) => {
                    let result = 0;
                    items
                        .filter(
                            (item) => item.status?.type === "REQUEST"
                        )
                        .forEach((item) => {
                            result += item.price;
                        });
                    return result;
                };
                const resultAccept = (items) => {
                    let result = 0;
                    items
                        .filter(
                            (item) => item.status?.type === "ACCEPT"
                        )
                        .forEach((item) => {
                            result += item.price;
                        });
                    return result;
                };
                const resultComplete = (items) => {
                    let result = 0;
                    items
                        .filter(
                            (item) => item.status?.type === "COMPLETE"
                        )
                        .forEach((item) => {
                            result += item.price;
                        });
                    return result;
                };
                setSumAvailable(resultAvailable(res));
                setSumRequest(resultRequest(res));
                setSumAccept(resultAccept(res));
                setSumComplete(resultComplete(res));
            });
        }
    }, [userData.user]);

    const handleReceive = () => {
        if (sumAvailable === 0) {
            utilsHandler.notify(
                notifyType.WARNING,
                "Bác sĩ không có doanh thu để nhận!!!"
            );
            return;
        }
        utilsHandler.notify(
            notifyType.LOADING,
            "Đang xử lý yêu cầu"
        );
        api({
            type: TypeHTTP.POST,
            path: "/payBacks/request-status",
            body: {
                doctor_id: userData.user?._id,
                status: {
                    type: "REQUEST",
                    messages: "Đã gửi yêu cầu",
                },
                priceValid: sumAvailable,
                descriptionTake: "Đang chờ xác nhận",
            },
            sendToken: true,
        }).then((res) => {
            setSumAvailable(0);
            setSumRequest(
                (prevSumRequest) => prevSumRequest + sumAvailable
            );
            utilsHandler.notify(
                notifyType.SUCCESS,
                "Đã gửi yêu cầu nhận tiền thành công!!!"
            );
        });
    };

    return (
        <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 5, paddingHorizontal: 20, paddingVertical: 10, height: '100%', position: 'relative' }}>
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
            >Doanh thu của bác sĩ.</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <TouchableOpacity onPress={() => handleReceive()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: 100 }}>
                    <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Rút Tiền</Text>
                </TouchableOpacity>
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

            <View style={{ width: '100%', height: 70, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%', backgroundColor: '#e59866', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', borderRadius: 10, flexDirection: 'row', padding: 10 }}>
                    <CalenderCheck
                        name="calendar-check-o"
                        style={{ fontSize: 35, color: "white" }}
                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>{formatMoney(sumAvailable)}đ</Text>
                        <Text style={{ color: 'white' }}>Có thể nhận</Text>
                    </View>
                </View>
                <View style={{ width: '48%', backgroundColor: '#f5b041', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', borderRadius: 10, flexDirection: 'row', padding: 10 }}>
                    <Octicons
                        name="hourglass"
                        style={{ fontSize: 35, color: "white" }}
                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>{formatMoney(sumRequest)}đ</Text>
                        <Text style={{ color: 'white' }}>Đang chờ nhận</Text>
                    </View>
                </View>
            </View>
            <View style={{ width: '100%', height: 70, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%', backgroundColor: '#5dade2', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', borderRadius: 10, flexDirection: 'row', padding: 10 }}>
                    <MaterialCommunityIcons
                        name="chart-line"
                        style={{ fontSize: 35, color: "white" }}
                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>{formatMoney(sumAccept)}đ</Text>
                        <Text style={{ color: 'white' }}>Đã Duyệt</Text>
                    </View>
                </View>
                <View style={{ width: '48%', backgroundColor: '#76d7c4', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', borderRadius: 10, flexDirection: 'row', padding: 10 }}>
                    <Icon5
                        name="coins"
                        style={{ fontSize: 34, color: "white" }}
                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>{formatMoney(sumComplete)}đ</Text>
                        <Text style={{ color: 'white' }}>Đã Nhận</Text>
                    </View>
                </View>
            </View>
            <ScrollView style={{ flexDirection: 'column', width: '100%' }}>
                {dsPayBack.map((payback, index) => (
                    <View key={index} style={{ flexDirection: 'column', marginBottom: 5, width: '100%', gap: 5, backgroundColor: '#f7f7f7', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 600 }}>{ticketType === '1' ? 'Tư vấn sức khỏe trực tuyến' : ticketType === '2' ? 'Dịch vụ theo dõi sức khỏe' : 'Tư vấn sức khỏe tại nhà'}</Text>
                        <Text>{formatMoney(payback.price)}đ</Text>
                        <Text>{payback.date?.time}-{payback.date?.day}/{payback.date?.month}/{payback.date?.year}</Text>
                        <Text style={{
                            color:
                                payback.status?.type === "AVAILABLE"
                                    ? "black"
                                    : payback.status?.type ===
                                        "REQUEST"
                                        ? "#FFFF00"
                                        : payback.status?.type ===
                                            "ACCEPT"
                                            ? "green"
                                            : payback.status?.type ===
                                                "REFUSE"
                                                ? "red"
                                                : "blue",
                        }}>{payback.status?.messages}</Text>
                    </View>
                ))}
            </ScrollView>
            {(display) && (
                <Pressable
                    onPress={() => setDisplay(false)}
                    style={{
                        position: "absolute",
                        width,
                        height,
                        top: 0,
                        left: 0,
                        backgroundColor: "#00000053",
                        zIndex: 1,
                    }}
                />
            )}
        </View>
    )
}

export default MyProfitScreen