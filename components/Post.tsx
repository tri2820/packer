import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Image, ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, noComment, requestComments, sharedAsyncState, toUIList } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import { MemoMoreDiscussionsButton } from './MoreDiscussionsButton';
import PostHeader from './PostHeader';
import VideoPlayer from './VideoPlayer';
// import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

function ListHeader(props: any) {
    const insets = useSafeAreaInsets();
    const [videoPlaying, setVideoPlaying] = useState(false);

    useEffect(() => {
        setVideoPlaying(props.scrolledOn);
    }, [props.scrolledOn])

    return <View style={{
        paddingTop: insets.top
    }}>
        {/* <Text style={{ color: 'white' }}>{props.post.id}@{props.index}</Text> */}
        <VideoPlayer videoPlaying={videoPlaying} source_url={props.post.source_url} />
        <PostHeader setApp={props.setApp} post={props.post} imageLoaded={props.imageLoaded} />
        <KeyTakeaways content={props.post.keytakeaways} />
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
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);
    const comments = sharedAsyncState[`comments/${props.post.id}`] ?? [];
    const [__, update] = useState(false);
    const topLevelSelfComment = comments.length > 0 && comments[0].author_id == 'self' ? comments[0] : null;
    const numTopLevelComments = comments.filter((c: any) => c.parent_id == null).length;
    const timer = useRef<any>(null);
    const uiList = toUIList(comments, hiddenCommentIds)

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


    sharedAsyncState[`commentsChangeListener/${props.post.id}`] = () => {
        update((d) => !d);
    }

    const commentAsksForComments = React.useCallback(async (parent_id: string) => {
        await requestComments(sharedAsyncState, props.post.id, parent_id);
    }, [])

    const loadComments = async () => {
        const key = `preloadStatus/${props.post.id}`;
        if (sharedAsyncState[key] == 'running') return;
        sharedAsyncState[key] = 'running';
        timer.current = setTimeout(async () => {
            await requestComments(sharedAsyncState, props.post.id, null);
            sharedAsyncState[key] = 'done';
        }, 1000);
    }

    useEffect(() => {
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
        ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
        return;
    }, [topLevelSelfComment])

    useEffect(() => {
        if (!props.scrolledOn) return;

        if (props.mode == 'normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        comments.length > 0 && ref.current?.scrollToOffset({ offset: constants.height / 3 });
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
            <MemoComment
                key={item.id}
                hidden={hiddenCommentIds[item.id]}
                comment={item}
                setApp={props.setApp}
                setSelectedComment={props.setSelectedComment}
                toggle={toggle}
            />
    }

    const onScroll = (event: any) => {
        // Hack because onEndReached doesn't work
        const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const y = event.nativeEvent.contentOffset.y;
        if (y < end - constants.height * 0.05) return;
        loadComments();
    }

    const keyExtractor = (item: any) => item.id
    const header = <ListHeader
        index={props.index}
        imageLoaded={imageLoaded}
        setApp={props.setApp}
        scrolledOn={props.scrolledOn}
        shouldActive={props.shouldActive}
        post={props.post}
        numTopLevelComments={numTopLevelComments}
        setMode={props.setMode}
    // timesLoaded={timesLoaded}
    />
    const refresh = Platform.OS == 'android' ? undefined : <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['transparent']}
        progressBackgroundColor='transparent'
        tintColor={'transparent'}
    />
    const footer =
        sharedAsyncState[`count/${props.post.id}`] > numTopLevelComments &&
            !(sharedAsyncState[`loadedTimes/${props.post.id}`] >= 1 &&
                props.numTopLevelComments == 0)
            ? <View style={{
                marginTop: 20
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
            </View> : undefined

    console.log('debug render post', props.index)

    return <View style={{
        backgroundColor: props.mode == 'comment' ? '#272727' : '#151316',
        height: props.height
    }}>
        {
            props.shouldActive
            &&
            <FlatList
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
                onScroll={onScroll}
                // @ts-ignore
                listKey={props.post.id}
                onEndReached={(distanceFromEnd) => {
                    if (!props.scrolledOn) return;
                    console.log('*****************end reached', props.post.id, distanceFromEnd, props.mode)
                    loadComments();
                }}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={header}
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
                {
                    (comments.length > 0 || props.post.keytakeaways) && props.shouldActive &&
                    <View style={styles.more_discussion_view}>
                        <MemoMoreDiscussionsButton onPress={changeModeToComment} />
                    </View>
                }
            </>
        }
    </View >
}

export default Post;
const shouldRerenderTheSame = (p: any, c: any) => {
    return p.app == c.app
        && p.mode == c.mode
        && p.height == c.height
        && p.shouldActive == c.shouldActive
        && p.scrolledOn == c.scrolledOn
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
    more_discussion_view: {
        position: 'absolute',
        bottom: 12,
        right: 16
        // alignSelf: 'center',
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