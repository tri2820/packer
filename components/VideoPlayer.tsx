import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, loadingView, normalizedHostname } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from "react-native-youtube-iframe";

function VideoPlayer(props: any) {
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    useEffect(() => {
        const url = new URL(props.source_url);
        if (!(normalizedHostname(url.hostname) == 'youtube.com')) {
            setYoutubeVideoId('')
            return;
        }
        const youtubeVideoId = url.searchParams.get('v') || ''
        setYoutubeVideoId(youtubeVideoId)
    }, [props.source_url])

    if (youtubeVideoId == '') return <></>

    // 560x315
    // console.log(constants.width, Math.floor(constants.width / 16 * 9))
    return <View style={{
        paddingBottom: 16,
    }}>
        <YoutubePlayer
            height={Math.floor(constants.width / 16 * 9)}
            play={props.videoPlaying}
            videoId={youtubeVideoId}
            playList={[youtubeVideoId]}
            initialPlayerParams={{
                modestbranding: true,
                loop: true,
                showClosedCaptions: true
            }}
            onError={(e) => {
                console.log('error yt', e)
            }}
        // webViewProps={{
        //     startInLoadingState: true,
        //     renderLoading: loadingView
        // }}
        // baseUrlOverride={"https://lonelycpp.github.io/react-native-youtube-iframe/iframe.html"}
        />
    </View>

}

export default VideoPlayer;