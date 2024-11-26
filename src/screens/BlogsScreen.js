import React, { useContext, useEffect, useState } from 'react'
import { Dimensions, Image, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { menuContext } from '../contexts/MenuContext';
import { api, TypeHTTP } from '../utils/api';
import Icon from "react-native-vector-icons/AntDesign";
import { payloadContext } from '../contexts/PayloadContext';
import { screenContext } from '../contexts/ScreenContext';

const BlogsScreen = () => {
    const { width } = Dimensions.get('window');
    const { menuHandler } = useContext(menuContext)
    const { payloadHandler } = useContext(payloadContext)
    const [blogs, setBlogs] = useState([]);
    const { screenData } = useContext(screenContext)

    useEffect(() => {
        api({
            path: "/forums/get-all",
            sendToken: false,
            type: TypeHTTP.GET,
        }).then((res) => {
            setBlogs(res);
        });
    }, []);


    const extractFirstParagraphAndImage = (content) => {
        // Lấy đoạn nội dung đầu tiên
        const paragraphMatch = content.match(/<p>(.*?)<\/p>/);
        const firstParagraph = paragraphMatch
            ? paragraphMatch[1]
            : "";

        // Lấy URL của hình ảnh đầu tiên
        const imgMatch = content.match(/<img\s+src="([^"]+)"/);
        const firstImageUrl = imgMatch ? imgMatch[1] : "";

        return { firstParagraph, firstImageUrl };
    };

    const clickDetailBlog = (blog) => {
        api({
            path: `/forums/update/views/${blog._id}`,
            sendToken: false,
            type: TypeHTTP.POST,
        });
        payloadHandler.setBlog(blog)
        menuHandler.setDisplayDetailBlog(true)
    }

    return (
        <ScrollView>
            <View style={{ flexWrap: 'wrap', flexDirection: 'column', width, gap: 20, paddingHorizontal: 20, paddingVertical: 10 }}>
                {screenData.currentScreen === 5 && (<>
                    {blogs.map((blog, index) => {
                        const { firstParagraph, firstImageUrl } =
                            extractFirstParagraphAndImage(
                                blog.content
                            );
                        return (
                            <Pressable
                                onPress={() => clickDetailBlog(blog)}
                                key={index}
                                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                            >
                                <Image source={{ uri: firstImageUrl }} style={{ width: 130, height: 70 }} />
                                <View style={{ width: '100%', flexDirection: 'column', gap: 5 }} >
                                    <Text style={{ fontSize: 14, fontFamily: 'Nunito-B', width: '60%' }}>
                                        {blog.title}
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 20 }} className="flex items-center text-gray-500 text-[13px] mt-1">
                                        <Text style={{ fontFamily: 'Nunito-S' }}>
                                            {blog.date.day}/{blog.date.month}/
                                            {blog.date.year}
                                        </Text>
                                        <Text style={{ fontFamily: 'Nunito-S' }}>
                                            <Icon name='eyeo' style={{ fontSize: 14, marginRight: 10 }} />
                                            {' ' + blog.views}
                                        </Text>
                                        <Text style={{ fontFamily: 'Nunito-S' }}>
                                            <Icon name='like2' style={{ fontSize: 14, marginRight: 10 }} />
                                            {' ' + blog.like?.length}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </>)}
            </View>
        </ScrollView>
    )
}

export default BlogsScreen