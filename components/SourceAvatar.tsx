import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

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