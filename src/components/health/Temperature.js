import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TouchableOpacity } from 'react-native'
import { TextInput, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { api, TypeHTTP } from '../../utils/api'
import { utilsContext } from '../../contexts/UtilsContext'
import { notifyType } from '../../utils/notify'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'

const Temperature = ({ logBook, setLogBook }) => {

    const { width } = Dimensions.get('window');
    const [temperature, setTemperature] = useState("");
    const [times, setTimes] = useState([])
    const [temperatures, setTemperatures] = useState([])
    const { userData } = useContext(userContext)
    const { utilsHandler } = useContext(utilsContext)

    useEffect(() => {
        if (logBook) {
            const times = logBook.disMon.filter(item => item.vitalSign.temperature !== 0).map(item => `(${item.date.time}) ${item.date.day}/${item.date.month}/${item.date.year}`).slice(-10)
            const temperatures = logBook.disMon.filter(item => item.vitalSign.temperature !== 0).map(item => item.vitalSign.temperature).slice(-10)
            setTimes(times)
            setTemperatures(temperatures)
        }
    }, [logBook]);

    const resetForm = () => {
        setTemperature('')
    }

    const handleSubmit = () => {
        if (temperature === "") {
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập đầy đủ thông tin");
            return;
          }
          if (isNaN(Number(temperature))) {
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập số");
            return;
          }
          if (Number(temperature) <= 25 || Number(temperature) >= 50) {
            utilsHandler.notify(notifyType.WARNING, "Nhiệt độ cơ thể không hợp lệ");
            return;
          }
        const dataAI = {
            patient: {
                sex: userData.user?.sex,
                dateOfBirth: userData.user?.dateOfBirth
            },
            temperature: temperature
        }

        api({ sendToken: false, type: TypeHTTP.POST, path: '/chats/temperature-warning', body: dataAI })
            .then(resAI => {
                utilsHandler.notify(notifyType.NOTIFYAI, `Nhiệt độ cơ thể ngày hôm nay của bạn: ${resAI.comment} ${resAI.advice}`)
                const body = {
                    _id: logBook._id,
                    disMonItem: {
                        vitalSign: {
                            temperature
                        },
                        date: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                    },
                    status_temperature: {
                        status_type: resAI.status,
                        message: resAI.comment
                    }
                }
                api({ type: TypeHTTP.POST, sendToken: true, path: '/healthLogBooks/update-temperature', body })
                    .then(res => {
                        setLogBook(res)
                        api({
                            type: TypeHTTP.POST, sendToken: true, path: '/rooms/get-patient-doctor', body: {
                                patient_id: logBook.patient._id,
                                doctor_id: logBook.doctor._id
                            }
                        })
                            .then(res => {
                                const newMessage = {
                                    vitals: {
                                        temperature
                                    },
                                    time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                                    author: 'PATIENT',
                                    type: 'REPORT'
                                }
                                resetForm()
                                const newMessages = JSON.parse(JSON.stringify(res[0]))
                                newMessages.messages.push(newMessage)
                                api({ sendToken: true, type: TypeHTTP.POST, path: '/messages/update', body: newMessages })

                                api({ sendToken: true, type: TypeHTTP.GET, path: `/rooms/get-one/${res[0].room}` })
                                    .then(room1 => {
                                        const room = JSON.parse(JSON.stringify(room1))
                                        room.lastMessage = {
                                            author: 'PATIENT',
                                            content: 'Đã gửi báo cáo nhiệt độ',
                                            time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                                        }
                                        api({ sendToken: true, type: TypeHTTP.POST, path: '/rooms/update', body: room })
                                    })

                            })
                    })
            })

    }

    return (
        <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width: '100%', gap: 5 }}>
            <TextInput value={temperature} onChangeText={e => setTemperature(e)} placeholder='Nhiệt Độ...' style={{ color: 'black', height: 45, zIndex: 1, width: '80%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TouchableOpacity onPress={() => handleSubmit()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 43, width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 15, color: 'white', fontFamily: 'Nunito-B' }}>Xác nhận</Text>
            </TouchableOpacity>
            <LineChart
                data={temperatures.map((item, index) => {
                    return {
                        value: Number(item),
                        label: times[index]
                    }
                })}
                height={200}
                showValuesAsDataPointsText
                showVerticalLines
                // spacing={44}
                initialSpacing={0}
                color1="skyblue"
                color2="orange"
                textColor1="green"
                dataPointsHeight={6}
                dataPointsWidth={6}
                dataPointsColor1="blue"
                dataPointsColor2="red"
                xAxisLabelTextStyle={{
                    color: 'gray',
                    fontSize: 10,
                    transform: [{ rotate: '45deg' }], // Xoay nhãn 45 độ
                    width: 100
                }}
                textShiftY={-2}
                textShiftX={-5}
                textFontSize={13}
                width={width * 0.85}
            />
            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B', marginTop: 20 }}>Lịch Sử Sức Khỏe</Text>
            <ScrollView style={{ width: '90%', flexDirection: 'column', height: 200 }}>
                {times.map((time, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between', paddingHorizontal: 10, backgroundColor: '#f9f9f9', paddingVertical: 5, borderRadius: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S' }}>Nhiệt Độ: {temperatures[index]}</Text>
                        <Text style={{ fontFamily: 'Nunito-S' }}>{time}</Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    )
}

export default Temperature