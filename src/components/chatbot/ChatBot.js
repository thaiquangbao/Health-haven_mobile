import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Doctor from '../../../assets/doctor-chatbot.png'
import { userContext } from '../../contexts/UserContext';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import { api, TypeHTTP } from '../../utils/api';

const ChatBot = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayChatBot === true ? 0 : width));
    const { userData } = useContext(userContext)
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([{ sender: 'chatbot', message: 'Chào bạn, tôi có thể giúp gì cho bạn trong lĩnh vực y khoa?' }])
    const [message, setMessage] = useState('')
    const [previous, setPrevious] = useState('')
    const messageRef = useRef()

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayChatBot === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayChatBot]);

    useEffect(() => {
        if (userData.user && userData.user?.processSignup === 3) {
            setMessages([{ sender: 'chatbot', message: `Chào ${userData.user.fullName.split(' ')[userData.user.fullName.split(' ').length - 1]}, tôi có thể giúp gì cho bạn trong lĩnh vực y khoa về bệnh tim mạch?` }])
        }
    }, [userData.user])

    useEffect(() => {
        setTimeout(() => {
            messageRef.current?.scrollTo({
                top: messageRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }, 500);
    }, [messages])

    const handleSendMessage = () => {
        const content = message
        setMessage('')
        setMessages([...messages, { sender: 'me', message: content }, { sender: 'chatbot', message: 'Đang trả lời câu hỏi của bạn', type: 'notify' }])
        api({ type: TypeHTTP.POST, sendToken: false, path: `/chats/ask`, body: { content: content, previous } })
            .then(res => {
                setMessages([...messages, { sender: 'me', message: content }, { sender: 'chatbot', message: res }])
                setPrevious(prev => prev + content + ' : ' + res)
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
            <View style={{ position: 'absolute', right: 15, top: 30, zIndex: 1 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplayChatBot(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', paddingHorizontal: 20, flexDirection: 'column', alignItems: 'center', paddingTop: 40, height: '100%' }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%', borderBottomWidth: 1, borderColor: '#f7f7f7', paddingBottom: 5 }}>
                    <Image source={Doctor} style={{ height: 50, width: 50, borderRadius: 25 }} />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>HealthHaven Chatbot</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <View style={{ height: 10, aspectRatio: 1, backgroundColor: 'green', borderRadius: 10 }} />
                            <Text style={{ fontSize: 14 }}>Hoạt Động 24/7</Text>
                        </View>
                    </View>
                </View>
                <ScrollView onContentSizeChange={() => {
                    messageRef.current.scrollToEnd({ animated: true });
                }} ref={messageRef} style={{ flexDirection: 'column', width: '100%', marginTop: 10 }}>
                    <View style={{ flexDirection: 'column', width: '100%', justifyContent: 'center' }}>
                        {messages.map((item, index) => (
                            <View key={index} style={{ width: '100%', flexDirection: 'column', borderRadius: 5, alignItems: item.sender === 'chatbot' ? 'flex-start' : 'flex-end', justifyContent: 'center', marginTop: 10 }}>
                                <View key={index} style={{ flexDirection: 'column', maxWidth: '70%', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 3, alignItems: 'flex-start', backgroundColor: '#f5f5f5', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 15, fontFamily: 'Nunito-R', paddingHorizontal: 10 }}>{item.message}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <View style={{ flexDirection: 'row', zIndex: 1, marginTop: 20, justifyContent: 'center', width: '100%', backgroundColor: 'white', paddingVertical: 10, bottom: 10, alignItems: 'center', gap: 10, }}>
                    <TextInput value={message} onChangeText={e => setMessage(e)} placeholder='Soạn Tin Nhắn' style={{ width: '90%', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderColor: '#e5e7e9', height: 45 }} />
                    <TouchableOpacity onPress={() => handleSendMessage()}>
                        <Icon3 name='send' style={{ fontSize: 27, zIndex: 2, color: '#999' }} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
}

export default ChatBot