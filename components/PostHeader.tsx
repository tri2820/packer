import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, getSourceName, hookListener, isVideoPost, normalizedHostname, sharedAsyncState, toggleBookmark, unhookListener } from '../utils';
import { MemoContentMenu } from './ReportMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

function PostHeader(props: any) {

    const insets = useSafeAreaInsets();
    const longPressed = useSharedValue(false);

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
            props.navProps.navigation.navigate('TheTab', { screen: 'Profile' })
            return;
        }
        toggleBookmark(props.post, props.user)
    }


    const longPressedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: longPressed.value ? withTiming('rgba(0,0,0,0.5)', { duration: 100 }) : withTiming('rgba(0,0,0,0)', { duration: 200 })
        };
    });


    const menuref = useRef<any>(null)
    const openMenu = () => {
        longPressed.value = true;
        menuref.current?.open();
    }

    const onMenuClose = React.useCallback(() => {
        longPressed.value = false;
    }, [])

    // console.log('debug re render this with', bookmarked, sharedAsyncState[`BookmarkChangelisteners/${props.post.id}`])

    return <View>
        <Animated.View style={longPressedStyle}>
            <Pressable
                // style={styles.touch}
                onPress={() => {
                    props.openLink(props.post.source_url)
                }}
                onLongPress={openMenu}
            >

                <View style={{
                    paddingTop: 8,
                    marginHorizontal: 16
                    // paddingBottom: 4
                }}>

                    <View style={styles.contentmenu}>
                        <MemoContentMenu
                            menuref={menuref}
                            post={props.post}
                            triggerOuterWrapper={styles.triggerOuterWrapper}
                            onClose={onMenuClose}
                            noUser
                        />
                    </View>

                    <Text style={styles.title}>
                        {
                            isVideoPost(props.post.source_url)
                                ? props.post.title.replace(/#[^\s]+/g, '')
                                : props.post.title
                        }
                    </Text>

                    <View style={{
                        marginTop: 4
                    }}>
                        {/* <Ionicons name='link' color='#A3A3A3' size={12} style={{
                            marginTop: 2,
                            // backgroundColor: 'blue'
                        }} /> */}
                        <Text style={{
                            color: '#a3a3a3',
                            // marginLeft: 4,
                            fontWeight: '300',
                            // backgroundColor: 'blue',
                            // borderRadius: 4,
                            // paddingVertical: 4,
                            // paddingHorizontal: 8,
                        }}>
                            {
                                isVideoPost(props.post.source_url) ?
                                    props.post.author_name
                                    :
                                    getSourceName(props.post.source_url, true)
                            }
                            <Text style={styles.created_at}> • {
                                moment.utc(props.post.created_at).local().startOf('seconds').fromNow().replace(' days ago', 'd')
                            }</Text>
                        </Text>
                    </View>


                    {
                        props.isSinglePost && <View>
                            <View style={{
                                borderBottomColor: '#3C3D3F',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                // marginHorizontal: 16,
                                marginVertical: 8
                            }} />

                            <TouchableOpacity
                                onPress={_toggleBookmark}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    // justifyContent: 'center'
                                    marginLeft: -2
                                }}
                            >
                                <Ionicons
                                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                                    size={18}
                                    color={bookmarked ? '#FFC542' : '#5c5c5c'}
                                />
                                <Text style={{
                                    color: bookmarked ? '#FFC542' : '#737373',
                                    marginLeft: 4
                                }}>{props.user ? (bookmarked ? 'Bookmarked' : 'Bookmark') : 'Sign in to bookmark'}</Text>

                            </TouchableOpacity>

                            <View style={{
                                borderBottomColor: '#3C3D3F',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                // marginHorizontal: 16
                                marginTop: 8
                            }} />
                        </View>
                    }
                </View>

            </Pressable >

        </Animated.View>

        {/* <View style={{
            borderBottomColor: '#3C3D3F',
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginHorizontal: 16
        }} /> */}

        {/* <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 16
        }}>
            <Text style={{
                color: '#a3a3a3'
            }}>
                {getSourceName(props.post.source_url, true)}
            </Text> */}



        {/* </View> */}
    </View >;
}

export default PostHeader;
const styles = StyleSheet.create({
    touch: {
        // paddingTop: 8,
        // marginBottom: 0,
        marginHorizontal: 16
    },
    source: {
        color: '#A3A3A3',
        fontSize: 10,
        // marginTop: 2,
        // marginBottom: 2,
        // marginLeft: 4
        // backgroundColor: 'red'
    },
    textheader: {
        // marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center'
    },
    title: {
        color: 'white',
        // fontWeight: 'bold',
        fontSize: 18,
        // marginBottom: 4,
        fontFamily: 'Rubik_500Medium'
    },
    triggerOuterWrapper: {
        // backgroundColor: 'red',
        paddingLeft: 8
    },
    contentmenu: {
        marginLeft: 'auto',
        marginRight: 0,
        // backgroundColor: 'blue',
        // width: 20,
        // height: 20
    },
    created_at: {
        color: '#A3A3A3',
        fontWeight: '300'
    },
    author_name: {
        color: '#A3A3A3',
        fontFamily: 'Rubik_500Medium'
    },
    text_header_2: {
        marginBottom: 4,
        flexDirection: 'row',
        // backgroundColor: 'blue',
        alignItems: 'center'
    }
})

const gradient = ['transparent', 'rgba(0, 0, 0, 0.9)']