import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { utilsContext } from '../../contexts/UtilsContext'
import { api, TypeHTTP } from '../../utils/api'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'
import { notifyType } from '../../utils/notify'
const NhipTim = ({ logBook, setLogBook }) => {
    const { width } = Dimensions.get('window');
    const [dsTimes, setDsTimes] = useState([])
    const [value, setValue] = useState('')
    const [heartRates, setHeartRates] = useState([])
    const { userData } = useContext(userContext)
    const { utilsHandler } = useContext(utilsContext)
    useEffect(() => {
        if (logBook) {
            const times = logBook.disMon.filter(item => item.vitalSign.heartRate !== 0).map(item => `(${item.date.time}) ${item.date.day}/${item.date.month}/${item.date.year}`).slice(-10)
            const heartRates = logBook.disMon.filter(item => item.vitalSign.heartRate !== 0).map(item => item.vitalSign.heartRate).slice(-10)
            setDsTimes(times)
            setHeartRates(heartRates)
        }
    }, [logBook]);
    return (
        <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width: '100%', gap: 5 }}>
            <LineChart
                data={heartRates.map((item, index) => {
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
export default NhipTim