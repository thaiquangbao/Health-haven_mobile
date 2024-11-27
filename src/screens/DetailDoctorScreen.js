import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { dataContext } from '../contexts/DataContext';
import { screenContext } from '../contexts/ScreenContext';
import { SvgUri } from 'react-native-svg';
import { api, TypeHTTP } from '../utils/api';
import { formatMoney } from '../utils/other';
import Icon from "react-native-vector-icons/AntDesign";
import { payloadContext } from '../contexts/PayloadContext';
import { menuContext } from '../contexts/MenuContext';
import { utilsContext } from '../contexts/UtilsContext';
import { userContext } from '../contexts/UserContext';
import { notifyType } from '../utils/notify';

const DetailDoctorScreen = () => {
    const { data } = useContext(dataContext)
    const { width } = Dimensions.get('window');
    const { screenData } = useContext(screenContext)
    const [doctorRecord, setDoctorRecord] = useState()
    const [assessments, setAssessments] = useState([]);
    const [priceList, setPriceList] = useState(0);
    const [forums, setForums] = useState([]);
    const { menuHandler } = useContext(menuContext)
    const { utilsHandler } = useContext(utilsContext)
    const { userData } = useContext(userContext)
    const [healthLogBooks, setHealthLogBooks] = useState([]);
    const [priceListHome, setPriceListHome] = useState(0);
    const [appointmentHomes, setAppointmentHomes] = useState(
        []
    );
    const { payloadData, payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        if (userData.user) {
            api({ type: TypeHTTP.GET, path: `/healthLogBooks/findByPatient/${userData.user?._id}`, sendToken: true })
                .then(res => {
                    setHealthLogBooks(res)
                })
            api({
                type: TypeHTTP.GET,
                path: `/appointmentHomes/findByPatient/${userData.user?._id}`,
                sendToken: true,
            }).then((res) => {
                setAppointmentHomes(res);
            });
        }

    }, [userData.user, payloadData.reload]);

    useEffect(() => {
        api({
            path: "/price-lists/getAll",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setPriceList(
                res.filter((item) => item.type === "Online")[0]
            );
            setPriceListHome(
                res.filter((item) => item.type === "Home")[0]
            );
        });
    }, [data.sicks]);

    useEffect(() => {
        setDoctorRecord(screenData.currentDoctorRecord)
    }, [screenData.currentDoctorRecord])

    useEffect(() => {
        // get assessments
        if (doctorRecord) {
            api({
                type: TypeHTTP.GET,
                path: `/assessments/getByDoctorRecord/${doctorRecord._id}`,
                sendToken: false,
            }).then((res) => {
                setAssessments(res);
            });
            api({
                type: TypeHTTP.GET,
                path: `/forums/get-by-doctor/${doctorRecord.doctor._id}`,
                sendToken: false,
            }).then((res) => {
                setForums(res);
            });
        }
    }, [doctorRecord]);


    const extractFirstParagraphAndImage = (content) => {
        // Lấy đoạn nội dung đầu tiên
        const paragraphMatch = content.match(/<p>(.*?)<\/p>/);
        const firstParagraph = paragraphMatch
            ? paragraphMatch[1]
            : "";

        // Lấy URL của hình ảnh đầu tiên
        const imgMatch = content.match(/<img\s+src="([^"]+)"/);
        const firstImageUrl = imgMatch ? imgMatch[1] : "";

        return { firstParagraph, firstImageUrl };
    };

    return (
        <ScrollView>
            <View style={{ flexDirection: 'column', paddingBottom: 30, alignItems: 'center', marginTop: 20, width, gap: 10, paddingHorizontal: 10, paddingVertical: 10 }}>
                {screenData.currentScreen === 2 && (
                    <>
                        <View style={{
                            height: 300,
                            width: 300,
                            borderWidth: 4,
                            borderColor: '#1dcbb6',
                            overflow: 'hidden',
                            borderRadius: 150
                        }}>
                            <Image
                                source={{ uri: doctorRecord?.doctor?.image }}
                                style={{
                                    height: 420,
                                    width: 300,
                                }}
                            />
                        </View>
                        <Text style={{ fontSize: 25, marginTop: 10, fontFamily: 'Nunito-B', lineHeight: 30, textAlign: 'center' }}>BS. {doctorRecord?.doctor?.fullName}</Text>

                        <View style={{ width: '100%', overflow: 'hidden', position: 'relative', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#1dcbb6', borderRadius: 8, padding: 15 }}>
                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-S', color: 'white' }}>{doctorRecord?.description}</Text>
                            {userData.user?.role !== 'DOCTOR' && (
                                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => {
                                        if (priceList && doctorRecord) {
                                            if (userData.user?.email === "") {
                                                utilsHandler.notify(
                                                    notifyType.WARNING,
                                                    "Vui lòng cập nhật email để đặt khám !!!"
                                                );
                                                return;
                                            } else {
                                                payloadHandler.setPriceList(priceList)
                                                payloadHandler.setDoctorRecord(doctorRecord)
                                                payloadHandler.setSick('Tư Vấn Trực Tuyến')
                                                menuHandler.setDisplayFormBookingNormal(true)
                                            }
                                        }
                                    }} style={{ borderRadius: 5, backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 15 }}>
                                        <Text style={{ color: 'black', fontFamily: 'Nunito-B', fontSize: 13 }}>Đặt Khám Ngay</Text>
                                    </TouchableOpacity>
                                    <View>
                                        <Text style={{ fontSize: 16, fontFamily: 'Nunito-B', color: 'white' }} >Giá Tư Vấn Trực Tuyến</Text>
                                        <Text style={{ fontSize: 15, fontFamily: 'Nunito-S', color: 'white' }} >{formatMoney(priceList?.price)}đ</Text>
                                    </View>
                                </View>
                            )}
                            {userData.user && (
                                <>
                                    {(appointmentHomes.length === 0 ||
                                        appointmentHomes
                                            .filter((item) =>
                                                ["QUEUE", "ACCEPTED"].includes(item.status.status_type)
                                            )
                                            .filter(
                                                (item) =>
                                                    item.doctor_record_id === doctorRecord?._id &&
                                                    item.patient._id === userData.user?._id
                                            ).length === 0) && (
                                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 }}>
                                                <TouchableOpacity onPress={() => {
                                                    if (priceList && doctorRecord) {
                                                        if (userData.user) {
                                                            if (userData.user?.email === "") {
                                                                utilsHandler.notify(
                                                                    notifyType.WARNING,
                                                                    "Vui lòng cập nhật email để đặt khám !!!"
                                                                );
                                                                return;
                                                            } else {
                                                                payloadHandler.setPriceList(priceListHome)
                                                                payloadHandler.setDoctorRecord(doctorRecord)
                                                                payloadHandler.setSick('Tư Vấn Tại Nhà')
                                                                menuHandler.setDisplayBookingHome(true)
                                                            }
                                                        } else {
                                                            utilsHandler.notify(
                                                                notifyType.WARNING,
                                                                "Vui lòng đăng nhập để đặt khám với bác sĩ!!!"
                                                            );
                                                        }
                                                    }
                                                }} style={{ borderRadius: 5, backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 15 }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Nunito-B', fontSize: 13 }}>Đặt Khám Ngay</Text>
                                                </TouchableOpacity>
                                                <View>
                                                    <Text style={{ fontSize: 16, fontFamily: 'Nunito-B', color: 'white' }} >Giá Tư Vấn Tại Nhà</Text>
                                                    <Text style={{ fontSize: 15, fontFamily: 'Nunito-S', color: 'white' }} >{formatMoney(priceListHome?.price)}đ</Text>
                                                </View>
                                            </View>
                                        )}
                                    {!healthLogBooks.filter(log => (log.status.status_type === 'ACCEPTED' || log.status.status_type === 'QUEUE' || log.status.status_type === 'TRANSFER')).length > 0 && (
                                        <TouchableOpacity onPress={() => {
                                            if (userData.user) {
                                                if (userData.user?.email === "") {
                                                    utilsHandler.notify(notifyType.WARNING, "Vui lòng cập nhật email để đặt khám !!!")
                                                    return;
                                                }
                                            } else {
                                                utilsHandler.notify(notifyType.WARNING, "Vui lòng đăng nhập để đặt lịch theo dõi sức khỏe với bác sĩ nhé !!!")
                                                return;
                                            }
                                            menuHandler.setDisplayServicesFollowing(true)
                                            payloadHandler.setDoctorRecord(doctorRecord)
                                        }} style={{ borderRadius: 5, backgroundColor: 'white', marginTop: 5, paddingVertical: 11, flexDirection: 'row', justifyContent: 'center' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Nunito-B', fontSize: 14 }}>Đăng Ký Theo Dõi Sức Khỏe</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>


                        <View style={{ width: '100%', gap: 10, marginTop: 20, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <View style={{
                                width: '40%', aspectRatio: 1, shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android 
                                backgroundColor: '#fbfbfb',
                                borderRadius: 8,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 8,
                                gap: 3
                            }}>
                                <SvgUri
                                    width="30"
                                    height="30"
                                    uri="https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/assets/icons/specialties-icon.svg"
                                />
                                <Text style={{ fontFamily: 'Nunito-B', marginTop: 5, fontSize: 14, textAlign: 'center' }}>Chuyên Khoa</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center' }}>{doctorRecord?.doctor.specialize}</Text>
                            </View>
                            <View style={{
                                width: '40%', aspectRatio: 1, shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android 
                                backgroundColor: '#fbfbfb',
                                borderRadius: 8,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 8,
                                gap: 3
                            }}>
                                <SvgUri
                                    width="30"
                                    height="30"
                                    uri="https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/assets/icons/school-icon.svg"
                                />
                                <Text style={{ fontFamily: 'Nunito-B', marginTop: 5, fontSize: 14, textAlign: 'center' }}>Nơi đào tạo</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center' }}>{doctorRecord?.trainingPlace}</Text>
                            </View>
                            <View style={{
                                width: '40%', aspectRatio: 1, shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android 
                                backgroundColor: '#fbfbfb',
                                borderRadius: 8,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 8,
                                gap: 3
                            }}>
                                <SvgUri
                                    width="30"
                                    height="30"
                                    uri="https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/assets/icons/degree-icon.svg"
                                />
                                <Text style={{ fontFamily: 'Nunito-B', marginTop: 5, fontSize: 14, textAlign: 'center' }}>Bằng Cấp</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center' }}>{doctorRecord?.certificate.join(", ")}</Text>
                            </View>
                            <View style={{
                                width: '40%', aspectRatio: 1, shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android 
                                backgroundColor: '#fbfbfb',
                                borderRadius: 8,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 8,
                                gap: 3
                            }}>
                                <SvgUri
                                    width="30"
                                    height="30"
                                    uri="https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/assets/icons/languages-icon.svg"
                                />
                                <Text style={{ fontFamily: 'Nunito-B', marginTop: 5, fontSize: 14, textAlign: 'center' }}>Ngôn Ngữ</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center' }}>{doctorRecord?.language.join("/")}</Text>
                            </View>
                            <View style={{
                                width: '40%', aspectRatio: 1, shadowColor: '#1dcbb6', // Màu của bóng
                                shadowOffset: { width: 0, height: 8 }, // Độ lệch của bóng
                                shadowOpacity: 0.3, // Độ mờ của bóng
                                shadowRadius: 8, // Bán kính làm mờ của bóng
                                elevation: 8, // Shadow elevation cho Android 
                                backgroundColor: '#fbfbfb',
                                borderRadius: 8,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 8,
                                gap: 3
                            }}>
                                <SvgUri
                                    width="30"
                                    height="30"
                                    uri="https://cdn.jiohealth.com/jio-website/home-page/jio-website-v2.2/assets/icons/location.svg"
                                />
                                <Text style={{ fontFamily: 'Nunito-B', marginTop: 5, fontSize: 14, textAlign: 'center' }}>Khu vực</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, textAlign: 'center' }}>{doctorRecord?.area}</Text>
                            </View>
                        </View>
                        <View style={{ width: '100%', gap: 10, flexDirection: 'column' }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Học vấn và kinh nghiệm</Text>
                            <View style={{ flexDirection: 'column', gap: 6 }}>
                                {doctorRecord?.experience_work
                                    .split("\n")
                                    .map((item, index) => (
                                        <Text key={index} style={{ fontSize: 14, fontFamily: 'Nunito-R' }}>
                                            {item}
                                        </Text>
                                    ))}
                            </View>
                        </View>
                        <View style={{ width: '100%', gap: 10, flexDirection: 'column', marginTop: 20 }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Đánh giá từ người bệnh ({assessments.length})</Text>
                            <View style={{ flexDirection: 'column', gap: 20, marginTop: 10 }}>
                                {assessments.map((assessment, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'start', gap: 10 }}>
                                        <Image
                                            source={{ uri: assessment.assessment_list.image }}
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                        <View>
                                            <Text style={{ fontSize: 16, fontFamily: "Nunito-B" }}>
                                                {assessment.assessment_list.fullName}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                                                <Text style={{ fontFamily: 'Nunito-R' }}>Đánh giá:{" "}</Text>
                                                <RenderStars rating={assessment.assessment_list.star} />
                                            </View>
                                            <Text style={{ fontFamily: 'Nunito-R' }}>
                                                Nội dung:{" "}{assessment.assessment_list.content}
                                            </Text>
                                            <Text style={{ fontFamily: 'Nunito-R' }}>
                                                Ngày:{" "}
                                                {assessment.assessment_list.date.day}/
                                                {assessment.assessment_list.date.month}/
                                                {assessment.assessment_list.date.year}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={{ width: '100%', gap: 10, flexDirection: 'column', marginTop: 20 }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 20 }}>Bài viết của bác sĩ ({forums.length})</Text>
                            <View style={{ flexDirection: 'column', gap: 20, marginTop: 10 }}>
                                {forums.map((forum, index) => {
                                    const { firstParagraph, firstImageUrl } =
                                        extractFirstParagraphAndImage(
                                            forum.content
                                        );
                                    return (
                                        <View
                                            key={index}
                                            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                                        >
                                            <Image source={{ uri: firstImageUrl }} style={{ width: 130, height: 70 }} />
                                            <View style={{ width: '100%' }} >
                                                <Text style={{ fontSize: 14, fontFamily: 'Nunito-B', width: '60%' }}>
                                                    {forum.title}
                                                </Text>
                                                <View style={{ flexDirection: 'row', gap: 20 }} className="flex items-center text-gray-500 text-[13px] mt-1">
                                                    <Text style={{ fontFamily: 'Nunito-S' }}>
                                                        {forum.date.day}/{forum.date.month}/
                                                        {forum.date.year}
                                                    </Text>
                                                    <Text style={{ fontFamily: 'Nunito-S' }}>
                                                        <Icon name='eyeo' style={{ fontSize: 14, marginRight: 10 }} />
                                                        {' ' + forum.views}
                                                    </Text>
                                                    <Text style={{ fontFamily: 'Nunito-S' }}>
                                                        <Icon name='like2' style={{ fontSize: 14, marginRight: 10 }} />
                                                        {' ' + forum.like?.length}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
            </View>
        </ScrollView >
    )
}

export default DetailDoctorScreen


const RenderStars = ({ rating }) => {
    return (
        <View style={{ flexDirection: 'row', gap: 5 }}>
            <Icon name='star' style={{ fontSize: 25, color: rating >= 1 ? '#f1c40f' : '#d6d6d6' }} />
            <Icon name='star' style={{ fontSize: 25, color: rating >= 2 ? '#f1c40f' : '#d6d6d6' }} />
            <Icon name='star' style={{ fontSize: 25, color: rating >= 3 ? '#f1c40f' : '#d6d6d6' }} />
            <Icon name='star' style={{ fontSize: 25, color: rating >= 4 ? '#f1c40f' : '#d6d6d6' }} />
            <Icon name='star' style={{ fontSize: 25, color: rating >= 5 ? '#f1c40f' : '#d6d6d6' }} />
        </View>
    );
};