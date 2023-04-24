import * as React from 'react';
import { memo, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';


function LoadCommentButton(props: any) {
    const [visible, setVisible] = useState(true);

    const load = async () => {
        console.log('debug load false');
        setVisible(false);
        await props.requestComments(props.ofId);
        setVisible(true);
    }

    return visible
        ? <TouchableOpacity style={
            {
                marginLeft: props.level == 16 ? 0 : 36 + (20 * (props.level - 1)),
                // backgroundColor: props.mode == 'comment' ? '#2e2e2e' : '#1e1d21',
                marginBottom: 8,
                flex: 1,
                marginRight: 'auto',
                // alignSelf: 'center',
                paddingVertical: 8,
                paddingRight: 16,
                borderRadius: 4

            }}
            onPress={load}
        >
            <Text style={styles.text}>
                {props.num} replies
                {/* {props.ofId} */}
            </Text>
        </TouchableOpacity>
        :
        <ActivityIndicator
            style={styles.loading_indicator}
            size="small"
        />
}

export default LoadCommentButton;
export const MemoLoadCommentButton = memo(LoadCommentButton);

const styles = StyleSheet.create({
    text: {
        color: '#7E8084',
        fontWeight: '400'
    },
    loading_indicator: {
        marginBottom: 5,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16
    }
})