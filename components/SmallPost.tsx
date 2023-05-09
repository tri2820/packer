import * as React from 'react';

import { Octicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
// import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, getPastelColor, requestComments, sharedAsyncState, toUIList, toggleBookmark } from '../utils';
import { MemoComment } from './Comment';
import KeyTakeaways, { MemoKeyTakeaways } from './KeyTakeaways';
import { MemoLoadCommentButton } from './LoadCommentButton';
import PostHeader from './PostHeader';
import VideoPlayer from './VideoPlayer';
// import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { WebBrowserPresentationStyle } from 'expo-web-browser';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hookListener, unhookListener } from '../utils';
import AnonAvatar from './AnonAvatar';


function AnonAvatarList(props: any) {
    // console.log('debug ', props.author_names)
    if (props.author_names.length == 0) return <View style={{
        flexDirection: 'row',
        alignItems: 'center'
    }}>
        <Text style={{
            color: '#a3a3a3',
            // fontWeight: '600'
        }}>Be first to comment</Text>

        <Ionicons name="caret-forward" size={14} color='#a3a3a3' />
    </View>

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
        {/* <View style={{
            marginLeft: 4
        }}> */}
        <Text style={{
            color: '#a3a3a3',
            marginLeft: 4,
            // fontWeight: '600'
        }}>
            commented
        </Text>
        <Ionicons name="caret-forward" size={14} color='#a3a3a3' style={{
            alignSelf: 'center'
        }} />
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
            props.navProps.navigation.navigate('Settings')
            return;
        }
        toggleBookmark(props.post, props.user)
    }

    const renderItem = ({ item }: any) => {
        // console.log('debug props.post.ners', props.post)
        if (item.type == 'post') return <View style={{
            width: constants.width
        }}>
            <VideoPlayer
                // scrolling={props.scrolling}
                id={props.post.id}
                scrolledOn={props.scrolledOn}
                source_url={props.post.source_url}
            />
            <PostHeader
                // scrolling={props.scrolling}
                user={props.user}
                isSinglePost={props.isSinglePost}
                openLink={props.openLink}
                post={props.post}
                imageLoaded={props.imageLoaded}
                mode={props.mode}
                navProps={props.navProps}
            />

            <MemoKeyTakeaways ners={props.post.ners} content={props.post.keytakeaways} />


        </View>

        if (item.type == 'goodvibes') return <View>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                // justifyContent: 'center',
                marginHorizontal: 16,
                paddingBottom: 8,
                marginBottom: 8,
                marginTop: 16,
                // flex: 1,
                // backgroundColor: 'red',
                // alignSelf: 'center',
                borderBottomColor: '#3C3D3F',
                borderBottomWidth: StyleSheet.hairlineWidth,
            }}>

                <Text style={{
                    color: '#a3a3a3',
                    fontFamily: 'Rubik_300Light',
                    fontSize: 18,
                    // alignSelf: 'center'
                    // backgroundColor: '#DAFE21',
                    // color: '#861FFF'
                    // marginRight: 4,
                    // marginLeft: 4 + 24
                }}
                // numberOfLines={1}
                >
                    WHAT DOES THIS EVEN MEAN?
                </Text>

                {/* <MaterialCommunityIcons name="pencil-circle" size={24} color="#FFC542" /> */}
            </View>



            <View style={{
                width: constants.width - 32,
                // backgroundColor: '#303030',
                // borderRadius: 16,
                // flex: 1,
                // borderTopLeftRadius: 16,
                // borderTopRightRadius: 16,
                // borderBottomRightRadius: 16,
                // borderBottomLeftRadius: 4,
                marginHorizontal: 16,
                // padding: 16
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <AnonAvatar author_name={'Packer'} />
                    <Text style={{
                        fontFamily: 'Rubik_500Medium',
                        color: 'white',
                        marginLeft: 8
                    }}>
                        Packer
                    </Text>
                    {/* <Text style={{
                        color: '#A3A3A3',
                    }}> • recently</Text> */}
                </View>
                <Text style={{
                    marginTop: 8,
                    color: 'white'
                }}>( ͡° ͜ʖ ͡°) Well, if you're a fan of classic cars or just appreciate the history of automobiles, this news might make you happy. With GM killing off the Chevy Bolt and Bolt EUV, it's possible that the value of the existing models could go up in the future, making them more sought after by collectors. Plus, GM could use the resources they save from discontinuing these models to focus on developing newer, more innovative electric vehicles.</Text>

                <TouchableOpacity
                    // onPress={select}
                    style={{
                        alignSelf: 'flex-end',
                        flexDirection: 'row',
                        alignItems: 'center',
                        // paddingHorizontal: 8,
                        // paddingVertical: 4,
                        // backgroundColor: 'red'
                    }}
                >
                    <Octicons name="reply" size={12} color="#A3A3A3" />
                    <Text style={{
                        color: "#A3A3A3",
                        marginLeft: 8
                    }}>Reply</Text>
                </TouchableOpacity>

            </View>
        </View>
        return <View style={{
            width: constants.width
        }}>

        </View>
    }

    const [activePostIndex, setActivePostIndex] = useState(0);
    const updateIndex = (event: any) => {
        let offset = event.nativeEvent.contentOffset.x;
        if (offset < constants.width / 2) {
            setActivePostIndex(0)
            return;
        }
        offset -= constants.width / 2;
        setActivePostIndex(Math.floor(offset / constants.width) + 1);
    }

    useEffect(() => {
        console.log('debug activePostIndex', activePostIndex);
    }, [activePostIndex])

    const data = [
        { type: 'post' },
        { type: 'goodvibes' }
    ]

    return <View style={{
        // paddingTop: 8
        backgroundColor: '#151316'
    }}>
        <Animated.FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{
                marginBottom: 8,
            }}
            data={data}
            renderItem={renderItem}
            onScroll={updateIndex}
            alwaysBounceVertical={false}
            alwaysBounceHorizontal={false}
            bounces={false}
        />
        {/* <Text style={{ color: 'white' }}>{props.post.id}@{props.index}</Text> */}


        <View style={{
            marginBottom: 16,
            // marginHorizontal: 16
        }}>

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                marginHorizontal: 16,
                flex: 1,
                // backgroundColor: 'blue'
            }}>
                <TouchableOpacity
                    onPress={_toggleBookmark}
                    style={{
                        marginLeft: -4
                        // backgroundColor: 'blue'
                        // flexDirection: 'row',
                        // alignItems: 'center',
                        // flex: 1
                        // justifyContent: 'center'
                    }}
                >
                    <Ionicons
                        name={bookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={bookmarked ? '#FFC542' : '#5c5c5c'}
                    />
                    {/* <Text style={{
                        color: bookmarked ? '#FFC542' : '#737373',
                        marginLeft: 4
                    }}>{props.user ? (bookmarked ? 'Bookmarked' : 'Bookmark') : 'Sign in to bookmark'}</Text> */}

                </TouchableOpacity>

                <View style={{
                    flexDirection: 'row',
                    marginLeft: 8
                    // flex: 1
                    // marginHorizontal: 16,
                    // backgroundColor: 'red'
                }}
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
                                backgroundColor: activePostIndex == index ? 'white' : '#6E6E6E',
                                marginHorizontal: 4
                            }} />
                        })
                    }
                </View>

                <TouchableOpacity onPress={() => {
                    props.navProps.navigation.push('SinglePost', {
                        singlePost: props.post
                    })
                }} style={{
                    // alignSelf: 'stretch',
                    flex: 1,
                }}>
                    {/* {
                props.comments.length > 0 &&
                <AnonAvatar author_name={props.comments[0].author_name} />
            } */}
                    <View style={{
                        marginRight: 0,
                        marginLeft: 'auto',
                    }}>
                        <AnonAvatarList author_names={
                            Array.from(
                                props.comments.reduce((set: Set<any>, c: any) => set.add(c.author_name), new Set<string>())
                            )
                        } />
                    </View>
                </TouchableOpacity>
            </View>
            {
                // props.scrolledOn ?

                //  : <Animated.View style={{
                //     borderBottomColor: '#3C3D3F',
                //     borderBottomWidth: StyleSheet.hairlineWidth,
                //     marginHorizontal: 16,
                //     height: 2,
                //     // backgroundColor: 'red'
                // }}
                //     entering={FadeIn}
                //     exiting={FadeOut}
                // />
            }
        </View>
    </View>
}


function SmallPost(props: any) {
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

    const openLink = useCallback(async (url: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const result = await WebBrowser.openBrowserAsync(url, {
            presentationStyle: WebBrowserPresentationStyle.FULL_SCREEN,
            controlsColor: '#f5a30c',
            enableBarCollapsing: true,
            createTask: false
        });
        console.log('debug browser result', result);
    }, [])

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
                    setSelectedComment={props.setSelectedComment}
                    toggle={toggle}
                />
    }

    const onScroll = (event: any) => {
        // console.log('B')
        // Hack because onEndReached doesn't work
        const end = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const y = event.nativeEvent.contentOffset.y;
        if (y < end - constants.height * 0.05) return;
        loadComments();
    }

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
                props.numTopLevelComments == 0)
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
            </View> : undefined

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

    return <ListHeader
        // scrolling={props.scrolling}
        comments={comments}
        navProps={props.navProps}
        user={props.user}
        key={props.post.id}
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
    />
}

export default SmallPost;
// const shouldRerenderTheSame = (p: any, c: any) => {
//     return p.mode == c.mode
//         && p.height == c.height
//         && p.shouldActive == c.shouldActive
//         && p.scrolledOn == c.scrolledOn
//         && p.user == c.user
// }
export const MemoSmallPost = memo(SmallPost
    // , shouldRerenderTheSame
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