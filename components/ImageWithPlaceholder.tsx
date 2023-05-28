import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import { Alert, StyleSheet, Image, Text, TouchableOpacity, View, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';
import { constants, getSourceName, hookListener, isVideoPost, randomNickName, sharedAsyncState, sourceName, title, unhookListener } from '../utils';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import * as Application from 'expo-application';
import { FlatList } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import SignInSection from './SignInSection';
import { Canvas, Group, ImageSVG, fitbox, rect, useSVG } from '@shopify/react-native-skia';

export default function ImageWithPlaceholder(props: any) {
    const [imageLoaded, setImageLoaded] = useState(sharedAsyncState[`imageLoaded/${props.url}`]);
    useEffect(() => {
        if (sharedAsyncState[`imageLoaded/${props.url}`]) return;
        if (!props.url || props.url == '') return;
        (async () => {
            try {
                await Image.prefetch(props.url);
            } catch (e) {
                console.log('ERROR loading image');
                console.log('cannot load image', e, props.url)
                return;
            }
            setImageLoaded(true);

            // Image.getSize(
            //     props.url,
            //     (width, height) => {
            //         if (width < 640 || height < 480) return;
            //         sharedAsyncState[`imageLoaded/${props.post.image_url}`] = true;
            //         setImageLoaded(true);
            //     },
            //     (error) => {
            //         console.log('Error getting image size:', error);
            //     }
            // );
        })()
    }, [])

    if (!imageLoaded) return <Image
        style={props.imageStyle}
        source={props.placeholder}
    />

    return <Image
        style={props.imageStyle}
        source={{
            uri: props.url
        }}
    />
}

