import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const StatusPatient = ({ logBooks }) => {
    const { width } = Dimensions.get('window');
    const [normal, setNormal] = useState(0);
    const [warning, setWarning] = useState(0);
    useEffect(() => {
        if (logBooks.length > 0) {
            let normal_patient = 0;
            let warning_patient = 0;
            logBooks.forEach((logBook) => {
                if (logBook.status.status_type === "ACCEPTED") {
                    let warning = 0;
                    if (logBook.status_bloodPressure !== null) {
                        warning++;
                    }
                    if (logBook.status_temperature !== null) {
                        warning++;
                    }
                    if (logBook.status_heartRate !== null) {
                        warning++;
                    }
                    if (logBook.status_bmi !== null) {
                        warning++;
                    }
                    if (warning > 0) {
                        warning_patient++;
                    } else {
                        normal_patient++;
                    }
                }
                setWarning(warning_patient);
                setNormal(normal_patient);
            });
        }
    }, [logBooks]);

    return (
        <View style={{ flexDirection: 'column', gap: 15, marginTop: 10 }}>
            <Text style={{ fontFamily: 'Nunito-B', fontSize: 18 }}>Trạng Thái Sức Khỏe Bệnh Nhân</Text>
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
                        { value: warning, text: `${warning} người`, color: 'rgb(54, 162, 235)' },  // màu xanh lơ
                        { value: normal, text: `${normal} người`, color: 'rgb(255, 99, 132)' },  // màu xanh dương
                    ]}
                    focusOnPress
                    inwardExtraLengthForFocused={70}
                    extraRadius={0}
                />
                <View style={{ flexDirection: 'column', gap: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(54, 162, 235)' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Báo Động</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ height: 20, width: 20, borderRadius: 15, backgroundColor: 'rgb(255, 99, 132))' }} />
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15 }}>Bình Thường</Text>
                    </View>
                </View>
            </View>
        </View>

    );
};

export default StatusPatient;
