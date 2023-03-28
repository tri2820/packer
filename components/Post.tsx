import * as React from 'react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, sharedAsyncState } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import Comment, { MemoComment } from './Comment';
import * as Haptics from 'expo-haptics';
import MoreDiscussionsButton from './MoreDiscussionsButton';
import PostHeader from './PostHeader';
import { INIT_DATE, supabaseClient } from '../supabaseClient';
import VideoPlayer from './VideoPlayer';
import KeyTakeaways from './KeyTakeaways';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MainContext } from '../utils';
import { MemoLoadCommentButton } from './LoadCommentButton';

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
    const num = sharedAsyncState[`count/${parent.id}`] - commentStates[`numComments/${parent.id}`];
    const button = {
        type: 'load-comment-button',
        num: num,
        level: parent.level,
        ofId: parent.id,
        id: `button/${parent.id}`
    }
    let childrenUILists = [];
    if (!hiddenCommentIds.includes(parent.id)) {
        const tail = comments.slice(1);
        childrenUILists = splitAt(tail).map(chunks => toUIList(chunks, hiddenCommentIds, commentStates))
    }
    if (num > 0) {
        return [
            parent,
            childrenUILists,
            button
        ]
    }
    return [
        parent,
        childrenUILists
    ]
}

function Post(props: any) {
    const { mode, post, comments: myComments, setSelectedCommentId, requestComments, setMode } = props;
    const selectedCommentId = null;
    const [refreshing, setRefreshing] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [hiddenCommentIds, setHiddenCommentIds] = useState<string[]>([]);
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);

    const commentStates: any = {};
    myComments.forEach((c: any) => {
        commentStates[`numComments/${c.id}`] = 0;
        commentStates[`numComments/${c.parent_id}`] += 1;
    })

    const uiList = splitAt(myComments).map(ch => toUIList(ch, hiddenCommentIds, commentStates)).flat(Infinity);
    const [loadState, setLoadState] = useState<'did_not_load' | 'loading' | 'done'>('did_not_load');
    useEffect(() => {
        setVideoPlaying(props.scrolledOn);
    }, [props.scrolledOn])

    if (props.shouldActive && loadState == 'did_not_load') {
        console.log('active', props.id);
        (async () => {
            setLoadState('loading')
            await requestComments(post.id, null);
            setLoadState('done')
        })()
    }

    useEffect(() => {
        if (!props.scrolledOn) return;
        if (mode.tag == 'Normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        if (mode.tag == 'Comment') {
            myComments.length > 0 && ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
            return;
        }
    }, [mode])

    const onRefresh = React.useCallback(() => {
        setMode({ tag: 'Normal' });
    }, []);

    const backToApp = React.useCallback((target: string) => setMode({
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

    const renderItem = ({ item, index }: any) => {
        return item.type == 'load-comment-button' ?
            <MemoLoadCommentButton
                key={item.id}
                level={item.level}
                post_id={post.id}
                ofId={item.ofId}
                num={item.num}
            />
            :
            <MemoComment
                key={item.id}
                comment={item}
                backToApp={backToApp}
                setSelectedCommentId={setSelectedCommentId}
                highlight={item.id == selectedCommentId}
                toggle={toggle}
            />
    }



    const keyExtractor = (item: any) => item.id

    // console.log('Render Post')
    return <View style={{
        backgroundColor: mode.tag == 'Comment' ? '#212121' : '#151316',
        height: props.height
    }}>
        {
            props.scrolledOn &&
            <FlatList
                showsVerticalScrollIndicator={false}
                listKey={post.id}
                ref={ref}
                scrollEnabled={mode.tag == 'Comment'}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['transparent']}
                        progressBackgroundColor='transparent'
                        tintColor={'transparent'}
                    />
                }
                // onScroll={onScroll}
                data={uiList}
                onEndReached={() => {
                    console.log('on end reached', post.id);
                    requestComments(post.id, null);
                }}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={<View style={{
                    paddingTop: insets.top
                }}>
                    {/* <Text style={{ color: 'white' }}>{JSON.stringify(post.id)}</Text> */}
                    <VideoPlayer videoPlaying={videoPlaying} source_url={post.source_url} />
                    <View style={{
                        paddingHorizontal: 16
                    }}>
                        <PostHeader post={post} setMode={setMode} />
                        <KeyTakeaways content={post.keytakeaways} />
                        {
                            loadState == 'done' && myComments.length == 0 &&
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                            // entering={FadeInUp}
                            >
                                <Ionicons name="chatbubble" size={16} color='#A3A3A3' style={{
                                    marginRight: 4
                                }} />
                                <Text style={{
                                    color: '#A3A3A3',
                                    marginLeft: 4,
                                    marginRight: 16 + 4
                                }}
                                >
                                    Let's spark the conversation! Be the first to share your thoughts and bring some high energy to this post!
                                </Text>
                            </View>
                        }
                    </View>
                </View>
                }
            />
        }

        {
            mode.tag == 'Normal' &&
            <>
                <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.9)']} style={{
                    width: '100%',
                    position: 'absolute',
                    bottom: 0,
                    height: 128
                }}
                    pointerEvents='none'
                />

                {
                    myComments.length > 0 && props.shouldActive &&
                    <View style={{
                        position: 'absolute',
                        bottom: 16,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // backgroundColor: 'blue'
                    }}>
                        <MoreDiscussionsButton onPress={() => {
                            setMode({ tag: 'Comment' })
                        }} />
                    </View>
                }

            </>
        }
    </View >
}

export default Post;
export const MemoPost = memo(Post);