import React, { useContext, useEffect, useState } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import { userContext } from '../../contexts/UserContext'
import { api, TypeHTTP } from '../../utils/api'
import CalenderCheck from 'react-native-vector-icons/FontAwesome';
import { returnNumber } from '../../utils/other';
import { TouchableOpacity } from 'react-native';
import { convertDateToDayMonthYearObject, convertDateToDayMonthYearVietNam } from '../../utils/date';
import { notifyType } from '../../utils/notify';
import { utilsContext } from '../../contexts/UtilsContext';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';

const CuocHenTaiNha = ({ type, setType }) => {
    const [doctorRecord, setDoctorRecord] = useState()
    const { userData } = useContext(userContext)
    const { utilsHandler } = useContext(utilsContext)
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler, payloadData } = useContext(payloadContext)

    useEffect(() => {
        if (userData.user) {
            api({
                type: TypeHTTP.GET,
                path: `/doctorRecords/getById/${userData.user?._id}`,
                sendToken: false,
            }).then((res) => {
                setDoctorRecord(res);
            })
        }
    }, [userData])

    useEffect(() => {
        if (doctorRecord) {
            if (type === "6") {
                api({
                    type: TypeHTTP.GET,
                    path: `/appointmentHomes/findByRecord/${doctorRecord?._id}`,
                    sendToken: true,
                }).then((res) => {
                    payloadHandler.setAppointmentHomes(res);
                });
            } else if (type === "1" || type === "2") {
                let date = new Date();
                date.setDate(date.getDate() + (Number(type) - 1))
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
                    path: "/appointmentHomes/findByDate",
                    body,
                    sendToken: false,
                }).then((res) => {
                    payloadHandler.setAppointmentHomes(res);
                });
            } else if (type === "3") {
                const body = {
                    doctor_record_id:
                        doctorRecord._id,
                };
                api({
                    type: TypeHTTP.POST,
                    path: "/appointmentHomes/findByWeek",
                    body,
                    sendToken: false,
                }).then((res) => {
                    payloadHandler.setAppointmentHomes(res);
                });
            } else if (type === "4") {
                const body = {
                    doctor_record_id:
                        doctorRecord._id,
                };
                api({
                    type: TypeHTTP.POST,
                    path: "/appointmentHomes/findByMonth",
                    body,
                    sendToken: false,
                }).then((res) => {
                    payloadHandler.setAppointmentHomes(res);
                });
            } else if (type === "5") {
                const body = {
                    doctor_record_id:
                        doctorRecord._id,
                };
                api({
                    type: TypeHTTP.POST,
                    path: "/appointmentHomes/findByNextMonth",
                    body,
                    sendToken: false,
                }).then((res) => {
                    payloadHandler.setAppointmentHomes(res);
                });
            }
        }
    }, [type, doctorRecord]);

    const handleRejectAppointmentHome = (appointment) => {
        const body = {
            _id: appointment._id,
            status: {
                status_type: "REJECTED",
                message: "Bác sĩ đã từ chối",
            }
        };
        utilsHandler.notify(
            notifyType.LOADING,
            "Đang thực hiện thao tác"
        );
        api({
            sendToken: true,
            path: "/appointmentHomes/doctor-reject",
            type: TypeHTTP.POST,
            body: body,
        }).then((res) => {
            setAppointmentHomes((prev) =>
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
            // });
        });
    };

    return (
        <View style={{ flexDirection: 'column', width: '100%', gap: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center', height: 80 }}>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff7777', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
                    <CalenderCheck name='calendar' style={{ fontSize: 35, color: 'white' }} />
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>{returnNumber(payloadData.appointmentHomes.length)}</Text>
                        <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Tất cả cuộc hẹn</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: 'orange', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
                    <CalenderCheck name='calendar-check-o' style={{ fontSize: 35, color: 'white' }} />
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                            {returnNumber(
                                payloadData.appointmentHomes.filter(
                                    (item) => item.status.status_type === "ACCEPTED"
                                ).length
                            )}
                        </Text>
                        <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đã chấp nhận</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#66cc66', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
                    <CalenderCheck name='calendar-plus-o' style={{ fontSize: 35, color: 'white' }} />
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                            {returnNumber(
                                payloadData.appointmentHomes.filter(
                                    (item) => item.status.status_type === "QUEUE"
                                ).length
                            )}
                        </Text>
                        <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đang chờ</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff2222', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
                    <CalenderCheck name='calendar-times-o' style={{ fontSize: 35, color: 'white' }} />
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                            {returnNumber(
                                payloadData.appointmentHomes.filter(
                                    (item) => item.status.status_type === "REJECTED"
                                ).length
                            )}
                        </Text>
                        <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đã từ chối</Text>
                    </View>
                </View>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', gap: 10 }}>
                {payloadData.appointmentHomes.reverse().map((home, index) => (
                    <TouchableOpacity onPress={() => {
                        menuHandler.setDisplayDetailAppointmentHome(true)
                        payloadHandler.setAppointmentHome(home)
                    }} key={index} style={{ flexDirection: 'row', gap: 10, backgroundColor: '#f8f9f9', paddingHorizontal: 10, paddingVertical: 10, alignItems: 'flex-start' }}>
                        <Image source={{ uri: home.patient.image }} style={{ height: 60, width: 60, borderRadius: 60 }} />
                        <View style={{ flexDirection: 'column', gap: 3 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Text style={{ fontSize: 16, fontWeight: 600 }}>Bệnh nhân:</Text>
                                <Text style={{ fontSize: 16 }}>{home.patient.fullName}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                {/* <Text style={{ fontSize: 15, fontWeight: 600 }}>Thời gian:</Text> */}
                                <Text style={{ fontSize: 15 }}>{['ACCEPTED', 'COMPLETED'].includes(home.status?.status_type) ? `${convertDateToDayMonthYearVietNam(
                                    home.appointment_date
                                )}` : 'Chưa rõ thời gian'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                {/* <Text style={{ fontSize: 16, fontWeight: 600 }}>Trạng thái:</Text> */}
                                <Text style={{
                                    fontSize: 16, color:
                                        home.status?.status_type === "QUEUE"
                                            ? "black"
                                            : home.status?.status_type ===
                                                "ACCEPTED"
                                                ? "green"
                                                : home?.status.status_type === "COMPLETED" ? 'blue' : "red",
                                }}>{home.status?.message}</Text>
                            </View>
                            <Text style={{
                                fontSize: 14,
                                width: '60%'
                            }}>{home.note}</Text>
                            {userData.user.role === 'USER' ?
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    {home.status?.status_type === "QUEUE" && (
                                        <>
                                            <TouchableOpacity onPress={() => handleRejectAppointmentHome(home)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Hủy</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                                :
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    {home.status?.status_type === "QUEUE" && (
                                        <>
                                            <TouchableOpacity onPress={() => {
                                                payloadHandler.setAppointmentHome(home)
                                                menuHandler.setDisplayScheduleAppoimentHome(true)
                                            }} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Chấp nhận</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleRejectAppointmentHome(home)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Từ chối</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            }
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View >
    )
}

export default CuocHenTaiNha