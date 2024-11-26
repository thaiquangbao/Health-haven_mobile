import React, { useContext, useEffect, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import IconAuthor from "react-native-vector-icons/AntDesign";
import Icon from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import { menuContext } from '../../contexts/MenuContext';
import { payloadContext } from '../../contexts/PayloadContext';
import { userContext } from '../../contexts/UserContext';
import { color } from '../../screens/AppointmentsScreen';
import { api, TypeHTTP } from '../../utils/api';
const DetailBlog = () => {
  const { menuData, menuHandler } = useContext(menuContext);
  const { payloadData, payloadHandler } = useContext(payloadContext)
  const { width, height } = Dimensions.get('window');
  const [translateX] = useState(new Animated.Value(menuData.displayDetailBlog === true ? 0 : width));
  const [likes, setLikes] = useState([]);
  const { userData } = useContext(userContext);
  useEffect(() => {
    api({
      path: `/forums/get-one/${payloadData.blog?._id}`,
      sendToken: false,
      type: TypeHTTP.GET,
    }).then((res) => {
      setLikes(res.like);
    });
  }, [payloadData.blog?._id])
  const addLike = () => {
    api({
      path: `/forums/update/likes`,
      sendToken: false,
      type: TypeHTTP.POST,
      body: { _id: payloadData.blog?._id, patient: userData?.user?._id },
    }).then((res) => {
      setLikes((pre) => [userData.user?._id, ...pre]);
    });


  };
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuData.displayDetailBlog === true ? 0 : width,
      duration: 300, // Thời gian animation (ms)
      useNativeDriver: true, // Sử dụng Native Driver cho hiệu suất tốt hơn
    }).start();
  }, [menuData.displayDetailBlog]);


  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        position: 'absolute',
        height: '100%',
        width: '100%', // Sử dụng chiều rộng của màn hình
        backgroundColor: 'white',
        zIndex: 3,
        top: 0,
        flexDirection: 'column',
        // alignItems: 'center',
        gap: 20,
        right: 0,
      }}
    >
      <View style={{ position: 'absolute', right: 15, top: 30, zIndex: 1 }}>
        <TouchableOpacity onPress={() => {
          payloadHandler.setBlog()
          menuHandler.setDisplayDetailBlog(false)
        }}>
          <Icon name="x" style={{ fontSize: 30 }} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ width: '100%', paddingHorizontal: 20, flexDirection: 'column', height, paddingTop: 50 }}>
        {payloadData.blog && (<>
          <Text style={{ fontSize: 20, fontFamily: 'Nunito-B' }}>{payloadData.blog?.title}</Text>
          <RenderHtml
            contentWidth={width}
            source={{ html: payloadData.blog?.content }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 20, gap: 20 }} >
            <View style={{ height: 80, width: 80, borderWidth: 1, borderColor: '#1dcbb6', overflow: 'hidden', borderRadius: 150 }}>
              <Image source={{ uri: payloadData.blog?.author?.image }} style={{ height: 90, width: 80 }} />
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Nunito-S' }}>{payloadData.blog?.author?.fullName}</Text>
              <Text style={{ fontSize: 15, fontFamily: 'Nunito-R' }}>Chuyên mục: {payloadData.blog?.category}</Text>
              <View style={{ flexDirection: 'row', gap: 20 }} className="flex items-center text-gray-500 text-[13px] mt-1">
                <Text style={{ fontFamily: 'Nunito-S' }}>
                  Lượt xem: {""}
                  <IconAuthor name='eyeo' style={{ fontSize: 14, marginRight: 10 }} />
                  {' ' + payloadData.blog?.views}
                </Text>
                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { if (userData?.user && !likes?.includes(userData?.user?._id)) { addLike() } }}>
                  <Text style={{ fontFamily: 'Nunito-S' }}>
                    Lượt thích: {""}
                  </Text>
                  <IconAuthor name='like2' style={{
                    fontSize: 14, marginRight: 2, color: likes?.includes(userData?.user?._id)
                      ? "red"
                      : "",
                  }} />
                  <Text style={{ fontFamily: 'Nunito-S' }}>
                    {' ' + likes?.length}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, fontFamily: 'Nunito-R' }}>Ngày đăng: {payloadData.blog?.date?.day}/{payloadData.blog?.date?.month}/{payloadData.blog?.date?.year}</Text>
            </View>

          </View>
          <Text>ddddd</Text>
          <Text>ddddd</Text>

        </>)}
      </ScrollView>
    </Animated.View >
  )
}

export default DetailBlog