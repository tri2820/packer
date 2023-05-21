import * as React from 'react';

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, sourceName } from '../utils';
import { MemoKeyTakeaways } from './KeyTakeaways';
import PostHeader from './PostHeader';
// import { Image } from 'expo-image';


import { Canvas, Fill, ImageShader, Shader, Skia, useImage } from '@shopify/react-native-skia';
import moment from 'moment';

const source = Skia.RuntimeEffect.Make(`
    uniform shader image;
    uniform float imageHeight;      // Viewport resolution (pixels)

    half4 main(float2 xy) {  
      // xy.x += sin(xy.y / 10) * 4;

      // float4 shadowColor = float4(0, 0, 0, 1); // Black shadow color
      float4 shadowColor = float4(21 / 255.0, 19 / 255.0, 22 / 255.0, 1);


      // Evaluate the input image shader
      half4 imageColor = image.eval(xy);


      // Calculate the shadow intensity based on the vertical position
      float shadowIntensity = saturate(1 - pow(xy.y / (imageHeight - 54 - 8), 2));

      // Blend the shadow color with the image color
      half4 outputColor = mix(shadowColor, imageColor, shadowIntensity);

      return outputColor;
    }`)!;


export default function FirstSlide(props: any) {
    const image = useImage(props.post.image_url);

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

            <Pressable onPress={() => {
                props.setImageViewerIndex(0);
                props.setImageViewerIsVisible(true);
            }}
                style={{
                    marginLeft: 12,
                    marginBottom: 16,
                    width: constants.width / 3,
                    // borderRadius: 2,
                    // borderWidth: StyleSheet.hairlineWidth,
                    // borderColor: '#222324',
                    overflow: 'hidden'
                }}>

                {image && <Canvas style={{
                    flex: 1
                }}>
                    <Fill>
                        <Shader
                            source={source}
                            uniforms={{
                                imageHeight: props.height
                            }}
                        >
                            <ImageShader
                                image={image}
                                fit="cover"
                                rect={{ x: 0, y: 0, width: constants.width / 3, height: props.height }}
                            />
                        </Shader>
                    </Fill>
                </Canvas>}

            </Pressable>

        </View>



    </View>
}

export const MemoFirstSlide = memo(FirstSlide)