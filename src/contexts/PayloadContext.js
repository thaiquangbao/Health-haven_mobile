import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api, TypeHTTP } from "../utils/api";
export const payloadContext = createContext()

const PayLoadProvider = ({ children }) => {

    const [qa, setQa] = useState()
    const [blog, setBlog] = useState()

    //reload
    const [reload, setReload] = useState(false)

    // zego
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [meetId, setMeetId] = useState()
    const [meetType, setMeetType] = useState()

    // schedule
    const [day, setDay] = useState()
    const [time, setTime] = useState()

    //health
    const [logbook, setLogbook] = useState()
    const [patient, setPatient] = useState()

    //room
    const [currentRoom, setCurrentRoom] = useState()
    const [rooms, setRooms] = useState([])

    // detail appointment
    const [detailAppointment, setDetailAppointment] = useState()
    const [displayConnect, setDisplayConnect] = useState()

    // booking
    const [priceList, setPriceList] = useState()
    const [doctorRecord, setDoctorRecord] = useState()
    const [sick, setSick] = useState('')
    const [bookingImages, setBookingImages] = useState([])
    // => 
    const [bookingNormal, setBookingNormal] = useState()

    // booking follow health
    const [bookingHealth, setBookingHealth] = useState()

    // bookingHome
    const [paymentBookingHome, setPaymentBookingHome] = useState([])
    const [bookingHome, setBookingHome] = useState()
    const [appointmentHome, setAppointmentHome] = useState()
    const [appointmentHomes, setAppointmentHomes] = useState([])

    // assessment
    const [assessment, setAssessments] = useState([])

    // add medical
    const [currentMedical, setCurrentMedical] = useState()

    useEffect(() => {
        api({ type: TypeHTTP.GET, sendToken: false, path: '/assessments/getAll' })
            .then(res => setAssessments(res))
    }, [])

    const data = {
        qa,
        blog,
        priceList,
        doctorRecord,
        sick,
        bookingNormal,
        detailAppointment,
        displayConnect,
        currentRoom,
        rooms,
        bookingImages,
        logbook,
        day,
        time,
        patient,
        bookingHealth,
        accessToken,
        refreshToken,
        meetId,
        meetType,
        paymentBookingHome,
        bookingHome,
        appointmentHome,
        appointmentHomes,
        reload,
        assessment,
        currentMedical
    }

    const handler = {
        setQa,
        setBlog,
        setPriceList,
        setDoctorRecord,
        setSick,
        setBookingNormal,
        setDetailAppointment,
        setDisplayConnect,
        setCurrentRoom,
        setRooms,
        setBookingImages,
        setLogbook,
        setDay,
        setTime,
        setPatient,
        setBookingHealth,
        setAccessToken,
        setRefreshToken,
        setMeetId,
        setMeetType,
        setPaymentBookingHome,
        setBookingHome,
        setAppointmentHome,
        setAppointmentHomes,
        setReload,
        setAssessments,
        setCurrentMedical
    }

    return (
        <payloadContext.Provider value={{ payloadData: data, payloadHandler: handler }}>
            {children}
        </payloadContext.Provider>
    )
}

export default PayLoadProvider