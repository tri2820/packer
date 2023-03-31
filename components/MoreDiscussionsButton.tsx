import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as React from 'react';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

function MoreDiscussionsButton(props: any) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <Animated.View style={styles.view} entering={FadeInDown}>
                <FontAwesome5 name='expand' color='#E6E6E6' size={16} />
                <Text style={styles.text}> Expand </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default MoreDiscussionsButton;
export const MemoMoreDiscussionsButton = memo(MoreDiscussionsButton);

const styles = StyleSheet.create({
    view: {
        backgroundColor: '#151316',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 24,
        borderColor: '#2A2829',
        overflow: 'hidden',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: '#E6E6E6',
        fontWeight: '500',
        marginLeft: 8
    }
});