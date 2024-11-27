import React, { useContext, useEffect, useState } from 'react'
import PayLoadProvider from './src/contexts/PayloadContext'
import UserProvider from './src/contexts/UserContext'
import ScreenProvider from './src/contexts/ScreenContext'
import AuthProvider from './src/contexts/AuthContext'
import MenuProvider from './src/contexts/MenuContext'
import DataProvider from './src/contexts/DataContext'
import BookingHomeProvider from './src/contexts/BookingHomeContext'
import Menu from './src/components/menu/Menu'
import Index from './src/screens'
import { utilsContext } from './src/contexts/UtilsContext'

const MyApp = () => {

    const { utilsData } = useContext(utilsContext)
    const [reload, setReload] = useState(false)
    useEffect(() => {
        setReload(utilsData.reload)
    }, [utilsData.reload])

    return (
        <>
            {reload === false && (
                <PayLoadProvider>
                    <UserProvider>
                        <ScreenProvider>
                            <AuthProvider>
                                <MenuProvider>
                                    <DataProvider>
                                        <BookingHomeProvider>
                                            <Menu />
                                            <Index />
                                        </BookingHomeProvider>
                                    </DataProvider>
                                </MenuProvider>
                            </AuthProvider>
                        </ScreenProvider>
                    </UserProvider>
                </PayLoadProvider>
            )}
        </>
    )
}

export default MyApp