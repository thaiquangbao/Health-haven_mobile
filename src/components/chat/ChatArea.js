import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { io } from 'socket.io-client'
import { api, baseURL, TypeHTTP } from '../../utils/api';
const socket = io.connect(baseURL)
import BloodPressure from '../../../assets/bloodpressure.png'
import BMI from '../../../assets/bmi.png'
import HeartBeat from '../../../assets/heartbeat.png'
import Weight from '../../../assets/weight.png'
import Tempurature from '../../../assets/tempurature.png'
import Height from '../../../assets/height.png'
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import { convertDateToDayMonthYearTimeObject } from '../../utils/date';
import * as ImagePicker from 'expo-image-picker';

const ChatArea = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { width } = Dimensions.get('window');
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState()
    const [translateX] = useState(new Animated.Value(menuData.displayChatArea === true ? 0 : width));
    const messageRef = useRef()
    const wrapperRef = useRef(null)

    useEffect(() => {
        if (userData.user) {
            setCurrentUser(userData.user?.role === "USER" ? 'PATIENT' : 'DOCTOR')
        }
    }, [userData.user])

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayChatArea === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayChatArea]);

    useEffect(() => {
        if (payloadData.currentRoom) {
            api({ type: TypeHTTP.GET, sendToken: true, path: `/messages/get-messages-rooms/${payloadData.currentRoom._id}` })
                .then(messages => {
                    setMessages(messages[0])
                })
        }
    }, [payloadData.currentRoom])


    const handleSentMessage = () => {
        if (message !== '') {
            const newMessage = {
                content: message,
                time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                author: userData.user?.role === 'USER' ? 'PATIENT' : 'DOCTOR',
                type: 'TEXT'
            }
            const newMessages = JSON.parse(JSON.stringify(messages))
            newMessages.messages.push(newMessage)
            api({ sendToken: true, type: TypeHTTP.POST, path: '/messages/update', body: newMessages })

            const room = JSON.parse(JSON.stringify(payloadData.currentRoom))
            room.lastMessage = {
                author: userData.user.role === 'USER' ? 'PATIENT' : 'DOCTOR',
                content: message,
                time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
            }
            api({ sendToken: true, type: TypeHTTP.POST, path: '/rooms/update', body: room })
            setMessage('')
        }
    }

    useEffect(() => {
        socket.on(`message.update${payloadData.currentRoom?._id}`, (messages) => {
            setMessages(messages)
        })
        return () => {
            socket.off(`message.update${payloadData.currentRoom?._id}`);
        }
    }, [socket, payloadData.currentRoom?._id])

    useEffect(() => {
        socket.on(`room.update${payloadData.currentRoom?._id}`, (room) => {
            payloadHandler.setCurrentRoom(room)
            payloadHandler.setRooms(prev => prev.map(item => {
                if (item._id === room._id) {
                    return room
                }
                return item
            }))
        })
        return () => {
            socket.off(`room.update${payloadData.currentRoom?._id}`);
        }
    }, [socket, payloadData.currentRoom?._id])


    const openGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.cancelled) { // sửa chổ này
                const file = {
                    base64: result.assets[0].base64,
                    originalname: result.assets[0].fileName,
                    uri: result.assets[0].uri,
                    mimetype: result.assets[0].mimeType,
                    size: result.assets[0].fileSize
                }
                api({ sendToken: false, body: [file], path: '/upload-image/mobile/upload', type: TypeHTTP.POST })
                    .then(res => {
                        const newMessage = {
                            content: res[0],
                            time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                            author: userData.user?.role === 'USER' ? 'PATIENT' : 'DOCTOR',
                            type: 'IMAGE'
                        }
                        const newMessages = JSON.parse(JSON.stringify(messages))
                        newMessages.messages.push(newMessage)
                        api({ sendToken: true, type: TypeHTTP.POST, path: '/messages/update', body: newMessages })


                        const room = JSON.parse(JSON.stringify(payloadData.currentRoom))
                        room.lastMessage = {
                            author: userData.user.role === 'USER' ? 'PATIENT' : 'DOCTOR',
                            content: 'Đã gửi 1 hình ảnh',
                            time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                        }
                        api({ sendToken: true, type: TypeHTTP.POST, path: '/rooms/update', body: room })
                        setMessage('')
                    })
            }
        } catch (error) {
            console.error('Lỗi khi mở thư viện ảnh:', error);
        }
    };

    const handleShowUpdateHealth = () => {
        api({ type: TypeHTTP.GET, sendToken: true, path: `/healthLogBooks/findByPatient/${userData.user._id}` })
            .then(logBooks => {
                const logBook = logBooks.filter(item => item.doctor._id === payloadData.currentRoom.doctor._id && item.status.status_type === 'ACCEPTED')[0];
                payloadHandler.setLogbook(logBook)
                menuHandler.setDisplayHealth(true)
            })
    }

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
                <TouchableOpacity onPress={() => menuHandler.setDisplayChatArea(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingTop: 50 }}>
                <View style={{ flexDirection: 'row', width: '100%', gap: 10, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        {userData.user?.role === 'DOCTOR' ? (
                            <Image source={{ uri: payloadData.currentRoom?.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                        ) : (
                            <View style={{
                                height: 50,
                                width: 50,
                                borderWidth: 1,
                                borderColor: '#1dcbb6',
                                overflow: 'hidden',
                                borderRadius: 150
                            }}>
                                <Image
                                    source={{
                                        uri: payloadData.currentRoom?.doctor.image
                                    }}
                                    style={{
                                        height: 70,
                                        width: 50,
                                    }}
                                />
                            </View>
                        )}
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>{userData.user?.role === 'USER' ? 'BS. ' + payloadData.currentRoom?.doctor.fullName : payloadData.currentRoom?.patient.fullName}</Text>
                            <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Đang Hoạt Động</Text>
                        </View>
                    </View>
                    {currentUser === 'PATIENT' && (
                        <TouchableOpacity onPress={() => handleShowUpdateHealth()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, paddingHorizontal: 20 }}>
                            <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-B' }}>Sức Khỏe</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ height: 1, width: '100%', backgroundColor: '#d5dbdb', marginTop: 10 }} />
                <ScrollView onContentSizeChange={() => {
                    wrapperRef.current.scrollToEnd({ animated: true });
                }} ref={wrapperRef} style={{ flexDirection: 'column', width: '100%', height: '80%', marginTop: 10 }}>
                    <View ref={messageRef} style={{ flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center' }}>
                        {messages && messages.messages.map((message, index) => {
                            if (message.author === 'SYSTEM') {
                                return <View key={index} style={{ width: '100%', marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, backgroundColor: '#f5f5f5' }}>{message.content}</Text>
                                </View>
                            } else {
                                if (message.author === currentUser) {
                                    if (message.type === 'TEXT') {
                                        return <View key={index} style={{ width: '100%', flexDirection: 'column', borderRadius: 5, alignItems: 'flex-end', justifyContent: 'center', marginTop: 10 }}>
                                            <View key={index} style={{ flexDirection: 'column', maxWidth: '70%', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 3, alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.content}</Text>
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                    else if (message.type === 'IMAGE') {
                                        return <View key={index} style={{ width: '100%', flexDirection: 'column', borderRadius: 5, alignItems: 'flex-end', justifyContent: 'center', marginTop: 10 }}>
                                            <View key={index} style={{ flexDirection: 'column', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <Image source={{ uri: message.content }} style={{ width: 190, height: 90, borderRadius: 5 }} />
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', marginTop: 5 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                    else {
                                        return <View key={index} style={{ width: '100%', flexDirection: 'row', borderRadius: 5, alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 }}>
                                            <View key={index} style={{ flexDirection: 'column', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 10, gap: 5, alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    {message.vitals.height !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Height} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{((message.vitals.height / 100) + '').split('.')[0] + 'm' + ((message.vitals.height / 100) + '').split('.')[1]}</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.weight !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Weight} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.weight} kg</Text>
                                                        </View>
                                                    )}
                                                    {(message.vitals.weight !== 0 && message.vitals.height !== 0) && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={BMI} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{(message.vitals.weight / ((message.vitals.height / 100) * (message.vitals.height / 100))).toFixed(2)}</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.temperature !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Tempurature} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.temperature}°C</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.bloodPressure !== '' && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={BloodPressure} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.bloodPressure} mmHg</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.heartRate !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={HeartBeat} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.heartRate}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{!message.content ? 'Tôi vừa cập nhật thông tin sức khỏe' : message.content}</Text>
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                } else {
                                    if (message.type === 'TEXT') {

                                        return <View key={index} style={{ width: '100%', flexDirection: 'row', borderRadius: 5, alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginTop: 10 }}>
                                            {userData.user?.role === 'DOCTOR' ? (
                                                <Image source={{ uri: payloadData.currentRoom?.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                                            ) : (
                                                <View style={{
                                                    height: 50,
                                                    width: 50,
                                                    borderWidth: 1,
                                                    borderColor: '#1dcbb6',
                                                    overflow: 'hidden',
                                                    borderRadius: 150
                                                }}>
                                                    <Image
                                                        source={{
                                                            uri: payloadData.currentRoom?.doctor.image
                                                        }}
                                                        style={{
                                                            height: 70,
                                                            width: 50,
                                                        }}
                                                    />
                                                </View>
                                            )}
                                            <View key={index} style={{ flexDirection: 'column', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 3, maxWidth: '70%', alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.content}</Text>
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                    else if (message.type === 'IMAGE') {
                                        return <View key={index} style={{ width: '100%', flexDirection: 'row', borderRadius: 5, alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginTop: 10 }}>
                                            {userData.user?.role === 'DOCTOR' ? (
                                                <Image source={{ uri: payloadData.currentRoom?.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                                            ) : (
                                                <View style={{
                                                    height: 50,
                                                    width: 50,
                                                    borderWidth: 1,
                                                    borderColor: '#1dcbb6',
                                                    overflow: 'hidden',
                                                    borderRadius: 150
                                                }}>
                                                    <Image
                                                        source={{
                                                            uri: payloadData.currentRoom?.doctor.image
                                                        }}
                                                        style={{
                                                            height: 70,
                                                            width: 50,
                                                        }}
                                                    />
                                                </View>
                                            )}
                                            <View key={index} style={{ flexDirection: 'column', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 3, maxWidth: '70%', alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <Image source={{ uri: message.content }} style={{ width: 190, height: 90, borderRadius: 5 }} />
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                    else {
                                        return <View key={index} style={{ width: '100%', flexDirection: 'row', borderRadius: 5, alignItems: 'center', justifyContent: 'flex-start', marginTop: 10, gap: 10 }}>
                                            {userData.user?.role === 'DOCTOR' ? (
                                                <Image source={{ uri: payloadData.currentRoom?.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                                            ) : (
                                                <View style={{
                                                    height: 50,
                                                    width: 50,
                                                    borderWidth: 1,
                                                    borderColor: '#1dcbb6',
                                                    overflow: 'hidden',
                                                    borderRadius: 150
                                                }}>
                                                    <Image
                                                        source={{
                                                            uri: payloadData.currentRoom?.doctor.image
                                                        }}
                                                        style={{
                                                            height: 70,
                                                            width: 50,
                                                        }}
                                                    />
                                                </View>
                                            )}
                                            <View key={index} style={{ flexDirection: 'column', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 10, gap: 5, alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    {message.vitals.height !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Height} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{((message.vitals.height / 100) + '').split('.')[0] + 'm' + ((message.vitals.height / 100) + '').split('.')[1]}</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.weight !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Weight} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.weight} kg</Text>
                                                        </View>
                                                    )}
                                                    {(message.vitals.weight !== 0 && message.vitals.height !== 0) && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={BMI} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{(message.vitals.weight / ((message.vitals.height / 100) * (message.vitals.height / 100))).toFixed(2)}</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.temperature !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={Tempurature} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.temperature}°C</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.bloodPressure !== '' && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={BloodPressure} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.bloodPressure} mmHg</Text>
                                                        </View>
                                                    )}
                                                    {message.vitals.heartRate !== 0 && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                            <Image source={HeartBeat} style={{ width: 35, height: 35, borderRadius: 5 }} />
                                                            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 5 }}>{message.vitals.heartRate}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{!message.content ? 'Tôi vừa cập nhật thông tin sức khỏe' : message.content}</Text>
                                                <Text style={{ fontSize: 12, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{message.time.time}</Text>
                                            </View>
                                        </View>
                                    }
                                }
                            }
                        })}
                    </View>
                </ScrollView>
            </View>
            <View style={{ flexDirection: 'row', zIndex: 1, marginTop: 20, position: 'absolute', left: 0, justifyContent: 'center', width: '100%', backgroundColor: 'white', paddingVertical: 10, bottom: 10, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                    <TextInput value={message} onChangeText={e => setMessage(e)} placeholder='Soạn Tin Nhắn' style={{ width: '75%', borderWidth: 1, height: 40, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderColor: '#e5e7e9' }} />
                    <TouchableOpacity onPress={() => openGallery()}>
                        <Icon2 name='image' style={{ fontSize: 27, zIndex: 1, color: '#999' }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSentMessage()}>
                        <Icon3 name='send' style={{ fontSize: 27, zIndex: 2, color: '#999' }} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View >
    )
}

export default ChatArea