import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';


function NoComment(props: any) {
    return <View style={styles.nocomment}
    >
        <Ionicons
            name="chatbubble"
            size={16}
            color='#A3A3A3'
            style={styles.bubble} />
        <Text style={styles.text}
        >
            Let's spark the conversation! Be the first to share your thoughts and bring some high energy to this post!
        </Text>
    </View>
}

export default NoComment;
export const MemoNoComment = memo(NoComment);
const styles = StyleSheet.create({
    nocomment: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingHorizontal: 16
    },
    bubble: {
        marginRight: 4
    },
    text: {
        color: '#A3A3A3',
        marginLeft: 4,
        marginRight: 16 + 4
    }
});