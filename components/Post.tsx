import * as React from 'react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
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
import { MainContext } from '../utils';

function Post(props: any) {
    const { mode, posts, setMode, comments, requestComments } = useContext(MainContext);
    const [refreshing, setRefreshing] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);
    const post = posts.find((post: any) => post.id == props.id);
    const myCommentIds = comments.filter((c: any) => c.post_id == post.id && c.parent_id == null).map((c: any) => c.id);
    const [inited, setInited] = useState(false);

    useEffect(() => {
        if (!props.shouldActive) return;
        if (inited) return;
        console.log('active', props.id);
        (async () => {
            await requestComments(post.id, null);
            setInited(true)
        })()
    }, [props.shouldActive])

    const onRefresh = React.useCallback(() => {
        setMode({ tag: 'Normal' });
    }, []);

    useEffect(() => {
        if (props.scrolledOn) {
            setVideoPlaying(true);
            return;
        }
        setVideoPlaying(false);
    }, [props.scrolledOn]);

    useEffect(() => {
        if (!props.scrolledOn) return;
        if (mode.tag == 'Normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        if (mode.tag == 'Comment') {
            myCommentIds.length > 0 && ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
            return;
        }
    }, [mode])

    const renderItem = ({ item, index }: any) =>
        <MemoComment
            key={item}
            level={0}
            id={item}
        />

    const keyExtractor = (item: any) => item
    const onScroll = (event: any) => {
        // Hack because onEndReached doesn't work
        const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const y = event.nativeEvent.contentOffset.y;
        if (y < end - constants.height / 4) return;
        // requestComments(post.id, null);
    }


    return <View style={{
        backgroundColor: mode.tag == 'Comment' ? '#212121' : '#151316',
        height: props.height
    }}>
        {
            props.scrolledOn &&
            <Animated.View
                entering={FadeInDown}>
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
                    onScroll={onScroll}
                    data={myCommentIds}
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
                                inited && myCommentIds.length == 0 &&
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
            </Animated.View>
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
                    myCommentIds.length > 0 && props.shouldActive &&
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