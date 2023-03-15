import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { IconMedicalCrossFilled } from 'tabler-icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from "react-native-youtube-iframe";
import MoreDiscussionsButton from './MoreDiscussionsButton';
import PostHeader from './PostHeader';
import CommentSection from './CommentSection';
import KeyTakeaways from './KeyTakeaways';
import VideoPlayer from './VideoPlayer';
import { INIT_DATE, supabaseClient } from '../supabaseClient';


function VideoPost(props: any) {
    const [comments, setComments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [requestedComment, setRequestedComment] = useState(false);


    useEffect(() => {
        if (props.activePostIndex != props.index) return;
        if (requestedComment) return;

        (async () => {
            console.log('debug requesting comments from post');
            setRequestedComment(true);
            const { data, error } = await supabaseClient
                .from('comments')
                .select()
                .lt('created_at', INIT_DATE)
                .order('created_at', { ascending: false })
                .eq('post_id', props.post.id)
                .is('parent_id', null)
                .range(0, 5);
            if (error) {
                console.log('debug error query comments from post', error)
                return;
            }
            setComments(data);
        })()
    }, [props.activePostIndex])

    const insets = useSafeAreaInsets();
    const ref = useRef<any>(null);

    const onRefresh = React.useCallback(() => {
        props.setMode({ tag: 'Normal' });
    }, []);


    useEffect(() => {
        if (props.activePostIndex == props.index) {
            setVideoPlaying(true);
            return;
        }
        setVideoPlaying(false);
    }, [props.activePostIndex])

    useEffect(() => {
        if (props.activePostIndex != props.index) return;
        if (props.mode.tag == 'Normal') {
            ref.current?.scrollToOffset({ offset: -insets.top });
            return;
        }

        if (props.mode.tag == 'Comment') {
            comments.length > 0 && ref.current?.scrollToIndex({ index: 0, viewOffset: insets.top });
            return;
        }
    }, [props.mode])


    const renderItem = ({ item, index }: any) => <View
        style={{
            paddingHorizontal: 16
        }} >
        <Comment
            startLoading={props.activePostIndex == props.index}
            comment={item}
            level={0}
            setMode={props.setMode}
        />
    </View>


    return (
        <View style={{
            backgroundColor: props.mode.tag == 'Comment' ? '#212121' : '#121212',
            height: props.height,
        }}>
            <FlatList
                listKey={props.post.id}
                ref={ref}
                contentInset={{ top: insets.top }}
                automaticallyAdjustContentInsets={false}
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

                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={<View>
                    <VideoPlayer videoPlaying={videoPlaying} source_url={props.post.source_url} />
                    <View style={{
                        paddingHorizontal: 16
                    }}>
                        <PostHeader post={props.post} setMode={props.setMode} />
                        <KeyTakeaways content={props.post.keytakeaways} />
                    </View>
                </View>}
            />
            {
                props.mode.tag == 'Normal' && <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}>
                    <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.8)']} style={{
                        width: '100%',
                        paddingBottom: 8,
                        paddingTop: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} >
                        <MoreDiscussionsButton onPress={() => {
                            props.setMode({ tag: 'Comment' })
                        }} />
                    </LinearGradient>
                </View>
            }

        </View>


    );
}

export default VideoPost;