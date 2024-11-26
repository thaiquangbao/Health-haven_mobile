import React, { useContext, useEffect } from 'react';
import { Dimensions, ScrollView, View, Button, Linking } from 'react-native';
import { menuContext } from '../contexts/MenuContext';
import { payloadContext } from '../contexts/PayloadContext';
import { userContext } from '../contexts/UserContext';
import { screenContext } from '../contexts/ScreenContext';
import { deploy } from '../utils/api';

const ZegoScreen = () => {
    const { width, height } = Dimensions.get('window');
    const { payloadData } = useContext(payloadContext);
    const { screenData } = useContext(screenContext);

    const openInBrowser = () => {
        const url = `${deploy}/meet/${payloadData.meetId}/${payloadData.meetType}?accesstoken=${payloadData.accessToken}&refreshtoken=${payloadData.refreshToken}`;
        Linking.openURL(url)
    };

    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 10 }}>
                {(screenData.currentScreen === 7 && payloadData.accessToken && payloadData.refreshToken && payloadData.meetId && payloadData.meetType) && (
                    <>
                        <Button title="Mở Cuộc Hẹn Trong Trình Duyệt" onPress={openInBrowser} />
                    </>
                )}
            </View>
        </ScrollView>
    );
};

export default ZegoScreen;
