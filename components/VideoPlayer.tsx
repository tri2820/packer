import * as React from 'react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import YoutubePlayer from "react-native-youtube-iframe";
import { constants, loadingView, normalizedHostname } from '../utils';

function VideoPlayer(props: any) {
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    const [reloadN, setReloadN] = useState(0);
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

    if (youtubeVideoId == '') return <></>

    const onError = (e: string) => {
        console.log('error yt', e, youtubeVideoId)
        if (e != 'embed_not_allowed' || reloadN > 0) {
            // setError(true);
            return;
        }
        setReloadN((reloadN) => reloadN + 1);
    }

    // const onReady = () => {
    //     setReady(true);
    // }


    // 560x315
    // console.log(constants.width, Math.floor(constants.width / 16 * 9))
    return <View style={{
        paddingBottom: 4,
    }}>
        <YoutubePlayer
            key={reloadN}
            height={Math.floor(constants.width / 16 * 9)}
            play={props.videoPlaying}
            videoId={youtubeVideoId}
            playList={[youtubeVideoId]}
            initialPlayerParams={{
                modestbranding: true,
                loop: true,
                showClosedCaptions: true
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