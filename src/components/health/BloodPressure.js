import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TouchableOpacity } from 'react-native'
import { TextInput, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { api, TypeHTTP } from '../../utils/api'
import { utilsContext } from '../../contexts/UtilsContext'
import { notifyType } from '../../utils/notify'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'

const BloodPressure = ({ logBook, setLogBook }) => {

    const { width } = Dimensions.get('window');
    const [dsTimes, setDsTimes] = useState([])
    const [dsTamTruong, setDsTamTruong] = useState([])
    const [dsTamThu, setDsTamThu] = useState([])
    const [tamThu, setTamThu] = useState('')
    const [tamTruong, setTamTruong] = useState('')
    const { userData } = useContext(userContext)
    const { utilsHandler } = useContext(utilsContext)

    useEffect(() => {
        if (logBook) {
            const times = logBook.disMon.filter(item => item.vitalSign.bloodPressure !== '').map(item => `(${item.date.time}) ${item.date.day}/${item.date.month}/${item.date.year}`).slice(-10)
            const dsTamTruong = logBook.disMon.filter(item => item.vitalSign.bloodPressure !== '').map(item => item.vitalSign.bloodPressure.split('/')[1]).slice(-10)
            const dsTamThu = logBook.disMon.filter(item => item.vitalSign.bloodPressure !== '').map(item => item.vitalSign.bloodPressure.split('/')[0]).slice(-10)
            setDsTimes(times)
            setDsTamTruong(dsTamTruong)
            setDsTamThu(dsTamThu)
        }
    }, [logBook]);

    const resetForm = () => {
        setTamThu('')
        setTamTruong('')
    }

    const handleSubmit = () => { // sửa ở đây
        if (tamThu === "" || tamTruong === "") {
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập đầy đủ thông tin");
            return;
          }
          if (isNaN(Number(tamThu)) || isNaN(Number(tamTruong))) {
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập số");
            return;
          }
          if (Number(tamThu) <= 0 || Number(tamThu) >= 200) {
            utilsHandler.notify(notifyType.WARNING, "Tâm thu không hợp lệ");
            return;
          }
          if (Number(tamTruong) <= 0 || Number(tamTruong) >= 200) {
            utilsHandler.notify(notifyType.WARNING, "Tâm trương không hợp lệ");
            return;
          }
        const dataAI = {
            patient: {
                sex: userData.user?.sex,
                dateOfBirth: userData.user?.dateOfBirth
            },
            vitalSign: {
                bloodPressure: tamThu + '/' + tamTruong
            }
        }
        api({ sendToken: false, type: TypeHTTP.POST, path: '/chats/bloodPressure-warning', body: dataAI })
            .then(resAI => {
                utilsHandler.notify(notifyType.NOTIFYAI, `Huyết áp ngày hôm nay của bạn: ${resAI.comment} ${resAI.advice}`)
                const body = {
                    _id: logBook._id,
                    disMonItem: {
                        vitalSign: {
                            bloodPressure: tamThu + '/' + tamTruong
                        },
                        date: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                    },
                    status_bloodPressure: {
                        status_type: resAI.status,
                        message: resAI.comment,
                    }
                }
                api({ type: TypeHTTP.POST, sendToken: true, path: '/healthLogBooks/update-blood-pressure', body })
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
                                        bloodPressure: tamThu + '/' + tamTruong
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
                                            content: 'Đã gửi báo cáo huyết áp',
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
            <TextInput value={tamThu} onChangeText={e => setTamThu(e)} placeholder='Tâm thu...' style={{ color: 'black', height: 45, zIndex: 1, width: '80%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={tamTruong} onChangeText={e => setTamTruong(e)} placeholder='Tâm trương...' style={{ color: 'black', height: 45, zIndex: 1, width: '80%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TouchableOpacity onPress={() => handleSubmit()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 43, width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 15, color: 'white', fontFamily: 'Nunito-B' }}>Xác nhận</Text>
            </TouchableOpacity>
            <LineChart
                data={dsTamThu.map((item, index) => {
                    return {
                        value: Number(item),
                        label: dsTimes[index]
                    }
                })}
                data2={dsTamTruong.map((item, index) => {
                    return {
                        value: Number(item),
                        label: dsTimes[index]
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
                {dsTimes.map((time, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between', paddingHorizontal: 10, backgroundColor: '#f9f9f9', paddingVertical: 5, borderRadius: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S' }}>Tâm Trương: {dsTamTruong[index]}</Text>
                        <Text style={{ fontFamily: 'Nunito-S' }}>Tâm Thu: {dsTamThu[index]}</Text>
                        <Text style={{ fontFamily: 'Nunito-S' }}>{time}</Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    )
}

export default BloodPressure