import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, MainContext, normalizedHostname } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';
import MoreDiscussionsButton from './MoreDiscussionsButton';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';

function PostHeader(props: any) {
    const { setMode } = useContext(MainContext);

    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname).toUpperCase();
    }

    return (<View style={{
        marginBottom: 8
    }}>
        <TouchableOpacity
            onPress={() => {
                setMode({
                    tag: 'App',
                    value: props.post.source_url,
                    insetsColor: 'rgba(0, 0, 0, 0)'
                })
            }}
        >
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
                color: '#E6E6E6',
                fontWeight: 'bold',
                fontSize: 18,
                marginBottom: 8
            },
                // animatedStyles
            ]}>
                {props.post.title}
            </Text>
        </TouchableOpacity>

        <Text style={{
            color: '#A3A3A3',
            marginBottom: 4
        }}>
            <Text style={{
                fontWeight: 'bold',
            }}>{props.post.author_name}</Text> • {
                moment.utc(props.post.created_at).local().startOf('seconds').fromNow()
            }
        </Text>

    </View>);
}

export default PostHeader;