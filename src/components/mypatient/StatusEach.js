import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const StatusEach = ({ logBooks }) => {
    const { width } = Dimensions.get('window');
    const [temperature, setTemperature] = useState(0);
    const [bloodPressure, setBloodPressure] = useState(0);
    const [heartRate, setHeartRate] = useState(0);
    const [bmi, setBmi] = useState(0);

    useEffect(() => {
        if (logBooks.length > 0) {
            let temperature = 0;
            let bloodPressure = 0;
            let heartRate = 0;
            let bmi = 0;
            logBooks.forEach((logBook) => {
                if (logBook.status.status_type === "ACCEPTED") {
                    if (logBook.status_bloodPressure !== null) {
                        bloodPressure++;
                    }
                    if (logBook.status_temperature !== null) {
                        temperature++;
                    }
                    if (logBook.status_heartRate !== null) {
                        heartRate++;
                    }
                    if (logBook.status_bmi !== null) {
                        bmi++;
                    }
                }
            });
            setTemperature(temperature);
            setBloodPressure(bloodPressure);
            setHeartRate(heartRate);
            setBmi(bmi);
        }
    }, [logBooks]);

    return (
        <View style={{ flexDirection: 'column', gap: 15 }}>
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>Báo Động Chỉ Số Sức Khỏe</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <PieChart
                    donut
                    showText
                    textColor="black"
                    innerRadius={30}
                    radius={80}
                    showTextBackground
                    textBackgroundColor="white"
                    textBackgroundRadius={10}
                    data={[
                        { value: bloodPressure, text: bloodPressure, color: 'rgb(54, 162, 235)' },  // màu xanh lơ
                        { value: heartRate, text: heartRate, color: 'rgb(255, 99, 132)' },  // màu xanh dương
                        { value: bmi, text: bmi, color: 'rgb(255, 205, 86)' },  // màu vàng
                        { value: temperature, text: temperature, color: 'rgb(75, 192, 192)' }  // màu xanh lá
                    ]}
                    focusOnPress
                    inwardExtraLengthForFocused={70}
                    extraRadius={0}
                />
                <View style={{ flexDirection: 'column', gap: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(54, 162, 235)' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Huyết Áp</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(255, 99, 132))' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Nhịp Tim</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(255, 205, 86)' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>BMI</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(75, 192, 192)' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Nhiệt độ</Text>
                    </View>
                </View>
            </View>
        </View>

    );
};

export default StatusEach;
