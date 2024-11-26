import React, { useContext, useEffect, useState } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { payloadContext } from '../../contexts/PayloadContext';
import BloodPressure from './BloodPressure';
import HeartBeats from './HeartBeats';
import BMI from './BMI';
import Temperature from './Temperature';
import Symptom from './Symptom';

const Health = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const [translateX] = useState(new Animated.Value(menuData.displayHealth === true ? 0 : width));
    const { payloadData, payloadHandler } = useContext(payloadContext)
    const [choose, setChoose] = useState(0)

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayHealth === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayHealth]);


    return (
        <Animated.View
            style={{
                transform: [{ translateX }],
                position: 'absolute',
                height: '100%',
                width: '100%', // Sử dụng chiều rộng của màn hình
                backgroundColor: 'white',
                zIndex: 4,
                top: 0,
                flexDirection: 'column',
                // alignItems: 'center',
                gap: 20,
                right: 0,
            }}
        >
            <View style={{ position: 'absolute', right: 15, top: 30 }}>
                <TouchableOpacity onPress={() => menuHandler.setDisplayHealth(false)}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
                <Text style={{ fontFamily: 'Nunito-B', fontSize: 22 }}>Các chỉ số của bạn</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingHorizontal: 40, justifyContent: 'center', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => setChoose(0)} style={{ backgroundColor: choose === 0 ? '#1dcbb6' : 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: '#dcdcdc' }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: choose === 0 ? 'white' : 'black' }}>Huyết Áp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChoose(1)} style={{ backgroundColor: choose === 1 ? '#1dcbb6' : 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: '#dcdcdc' }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: choose === 1 ? 'white' : 'black' }}>Nhịp Tim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChoose(2)} style={{ backgroundColor: choose === 2 ? '#1dcbb6' : 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: '#dcdcdc' }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: choose === 2 ? 'white' : 'black' }}>BMI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChoose(3)} style={{ backgroundColor: choose === 3 ? '#1dcbb6' : 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: '#dcdcdc' }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: choose === 3 ? 'white' : 'black' }}>Nhiệt độ cơ thể</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setChoose(4)} style={{ backgroundColor: choose === 4 ? '#1dcbb6' : 'white', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, borderWidth: 1, borderColor: '#dcdcdc' }}>
                        <Text style={{ fontFamily: 'Nunito-S', fontSize: 15, color: choose === 4 ? 'white' : 'black' }}>Triệu Chứng</Text>
                    </TouchableOpacity>
                </View>
                {choose === 0 ? (
                    <BloodPressure logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
                ) : choose === 1 ? (
                    <HeartBeats logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
                ) : choose === 2 ? (
                    <BMI logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
                ) : choose === 3 ? (
                    <Temperature logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
                ) : (
                    <Symptom logBook={payloadData.logbook} setLogBook={payloadHandler.setLogbook} />
                )}
            </View>
        </Animated.View >
    )
}

export default Health