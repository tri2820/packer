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
    const [refreshing, setRefreshing] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);
    const comments = props.comments.filter((c: any) => c.post_id == props.post.id && c.parent_id == null);
    const [inited, setInited] = useState(false);

    useEffect(() => {
        if (!props.shouldActive) return;
        if (inited) return;
        console.log('active');
        (async () => {
            await props.requestComments(props.post.id, null);
            setInited(true)
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

    const renderItem = ({ item, index }: any) =>
        <View style={{
            marginHorizontal: 16
        }}>
            <MemoComment
                selectedCommentId={props.selectedCommentId}
                setSelectedCommentId={props.setSelectedCommentId}
                shouldActive={props.shouldActive}
                comment={item}
                level={0}
                setMode={props.setMode}
                comments={props.comments}
                requestComments={props.requestComments}
            />
        </View>


    const keyExtractor = (item: any) => item.id
    const onScroll = (event: any) => {
        // Hack because onEndReached doesn't work
        const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const y = event.nativeEvent.contentOffset.y;
        if (y < end - constants.height / 4) return;
        // props.requestComments(props.post.id, null);
    }


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
                onScroll={onScroll}
                data={comments}
                onEndReached={() => {
                    console.log('on end reached');
                    props.requestComments(props.post.id, null);
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
                            inited && comments.length == 0 &&
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
                                    Let's spark the conversation! Be the first to share your thoughts and bring some high energy to this post!
                                </Text>
                            </Animated.View>
                        }
                    </View>
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