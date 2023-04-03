import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sharedAsyncState } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import { MemoMoreDiscussionsButton } from './MoreDiscussionsButton';
import { MemoNoComment } from './NoComment';
import PostHeader from './PostHeader';
import VideoPlayer from './VideoPlayer';

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

    const hidden = hiddenCommentIds.includes(parent.id);
    if (hidden) {
        return [parent]
    }

    const tail = comments.slice(1);
    const childrenUILists = splitAt(tail).map(chunks => toUIList(chunks, hiddenCommentIds, commentStates))
    return [parent, childrenUILists, num > 0 ? button : []]
}

function Post(props: any) {
    const [refreshing, setRefreshing] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>([]);
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);

    const uiList = splitAt(props.comments).map(ch => toUIList(ch, hiddenCommentIds, sharedAsyncState)).flat(Infinity);
    const [loadState, setLoadState] = useState<'loading' | 'not_loading'>('not_loading');
    const [timesLoaded, setTimesLoaded] = useState(0);

    useEffect(() => {
        setVideoPlaying(props.scrolledOn);
    }, [props.scrolledOn])

    const timer = useRef<any>(null);

    const loadComments = async () => {
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
        insetsColor: 'rgba(0, 0, 0, 0)'
    }), [])

    const toggle = React.useCallback((commentId: string, show: boolean) => {
        if (show) {
            setHiddenCommentIds((hiddenCommentIds) => hiddenCommentIds.filter(id => id != commentId));
            return
        }

        setHiddenCommentIds((hiddenCommentIds) => hiddenCommentIds.concat(commentId));
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
                key={item.id}
                comment={item}
                backToApp={backToApp}
                setSelectedComment={props.setSelectedComment}
                toggle={toggle}
            />
    }

    const keyExtractor = (item: any) => item.id

    return <View style={{
        backgroundColor: props.mode.tag == 'Comment' ? '#272727' : '#151316',
        height: props.height
    }}>
        {
            // Experiment
            (Platform.OS == 'android' ? props.shouldActive : props.scrolledOn) &&
            <FlatList
                showsVerticalScrollIndicator={false}
                listKey={props.post.id}
                ref={ref}
                scrollEnabled={props.mode.tag == 'Comment'}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['transparent']}
                        progressBackgroundColor='transparent'
                        tintColor={'transparent'}
                    />
                }
                data={uiList}
                onEndReached={loadComments}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View style={{
                        paddingTop: insets.top
                    }}>
                        <VideoPlayer videoPlaying={videoPlaying} source_url={props.post.source_url} />
                        <View style={styles.padding}>
                            <PostHeader post={props.post} setMode={props.setMode} />
                            <KeyTakeaways content={props.post.keytakeaways} />
                            {timesLoaded > 0 && props.comments.length == 0 && <MemoNoComment />}
                        </View>
                    </View>
                }
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