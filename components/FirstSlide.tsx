import * as React from 'react';

import { Octicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ImageBackground, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, getPastelColor, isVideoPost, openLink, randomColor, requestComments, sharedAsyncState, sourceName, toUIList, toggleBookmark } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways, { MemoKeyTakeaways } from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import PostHeader from './PostHeader';
import VideoPlayer, { MemoVideoPlayer } from './VideoPlayer';
// import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { WebBrowserPresentationStyle } from 'expo-web-browser';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hookListener, unhookListener } from '../utils';
import AnonAvatar from './AnonAvatar';
import WebView from 'react-native-webview';
import Slide from './Slide';
import ImageView from "react-native-image-viewing";


import moment from 'moment';
import CategoryText from './CategoryText';
import { Canvas, useImage, Image, Shadow, Morphology, Shader, Skia, Fill, ColorMatrix } from '@shopify/react-native-skia';


const source = Skia.RuntimeEffect.Make(`
uniform shader image;
 
half4 main(float2 xy) {   
  xy.x += sin(xy.y / 3) * 4;
  return image.eval(xy).rbga;
}`)!;

export default function FirstSlide(props: any) {
    const image = useImage(props.post.image_url);

    return <View style={{
        width: constants.width,
        paddingBottom: 54
    }}>
        {/* <MemoVideoPlayer
            // scrolling={props.scrolling}
            id={props.post.id}
            scrolledOn={props.scrolledOn}
            url={props.post.url}
            isSinglePost={false}
        /> */}


        <View style={{
            flexDirection: 'row',
            paddingHorizontal: 16,

        }}>
            <View style={{
                flex: 1,

            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // paddingHorizontal: 16,
                    paddingTop: 16,
                    // backgroundColor: 'red',
                    paddingBottom: 8,
                }}>


                    <Text style={{
                        color: '#a3a3a3',
                        fontWeight: '700',
                        fontSize: 10
                        // backgroundColor: 'green'

                    }}>
                        {
                            sourceName(props.post, false)
                        }
                        <Text style={{
                            color: '#A3A3A3',
                            fontWeight: '300',
                            letterSpacing: 2
                        }}> • {
                                moment.utc(props.post.date_modify).local().startOf('seconds').fromNow().replace(' days ago', 'd').toUpperCase()
                            }</Text>
                    </Text>
                </View>
                <View style={{
                    // flex: 1,
                    // backgroundColor: 'blue'
                    // flexDirection: 'row'
                }}>
                    <View style={{
                        paddingBottom: 8
                    }}>
                        <PostHeader
                            // scrolling={props.scrolling}
                            user={props.user}
                            isSinglePost={props.isSinglePost}
                            openLink={props.openLink}
                            post={props.post}
                            mode={props.mode}
                            navProps={props.navProps}
                        />
                    </View>

                    <MemoKeyTakeaways ners={props.post.ners} content={props.post.maintext} />
                    {/* <CategoryText authors={props.post.authors} /> */}
                </View>

            </View>



            {image &&
                <View
                    style={{
                        // flex: 1,
                        marginTop: 16,
                        paddingLeft: 12
                    }}>
                    <Pressable onPress={() => {
                        props.setImageViewerIndex(0);
                        props.setImageViewerIsVisible(true);
                    }}>

                        <Canvas style={{
                            width: constants.width / 4,
                            height: constants.width / 3,
                            borderRadius: 2,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: '#222324',
                            backgroundColor: 'white',
                            overflow: 'hidden'
                        }}>
                            <Image image={image} fit='cover' x={0} y={0} width={constants.width / 4} height={constants.width / 3} >

                                {/* <ColorMatrix
                                    matrix={[
                                        -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
                                        -0.703, 0, 0, 0, 0, 0, 1, 0,
                                    ]}
                                /> */}
                            </Image>

                        </Canvas>

                    </Pressable>
                </View>
            }
        </View>



    </View>
}