import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TouchableOpacity } from 'react-native'
import { TextInput, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { api, TypeHTTP } from '../../utils/api'
import { utilsContext } from '../../contexts/UtilsContext'
import { notifyType } from '../../utils/notify'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'

const Symptom = ({ logBook, setLogBook }) => {

    const { width } = Dimensions.get('window');
    const [note, setNote] = useState('')
    const [symptom, setSymptom] = useState('')
    const [dsTrieuChung, setDsTrieuChung] = useState([])
    const [dsNote, setDsNote] = useState([])
    const [dsTimes, setDsTimes] = useState([])
    const { userData } = useContext(userContext)
    const { utilsHandler } = useContext(utilsContext)

    useEffect(() => {
        if (logBook) {
            const times = logBook.disMon?.filter(item => item.symptom !== '').map(item => `(${item.date.time}) ${item.date.day}/${item.date.month}/${item.date.year}`).slice(-10)
            const dsTrieuChung = logBook.disMon?.filter(item => item.symptom !== '').map(item => item.symptom).slice(-10)
            const dsNote = logBook.disMon?.filter(item => item.note !== '').map(item => item.note).slice(-10)
            setDsTimes(times)
            setDsTrieuChung(dsTrieuChung)
            setDsNote(dsNote)
        }
    }, [logBook]);

    const resetForm = () => {
        setNote('')
        setSymptom('')
    }

    const handleSubmit = () => {
        if (symptom === "" && note === "") { // sửa ở đây
            utilsHandler.notify(notifyType.WARNING, "Hãy nhập ít nhật một thông tin");
            return;
          }
        const body = {
            _id: logBook._id,
            disMonItem: {
                symptom,
                date: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                note
            }
        }
        api({ type: TypeHTTP.POST, sendToken: true, path: '/healthLogBooks/update-symptom-note', body })
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
                            content: (symptom !== '' && note !== '') ? symptom : symptom !== '' ? symptom : note !== '' ? note : '',
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
                                    content: 'Đã gửi triệu chứng và ghi chú',
                                    time: convertDateToDayMonthYearTimeObject(new Date().toISOString()),
                                }
                                api({ sendToken: true, type: TypeHTTP.POST, path: '/rooms/update', body: room })
                            })
                    })
            })
    }

    return (
        <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width: '100%', gap: 5 }}>
            <TextInput value={symptom} onChangeText={e => setSymptom(e)} placeholder='Triệu Chứng...' style={{ color: 'black', height: 45, zIndex: 1, width: '80%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={note} onChangeText={e => setNote(e)} placeholder='Ghi Chú...' style={{ color: 'black', height: 45, zIndex: 1, width: '80%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
            <TouchableOpacity onPress={() => handleSubmit()} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 43, width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 15, color: 'white', fontFamily: 'Nunito-B' }}>Xác nhận</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontFamily: 'Nunito-B' }}>Lịch Sử Sức Khỏe</Text>
            <ScrollView style={{ width: '90%', flexDirection: 'column', height: 200 }}>
                {dsTimes.map((time, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 5, justifyContent: 'space-between', paddingHorizontal: 10, backgroundColor: '#f9f9f9', paddingVertical: 5, borderRadius: 5 }}>
                        <Text style={{ fontFamily: 'Nunito-S' }}>{dsTrieuChung[index]}</Text>
                        <Text style={{ fontFamily: 'Nunito-S' }}>Ghi Chú: {dsNote[index]}</Text>
                        <Text style={{ fontFamily: 'Nunito-S' }}>{time}</Text>
                    </View>
                ))}

            </ScrollView>
        </View>
    )
}

export default Symptom