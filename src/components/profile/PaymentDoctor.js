import React, { useEffect, useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import { api, TypeHTTP } from '../../utils/api';
import { formatMoney } from '../../utils/other';

const PaymentDoctor = ({ user, setUser }) => {

    const [payments, setPayments] = useState([]);
    useEffect(() => {
        api({
            sendToken: true,
            type: TypeHTTP.POST,
            path: `/payments/find-by-doctor`,
            body: { doctor_id: user?._id },
        }).then((res) => {
            setPayments(
                res.filter((item) => item.namePayment === "PAYBACK")
            );
        });
    }, [user]);

    return (
        <View style={{ flexDirection: 'column', width: '100%', gap: 10, alignItems: 'center', paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: 600, width: '100%' }}>Thông Tin Thanh Toán</Text>
            <TextInput value={user?.bank?.bankName} onChangeText={e => setUser({ ...user, bank: { ...user.bank, bankName: e } })} placeholder='Tên Ngân Hàng' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={user?.bank?.accountName} onChangeText={e => setUser({ ...user, bank: { ...user.bank, accountName: e } })} placeholder='Tên Chủ Tài Khoản' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
            <TextInput value={user?.bank?.accountNumber} onChangeText={e => setUser({ ...user, bank: { ...user.bank, accountNumber: e } })} placeholder='Số Tài Khoản' style={{ color: 'black', height: 45, zIndex: 1, width: '100%', backgroundColor: 'white', borderWidth: 1, paddingHorizontal: 10, borderRadius: 7, borderColor: '#bbb' }} />
            <Text style={{ fontSize: 15, fontWeight: 600, width: '100%', marginTop: 10 }}>Lịch Sử Thanh Toán</Text>
            {payments.map((payment, index) => (
                <View key={index} style={{ flexDirection: 'column', gap: 5, padding: 10, backgroundColor: '#f7f7f7', borderRadius: 10, position: 'relative', width: '100%' }}>
                    <Text key={index} style={{ fontWeight: 600 }}>{payment?.beneficiaryAccount?.bankName === ""
                        ? "Đang xử lý" : `${payment.beneficiaryAccount?.bankName}-${payment.beneficiaryAccount?.accountNumber}-${payment.beneficiaryAccount?.accountName}`}</Text>
                    <Text>Nhận tiền</Text>
                    <Text>{payment.dateTake?.day === 0 &&
                        payment.dateTake?.month === 0
                        ? "Chưa xác định"
                        : `${payment.dateTake?.time}-${payment.dateTake?.day}/${payment.dateTake?.month}/${payment.dateTake?.year}`}</Text>
                    <Text style={{ position: 'absolute', bottom: 10, right: 10, fontWeight: 600 }}>{formatMoney(payment.price)} đ</Text>
                    <Text style={{
                        color:
                            payment.status_take_money.type ===
                                "PENDING"
                                ? "black"
                                : payment.status_take_money.type ===
                                    "ACCEPT"
                                    ? "green"
                                    : payment.status_take_money.type ===
                                        "REJECTED"
                                        ? "red"
                                        : "blue",
                    }}>{payment.status_take_money.messages}</Text>
                </View>
            ))}
        </View>
    )
}

export default PaymentDoctor