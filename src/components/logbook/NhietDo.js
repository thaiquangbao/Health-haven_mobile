import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { utilsContext } from '../../contexts/UtilsContext'
import { api, TypeHTTP } from '../../utils/api'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'
import { notifyType } from '../../utils/notify'
const NhietDo = ({ logBook, setLogBook }) => {
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
  return (
    <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width: '100%', gap: 5 }}>
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
    </View>
  )
}
export default NhietDo;