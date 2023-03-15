import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, StyleSheet, Pressable, SafeAreaView, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../utils';
import { IconSearch } from 'tabler-icons-react-native';
import Animated, { Easing, useAnimatedKeyboard, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { TextInput } from 'react-native-gesture-handler';


function SearchIcon(props: any) {
    const insets = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();

    return (
        <View style={{
            position: 'absolute',
            // top: insets.top,
            right: 16,
            bottom: insets.bottom + 16,
            // backgroundColor: '#151316',
            // borderWidth: StyleSheet.hairlineWidth,
            // borderColor: '#2A2829',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 18,
            // shadowColor: "#000",
            // shadowOffset: {
            //     width: 0,
            //     height: 5,
            // },
            // shadowOpacity: 0.34,
            // shadowRadius: 6.27,

            elevation: 10,
        }}>
            <IconSearch size={24} color='#C2C2C2' stroke={1.6} />
        </View>
    );
}

export default SearchIcon;