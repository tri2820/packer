import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function MoreDiscussionsButton(props: any) {
    return (
        <TouchableOpacity onPress={props.onPress} style={styles.view}>
            {/* <FontAwesome5 name='expand' color='angle-double-down' size={16} /> */}

            {/* <MaterialCommunityIcons name='chevron-double-down' size={16} /> */}
            <Text style={styles.text}>See all chats</Text>
            {/* <FontAwesome5 name="angle-double-right" size={14} color="black" /> */}
            <Ionicons name="chevron-forward"
                size={20}
                color='black'
                style={{
                    // backgroundColor: 'red',
                }}
            />
        </TouchableOpacity>
    );
}

export default MoreDiscussionsButton;
export const MemoMoreDiscussionsButton = memo(MoreDiscussionsButton);

const styles = StyleSheet.create({
    view: {
        backgroundColor: '#F1F1F1',
        paddingVertical: 12,
        paddingHorizontal: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        // borderColor: '#2A2829',
        // overflow: 'hidden',
        borderRadius: 24,
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: 'black',
        fontWeight: '700',
        marginLeft: 4
    }
});