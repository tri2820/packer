import * as React from 'react';
import { memo, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';


function LoadCommentButton(props: any) {
    const [visible, setVisible] = useState(true);

    const load = () => {
        setVisible(false);
        props.requestComments(props.post_id, props.ofId);
    }

    return visible
        ? <TouchableOpacity style={
            [
                {
                    marginLeft: props.level <= 1 ? 0 : (16 * props.level) + props.level == 0 ? 0 : (props.level == 1 ? 2 : 18),
                },
                styles.button
            ]}
            onPress={load}
        >
            <Text style={styles.text}>
                Load {props.num} more
            </Text>
        </TouchableOpacity>
        :
        <ActivityIndicator
            style={styles.loading_indicator}
            size="small"
            color="#6b5920" />
}

export default LoadCommentButton;
export const MemoLoadCommentButton = memo(LoadCommentButton);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2C2C2C',
        marginBottom: 8,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4
    },
    text: {
        color: '#e6e6e6',
        fontWeight: '500'
    },
    loading_indicator: {
        marginBottom: 8,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16
    }
})