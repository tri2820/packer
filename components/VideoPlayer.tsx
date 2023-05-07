import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import YoutubePlayer from "react-native-youtube-iframe";
import { constants, loadingView, normalizedHostname, sharedAsyncState } from '../utils';

function VideoPlayer(props: any) {
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    const [reloadN, setReloadN] = useState(0);
    const appState = useRef(AppState.currentState);
    const [appStateCurrent, setAppStateCurrent] = useState(appState.current)
    const [videoShouldPlaying, setVideoShouldPlaying] = useState(false);
    const [error, setError] = useState(false);
    const ref = useRef<any>(null);
    const [intervalObj, setIntervalObj] = useState<any>(null);

    const startSyncTime = () => {
        const id = setInterval(async () => {
            const sec = await ref.current?.getCurrentTime();
            // console.log('debug SEC', sec);
            sharedAsyncState[`player/${props.id}/second`] = sec;
        }, 1000);
        setIntervalObj(id);
    };

    useEffect(() => {
        console.log('debug appStateCurrent', appStateCurrent, props.scrolledOn, youtubeVideoId)
        const playing = props.scrolledOn && appStateCurrent == 'active' && youtubeVideoId != '';
        setVideoShouldPlaying(playing);
    }, [props.scrolledOn, appStateCurrent, youtubeVideoId]);

    useEffect(() => {
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
            console.log('AppState', appState.current);
            setAppStateCurrent(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, []);
    // const [ready, setReady] = useState(false);
    // const [error, setError] = useState(false);
    useEffect(() => {
        const url = new URL(props.source_url);
        if (!(normalizedHostname(url.hostname) == 'youtube.com')) {
            setYoutubeVideoId('')
            return;
        }
        const youtubeVideoId = url.searchParams.get('v') || ''
        setYoutubeVideoId(youtubeVideoId)
    }, [props.source_url])



    const onError = (e: string) => {
        console.log('error yt', e, youtubeVideoId)
        if (e != 'embed_not_allowed' || reloadN > 0) {
            setError(true);
            return;
        }
        setReloadN((reloadN) => reloadN + 1);
    }

    // const onReady = () => {
    //     setReady(true);
    // }

    if (youtubeVideoId == '') return <></>
    // 560x315
    // console.log(constants.width, Math.floor(constants.width / 16 * 9))
    return (error || reloadN > 1) ? <></> : <View style={{
        // paddingBottom: 4,
    }}
        pointerEvents={props.scrolling ? 'none' : 'auto'}
    >
        <YoutubePlayer
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
                console.log('READYYYY')
                const second = sharedAsyncState[`player/${props.id}/second`] ?? 0;
                console.log('LOAD SEC', second, ref.current);
                ref.current?.seekTo(second, true)
                startSyncTime();
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