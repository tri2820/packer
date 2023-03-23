import * as React from 'react';
import { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import Comment, { MemoComment } from './Comment';
import * as Haptics from 'expo-haptics';
import MoreDiscussionsButton from './MoreDiscussionsButton';
import PostHeader from './PostHeader';
import { INIT_DATE, supabaseClient } from '../supabaseClient';
import VideoPlayer from './VideoPlayer';
import KeyTakeaways from './KeyTakeaways';
import Ionicons from '@expo/vector-icons/Ionicons';

function Post(props: any) {
    const [comments, setComments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    // const [timeScrolledOn, setTimeScrolledOn] = useState(0);
    const [inited, setInited] = useState(false);
    const [firstLoadResult, setFirstLoadResult] = useState<'waiting' | 'success' | 'failure'>('waiting');
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [waitingForCommentLoading, setWaitingForCommentLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [shouldActive, setShouldActive] = useState(false);
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);

    useEffect(() => {
        setWaitingForCommentLoading(false)
    }, [page])

    const loadComments = async () => {
        console.log('debug requesting comments from post');
        const { data, error } = await supabaseClient
            .from('comments')
            .select()
            .lt('created_at', INIT_DATE)
            .order('created_at', { ascending: false })
            .eq('post_id', props.post.id)
            .is('parent_id', null)
            .range(page, page + 5);

        if (error) {
            console.log('debug error query comments from post', error)
            return 'failure';
        }
        setComments(comments.concat(data));
        setPage(page + 6);
        return 'success'
    }

    const getCount = async () => {
        const { count, error } = await supabaseClient
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', INIT_DATE)
            .eq('post_id', props.post.id)
            .is('parent_id', null)

        if (error) {
            console.log('debug error getting count from post', error)
            return;
        }

        setCount(count ? count : 0)
    }

    useEffect(() => {
        setShouldActive(props.shouldActive);
        if (inited) return;
        if (!props.shouldActive) return;

        (async () => {
            // Sleep
            await new Promise(r => setTimeout(r, 300));
            let active = undefined;
            setShouldActive(shouldActive => {
                active = shouldActive;
                return shouldActive
            })

            // Not focusing -> return
            if (!active) {
                console.log('!! debug request', active, props.index);
                return;
            }
            console.log('!! debug request', active, props.index);
            setInited(true);
            const result = await loadComments();
            setFirstLoadResult(result);
            getCount();
        })()

    }, [props.shouldActive])

    const onRefresh = React.useCallback(() => {
        props.setMode({ tag: 'Normal' });
    }, []);

    useEffect(() => {
        if (props.shouldActive) {
            setVideoPlaying(true);
            return;
        }
        setVideoPlaying(false);
    }, [props.shouldActive]);

    useEffect(() => {
        if (!props.shouldActive) return;
        if (props.mode.tag == 'Normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        if (props.mode.tag == 'Comment') {
            comments.length > 0 && ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
            return;
        }
    }, [props.mode])

    useEffect(() => {
        console.log('debug changed props.recentComment', props.recentComment
            // .filter((c: any) => c.comment.post_id == props.post.id)
            // , props.post.id
        )
    }, [props.recentComment])

    const renderItem = ({ item, index }: any) =>
        <View style={{
            marginHorizontal: 16
        }}>
            <MemoComment
                startLoading={props.shouldActive}
                comment={item}
                level={0}
                setMode={props.setMode}
                selectedCommentId={props.selectedCommentId}
                setSelectedCommentId={props.setSelectedCommentId}
                recentComment={props.recentComment}
            />
        </View>


    const keyExtractor = (item: any) => item.id
    const onScroll = (event: any) => {
        // Hack because onEndReached doesn't work
        const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const y = event.nativeEvent.contentOffset.y;
        if (y < end * 0.9) return;
        // console.log('debug over 0.9');
        if (waitingForCommentLoading) {
            // console.log('debug waitingForCommentLoading');
            return;
        }
        if (comments.length >= count) {
            // console.log('debug have all comments already');
            return;
        }

        // console.log('debug loading');
        setWaitingForCommentLoading(true);
        loadComments();
    }

    console.log('Post was rendered!', props.index, new Date().toLocaleTimeString())


    return <View style={{
        backgroundColor: props.mode.tag == 'Comment' ? '#212121' : '#151316',
        height: props.height
    }}>
        {
            props.shouldActive &&
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
                onScroll={
                    onScroll
                }
                data={comments}
                onEndReached={() => {
                    console.log('debug one end reached', props.index);
                    if (waitingForCommentLoading) {
                        // console.log('debug waitingForCommentLoading');
                        return;
                    }
                    if (comments.length >= count) {
                        // console.log('debug have all comments already');
                        return;
                    }

                    // console.log('debug loading');
                    setWaitingForCommentLoading(true);
                    loadComments();
                }}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={<View style={{
                    paddingTop: insets.top
                }}>
                    <VideoPlayer videoPlaying={videoPlaying} source_url={props.post.source_url} />
                    <View style={{
                        paddingHorizontal: 16
                    }}>
                        <PostHeader post={props.post} setMode={props.setMode} />
                        <KeyTakeaways content={props.post.keytakeaways} />
                        {
                            props.recentComment === null &&
                            firstLoadResult != 'waiting' &&
                            comments.length == 0 &&
                            <Animated.View style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                                entering={FadeInUp}
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
                                    {firstLoadResult == 'success' ? `Let's spark the conversation! Be the first to share your thoughts and bring some high energy to this post!` : "Dang, error querying comments"}
                                </Text>
                            </Animated.View>
                        }
                    </View>
                    {
                        props.recentComment && props.recentComment.parent_id == null && <MemoComment
                            fixed
                            comment={props.recentComment}
                            level={0}
                            startLoading={props.startLoading}
                            setMode={props.setMode}
                            selectedCommentId={props.selectedCommentId}
                            setSelectedCommentId={props.setSelectedCommentId}
                            recentComment={props.recentComment}
                        />
                    }
                </View>
                }
            />
        }

        {
            props.mode.tag == 'Normal' &&
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
                    comments.length > 0 && props.shouldActive &&
                    <View style={{
                        position: 'absolute',
                        bottom: 16,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // backgroundColor: 'blue'
                    }}>
                        <MoreDiscussionsButton onPress={() => {
                            props.setMode({ tag: 'Comment' })
                        }} />
                    </View>
                }

            </>

        }

    </View >
}

export default Post;
export const MemoPost = memo(Post);