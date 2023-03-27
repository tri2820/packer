import * as React from 'react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants, sharedAsyncState } from '../utils';
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

function LoadCommentButton(props: any) {
    const { requestComments } = useContext(MainContext);

    return <TouchableOpacity style={{
        backgroundColor: '#2C2C2C',
        marginBottom: 8,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: props.level <= 1 ? 0 : (16 * props.level) + props.level == 0 ? 0 : (props.level == 1 ? 2 : 18),
        borderRadius: 4
    }}
        onPress={async () => {
            await requestComments(props.post_id, props.ofId);
        }}
    >
        <Text style={{
            color: '#e6e6e6',
            fontWeight: '500'
        }}>
            Load {props.num} more
        </Text>
    </TouchableOpacity>
}

export default LoadCommentButton;
export const MemoLoadCommentButton = memo(LoadCommentButton);