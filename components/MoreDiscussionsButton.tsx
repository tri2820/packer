import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, Gesture, GestureDetector, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { IconArrowAutofitHeight } from 'tabler-icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Comment from './Comment';
import * as Haptics from 'expo-haptics';

function Post(props: any) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <Animated.View style={{
                backgroundColor: '#151316',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 24,
                borderColor: '#2A2829',
                overflow: 'hidden',
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center'
            }}
                entering={FadeInDown}
            >
                <IconArrowAutofitHeight color='#E6E6E6' size={16} />
                <Text style={{
                    color: '#E6E6E6',
                    fontWeight: '500',
                    marginLeft: 4
                }}>
                    See discussions
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default Post;