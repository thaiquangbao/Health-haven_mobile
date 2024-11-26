import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { utilsContext } from '../../contexts/UtilsContext'
import { api, TypeHTTP } from '../../utils/api'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'
import { notifyType } from '../../utils/notify'
const HuyetAp = ({ logBook, setLogBook }) => {
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
    return (
        <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width, gap: 5, paddingVertical: 15 }}>
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
        </View>
    )
}
export default HuyetAp;