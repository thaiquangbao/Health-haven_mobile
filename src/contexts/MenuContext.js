import { createContext, useState } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import MenuArea from "../components/menu/MenuArea";
import SignIn from "../components/auth/SignIn";
import SignUp from "../components/auth/SignUp";
import DetailQuestion from "../components/forums/DetailQuestion";
import AddQuestion from "../components/forums/AddQuestion";
import DetailBlog from "../components/blogs/DetailBlog";
import FormBookingNormal from "../components/booking/FormBookingNormal";
import InformationBookingNormal from "../components/booking/normal/InformationBookingNormal";
import DetailAppointment from "../components/appointments/DetailAppointment";
import DetailAppointmentHome from "../components/appointments/DetailAppointmentHome";
import ChatArea from "../components/chat/ChatArea";
import Health from "../components/health/Health";
import DetailLogbook from "../components/logbook/DetailLogbook";
import Schedule from "../components/doctorrecord/Schedule";
import DetailTime from "../components/doctorrecord/DetailTime";
import MedicalRecord from "../components/logbook/MedicalRecord";
import ServicesFollowing from "../components/booking/follow-health/ServicesFollowing";
import InformationBookingHealth from "../components/booking/follow-health/InformationBookingHealth";
import FormBookingHome from "../components/bookingHome/FormBookingHome";
import FormNotificationPayment from "../components/bookingHome/NotificationPayment";
import InformationBookingHome from "../components/bookingHome/payment/InformationBookingHome";
import FormSchedule from "../components/appointments/FormSchedule";
import ChatBot from "../components/chatbot/ChatBot";
import SmartSearching from "../components/smartsearching/SmartSearching";
import AddMedical from "../components/appointments/AddMedical";
export const menuContext = createContext()

const MenuProvider = ({ children }) => {
    const [display, setDisplay] = useState(false) // displayMenu
    const [displaySignIn, setDisplaySignIn] = useState(false)
    const [displaySignUp, setDisplaySignUp] = useState(false)
    const [displayDetailQuestion, setDisplayDetailQuestion] = useState(false)
    const [displayAddQuestion, setDisplayAddQuestion] = useState(false)
    const [displayDetailBlog, setDisplayDetailBlog] = useState(false)
    const [displayFormBookingNormal, setDisplayFormBookingNormal] = useState(false)
    const [displayInformationBookingNormal, setDisplayInformationBookingNormal] = useState(false)
    const [displayInformationBookingHome, setDisplayInformationBookingHome] = useState(false)
    const [displayDetailAppointment, setDisplayDetailAppointment] = useState(false)
    const [displayChatArea, setDisplayChatArea] = useState(false)
    const [displayHealth, setDisplayHealth] = useState(false)
    const [displayDetailLogbook, setDisplayDetailLogbook] = useState(false)
    const [displaySchedule, setDisplaySchedule] = useState(false)
    const [displayDetailTime, setDisplayDetailTime] = useState(false)
    const [displayMedicalRecord, setDisplayMedicalRecord] = useState(false)
    const [displayServicesFollowing, setDisplayServicesFollowing] = useState(false)
    const [displayInformationBookingHealth, setDisplayInformationBookingHealth] = useState(false)
    const [displayBookingHome, setDisplayBookingHome] = useState(false)
    const [displayNotificationPayment, setDisplayNotificationPayment] = useState(false)
    const [displayScheduleAppoimentHome, setDisplayScheduleAppoimentHome] = useState(false)
    const [displayDetailAppointmentHome, setDisplayDetailAppointmentHome] = useState(false)
    const [displayChatBot, setDisplayChatBot] = useState(false)
    const [displaySmartSearching, setDisplaySmartSearching] = useState(false)
    const [displayAddMedical, setDisplayAddMedical] = useState(false)

    const hidden = () => {
        setDisplay(false)
        setDisplaySignIn(false)
        setDisplaySignUp(false)
        setDisplayDetailQuestion(false)
        setDisplayAddQuestion(false)
        setDisplayDetailBlog(false)
        setDisplayFormBookingNormal(false)
        setDisplayInformationBookingNormal(false)
        setDisplayDetailAppointment(false)
        setDisplayChatArea(false)
        setDisplayHealth(false)
        setDisplayDetailLogbook(false)
        setDisplaySchedule(false)
        setDisplayDetailTime(false)
        setDisplayMedicalRecord(false)
        setDisplayServicesFollowing(false)
        setDisplayInformationBookingHealth(false)
        setDisplayBookingHome(false)
        setDisplayNotificationPayment(false)
        setDisplayInformationBookingHome(false)
        setDisplayScheduleAppoimentHome(false)
        setDisplayDetailAppointmentHome(false)
        setDisplayChatBot(false)
        setDisplaySmartSearching(false)
        setDisplayAddMedical(false)
    }

    const data = {
        display,
        displaySignIn,
        displaySignUp,
        displayDetailQuestion,
        displayAddQuestion,
        displayDetailBlog,
        displayFormBookingNormal,
        displayInformationBookingNormal,
        displayDetailAppointment,
        displayChatArea,
        displayHealth,
        displayDetailLogbook,
        displaySchedule,
        displayDetailTime,
        displayMedicalRecord,
        displayServicesFollowing,
        displayInformationBookingHealth,
        displayBookingHome,
        displayNotificationPayment,
        displayInformationBookingHome,
        displayScheduleAppoimentHome,
        displayDetailAppointmentHome,
        displayChatBot,
        displaySmartSearching,
        displayAddMedical
    }

    const handler = {
        setDisplay,
        setDisplaySignIn,
        setDisplaySignUp,
        setDisplayDetailQuestion,
        setDisplayAddQuestion,
        setDisplayDetailBlog,
        setDisplayFormBookingNormal,
        setDisplayInformationBookingNormal,
        setDisplayDetailAppointment,
        setDisplayChatArea,
        setDisplayHealth,
        setDisplayDetailLogbook,
        setDisplaySchedule,
        setDisplayDetailTime,
        setDisplayMedicalRecord,
        setDisplayServicesFollowing,
        setDisplayInformationBookingHealth,
        setDisplayBookingHome,
        setDisplayNotificationPayment,
        setDisplayInformationBookingHome,
        setDisplayScheduleAppoimentHome,
        setDisplayDetailAppointmentHome,
        setDisplayChatBot,
        setDisplaySmartSearching,
        setDisplayAddMedical
    }

    return (
        <menuContext.Provider value={{ menuData: data, menuHandler: handler }}>
            {children}
            {display && (
                <Pressable onPress={() => hidden()} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, backgroundColor: '#00000053', zIndex: 1 }} />
            )}
            <MenuArea />
            <SignIn />
            <SignUp />
            <DetailQuestion />
            <AddQuestion />
            <DetailBlog />
            <ServicesFollowing />
            <FormBookingNormal />
            <InformationBookingNormal />
            <InformationBookingHealth />
            <DetailAppointment />
            <DetailLogbook />
            <Schedule />
            <DetailTime />
            <ChatArea />
            <Health />
            <FormBookingNormal />
            <FormBookingHome />
            <FormNotificationPayment />
            <DetailAppointmentHome />
            <InformationBookingHome />
            <FormSchedule />
            <ChatBot />
            <SmartSearching />
            <AddMedical />
            {/* <MedicalRecord /> */}
            <MedicalRecord />
        </menuContext.Provider>
    )
}

export default MenuProvider