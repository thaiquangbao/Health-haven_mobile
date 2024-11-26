import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { BarChart, LineChart } from 'react-native-gifted-charts'
import { userContext } from '../../contexts/UserContext'
import { utilsContext } from '../../contexts/UtilsContext'
import { api, TypeHTTP } from '../../utils/api'
import { convertDateToDayMonthYearTimeObject } from '../../utils/date'
import { notifyType } from '../../utils/notify'
const ChiSoBMI = ({ logBook, setLogBook }) => {
  const { width } = Dimensions.get('window');
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [times, setTimes] = useState([])
  const [bmis, setBmis] = useState([])
  const [heights, setHeights] = useState([])
  const [weights, setWeights] = useState([])
  const { userData } = useContext(userContext)
  const { utilsHandler } = useContext(utilsContext)
  useEffect(() => {
    if (logBook) {
      const times = logBook.disMon.filter(item => item.vitalSign.height !== 0 && item.vitalSign.weight !== 0).map(item => `(${item.date.time}) ${item.date.day}/${item.date.month}/${item.date.year}`).slice(-10)
      const bmis = logBook.disMon.filter(item => item.vitalSign.height !== 0 && item.vitalSign.weight !== 0).map(item => (item.vitalSign.weight / ((item.vitalSign.height / 100) * (item.vitalSign.height / 100))).toFixed(2)).slice(-10)
      const heights = logBook.disMon.filter(item => item.vitalSign.height !== 0 && item.vitalSign.weight !== 0).map(item => item.vitalSign.height).slice(-10)
      const weights = logBook.disMon.filter(item => item.vitalSign.height !== 0 && item.vitalSign.weight !== 0).map(item => item.vitalSign.weight).slice(-10)
      setTimes(times)
      setBmis(bmis)
      setHeights(heights)
      setWeights(weights)
    }
  }, [logBook]);
  return (
    <View style={{ flexDirection: 'column', marginTop: 10, alignItems: 'center', width: '100%', gap: 5 }}>
      <LineChart
        data={bmis.map((item, index) => {
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
export default ChiSoBMI;