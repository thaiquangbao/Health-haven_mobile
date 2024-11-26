import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { utilsContext } from '../../contexts/UtilsContext';
import { api, TypeHTTP } from '../../utils/api';
import { compare2Date, compareTimeDate1GreaterThanDate2, convertDateToDayMonthYearObject, convertDateToDayMonthYearTimeObject, convertDateToDayMonthYearVietNam, isALargerWithin10Minutes, isALargerWithin60Minutes, sortByAppointmentDate } from '../../utils/date';
import { notifyType } from '../../utils/notify';
const Assessment = ({ hidden, doctor }) => {
  const { menuData, menuHandler } = useContext(menuContext);
  const { width } = Dimensions.get('window');
  const { payloadData, payloadHandler } = useContext(payloadContext)
  const [dsAssessment, setDsAssessment] = useState([]);
  const [doctorRecord, setDoctorRecord] = useState();
  const { utilsHandler } = useContext(utilsContext)
  useEffect(() => {
    if (doctor) {
      api({
        type: TypeHTTP.GET,
        path: `/doctorRecords/getById/${doctor?._id}`,
        sendToken: false,
      })
        .then((res) => {
          setDoctorRecord(res);
        })
        
    
    }

  }, [doctor]);
  useEffect(() => {
    if (doctorRecord) {
      api({
        type: TypeHTTP.GET,
        path: `/assessments/getByDoctorRecord/${doctorRecord._id}`,
        sendToken: false,
      }).then((res) => {
        setDsAssessment(res);
      });
      
    }
  },[doctorRecord])
  return (
    <>
      <View style={{ position: 'absolute', height: '100%', width: '100%', backgroundColor: 'white', flexDirection: 'column', gap: 20 }}>
        <View style={{ position: 'absolute', right: 15, top: 15, }}>
          <TouchableOpacity onPress={() => hidden()}>
            <Icon name="x" style={{ fontSize: 25 }} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 22, color: 'black', fontFamily: 'Nunito-B' }}>Đánh giá từ người bệnh ({dsAssessment.length})</Text>
        </View>
        <ScrollView style={{ width: '100%', paddingHorizontal: 5, flexDirection: 'column' }}>
          <View style={{ flexDirection: 'column', paddingBottom: 50}}>
          {dsAssessment.map((assessment, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'start', gap: 10, marginTop: 10  }}>
                                        <Image
                                            source={{ uri: assessment.assessment_list.image }}
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                        <View>
                                            <Text style={{ fontSize: 16, fontFamily: "Nunito-B" }}>
                                                {assessment.assessment_list.fullName}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                                                <Text style={{ fontFamily: 'Nunito-R' }}>Đánh giá:{" "}</Text>
                                                <RenderStars rating={assessment.assessment_list.star} />
                                            </View>
                                            <Text style={{ fontFamily: 'Nunito-R' }}>
                                                Nội dung:{" "}{assessment.assessment_list.content}
                                            </Text>
                                            <Text style={{ fontFamily: 'Nunito-R' }}>
                                                Ngày:{" "}
                                                {assessment.assessment_list.date.day}/
                                                {assessment.assessment_list.date.month}/
                                                {assessment.assessment_list.date.year}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
          </View>
        </ScrollView>
      </View>
    </>


  )
}
export default Assessment;
const RenderStars = ({ rating }) => {
  return (
      <View style={{ flexDirection: 'row', gap: 5 }}>
          <Icon name='star' style={{ fontSize: 25, color: rating >= 1 ? '#f1c40f' : '#d6d6d6' }} />
          <Icon name='star' style={{ fontSize: 25, color: rating >= 2 ? '#f1c40f' : '#d6d6d6' }} />
          <Icon name='star' style={{ fontSize: 25, color: rating >= 3 ? '#f1c40f' : '#d6d6d6' }} />
          <Icon name='star' style={{ fontSize: 25, color: rating >= 4 ? '#f1c40f' : '#d6d6d6' }} />
          <Icon name='star' style={{ fontSize: 25, color: rating >= 5 ? '#f1c40f' : '#d6d6d6' }} />
      </View>
  );
};