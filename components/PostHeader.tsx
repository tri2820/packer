import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import * as React from 'react';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { constants, normalizedHostname } from '../utils';
import { MemoContentMenu } from './ReportMenu';
import * as Sentry from 'sentry-expo';


function PostHeader(props: any) {
    const longPressed = useSharedValue(false);

    const longPressedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: longPressed.value ? withTiming('rgba(0,0,0,0.5)', { duration: 100 }) : withTiming('rgba(0,0,0,0)', { duration: 200 })
        };
    });

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname).toUpperCase();
    }
    const menuref = useRef<any>(null)
    const openMenu = () => {
        longPressed.value = true;
        menuref.current?.open();
    }

    const onMenuClose = React.useCallback(() => {
        longPressed.value = false;
    }, [])

    return (
        <Animated.View style={longPressedStyle}>
            <TouchableOpacity
                style={styles.touch}
                onPress={() => {
                    props.setApp({ url: props.post.source_url })
                    // Sentry.Native.nativeCrash()
                }}
                onLongPress={openMenu}
            >

                <View style={{
                    // width: constants.width - 32,
                    // height: constants.width / 4 * 2,
                    // marginBottom: 16,
                    // borderRadius: 8
                    // backgroundColor: 'red'
                }}>
                    {props.imageLoaded && <Animated.Image
                        style={styles.image}
                        source={{
                            uri: props.post.image
                        }}
                        entering={FadeIn}
                    />
                    }

                    <View style={{
                        paddingVertical: 8
                    }}>
                        <Text style={styles.title}>
                            {props.post.title}
                        </Text>

                        <View style={styles.textheader}>
                            <Ionicons name='link' color='#A3A3A3' size={14} />
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

                    </View>
                </View>
            </TouchableOpacity >
        </Animated.View>
    );
}

export default PostHeader;
const styles = StyleSheet.create({
    image: {
        width: constants.width - 32,
        height: constants.width / 4 * 1.8,
        // marginBottom: 16,
        borderRadius: 8
    },
    touch: {
        // marginBottom: 0,
        marginHorizontal: 16
    },
    source: {
        color: '#A3A3A3',
        fontSize: 12,
        marginLeft: 4
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