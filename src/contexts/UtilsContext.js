import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
export const utilsContext = createContext()

const UtilsProvider = ({ children }) => {

    const [reload, setReload] = useState(false)

    const notify = (title, message, onCancel, onOK) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'Cancel',
                    onPress: onCancel,
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: onOK
                }
            ],
            { cancelable: false }
        );
    };

    useEffect(() => {
        if (reload === true) {
            setTimeout(() => {
                setReload(false)
            }, 50);
        }
    }, [reload])

    const data = {
        reload
    }

    const handler = {
        notify,
        setReload
    }

    return (
        <utilsContext.Provider value={{ utilsData: data, utilsHandler: handler }}>
            {children}
        </utilsContext.Provider>
    )
}

export default UtilsProvider