import React, { useContext, useEffect, useRef, useState } from 'react'
import { Animated, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { menuContext } from '../../contexts/MenuContext';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { utilsContext } from '../../contexts/UtilsContext';
import { notifyType } from '../../utils/notify';
import { payloadContext } from '../../contexts/PayloadContext';

const AddMedical = () => {
    const { menuData, menuHandler } = useContext(menuContext);
    const { width } = Dimensions.get('window');
    const { utilsHandler } = useContext(utilsContext)
    const [translateX] = useState(new Animated.Value(menuData.displayAddMedical === true ? 0 : width));
    const scrollViewRef = useRef(null);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuData.displayAddMedical === true ? 0 : width,
            duration: 300, // Thời gian animation (ms)
            useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
        }).start();
    }, [menuData.displayAddMedical]);

    // theem thuoc
    const [nameMedical, setNameMedical] = useState('')
    const [medicalData, setMedicalData] = useState([])
    const [medicalFilter, setMedicalFilter] = useState([])
    const [quantity, setQuantity] = useState('')
    const [unitOfCalculation, setUnitOfCalculation] = useState("");
    const [selectedMedical, setSelectedMedical] = useState()
    const { payloadHandler } = useContext(payloadContext)
    const [custom, setCustom] = useState(false)
    const [step, setStep] = useState(0)
    useEffect(() => {
        axios.post('https://prod.jiohealth.com:8443/jio-search/v1/search/retail/products-advance?offset=0&limit=315&sortName=PRICE&isDescending=false&categories=82&token=b161dc46-207d-11ee-aa37-02b973dc30b0&userID=1')
            .then(res => {
                setMedicalData(res.data.data.products)
            })
    }, [])

    useEffect(() => {
        setSelectedMedical()
    }, [menuData.displayAddMedical])

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: step * width, animated: true });
        }
    }, [step])

    useEffect(() => {
        if (nameMedical !== '') {
            const filter = medicalData.filter(item => item.title.toLowerCase().trim().includes(nameMedical.toLowerCase().trim()))
            setMedicalFilter(filter)
        } else {
            setMedicalFilter(medicalData)
        }
    }, [nameMedical])

    function checkIntegerString(value) {
        if (value === '') {
            return false
        }
        const parsedValue = Number(value);
        if (
            !isNaN(parsedValue) &&
            Number.isInteger(parsedValue)
        ) {
            return true;
        } else {
            return false;
        }
    }

    const handleAddMedical = () => {
        if (nameMedical === '') {
            utilsHandler.notify(
                notifyType.WARNING,
                "Vui lòng chọn thuốc"
            );
            return
        }
        if (quantity === '') {
            utilsHandler.notify(
                notifyType.WARNING,
                "Vui lòng nhập số lượng thuốc"
            );
            return
        }
        if (!checkIntegerString(quantity)) {
            utilsHandler.notify(
                notifyType.WARNING,
                "Số lượng thuốc không hợp lệ"
            );
            return
        }
        payloadHandler.setCurrentMedical({
            medicalName: nameMedical,
            quantity: Number(quantity),
            unitOfCalculation: unitOfCalculation,
        })
        setNameMedical('')
        setUnitOfCalculation('Đơn vị tính')
        setQuantity('')
        setCustom(false)
        menuHandler.setDisplayAddMedical(false)
    }


    return (
        <Animated.View
            style={{
                transform: [{ translateX }],
                position: 'absolute',
                height: '100%',
                width: '100%', // Sử dụng chiều rộng của màn hình
                backgroundColor: 'white',
                zIndex: 3,
                top: 0,
                flexDirection: 'column',
                // alignItems: 'center',
                gap: 20,
                right: 0,
            }}
        >
            <View style={{ position: 'absolute', right: 15, top: 30 }}>
                <TouchableOpacity onPress={() => {
                    menuHandler.setDisplayAddMedical(false)
                    setStep(0)
                    setNameMedical('')
                    setUnitOfCalculation('Đơn vị tính')
                    setQuantity('')
                    setCustom(false)
                    setSelectedMedical()
                }}>
                    <Icon name="x" style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
                <ScrollView scrollEnabled={false} ref={scrollViewRef} horizontal>
                    <View style={{ width, flexDirection: 'column', alignItems: 'center' }}>
                        <TextInput value={nameMedical} onChangeText={e => setNameMedical(e)} placeholder='Tên Thuốc' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '90%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', width: '90%' }}>
                            <TextInput value={quantity} onChangeText={e => setQuantity(e)} placeholder='Số lượng' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '40%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            {custom === false ? (
                                <TextInput value={unitOfCalculation} readOnly placeholder='Đơn vị tính' style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '58%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }} />
                            ) : (
                                <TouchableOpacity onPress={() => setStep(1)} style={{ color: 'black', marginTop: 5, height: 48, zIndex: 1, width: '58%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 15, borderRadius: 7, borderColor: '#bbb' }}>
                                    <Text>{unitOfCalculation}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 5, width: '90%' }}>
                            <TouchableOpacity onPress={() => handleAddMedical()} style={{ gap: 5, marginTop: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 5 }}>
                                <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Thêm Thuốc</Text>
                            </TouchableOpacity>
                            {selectedMedical && (
                                <TouchableOpacity onPress={() => {
                                    setNameMedical('')
                                    setUnitOfCalculation('Đơn vị tính')
                                    setQuantity('')
                                    setCustom(false)
                                    setSelectedMedical()
                                }} style={{ gap: 5, marginTop: 5, backgroundColor: 'red', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 10, borderRadius: 5 }}>
                                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Xóa thuốc đang chọn</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView style={{ width: '90%', height: '78%', marginTop: 10 }}>
                            <View style={{ width: '100%', flexDirection: 'column', gap: 10 }}>
                                {nameMedical !== '' && (
                                    <TouchableOpacity onPress={() => {
                                        setSelectedMedical({ title: nameMedical })
                                        setCustom(true)
                                    }} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <View style={{ height: 30, width: 60, flexDirection: 'row', justifyContent: 'center' }}>
                                            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8694/8694747.png' }} style={{ height: 30, width: 30 }} />
                                        </View>
                                        <Text style={{ fontSize: 14, width: '80%' }}>{nameMedical}</Text>
                                    </TouchableOpacity>
                                )}
                                {medicalFilter.map((item, index) => (
                                    <TouchableOpacity onPress={() => {
                                        setSelectedMedical(item)
                                        setNameMedical(item.title)
                                        setUnitOfCalculation(item.packaging)
                                    }} key={index} style={{ flexDirection: 'row', gap: 5 }}>
                                        <Image source={{ uri: item.images[0].images[0].url }} style={{ height: 30, width: 60 }} />
                                        <Text style={{ fontSize: 14, width: '80%' }}>{item.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={{ width, flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        {['Viên', 'Vỉ', 'Hộp', 'Ống', 'Gói', 'Chai/Lọ', 'Tuýp'].map((item, index) => (
                            <TouchableOpacity onPress={() => {
                                setUnitOfCalculation(item)
                                setStep(0)
                            }} style={{ width: '90%', backgroundColor: '#f2f3f4', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 5 }} key={index}>
                                <Text style={{ fontFamily: 'Nunito-B' }}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity onPress={() => setStep(0)} style={{ borderRadius: 5, backgroundColor: '#1dcbb6', height: 45, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '75%' }}>
                            <Text style={{ color: 'white', fontFamily: 'Nunito-B' }}>Quay Về</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Animated.View >
    )
}

export default AddMedical