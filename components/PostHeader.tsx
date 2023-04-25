import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, getSourceName, hookListeners, normalizedHostname, sharedAsyncState, toggleBookmark } from '../utils';
import { MemoContentMenu } from './ReportMenu';

function PostHeader(props: any) {
    const longPressed = useSharedValue(false);
    const [bookmarked, setBookmarked] = useState(sharedAsyncState.bookmarks[props.post.id] ? true : false);
    hookListeners(`BookmarkChangelisteners/${props.post.id}`, () => {
        console.log('update!');
        setBookmarked(sharedAsyncState.bookmarks[props.post.id] ? true : false)
    })

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

    const _toggleBookmark = () => {
        toggleBookmark(props.post)
    }

    console.log('debug re render this with', bookmarked)
    return <View>
        <Animated.View style={longPressedStyle}>
            <TouchableOpacity
                style={styles.touch}
                onPress={() => {
                    props.openLink(props.post.source_url)
                }}
                onLongPress={openMenu}
            >

                {props.imageLoaded && <Animated.Image
                    style={styles.image}
                    source={{
                        uri: props.post.image
                    }}
                    entering={FadeIn}
                />
                }


                <View style={{
                    paddingTop: 8,
                    paddingBottom: 4
                }}>
                    <View style={styles.textheader}>
                        {/* <Ionicons name='link' color='#A3A3A3' size={12} /> */}
                        <Text style={styles.source}>
                            {
                                getSourceName(props.post.source_url)
                            }
                        </Text>
                        {/* <Text style={styles.created_at}> • {
                                moment.utc(props.post.created_at).local().startOf('seconds').fromNow()
                            }</Text> */}


                        <View style={styles.contentmenu}>
                            <MemoContentMenu
                                menuref={menuref}
                                post={props.post}
                                triggerOuterWrapper={styles.triggerOuterWrapper}
                                onClose={onMenuClose}
                                noUser
                            />
                        </View>

                    </View>
                    <Text style={styles.title}>
                        {props.post.title}
                    </Text>
                </View>

            </TouchableOpacity >

        </Animated.View>

        <View style={{
            borderBottomColor: '#3C3D3F',
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginHorizontal: 16
        }} />

        <TouchableOpacity
            onPress={_toggleBookmark}
            style={{
                marginLeft: 0,
                marginRight: 'auto',
                // borderWidth: StyleSheet.hairlineWidth,
                // borderColor: 'white',
                // backgroundColor: '#323233',
                paddingVertical: 8,
                paddingHorizontal: 16,
                // paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                // borderRadius: 16,
                // marginTop: 2
            }}
        >
            {bookmarked ?
                <Ionicons
                    name="bookmark"
                    size={14}
                    color='#FFC542'
                />
                : <Ionicons
                    name="bookmark-outline"
                    size={14}
                    color='#a3a3a3'
                />
            }

            <Text style={{
                marginLeft: 4,
                color: bookmarked ? '#FFC542' : '#a3a3a3',
                fontSize: 14
            }}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</Text>
        </TouchableOpacity>
    </View >
        ;
}

export default PostHeader;
const styles = StyleSheet.create({
    image: {
        width: constants.width - 32,
        height: constants.width / 4 * 1.8,
        // paddingTop: 8,
        borderRadius: 8
    },
    touch: {
        paddingTop: 8,
        // marginBottom: 0,
        marginHorizontal: 16
    },
    source: {
        color: '#A3A3A3',
        fontSize: 10,
        marginTop: 2,
        marginBottom: 2,
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
        marginBottom: 4,
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
        color: '#A3A3A3'
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