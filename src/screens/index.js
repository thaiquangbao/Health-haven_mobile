import React, { useContext, useEffect, useRef } from 'react'
import { Dimensions, ScrollView } from 'react-native'
import { screenContext } from '../contexts/ScreenContext'
import AppointmentScreen from './AppointmentsScreen'
import BlogsScreen from './BlogsScreen'
import ChatMessageScreen from './ChatMessageScreen'
import DetailDoctorScreen from './DetailDoctorScreen'
import DoctorRecordScreen from './DoctorRecordScreen'
import DoctorsScreen from './DoctorsScreen'
import FollowHealthScreen from './FollowHealthScreen'
import ForumsScreen from './ForumsScreen'
import LandingScreen from './LandingScreen'
import MedicalRecordScreen from './MedicalRecordScreen'
import MyPatientScreen from './MyPatientScreen'
import NotificationScreen from './NotificationScreen'
import ProfileScreen from './ProfileScreen'
import ProfitDoctorScreen from './ProfitDoctorScreen'
import ServicesScreen from './ServicesScreen'
import TicketScreen from './TicketsScreen'
import ZegoScreen from './ZegoScreen'
import AppointmentHomesScreen from './AppointmentHomesScreen'
import MyProfitScreen from './MyProfit'
const Index = () => {
    const { width } = Dimensions.get('window');
    const { screenData } = useContext(screenContext)
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: screenData.currentScreen * width, animated: true });
        }
    }, [screenData.currentScreen])

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            style={{ flexDirection: 'row' }}
            scrollEnabled={false}
        >
            <LandingScreen />
            <DoctorsScreen />
            <DetailDoctorScreen />
            <ServicesScreen />
            <ForumsScreen />
            <BlogsScreen />
            <AppointmentScreen />
            <ZegoScreen />
            <MedicalRecordScreen />
            <ChatMessageScreen />
            <TicketScreen />
            <FollowHealthScreen />
            <ProfileScreen />
            <MyPatientScreen />
            <DoctorRecordScreen />
            <NotificationScreen />
            <ProfitDoctorScreen />
            <AppointmentHomesScreen />
            <MyProfitScreen />
            {/* for patient */}

        </ScrollView>
    )
}

export default Index