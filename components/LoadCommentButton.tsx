import * as React from 'react';
import { memo, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';


function LoadCommentButton(props: any) {
    const [visible, setVisible] = useState(true);

    const load = () => {
        setVisible(false);
        props.requestComments(props.ofId);
    }

    return visible
        ? <TouchableOpacity style={
            {
                marginLeft: props.level <= 1 ? 0 : (16 * props.level) + props.level == 0 ? 0 : (props.level == 1 ? 2 : 18),
                backgroundColor: props.mode == 'comment' ? '#2e2e2e' : '#1e1d21',
                marginBottom: 8,
                alignSelf: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 4

            }}
            onPress={load}
        >
            <Text style={styles.text}>
                {props.num} more replies
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