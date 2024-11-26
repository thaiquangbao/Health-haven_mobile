import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { userContext } from "./UserContext";
import { menuContext } from "./MenuContext";
import { api, TypeHTTP } from "../utils/api";
import { payloadContext } from "./PayloadContext";
export const bookingHomeContext = createContext()

const BookingHomeProvider = ({ children }) => {

    const { userData } = useContext(userContext)
    const [visiblePayment, setVisiblePayment] = useState(false)
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)

    useEffect(() => {
        if (userData.user && visiblePayment === false) {
            api({ sendToken: true, type: TypeHTTP.GET, path: `/appointmentHomes/findByPatient/${userData.user._id}` })
                .then(res => {
                    const results = res.filter(item => {
                        if (item.status.status_type === 'ACCEPTED' && item.processAppointment === 1) {
                            return item
                        }
                    })
                    if (results.length > 0) {
                        setVisiblePayment(true)
                        payloadHandler.setPaymentBookingHome(results)
                        menuHandler.setDisplayNotificationPayment(true)
                    } else {
                        setVisiblePayment(true)
                        payloadHandler.setPaymentBookingHome([])
                    }
                })
        }
    }, [userData.user])


    const data = {

    }

    const handler = {

    }

    return (
        <bookingHomeContext.Provider value={{ bookingHomeData: data, bookingHomeHandler: handler }}>
            {children}
        </bookingHomeContext.Provider>
    )
}

export default BookingHomeProvider