import * as React from 'react';
import { memo } from 'react';
import { Text, TouchableOpacity } from 'react-native';

function LoadCommentButton(props: any) {
    return <TouchableOpacity style={{
        backgroundColor: '#2C2C2C',
        marginBottom: 8,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: props.level <= 1 ? 0 : (16 * props.level) + props.level == 0 ? 0 : (props.level == 1 ? 2 : 18),
        borderRadius: 4
    }}
        onPress={async () => {
            await props.requestComments(props.post_id, props.ofId);
        }}
    >
        <Text style={{
            color: '#e6e6e6',
            fontWeight: '500'
        }}>
            Load {props.num} more
        </Text>
    </TouchableOpacity>
}

export default LoadCommentButton;
export const MemoLoadCommentButton = memo(LoadCommentButton);