import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Platform, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, sharedAsyncState } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import { MemoMoreDiscussionsButton } from './MoreDiscussionsButton';
import { MemoNoComment } from './NoComment';
import PostHeader from './PostHeader';
import VideoPlayer from './VideoPlayer';


function ListHeader(props: any) {
    const insets = useSafeAreaInsets();
    const [videoPlaying, setVideoPlaying] = useState(false);

    useEffect(() => {
        setVideoPlaying(props.scrolledOn);
    }, [props.scrolledOn])


    return <View style={{
        paddingTop: insets.top
    }}>
        <VideoPlayer videoPlaying={videoPlaying} source_url={props.post.source_url} />
        <View style={styles.padding}>
            <PostHeader post={props.post} setMode={props.setMode} />
            <KeyTakeaways content={props.post.keytakeaways} />
            {props.timesLoaded > 0 && props.numTopLevelComments == 0 && <MemoNoComment />}
        </View>
    </View>
}

// [ba ca da]
const splitAt = (comments: any[]) => {
    if (comments.length == 0) return [];
    let start = 0;
    let parent_id = comments[start].parent_id;
    let i = 1;
    let result = []
    while (i < comments.length) {
        if (comments[i].parent_id == parent_id) {
            result.push(
                comments.slice(start, i)
            )
            start = i;
        }
        i += 1;
    }
    result.push(comments.slice(start))
    return result
}

// (a null [ba ca da])
const toUIList = (comments: any[], hiddenCommentIds: any[], commentStates: any): any => {
    if (comments.length == 0) return [];
    const parent = comments[0];
    const num = sharedAsyncState[`count/${parent.id}`] - commentStates[`num/${parent.id}`];
    const button = {
        type: 'load-comment-button',
        num: num,
        level: parent.level,
        ofId: parent.id,
        id: `button/${parent.id}`
    }

    const hidden = hiddenCommentIds[parent.id] == true;
    if (hidden) {
        console.log('debug hidden')
        return [parent]
    }

    const tail = comments.slice(1);
    const childrenUILists = splitAt(tail).map(chunks => toUIList(chunks, hiddenCommentIds, commentStates))
    return [parent, childrenUILists, num > 0 ? button : []]
}

function Post(props: any) {
    const [refreshing, _] = useState(false);
    const [hiddenCommentIds, setHiddenCommentIds] = useState<any>({});
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);

    const [loadState, setLoadState] = useState<'loading' | 'not_loading'>('not_loading');
    const [timesLoaded, setTimesLoaded] = useState(0);
    const numTopLevelComments = props.comments.filter((c: any) => c.parent_id == null).length;
    const timer = useRef<any>(null);
    const uiList = splitAt(props.comments).map(ch => toUIList(ch, hiddenCommentIds, sharedAsyncState)).flat(Infinity)

    const loadComments = async () => {

        console.log('call load comments')
        if (loadState == 'loading') return;
        setLoadState('loading');

        timer.current = setTimeout(async () => {
            await props.requestComments(props.post.id, null);
            setLoadState('not_loading')
            setTimesLoaded(t => t + 1);
        }, 1000);
    }


    if (props.shouldActive && timesLoaded == 0) {
        loadComments();
    }

    if (!props.shouldActive) {
        clearTimeout(timer.current);
        if (loadState == 'loading') setLoadState('not_loading')
    }


    useEffect(() => {
        if (!props.scrolledOn) return;
        if (props.mode.tag == 'Normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        if (props.mode.tag == 'Comment') {
            props.comments.length > 0 && ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
            return;
        }
    }, [props.mode])

    const onRefresh = React.useCallback(() => {
        props.setMode({ tag: 'Normal' });
    }, []);

    const backToApp = React.useCallback((target: string) => props.setMode({
        tag: 'App',
        value: target,
        // insetsColor: 'rgba(0, 0, 0, 0)'
    }), [])

    const toggle = React.useCallback((commentId: string, show: boolean) => {
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
        props.setMode({ tag: 'Comment' })
    }, [])

    const renderItem = ({ item, index }: any) => {
        return item.type == 'load-comment-button' ?
            <MemoLoadCommentButton
                key={item.id}
                level={item.level}
                post_id={props.post.id}
                ofId={item.ofId}
                num={item.num}
                requestComments={props.requestComments}
                mode={props.mode}
            />
            :
            <MemoComment
                hidden={hiddenCommentIds[item.id]}
                key={item.id}
                comment={item}
                backToApp={backToApp}
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
        scrolledOn={props.scrolledOn}
        post={props.post}
        numTopLevelComments={numTopLevelComments}
        setMode={props.setMode}
        timesLoaded={timesLoaded}
    />
    const refresh = Platform.OS == 'android' ? undefined : <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={['transparent']}
        progressBackgroundColor='transparent'
        tintColor={'transparent'}
    />
    const footer = props.post
        ? <>
            {

                sharedAsyncState[`count/${props.post.id}`] > numTopLevelComments
                && <ActivityIndicator
                    style={styles.loading_indicator}
                    size="small"
                />
            }
            {
                sharedAsyncState[`count/${props.post.id}`] > 0 &&
                <Text style={{
                    color: '#A3A3A3',
                    alignSelf: 'center'
                }}>
                    {numTopLevelComments}/{sharedAsyncState[`count/${props.post.id}`]} comments
                </Text>
            }
        </> : undefined

    // console.log('debug render post', props.post?.id)
    return <View style={{
        backgroundColor: props.mode.tag == 'Comment' ? '#272727' : '#151316',
        height: props.height
    }}>
        {
            props.scrolledOn
            &&
            <FlatList
                // See, for windowSize, if I set this to a number, 2 for example, there are comments at the end not rendered.
                //  This might be because we have nested list (affect onEndReached also)
                // Here it's set to 21 by default, is there a performance impact?
                // Nevertheless there is now a limit (21) that comments will not get rendered, but it's really long so meh for now
                // windowSize={1}
                initialNumToRender={1}
                maxToRenderPerBatch={3}
                updateCellsBatchingPeriod={300}
                showsVerticalScrollIndicator={false}
                listKey={props.post.id}
                ref={ref}
                scrollEnabled={props.mode.tag == 'Comment'}
                refreshControl={refresh}
                scrollEventThrottle={6}
                data={uiList}
                onScroll={onScroll}
                // onEndReached={loadComments}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={header}
                ListFooterComponent={footer}
            />
        }

        {
            props.mode.tag == 'Normal' &&
            <>
                <LinearGradient
                    colors={gradient}
                    style={styles.gradient}
                    pointerEvents='none'
                />
                {
                    props.comments.length > 0 && props.shouldActive &&
                    <View style={styles.more_discussion_view}>
                        <MemoMoreDiscussionsButton onPress={changeModeToComment} />
                    </View>
                }
            </>
        }
    </View >
}

export default Post;
export const MemoPost = memo(Post);
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