import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CalenderCheck from 'react-native-vector-icons/FontAwesome';
import { userContext } from '../../contexts/UserContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { api, TypeHTTP } from '../../utils/api';
import { convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam } from '../../utils/date';
import { notifyType } from '../../utils/notify';
import { formatMoney, returnNumber } from '../../utils/other';
//PhieuTheoDoi
const PhieuTheoDoi = ({ type, setType }) => {
  const { userData } = useContext(userContext);
  const [logBooks, setLogBooks] = useState([]);
  const { utilsHandler } = useContext(utilsContext)
  useEffect(() => {
    if (userData.user) {
      if (type === '1') {
        const date = convertDateToDayMonthYearTimeObject(new Date().toISOString())
        api({
          path: '/healthLogBooks/findByDay', type: TypeHTTP.POST, sendToken: true, body: {
            doctor: userData.user._id,
            date
          }
        })
          .then(logBooks => {

            setLogBooks(logBooks)
          })
      } else if (type === '2') {
        const date = convertDateToDayMonthYearTimeObject(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString())
        api({
          path: '/healthLogBooks/findByNextDay', type: TypeHTTP.POST, sendToken: true, body: {
            doctor: userData.user._id,
            date
          }
        })
          .then(logBooks => {
            setLogBooks(logBooks)
          })
      } else if (type === '6') {
        api({
          path: `/healthLogBooks/findByDoctor/${userData.user?._id}`, type: TypeHTTP.GET, sendToken: true,
        })
          .then(logBooks => {
            setLogBooks(logBooks)
          })
      }
      else {
        api({
          path: `/healthLogBooks/findBy${type === "3" ? 'Week' : type === "4" ? 'Month' : 'NextMonth'}`, type: TypeHTTP.POST, sendToken: true, body: {
            doctor: userData.user._id,
          }
        })
          .then(logBooks => {
            setLogBooks(logBooks)
          })
      }
    }
  }, [type, userData.user])


  const handleAcceptLogBook = (logBook) => {
    const body = {
      _id: logBook._id,
      dateStop: logBook.priceList.type === '3 Tháng' ?
        convertDateToDayMonthYearTimeObject(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).setDate(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).getDate() + 91))
        :
        logBook.priceList.type === '6 Tháng' ?
          convertDateToDayMonthYearTimeObject(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).setDate(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).getDate() + 183))
          :
          convertDateToDayMonthYearTimeObject(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).setDate(new Date(`${logBook.date.year}-${logBook.date.month}-${logBook.date.day}`).getDate() + 365))
    }
    api({ path: 'healthLogBooks/accepted', sendToken: true, type: TypeHTTP.POST, body })
      .then(logBookAccepted => {
        setLogBooks(prev => prev.map(item => {
          if (item._id === logBookAccepted._id) {
            return logBookAccepted
          }
          return item
        }))
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã chấp nhận phiếu đăng ký"
        );
      })
  }

  const handleRejectLogBook = (logBook) => {
    api({ path: 'healthLogBooks/rejected', sendToken: true, type: TypeHTTP.POST, body: { _id: logBook._id } })
      .then(logBookRejected => {
        setLogBooks(prev => prev.map(item => {
          if (item._id === logBookRejected._id) {
            return logBookRejected
          }
          return item
        }))
        utilsHandler.notify(
          notifyType.SUCCESS,
          "Đã từ chối phiếu đăng ký"
        );
      })
  }

  return (
    <>
      <View style={{ flexDirection: 'column', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center', height: 80 }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff7777', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>{returnNumber(logBooks.length)}</Text>
              <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Tất cả cuộc hẹn</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: 'orange', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-check-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                {returnNumber(
                  logBooks.filter(
                    (item) => item.status.status_type === "ACCEPTED"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đã chấp nhận</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-center', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#66cc66', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-plus-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                {returnNumber(
                  logBooks.filter(
                    (item) => item.status.status_type === "QUEUE"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đang chờ</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e7e9', alignItems: 'flex-start', backgroundColor: '#ff2222', borderRadius: 10, gap: 10, padding: 10, width: '48%' }}>
            <CalenderCheck name='calendar-times-o' style={{ fontSize: 35, color: 'white' }} />
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Nunito-S', color: 'white' }}>
                {returnNumber(
                  logBooks.filter(
                    (item) => item.status.status_type === "REJECTED"
                  ).length
                )}
              </Text>
              <Text style={{ fontSize: 13, color: 'white', fontFamily: 'Nunito-R' }}>Đã từ chối</Text>
            </View>
          </View>
        </View>
      </View>
      {logBooks.map((logBook, index) => (
        <View key={index} style={{ backgroundColor: '#f8f9f9', padding: 5, borderRadius: 10, flexDirection: 'row', gap: 10, alignItems: 'start' }}>
          <View style={{ height: 60, width: 60, borderWidth: 1, borderColor: '#1dcbb6', overflow: 'hidden', borderRadius: 150 }}>
            <Image source={{ uri: logBook.patient.image }} style={{ height: 90, width: 60 }} />
          </View>
          <View style={{ flexDirection: 'column', marginTop: 5, paddingBottom: 10 }}>
            <Text style={{ fontFamily: 'Nunito-S', fontSize: 16, marginTop: 3 }}>Bệnh nhân: {logBook.patient.fullName}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Thời gian: {convertDateToDayMonthYearVietNam(logBook.date)}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3, color: logBook.status.status_type === "QUEUE" ? "black" : logBook.status.status_type === "ACCEPTED" ? "green" : logBook?.status.status_type === "COMPLETED" ? 'blue' : "red", }}>Trạng thái: {logBook?.status?.message}</Text>
            <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Loại phiếu: {formatMoney(logBook.priceList.price)}đ/{logBook.priceList.type}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, marginTop: 3 }}>Chức năng: </Text>
              {logBook.status.status_type === "TRANSFER" ? (
                <>
                  <TouchableOpacity onPress={() => handleAcceptLogBook(logBook)} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Chấp nhận</Text>
                  </TouchableOpacity>

                </>
              ) : (
                logBook.status.status_type === "QUEUE" && (
                  <>
                    <TouchableOpacity onPress={() => handleAcceptLogBook(logBook)} style={{ gap: 5, backgroundColor: '#66cc66', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Chấp nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRejectLogBook(logBook)} style={{ gap: 5, backgroundColor: '#ff2222', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Nunito-R', fontSize: 14, color: 'white' }}>Từ chối</Text>
                    </TouchableOpacity>
                  </>
                )
              )}
            </View>

          </View>
        </View>
      ))}
    </>
  )
}
export default PhieuTheoDoi