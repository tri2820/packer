import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';
import MoreDiscussionsButton from './MoreDiscussionsButton';
import PostHeader from './PostHeader';

function CommentSection(props: any) {
    return <>
        {
            props.comments.map((c: any) => <Comment key={c.id}
                comment={c}
                level={0}
                setMode={props.setMode}
            />)
        }
    </>
}

export default CommentSection;