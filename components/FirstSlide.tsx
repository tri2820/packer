import * as React from 'react';

import { memo, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, sharedAsyncState, sourceName } from '../utils';
import { MemoKeyTakeaways } from './KeyTakeaways';
import PostHeader from './PostHeader';
// import { Image } from 'expo-image';


import { Canvas, Fill, ImageShader, Shader, Skia, useImage } from '@shopify/react-native-skia';
import moment from 'moment';

const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float imageHeight;      // Viewport resolution (pixels)
    uniform float imageWidth;

    half4 main(float2 xy) {  
      // xy.x += sin(xy.y / 10) * 4;

      // float4 shadowColor = float4(0, 0, 0, 1); // Black shadow color
      float4 shadowColor = float4(21 / 255.0, 19 / 255.0, 22 / 255.0, 1);


      // Evaluate the input image shader
      half4 imageColor = image.eval(xy);



      // Calculate the shadow intensity based on the vertical position
      float shadowIntensity = saturate(1);

      // float shadowIntensity = saturate(1 - pow(xy.y/imageHeight, 2));
      if (imageHeight - xy.y > 32) {
        shadowIntensity = saturate(1);
      }
    //   float shadowIntensity = saturate(1);
    //   if (xy.y > imageHeight - 48) {
    //     // -32 -> 48
    //     float offset = imageHeight - xy.y - 20;
    //     shadowIntensity = saturate(pow(offset / (48 - 16), 3));
    //   }
      

      // Blend the shadow color with the image color
      half4 outputColor = mix(shadowColor, imageColor, shadowIntensity);

      return outputColor;
    }`)!;


export default function FirstSlide(props: any) {
    const imageHeight = Math.ceil(props.height / 2);
    const imageWidth = Math.ceil(constants.width / 3);

    return <View style={{
        width: constants.width,

        paddingTop: 16,
    }}
    >
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
                paddingBottom: 54,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // paddingHorizontal: 16,
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
                    // backgroundColor: 'blue'
                    flexDirection: 'row'
                }}>
                    <View style={{
                        flex: 1
                    }}>
                        <View style={{
                            paddingBottom: 8,
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


                        <MemoKeyTakeaways content={
                            props.post.logic.jottings ?? props.post.maintext.slice(0, 80).replace('\n', ' ') + '...'
                        } />
                        {/* <CategoryText authors={props.post.authors} /> */}
                    </View>

                    {props.imageLoaded && <Pressable onPress={() => {
                        props.setImageViewerIndex(0);
                        props.setImageViewerIsVisible(true);
                    }}
                        style={{
                            marginLeft: 6,
                            paddingTop: 4
                        }}>
                        <Image
                            style={{
                                backgroundColor: '#f1f1f1',
                                borderRadius: 2,
                                borderWidth: StyleSheet.hairlineWidth,
                                borderColor: '#222324',
                                width: imageWidth,
                                height: imageHeight
                            }}
                            source={{
                                uri: props.post.image_url
                            }}
                        />
                    </Pressable>}
                </View>

            </View>

        </View>



    </View>
}

export const MemoFirstSlide = memo(FirstSlide)