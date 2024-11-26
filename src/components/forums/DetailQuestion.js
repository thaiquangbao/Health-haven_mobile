import React, { useContext, useEffect, useState } from 'react'
import { Animated, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import { userContext } from '../../contexts/UserContext';
import { api, TypeHTTP } from '../../utils/api';
import * as ImagePicker from 'expo-image-picker';
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';

const DetailQuestion = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { userData, userHandler } = useContext(userContext)
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { utilsHandler } = useContext(utilsContext)
    const [comments, setComments] = useState([]);
    const [message, setMessage] = useState('')
    const { width } = Dimensions.get('window');
    const [images, setImages] = useState([])
    const [translateX] = useState(new Animated.Value(menuData.displayDetailQuestion === true ? 0 : width));

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayDetailQuestion === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayDetailQuestion]);

    useEffect(() => {
        if (payloadData.qa) {
            api({
                path: `/qas/update-view/${payloadData.qa._id}`,
                sendToken: false,
                type: TypeHTTP.POST,
            });
            api({
                path: `/comments/get-by-qa/${payloadData.qa._id}`,
                sendToken: false,
                type: TypeHTTP.GET,
            }).then((res) => {
                setComments(res.reverse());
            });
        }
    }, [payloadData.qa]);

    const handleSendComment = async () => {
        const today = new Date();
        const vietnamTime = new Date(
            today.getTime() + 7 * 60 * 60 * 1000
        );
        const date = {
            day: vietnamTime.getDate(),
            month: vietnamTime.getMonth() + 1,
            year: vietnamTime.getFullYear(),
        };
        const data = {
            author: userData.user._id,
            text: message,
            qa: payloadData.qa._id,
            date: date,
        };
        api({ sendToken: false, body: images, path: '/upload-image/mobile/upload', type: TypeHTTP.POST })
            .then(listImage => {
                data.image = listImage
                api({
                    type: TypeHTTP.POST,
                    path: `/comments/save`,
                    body: data,
                    sendToken: true,
                }).then((res) => {
                    api({
                        type: TypeHTTP.POST,
                        path: `/qas/update-comment/${payloadData.qa._id}`,
                        sendToken: false,
                    }).then((cm) => {
                        utilsHandler.notify(notifyType.SUCCESS, "Đăng tải câu hỏi thành công !!!")
                        setMessage('')
                        setImages([])
                        setComments([res, ...comments]);
                    });
                });
            })
    };

    const openGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.cancelled) {
                const file = {
                    base64: result.assets[0].base64,
                    originalname: result.assets[0].fileName,
                    uri: result.assets[0].uri,
                    mimetype: result.assets[0].mimeType,
                    size: result.assets[0].fileSize
                }
                setImages([...images, file])
            }
        } catch (error) {
            console.error('Lỗi khi mở thư viện ảnh:', error);
        }
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
                <TouchableOpacity onPress={() => {
                    payloadHandler.setQa()
                    menuHandler.setDisplayDetailQuestion(false)
                }}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: 10, paddingHorizontal: 20, paddingVertical: 50 }}>
                {payloadData.qa && (
                    <>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>{payloadData.qa.patient.sex === true ? "Nam" : "Nữ"} , {payloadData.qa.patient.dateOfBirth}</Text>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 17, color: '#6567eb' }}>{payloadData.qa.title}</Text>
                        <Text style={{ fontFamily: 'Nunito-R', fontSize: 16 }}>{payloadData.qa.content}</Text>
                        {payloadData.qa.image && payloadData.qa.image.length > 0 && (
                            <View style={{ flexDirection: 'row', marginVertical: 10, gap: 5 }}>
                                {payloadData.qa.image.map((image, index) => (
                                    <Image key={index} source={{ uri: image }} style={{ width: 60, height: 60 }} />
                                ))}
                            </View>
                        )}
                        <View style={{ backgroundColor: '#bfdbfe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }}>
                            <Text style={{ color: '#6567eb', fontFamily: 'Nunito-B' }}>{payloadData.qa.category}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <Text style={{ fontFamily: 'Nunito-S' }}><Icon name='clock' style={{ fontSize: 15 }} /> {payloadData.qa.date.day}/{payloadData.qa.date.month}/{payloadData.qa.date.year}</Text>
                            <Text style={{ fontFamily: 'Nunito-S' }}><Icon name='eye' style={{ fontSize: 15 }} /> {payloadData.qa.views}</Text>
                            <Text style={{ fontFamily: 'Nunito-S' }}><Icon1 name='like2' style={{ fontSize: 15 }} /> {payloadData.qa.like.length}</Text>
                            <Text style={{ fontFamily: 'Nunito-S' }}><Icon1 name='message1' style={{ fontSize: 15 }} /> {payloadData.qa.comment}</Text>
                        </View>
                    </>
                )}
                {userData?.user &&
                    (userData.user?.role === "DOCTOR" ||
                        userData.user?._id === payloadData.qa?.patient?._id) && (
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'start', marginTop: 5 }}>
                            <Image source={{ uri: userData.user?.image }} style={{ height: 45, width: 45, borderRadius: 22 }} />
                            <View style={{ flexDirection: 'column', gap: 8, }}>
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <TextInput value={message} onChangeText={e => setMessage(e)} placeholder='Thêm bình luận' style={{ width: '70%', borderBottomWidth: 1, borderColor: '#e5e7e9' }} />
                                    <TouchableOpacity onPress={() => openGallery()}>
                                        <Icon2 name='image' style={{ fontSize: 24, color: '#999' }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleSendComment()}>
                                        <Icon3 name='send' style={{ fontSize: 24, color: '#999' }} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    {images.map((image, index) => (
                                        <Image key={index} source={{ uri: image.uri }} style={{ width: 45, height: 45 }} />
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                <View style={{ flexDirection: 'column', gap: 10 }}>
                    {comments.map((comment, index) => (
                        <View key={index} style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-start', marginTop: 5 }}>
                            <Image source={{ uri: comment.author?.image }} style={{ height: 45, width: 45, borderRadius: 22 }} />
                            <View style={{ flexDirection: 'column', gap: 5, width: '85%' }}>
                                <Text style={{ fontFamily: 'Nunito-B', fontSize: 15 }}>{comment.author?.fullName}</Text>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>{comment.text}</Text>
                                <View style={{ flexDirection: 'row', gap: 5 }}>
                                    {comment.image?.map(
                                        (item, imgIndex) => (
                                            <Image key={imgIndex} source={{ uri: item }} style={{ height: 60, width: 100, borderRadius: 5 }} />
                                        )
                                    )}
                                </View>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 13 }}><Icon name='clock' style={{ fontSize: 15 }} /> {comment.date?.day}/
                                    {comment.date?.month}/
                                    {comment.date?.year}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    )
}

export default DetailQuestion