import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';
import { constants, getSourceName, randomColor, randomNickName, sharedAsyncState } from '../utils';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import * as Application from 'expo-application';
import { FlatList } from 'react-native-gesture-handler';
import AnonAvatar from './AnonAvatar';
import SourceAvatar from './SourceAvatar';
import { Canvas, Blur, Image, ColorMatrix, useImage, BackdropFilter, Skia, RuntimeShader } from "@shopify/react-native-skia";
import ImageView from "react-native-image-viewing";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

// Parameters for the halftone effect
const float dotSize = 8.0; // Size of each dot in pixels
const float dotSpacing = 12.0; // Spacing between dots in pixels

half4 main(float2 xy) {
// Get the original color of the pixel from the input image
half4 color = image.eval(xy);

// Calculate the position of the dot within the current grid cell
float2 dotPos = mod(xy, dotSpacing) - dotSpacing / 2.0;

// Calculate the distance of the current pixel to the center of the nearest dot
float dotDist = length(dotPos);

// Use a step function to create dots
float dot = step(dotDist, dotSize / 4.0);

// Blend the original color with the dot color (white)
return mix(color, half4(0.0, 0.0, 0.0, color.a), dot);
}
`)!;

// {image && <Canvas style={{ flex: 1 }}>
// <Image
//     x={0}
//     y={0}
//     width={constants.width}
//     height={props.height}
//     image={image}
//     fit='fitHeight'
// >

// </Image>
// {/* <RuntimeShader source={source} /> */}

// </Canvas>
// }


export default function Slide(props: any) {

    const imageUrl = supabaseClient
        .storage
        .from('public')
        .getPublicUrl(props.slide.image_id).data?.publicUrl



    // const image = 'https://djhuyrpeqcbvqbhfnibz.supabase.co/storage/v1/object/public/public/a6f2299b-3aec-4ea0-bfc2-081a00210f78';
    return <Pressable
        onPress={() => {
            props.showImageViewer(imageUrl)
        }}
        style={{
            width: constants.width,
            // backgroundColor: randomColor(),
            flex: 1,
            // height: '100%',
            // paddingBottom: 54
        }}
    >

        {props.activeSlideIndex > 0 &&
            <Animated.Image
                style={{
                    // backgroundColor: 'red',
                    width: constants.width,
                    height: props.height
                }}
                source={{
                    uri: imageUrl
                }}
                resizeMode={props.height < constants.width ? 'contain' : 'cover'}
            />
        }

        <View style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 54,
            backgroundColor: 'rgba(28,28,28,0.8)',
            // paddingBottom: 64
        }}>
            <Text style={{
                color: 'white',
            }}>
                {props.slide.content}
            </Text>
        </View>

    </Pressable>

}