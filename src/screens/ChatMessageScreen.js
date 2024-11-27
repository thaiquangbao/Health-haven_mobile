import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { api, TypeHTTP } from '../utils/api';
import { screenContext } from '../contexts/ScreenContext';

const ChatMessageScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler, payloadData } = useContext(payloadContext)
    const { userData } = useContext(userContext)
    const { screenData } = useContext(screenContext)

    useEffect(() => {
        if (userData.user && userData.user?.role === 'USER') {
            api({ type: TypeHTTP.GET, sendToken: true, path: `/rooms/get-room-patient/${userData.user._id}` })
                .then(rooms => {
                    payloadHandler.setRooms(rooms.filter(item => item.status === "ACTIVE"))
                })
        } else if (userData.user && userData.user?.role === 'DOCTOR') {
            api({ type: TypeHTTP.GET, sendToken: true, path: `/rooms/get-room-doctor/${userData.user._id}` })
                .then(rooms => {
                    payloadHandler.setRooms(rooms.filter(item => item.status === "ACTIVE"))
                })
        }
    }, [userData.user])

    return (
        <View>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
                {screenData.currentScreen === 9 && (<>
                    <View style={{ flexDirection: 'row', width: '100%', gap: 10, alignItems: 'center' }}>
                        {userData.user?.role === 'USER' ? (
                            <Image source={{ uri: userData.user?.image }} style={{ width: 50, height: 50, borderRadius: 50 }} />
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
                                        uri: userData.user.image
                                    }}
                                    style={{
                                        height: 70,
                                        width: 50,
                                    }}
                                />
                            </View>
                        )}

                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>{userData.user?.fullName}</Text>
                            <Text style={{ fontFamily: 'Nunito-R', fontSize: 15 }}>Đang Hoạt Động</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, width: '100%', backgroundColor: '#bfc9ca' }} />
                    <Text style={{ fontFamily: 'Nunito-B', fontSize: 17 }}>Cuộc Trò Chuyện ({payloadData.rooms.length})</Text>
                    <ScrollView style={{ width: '100%', height: '80%' }}>
                        {payloadData.rooms.map((room, index) => (
                            <TouchableOpacity onPress={() => {
                                payloadHandler.setCurrentRoom(room)
                                menuHandler.setDisplayChatArea(true)
                            }} key={index} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: '100%' }}>
                                {userData.user?.role === 'DOCTOR' ? (
                                    <Image source={{ uri: room.patient.image }} style={{ height: 50, width: 50, borderRadius: 25 }} />
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
                                                uri: room.doctor.image
                                            }}
                                            style={{
                                                height: 70,
                                                width: 50,
                                            }}
                                        />
                                    </View>
                                )}
                                <View style={{ flexDirection: 'column', gap: 1 }}>
                                    <Text style={{ fontFamily: 'Nunito-S', fontSize: 16 }}>{userData.user?.role === 'USER' ? room.doctor.fullName : room.patient.fullName}</Text>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14 }}>
                                        {(userData.user?.role === 'USER' && room.lastMessage.author === 'PATIENT') && 'Bạn: '}
                                        {(userData.user?.role === 'USER' && room.lastMessage.author === 'DOCTOR') && 'Bác sĩ: '}
                                        {(userData.user?.role === 'DOCTOR' && room.lastMessage.author === 'PATIENT') && 'Bệnh nhân: '}
                                        {(userData.user?.role === 'DOCTOR' && room.lastMessage.author === 'DOCTOR') && 'Bạn: '}
                                        {room.lastMessage.content}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            // <div key={index} onClick={() => setCurrentRoom(room)} className='cursor-pointer w-full flex gap-3 transition-all rounded-lg py-[5px] px-2 hover:bg-[#f0f0f0]'>
                            //     <div style={{ backgroundImage: `url(${userData.user?.role === 'USER' ? room.doctor.image : room.patient.image})` }} className='w-[45px] h-[45px] rounded-full bg-cover bg-start' />
                            //     <div className='flex flex-col'>
                            //         <span className='text-[14px] font-semibold'>{userData.user?.role === 'USER' ? room.doctor.fullName : room.patient.fullName}</span>
                            //         <span className='text-[13px]'>
                            //             {(userData.user?.role === 'USER' && room.lastMessage.author === 'PATIENT') && 'Bạn: '}
                            //             {(userData.user?.role === 'USER' && room.lastMessage.author === 'DOCTOR') && 'Bác sĩ: '}
                            //             {(userData.user?.role === 'DOCTOR' && room.lastMessage.author === 'PATIENT') && 'Bệnh nhân: '}
                            //             {(userData.user?.role === 'DOCTOR' && room.lastMessage.author === 'DOCTOR') && 'Bạn: '}
                            //             {room.lastMessage.content}</span>
                            //     </div>
                            // </div>
                        ))}
                    </ScrollView>
                </>)}
            </View>
            {/* )} */}
        </View>
    )
}

export default ChatMessageScreen