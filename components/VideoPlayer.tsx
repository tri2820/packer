import * as React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useEffect, useRef, useState } from 'react';
import { AppState, ImageBackground, Pressable, Touchable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import YoutubePlayer from "react-native-youtube-iframe";
import { constants, loadingView, normalizedHostname, sharedAsyncState } from '../utils';
import { getYoutubeMeta } from 'react-native-youtube-iframe';
import { TouchableOpacity } from 'react-native-gesture-handler';


function VideoPlayer(props: any) {
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    const [reloadN, setReloadN] = useState(0);
    const appState = useRef(AppState.currentState);
    const [appStateCurrent, setAppStateCurrent] = useState(appState.current)
    const [videoShouldPlaying, setVideoShouldPlaying] = useState(false);
    const [error, setError] = useState(false);
    const [_, setStepper] = useState(false);
    const ref = useRef<any>(null);
    const [intervalObj, setIntervalObj] = useState<any>(null);
    const [buttonPressed, setButtonPressed] = useState(props.isSinglePost);
    const [metadata, setMetadata] = useState<any>({});

    const startSyncTime = () => {
        const id = setInterval(async () => {
            const sec = await ref.current?.getCurrentTime();
            console.log('debug SEC', sec);
            sharedAsyncState[`player/${props.id}/second`] = sec;
        }, 1000);
        setIntervalObj(id);
    };

    useEffect(() => {
        if (!videoShouldPlaying) return;
        console.log('debug appStateCurrent', appStateCurrent, props.scrolledOn, youtubeVideoId)
        let needToPause = !props.scrolledOn
            || appStateCurrent != 'active'
            || youtubeVideoId == '';
        needToPause = needToPause ? true : false;
        if (needToPause) {
            // console.log('debug need to pause');
            setVideoShouldPlaying(false);
            setButtonPressed(false);
        }
    }, [props.scrolledOn, appStateCurrent, youtubeVideoId]);

    useEffect(() => {
        if (youtubeVideoId == '') return;
        (async () => {
            try {
                const metadata = await getYoutubeMeta(youtubeVideoId);
                setMetadata(metadata)
            } catch (e) {
                console.log('debug error', e)
            }
        })()
    }, [youtubeVideoId])

    useEffect(() => {
        // console.log("debug videoShouldPlaying", videoShouldPlaying)
        if (videoShouldPlaying) {
            return;
        }
        setIntervalObj(null);
    }, [videoShouldPlaying])

    useEffect(() => {
        return () => {
            clearInterval(intervalObj);
        }
    }, [intervalObj])

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
            // console.log('AppState', appState.current);
            setAppStateCurrent(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, []);
    // const [ready, setReady] = useState(false);
    // const [error, setError] = useState(false);
    useEffect(() => {
        const url = new URL(props.url);
        if (!(normalizedHostname(url.hostname) == 'youtube.com')) {
            setYoutubeVideoId('')
            return;
        }
        const youtubeVideoId = url.searchParams.get('v') || ''
        setYoutubeVideoId(youtubeVideoId)
    }, [props.url])



    const onError = (e: string) => {
        console.log('error yt', e, youtubeVideoId)
        if (e != 'embed_not_allowed' || reloadN > 0) {
            setError(true);
            return;
        }
        setReloadN((reloadN) => reloadN + 1);
    }

    const onChangeState = (event: string) => {
        console.log('debug on change state', event);
        if (event != 'playing' && event != 'paused') return;
        setVideoShouldPlaying(event == 'playing')
    }

    useEffect(() => {
        if (!videoShouldPlaying) {
            clearInterval(intervalObj);
            return;
        }
        startSyncTime();
    }, [videoShouldPlaying])

    if (youtubeVideoId == '') return <></>
    if (buttonPressed == false) return <Pressable style={{
        width: constants.width,
        height: Math.floor(constants.width / 16 * 9),
        backgroundColor: 'black',
        justifyContent: 'center'
    }}
        onPress={() => {
            setButtonPressed(true)
        }}
    >
        {
            metadata?.thumbnail_url &&
            <View style={{
                position: 'absolute'
            }}>
                <Animated.Image
                    style={{
                        width: constants.width,
                        height: Math.floor(constants.width / 16 * 9),
                    }}
                    source={{
                        uri: metadata.thumbnail_url
                    }}
                    entering={FadeIn}
                />

                {/* {
                    !buttonPressed && <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        // backgroundColor: 'rgba(0, 0, 0, 0.6)'
                    }} />
                } */}
            </View>
        }

        <View
            style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(28, 28, 28, 0.7)',
                padding: 16,
                borderRadius: 32
            }}>
            <Ionicons name="play-sharp" size={32} color="white" />
        </View>
    </Pressable>

    // 560x315
    // console.log(constants.width, Math.floor(constants.width / 16 * 9))
    return (error || reloadN > 1) ? <View style={{
        width: constants.width,
        height: Math.floor(constants.width / 16 * 9),
        backgroundColor: '#a3a3a3'
    }}>
    </View> : <View style={{
        // paddingBottom: 4,
    }}
    // pointerEvents={props.scrolling ? 'none' : 'auto'}
    >
        <YoutubePlayer
            onChangeState={onChangeState}
            ref={ref}
            key={reloadN}
            height={Math.floor(constants.width / 16 * 9)}
            play={videoShouldPlaying}
            videoId={youtubeVideoId}
            // playList={[youtubeVideoId]}
            initialPlayerParams={{
                modestbranding: true,
                // loop: true,
                showClosedCaptions: true
            }}
            onReady={() => {
                // if (!props.isSinglePost) return;
                const second = sharedAsyncState[`player/${props.id}/second`] ?? 0;
                ref.current?.seekTo(second, true)
                // console.log('debug need to play');
                setVideoShouldPlaying(true);
            }}
            onError={onError}
            // onReady={onReady}
            webViewProps={{
                startInLoadingState: true,
                renderLoading: loadingView
            }}
        // baseUrlOverride={"https://lonelycpp.github.io/react-native-youtube-iframe/iframe.html"}
        />

        {/* {!(ready || error) && <Animated.View style={{
            backgroundColor: 'black',
            position: 'absolute',
            height: Math.floor(constants.width / 16 * 9),
            width: constants.width,
        }}
            exiting={FadeOut}
        />} */}
    </View>

}

export default VideoPlayer;
export const MemoVideoPlayer = memo(VideoPlayer)