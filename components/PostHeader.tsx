import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import * as React from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, Image, View } from 'react-native';
import { constants, normalizedHostname } from '../utils';
import { MemoContentMenu } from './ReportMenu';

function PostHeader(props: any) {
    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname).toUpperCase();
    }
    const menuref = useRef<any>(null)
    const openMenu = () => {
        menuref.current.open();
    }



    return (<View style={{
        marginBottom: 8
    }}>
        <TouchableOpacity
            onPress={() => {
                props.setMode({
                    tag: 'App',
                    value: props.post.source_url,
                    // insetsColor: 'rgba(0, 0, 0, 0)'
                })
            }}
            onLongPress={openMenu}
        >
            {
                props.imageLoaded && <Animated.Image
                    style={{
                        width: constants.width - 32,
                        height: constants.width / 4 * 2,
                        marginHorizontal: 16,
                        marginBottom: 16,
                        borderRadius: 8
                    }}
                    source={{
                        uri: props.post.image
                    }}
                    entering={FadeIn}
                />
            }

            <View style={{
                paddingHorizontal: 16
            }}>
                <View style={{
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    // justifyContent: 'center'
                }}>
                    <Ionicons name='link' color='#A3A3A3' size={14} />
                    <Text style={{
                        color: '#A3A3A3',
                        fontSize: 12,
                        marginLeft: 4
                        // backgroundColor: 'red'
                    }}>
                        {
                            getSourceName(props.post.source_url)
                        }
                    </Text>
                </View>
                <Text style={[{
                    color: 'white',
                    // fontWeight: 'bold',
                    fontSize: 18,
                    marginBottom: 8,
                    fontFamily: 'Rubik_500Medium'
                },
                    // animatedStyles
                ]}>
                    {props.post.title}
                </Text>
            </View>
        </TouchableOpacity>

        <View style={{
            paddingHorizontal: 16,
            marginBottom: 4,
            flexDirection: 'row',
            // backgroundColor: 'blue',
            alignItems: 'center'
        }}>
            <Text style={{
                color: '#A3A3A3',
                fontFamily: 'Rubik_500Medium'
            }}>{props.post.author_name}</Text>

            <Text style={{
                color: '#A3A3A3'
            }}> • {
                    moment.utc(props.post.created_at).local().startOf('seconds').fromNow()
                }</Text>

            <View style={{
                marginLeft: 'auto',
                marginRight: 0,
            }}>
                <MemoContentMenu
                    menuref={menuref}
                    post={props.post}
                    triggerOuterWrapper={{
                        // backgroundColor: 'red',
                        paddingLeft: 8
                    }} />
            </View>
        </View>

    </View>);
}

export default PostHeader;