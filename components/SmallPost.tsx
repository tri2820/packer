import * as React from 'react';

import { Octicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import {
    Canvas,
    Rect,
    LinearGradient,
    Skia,
    Shader,
    vec
} from "@shopify/react-native-skia";


import moment from 'moment';
import FirstSlide from './FirstSlide';


function AnonAvatarList(props: any) {
    // console.log('debug ', props.author_names)
    if (props.author_names.length == 0) return <Ionicons name="chatbox-outline" size={20} color='#5c5c5c' />

    return <View style={{
        alignItems: 'center',
        flexDirection: 'row'
    }}>
        <AnonAvatar author_name={props.author_names[0]} />
        {
            props.author_names.length >= 2 &&
            <View style={{
                marginLeft: -8
            }}>
                <AnonAvatar author_name={props.author_names[1]} />
            </View>
        }

        {/* <Ionicons name="caret-forward" size={14} color='#a3a3a3' style={{
            alignSelf: 'center'
        }} /> */}
        {/* </View> */}
    </View>

}

function ListHeader(props: any) {
    const insets = useSafeAreaInsets();
    const [bookmarked, setBookmarked] = useState(sharedAsyncState.bookmarks[props.post.id] ? true : false);
    useEffect(() => {
        const key = `BookmarkChangelisteners/${props.post.id}`;
        const mySubkey = hookListener(key, () => {
            console.log('update!', props.post.id);
            setBookmarked(sharedAsyncState.bookmarks[props.post.id] ? true : false)
        })
        return () => unhookListener(key, mySubkey)
    }, [])



    const _toggleBookmark = () => {
        if (!props.user) {
            props.navProps.navigation.navigate('Profile')
            return;
        }
        toggleBookmark(props.post, props.user)
    }

    const imageSources: any[] = [];
    if (props.post.image_url) imageSources.push({ uri: props.post.image_url });
    imageSources.push({ uri: 'https://imgur.com/QpDXQe5.png' });

    const renderItem = ({ item, index }: any) => {
        // return <></>
        // console.log('debug props.post.ners', props.post)
        if (item.type == 'post_with_attachment')
            return <FirstSlide
                setImageViewerIndex={setImageViewerIndex}
                setImageViewerIsVisible={setImageViewerIsVisible}
                scrolledOn={props.scrolledOn}
                post={props.post}
                user={props.user}
                isSinglePost={props.isSinglePost}
                openLink={props.openLink}
                mode={props.mode}
                navProps={props.navProps}
            />

        return <Slide
            height={height}
            index={index}
            activeSlideIndex={activeSlideIndex}
            showImageViewer={(image: string) => {
                if (imageSources.length == 0) return;
                let index = imageSources.findIndex(s => s.uri == image);
                if (index == -1) index = 0;
                setImageViewerIndex(index);
                setImageViewerIsVisible(true);
            }}
        />
    }

    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [imageViewerVisible, setImageViewerIsVisible] = useState(false);
    const [imageViewerIndex, setImageViewerIndex] = useState(0);

    const updateIndex = (event: any) => {
        let offset = event.nativeEvent.contentOffset.x;
        if (offset < constants.width / 2) {
            setActiveSlideIndex(0)
            return;
        }
        offset -= constants.width / 2;
        setActiveSlideIndex(Math.floor(offset / constants.width) + 1);
    }

    const data = []
    if (props.post.image_url != '' || isVideoPost(props.post.url)) {
        data.push({ type: 'post_with_attachment' })
        data.push({ type: 'keytakeaways' })
    } else {
        data.push({ type: 'post' })
    }
    // if (props.post.outlook != '') data.push({ type: 'outlook' })

    const [height, setHeight] = useState(0);

    const onLayout = async (event: any) => {
        setHeight(event.nativeEvent.layout.height);
    }

    const header = ({ imageIndex }: any) => {
        return <Text style={{
            color: '#a3a3a3',
            // fontSize: 18,
            // fontFamily: 'Rubik_500Medium',
            paddingTop: insets.top,
            paddingBottom: 16,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(28,28,28,0.8)'
        }}>
            {props.post.title}
        </Text>
    }

    const footer = ({ imageIndex }: any) => {
        const content = imageIndex == 0 ?
            <Text>
                {props.post.maintext.slice(0, 80).replace('\n', '')}
            </Text>
            :
            <Text>Since layoffs, Vox might have been focusing on its core business.</Text>
        return <View style={{
            paddingTop: 16,
            paddingBottom: insets.bottom,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(28,28,28,0.8)'
        }}>
            {
                imageIndex == 0 &&
                <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Domine_700Bold',
                    marginBottom: 8
                }}>{props.post.title}</Text>}

            <Text style={{
                color: 'white'
            }}>
                {content}
            </Text>

            {imageSources.length > 1 && <View style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: 16
            }}>
                {imageSources.map((item: any, index: any) => {
                    // console.log('debug index', index, activePostIndex)
                    return <View key={index} style={{
                        height: 8,
                        width: 8,
                        borderRadius: 4,
                        backgroundColor: imageIndex == index ? (activeSlideIndex > 0 ? 'white' : '#6e6e6e') : 'transparent',
                        borderWidth: 1,
                        borderColor: imageIndex == index && activeSlideIndex > 0 ? 'white' : '#6e6e6e',
                        marginHorizontal: 3
                    }} />
                })}
            </View>
            }
        </View>

    }

    return <><View style={{
        // paddingTop: 8
    }}>
        <Animated.FlatList
            onLayout={onLayout}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={data}
            renderItem={renderItem}
            onScroll={updateIndex}
            alwaysBounceVertical={false}
            alwaysBounceHorizontal={false}
            bounces={false}
        />
        {/* <Text style={{ color: 'white' }}>{props.post.id}@{props.index}</Text> */}

        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            bottom: 16,
            left: 12,
            // alignSelf: 'center'
        }}>
            <TouchableOpacity
                onPress={_toggleBookmark}
            >
                <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={bookmarked ? '#FFC542' : (activeSlideIndex > 0 ? 'white' : '#5c5c5c')}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
                props.navProps.navigation.push('SinglePost', {
                    singlePost: props.post
                })
            }} style={{
                marginLeft: 8,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                {/* <AnonAvatarList author_names={
                    Array.from(
                        props.comments.reduce((set: Set<any>, c: any) => set.add(c.author_name), new Set<string>())
                    )
                } /> */}
                <Ionicons name="chatbox-outline" size={20} color={activeSlideIndex > 0 ? 'white' : '#5c5c5c'} />
                <Text style={{ color: activeSlideIndex > 0 ? 'white' : '#5c5c5c', marginLeft: 4, fontWeight: '300' }}>{sharedAsyncState[`count/${props.post.id}`] ?? 0}</Text>
            </TouchableOpacity>
        </View>

        {
            data.length > 1 && <View style={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                // alignSelf: 'center',
                flexDirection: 'row',
            }}
                pointerEvents='none'
            // entering={FadeIn}
            // exiting={FadeOut}
            >
                {
                    data.map((item: any, index: any) => {
                        // console.log('debug index', index, activePostIndex)
                        return <View key={index} style={{
                            height: 8,
                            width: 8,
                            borderRadius: 4,
                            backgroundColor: activeSlideIndex == index ? (activeSlideIndex > 0 ? 'white' : '#6e6e6e') : 'transparent',
                            borderWidth: 1,
                            borderColor: activeSlideIndex == index && activeSlideIndex > 0 ? 'white' : '#6e6e6e',
                            marginHorizontal: 3
                        }} />
                    })
                }
            </View>
        }


    </View>
        <ImageView
            keyExtractor={(s: any) => {
                return s.uri
            }}
            // HeaderComponent={header}
            FooterComponent={footer}
            doubleTapToZoomEnabled={true}
            images={imageSources}
            imageIndex={imageViewerIndex}
            visible={imageViewerVisible}
            onRequestClose={() => setImageViewerIsVisible(false)}
        />
    </>
}


function SmallPost(props: any) {
    // const [refreshing, _] = useState(false);
    // const [hiddenCommentIds, setHiddenCommentIds] = useState<any>({});
    // const ref = useRef<any>(null);
    const comments = sharedAsyncState[`comments/${props.post.id}`] ?? [];
    const [__, update] = useState(false);
    // const topLevelSelfComment = comments.length > 0 && comments[0].author_id == 'self' ? comments[0] : null;
    const numTopLevelComments = comments.filter((c: any) => c.parent_id == null).length;
    // const timer = useRef<any>(null);
    // const uiList = toUIList(comments, hiddenCommentIds)
    // uiList.unshift({
    //     type: 'post-header',
    //     id: 'post-header'
    // })
    // const isFocused = useIsFocused();
    // console.log('debug isFocused', isFocused)
    // const [imageLoaded, setImageLoaded] = useState(
    //     (!props.post.image_url || props.post.image_url == '') ? false :
    //         (
    //             sharedAsyncState[`imageLoaded/${props.post.image_url}`] == 'ok' ? true : false
    //         )
    // );
    const imageTimer = useRef<any>(null);

    // useEffect(() => {
    //     if (imageLoaded) return;
    //     if (!props.post.image_url || props.post.image_url == '') return;
    //     if (sharedAsyncState[`imageLoaded/${props.post.image_url}`] == 'error') return;
    //     const imageURI = props.post.image_url;
    //     const key = `preloadImage/${imageURI}`;
    //     if (props.shouldActive) {
    //         if (sharedAsyncState[key] == 'running') return;
    //         sharedAsyncState[key] = 'running';
    //         imageTimer.current = setTimeout(async () => {
    //             try {
    //                 console.log('loading image');
    //                 await Image.prefetch(imageURI);
    //             } catch (e) {
    //                 console.log('ERROR loading image');
    //                 sharedAsyncState[`imageLoaded/${imageURI}`] = 'error';
    //                 console.log('cannot load image', e, imageURI)
    //                 return;
    //             }
    //             console.log('OK loading image');
    //             setImageLoaded(true);
    //             sharedAsyncState[`imageLoaded/${imageURI}`] = 'ok';
    //             sharedAsyncState[key] = 'done';
    //         }, 1000);
    //         return;
    //     }

    //     clearTimeout(imageTimer.current)
    //     sharedAsyncState[key] = 'done';
    // }, [props.shouldActive])



    useEffect(() => {
        const key = `commentsChangeListeners/${props.post.id}`;
        const mySubkey = hookListener(key, () => {
            console.log('update!', props.post.id);
            update((d) => !d);
        })
        return () => unhookListener(key, mySubkey)
    }, [])


    // const loadComments = async () => {
    //     // console.log('L')
    //     const key = `preloadStatus/${props.post.id}`;
    //     if (sharedAsyncState[key] == 'running') return;
    //     sharedAsyncState[key] = 'running';
    //     timer.current = setTimeout(async () => {
    //         await requestComments(sharedAsyncState, props.post.id, null);
    //         sharedAsyncState[key] = 'done';
    //     }, 1000);
    // }

    // useEffect(() => {
    //     if (props.shouldActive) {
    //         if (sharedAsyncState[`loadedTimes/${props.post.id}`] >= 1 && props.mode == 'normal') return;
    //         loadComments();
    //         return;
    //     }

    //     clearTimeout(timer.current);
    //     const key = `preloadStatus/${props.post.id}`;
    //     sharedAsyncState[key] = 'done';
    // }, [props.shouldActive])


    return <View style={{
        backgroundColor: '#151316'
    }}>
        {/* <Text style={{ color: 'white' }}>asdnkjasndjaksndk</Text> */}
        {/* <View style={{
            position: 'absolute',
        }}>
            <Canvas style={{ flex: 1 }}>
                <Rect x={0} y={0} width={constants.width} height={500}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, 256)}
                        colors={["red", '#151316']}
                    />
                </Rect>
            </Canvas>
        </View> */}


        <ListHeader
            // scrolling={props.scrolling}
            comments={comments}
            navProps={props.navProps}
            user={props.user}
            key={props.post.id}
            isSinglePost={props.isSinglePost}
            index={props.index}
            // imageLoaded={imageLoaded}
            openLink={openLink}
            scrolledOn={props.scrolledOn}
            shouldActive={props.shouldActive}
            post={props.post}
            numTopLevelComments={numTopLevelComments}
            setMode={props.setMode}
            mode={props.mode}
        // timesLoaded={timesLoaded}
        />
    </View>
}

export default SmallPost;
const shouldRerenderTheSame = (p: any, c: any) => {
    return p.mode == c.mode
        && p.height == c.height
        && p.shouldActive == c.shouldActive
        && p.scrolledOn == c.scrolledOn
        && p.user == c.user
}
export const MemoSmallPost = memo(SmallPost
    , shouldRerenderTheSame
);
const styles = StyleSheet.create({
    loading_indicator: {
        marginBottom: 5,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    gradient: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 128
    },
    padding: {
        paddingHorizontal: 16
    }
});

const gradient = ['transparent', 'rgba(0, 0, 0, 0.9)']