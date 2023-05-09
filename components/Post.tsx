import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, hookListener, noComment, openLink, requestComments, sharedAsyncState, toUIList, unhookListener } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways, { MemoKeyTakeaways } from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import { MemoMoreDiscussionsButton } from './MoreDiscussionsButton';
import PostHeader from './PostHeader';
import VideoPlayer from './VideoPlayer';
// import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { WebBrowserPresentationStyle } from 'expo-web-browser';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



function ListHeader(props: any) {
    const insets = useSafeAreaInsets();
    return <View style={{
        paddingTop: props.mode == 'normal' ? insets.top : 0
    }}>
        {/* <Text style={{ color: 'white' }}>{props.post.id}@{props.index}</Text> */}
        <VideoPlayer
            id={props.post.id}
            scrolledOn={props.scrolledOn}
            source_url={props.post.source_url}
            isSinglePost={true}
        />
        <PostHeader
            navProps={props.navProps}
            user={props.user}
            isSinglePost={props.isSinglePost}
            openLink={props.openLink}
            post={props.post}
            imageLoaded={props.imageLoaded}
            mode={props.mode}
        />
        <MemoKeyTakeaways ners={props.post.ners} content={props.post.keytakeaways} />
        {
            sharedAsyncState[`loadedTimes/${props.post.id}`] >= 1 &&
            props.numTopLevelComments == 0 &&
            props.post.keytakeaways == '' &&
            noComment
        }
    </View>
}


function Post(props: any) {
    const [refreshing, _] = useState(false);
    const [hiddenCommentIds, setHiddenCommentIds] = useState<any>({});
    const ref = useRef<any>(null);
    const comments = sharedAsyncState[`comments/${props.post.id}`] ?? [];
    const [__, update] = useState(false);
    const topLevelSelfComment = comments.length > 0 && comments[0].author_id == 'self' ? comments[0] : null;
    const numTopLevelComments = comments.filter((c: any) => c.parent_id == null).length;
    const timer = useRef<any>(null);
    const uiList = toUIList(comments, hiddenCommentIds)
    uiList.unshift({
        type: 'post-header',
        id: 'post-header'
    })
    // const isFocused = useIsFocused();
    // console.log('debug isFocused', isFocused)
    const [imageLoaded, setImageLoaded] = useState(
        (!props.post.image || props.post.image == '') ? false :
            (
                sharedAsyncState[`imageLoaded/${props.post.image}`] == 'ok' ? true : false
            )
    );
    const imageTimer = useRef<any>(null);

    useEffect(() => {
        if (imageLoaded) return;
        if (!props.post.image || props.post.image == '') return;
        if (sharedAsyncState[`imageLoaded/${props.post.image}`] == 'error') return;
        const imageURI = props.post.image;
        const key = `preloadImage/${imageURI}`;
        if (props.shouldActive) {
            if (sharedAsyncState[key] == 'running') return;
            sharedAsyncState[key] = 'running';
            imageTimer.current = setTimeout(async () => {
                try {
                    console.log('loading image');
                    await Image.prefetch(imageURI);
                } catch (e) {
                    console.log('ERROR loading image');
                    sharedAsyncState[`imageLoaded/${imageURI}`] = 'error';
                    console.log('cannot load image', e, imageURI)
                    return;
                }
                console.log('OK loading image');
                setImageLoaded(true);
                sharedAsyncState[`imageLoaded/${imageURI}`] = 'ok';
                sharedAsyncState[key] = 'done';
            }, 1000);
            return;
        }

        clearTimeout(imageTimer.current)
        sharedAsyncState[key] = 'done';
    }, [props.shouldActive])


    useEffect(() => {
        const key = `commentsChangeListeners/${props.post.id}`;
        const mySubkey = hookListener(key, () => {
            console.log('update!', props.post.id);
            update((d) => !d);
        })
        return () => unhookListener(key, mySubkey)
    }, [])

    const commentAsksForComments = React.useCallback(async (parent_id: string) => {
        await requestComments(sharedAsyncState, props.post.id, parent_id);
    }, [])

    const loadComments = async () => {
        // console.log('L')
        const key = `preloadStatus/${props.post.id}`;
        if (sharedAsyncState[key] == 'running') return;
        sharedAsyncState[key] = 'running';
        timer.current = setTimeout(async () => {
            await requestComments(sharedAsyncState, props.post.id, null);
            sharedAsyncState[key] = 'done';
        }, 1000);
    }

    useEffect(() => {
        // console.log('A')
        if (props.shouldActive) {
            if (sharedAsyncState[`loadedTimes/${props.post.id}`] >= 1 && props.mode == 'normal') return;
            loadComments();
            return;
        }

        clearTimeout(timer.current);
        const key = `preloadStatus/${props.post.id}`;
        sharedAsyncState[key] = 'done';
    }, [props.shouldActive])

    useEffect(() => {
        if (!props.scrolledOn) return;
        if (!topLevelSelfComment) return;
        console.log('debug CHECK scroll to topLevelSelfComment')
        if (comments.length <= 0) return;
        console.log('debug scroll to topLevelSelfComment')
        ref.current?.scrollToIndex({
            index: 0
        });
        return;
    }, [topLevelSelfComment])

    useEffect(() => {
        if (!props.scrolledOn) return;

        if (props.mode == 'normal') {
            ref.current?.scrollToOffset({ offset: 0 });
            return;
        }

        comments.length > 0 && ref.current?.scrollToOffset({ offset: constants.height / 5 });
    }, [props.mode])

    const onRefresh = React.useCallback(() => {
        props.setMode('normal');
    }, []);


    const toggle = React.useCallback((commentId: string, show: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (show) {
            setHiddenCommentIds((hiddenCommentIds: any) => ({
                ...hiddenCommentIds,
                [commentId]: false
            }));
            return
        }

        setHiddenCommentIds((hiddenCommentIds: any) => ({
            ...hiddenCommentIds,
            [commentId]: true
        }));
    }, []);


    const changeModeToComment = React.useCallback(() => {
        props.setMode('comment')
    }, [])



    const renderItem = ({ item, index }: any) => {
        return item.type == 'load-comment-button' ?
            <MemoLoadCommentButton
                key={item.id}
                level={item.level}
                post_id={props.post.id}
                ofId={item.ofId}
                num={item.num}
                requestComments={commentAsksForComments}
                mode={props.mode}
            />
            :
            item.type == 'post-header' ?
                <ListHeader
                    navProps={props.navProps}
                    user={props.user}
                    key={item.id}
                    isSinglePost={props.isSinglePost}
                    index={props.index}
                    imageLoaded={imageLoaded}
                    openLink={openLink}
                    scrolledOn={props.scrolledOn}
                    shouldActive={props.shouldActive}
                    post={props.post}
                    numTopLevelComments={numTopLevelComments}
                    setMode={props.setMode}
                    mode={props.mode}
                // timesLoaded={timesLoaded}
                /> :
                <MemoComment
                    key={item.id}
                    hidden={hiddenCommentIds[item.id]}
                    comment={item}
                    openLink={openLink}
                    setSelectedComment={(c: any) => {
                        if (!props.user) {
                            props.navProps.navigation.navigate('TheTab', { screen: 'Settings' })
                            return;
                        }
                        props.setSelectedComment(c)
                    }}
                    toggle={toggle}
                />
    }

    // const onScroll = (event: any) => {
    //     // console.log('B')
    //     // Hack because onEndReached doesn't work
    //     const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
    //     const y = event.nativeEvent.contentOffset.y;
    //     if (y < end - constants.height * 0.05) return;
    //     loadComments();
    // }

    const keyExtractor = (item: any) => item.id
    const refresh = props.isSinglePost || Platform.OS == 'android' ? undefined : <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['transparent']}
        progressBackgroundColor='transparent'
        tintColor={'transparent'}
    />
    const footer =
        sharedAsyncState[`count/${props.post.id}`] > numTopLevelComments &&
            !(sharedAsyncState[`loadedTimes/${props.post.id}`] >= 1 &&
                numTopLevelComments == 0)
            ? <View style={{
                marginTop: 20,
                paddingBottom: 16
                // alignSelf: 'stretch'
            }}>
                <ActivityIndicator
                    style={styles.loading_indicator}
                    size="small"
                />
                <Text style={{
                    color: '#A3A3A3',
                    alignSelf: 'center'
                }}>
                    Loading {sharedAsyncState[`count/${props.post.id}`] - numTopLevelComments} comments
                </Text>
            </View> : < View style={{
                alignSelf: 'center',
                marginVertical: 16
            }}>
                <Text style={{ color: '#a3a3a3' }}>
                    All comments loaded
                </Text>
            </View >

    const insets = useSafeAreaInsets();
    const nav = () =>
        props.mode == 'comment' && !props.isSinglePost ?
            <View style={{
                paddingTop: insets.top,
                paddingBottom: 8,
                // marginBottom: 8,
                backgroundColor: '#272727',
                borderBottomColor: '#3C3D3F',
                borderBottomWidth: StyleSheet.hairlineWidth,
            }}>
                <TouchableOpacity onPress={() => {
                    props.setMode('normal')
                }} style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Animated.View style={props.offsetZoomStyles}>
                        <Ionicons name="chevron-back-sharp"
                            size={26}
                            color='white'
                            style={{
                                marginLeft: 8
                            }} />
                    </Animated.View>
                    <Text style={{
                        color: 'white',
                        // fontFamily: 'Rubik_400Regular',
                        fontSize: 16
                    }}>Back</Text>
                </TouchableOpacity>
            </View>
            : null

    return <View style={{
        backgroundColor: (props.mode == 'normal' || props.isSinglePost) ? '#151316' : '#272727',
        height: props.height
    }}>
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                height: constants.height / 2,
                width: '100%',
                backgroundColor: '#151316',
            }}
        />

        {
            props.shouldActive
            &&
            <FlatList
                contentContainerStyle={{
                    backgroundColor: '#151316',
                    minHeight: props.height,
                }}
                stickyHeaderIndices={[0]}
                // See, for windowSize, if I set this to a number, 2 for example, there are comments at the end not rendered.
                //  This might be because we have nested list (affect onEndReached also)
                // Here it's set to 21 by default, is there a performance impact?
                // Nevertheless there is now a limit (21) that comments will not get rendered, but it's really long so meh for now
                // windowSize={1}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                updateCellsBatchingPeriod={200}
                showsVerticalScrollIndicator={props.mode == 'comment'}
                ref={ref}
                scrollEnabled={props.mode == 'comment'}
                refreshControl={refresh}
                scrollEventThrottle={6}
                data={uiList}
                // onScroll={props.isSinglePost ? undefined : onScroll}
                // @ts-ignore
                listKey={props.post.id}
                onEndReached={(distanceFromEnd) => {
                    loadComments();
                }}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={nav}
                ListFooterComponent={footer}
            // style={{ backgroundColor: 'blue' }}
            />
        }

        {
            props.mode == 'normal' &&
            <>
                <LinearGradient
                    colors={gradient}
                    style={styles.gradient}
                    pointerEvents='none'
                />
                <View style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1
                }}>
                    {
                        (comments.length > 0 || props.post.keytakeaways) && props.shouldActive &&
                        <MemoMoreDiscussionsButton onPress={changeModeToComment} />
                    }
                </View>
            </>
        }
    </View >
}

export default Post;
const shouldRerenderTheSame = (p: any, c: any) => {
    return p.mode == c.mode
        && p.height == c.height
        && p.shouldActive == c.shouldActive
        && p.scrolledOn == c.scrolledOn
        && p.user == c.user
}
export const MemoPost = memo(Post
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