import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';
import { constants, getSourceName, randomColor, randomNickName, sharedAsyncState } from '../utils';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as Application from 'expo-application';
import { FlatList } from 'react-native-gesture-handler';
import AnonAvatar from './AnonAvatar';

export default function SourceAvatar(props: any) {
    return <Animated.Image
        style={{
            width: 24,
            height: 24,
            borderRadius: 1,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '#3C3D3F'
        }}
        source={{
            uri: props.uri
        }}
        entering={FadeIn}
    />
}