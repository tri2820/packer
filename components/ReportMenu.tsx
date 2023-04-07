import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// somewhere in your app
import {
    Menu, MenuOption, MenuOptions, MenuTrigger
} from 'react-native-popup-menu';
import { supabaseClient } from '../supabaseClient';

function ContentMenu(props: any) {
    const copyToClipboard = () => {
        const text = props.post?.title ?? props.comment?.content;
        if (text && text.length > 0) {
            Clipboard.setStringAsync(text);
            Alert.alert('Copied Text')
            return;
        }

        Alert.alert('Cannot Copy ☹️')
    };

    const report = async (user: any, reason: string) => {
        if (props.post) {
            const { data, error } = await supabaseClient.from('reported_posts').upsert({
                reporter_id: user.id,
                reason: reason,
                post_id: props.post.id
            })
            console.log('debug report', data, error);
            if (error) {
                Alert.alert('Cannot submit report', 'An error happened.')
                return;
            }

            Alert.alert('Report Submitted', 'Thanks for helping make Packer safer.')
            return;
        }
        if (!props.comment) {
            console.log('warn report function called with props.comment, returns early', props.comment);
            return;
        }

        const { data, error } = await supabaseClient.from('reported_comments').upsert({
            reporter_id: user.id,
            reason: reason,
            comment_id: props.comment.id
        })
        console.log('debug report', data, error);
        if (error) {
            Alert.alert('Cannot submit report', 'An error happened.')
            return;
        }

        Alert.alert('Report Submitted', 'Thanks for helping make Packer safer.')
    }

    const block = async (blockee: string, user: any) => {
        const { data, error } = await supabaseClient.from('user_blocks_user').insert({
            blocker: user.id,
            blockee: blockee
        })

        console.log('debug block', data, error);
        if (error) {
            Alert.alert('Cannot block.', 'An error happened.')
            return
        }

        Alert.alert('User blocked successfully', 'You will no longer receive content created by this user.')
    }

    const showReportMenu = async () => {
        const { data, error } = await supabaseClient.auth.getUser();
        if (!data.user || error) {
            Alert.alert('Cannot report', 'Please sign in first.')
            return;
        }

        Alert.alert('Report Content', 'Please select the option that best describes the problem.', [
            {
                text: 'Spam',
                onPress: () => report(data.user, 'spam'),
            },
            {
                text: 'Abuse or harassment',
                onPress: () => report(data.user, 'abuse_or_harassment'),
            },
            {
                text: 'Harmful misinformation',
                onPress: () => report(data.user, 'misinformation'),
            },
            {
                text: 'Something else',
                onPress: () => report(data.user, 'else'),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ])
    }



    const showBlockMenu = async () => {
        const { data, error } = await supabaseClient.auth.getUser();
        if (data.user == null || error) {
            Alert.alert('Cannot block', 'Please sign in first.')
            return;
        }
        console.log('debug props', props)
        const author_id = props.comment?.author_id ?? props.post?.author_id;

        if (!author_id) {
            Alert.alert('Cannot block', 'Author is not a Packer user. Please consider reporting the content instead.')
            return
        }

        if (author_id == 'self'
            || author_id == data.user.id
        ) {
            Alert.alert('Cannot block', 'You cannot block yourself 🙂')
            return
        }


        Alert.alert('Confirm blocking user', 'You will no longer receive content created by this user.', [
            {
                text: 'Block',
                onPress: () => block(author_id, data.user),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ])
    }



    return (
        <Menu ref={props.menuref}>
            <MenuTrigger customStyles={{
                triggerOuterWrapper: props.triggerOuterWrapper,
                triggerTouchable: {
                    activeOpacity: 0.2
                }
            }}>
                {/* <MaterialCommunityIcons name="dots-horizontal" size={16} color='#A3A3A3' /> */}
                {/* <Ionicons name="ellipsis-horizontal" size={14} color="#A3A3A3" /> */}
            </MenuTrigger>
            <MenuOptions
                optionsContainerStyle={{
                    shadowColor: 'black',
                    shadowOpacity: 0.7,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 10,
                }}
                customStyles={{
                    optionsWrapper: {

                    },
                    optionsContainer: {
                        borderRadius: 12,
                        backgroundColor: '#323233',
                    },
                    optionWrapper: {
                        marginVertical: 6,
                        marginHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center'
                    },
                    optionText: {

                    }
                }}>
                <MenuOption onSelect={copyToClipboard} >
                    <Ionicons name="copy" size={24} color="#B7B9BE" />
                    <Text style={{
                        fontSize: 16,
                        color: '#B7B9BE',
                        fontWeight: '600',
                        marginLeft: 8
                    }}>Copy Text</Text>
                </MenuOption>
                <MenuOption onSelect={showReportMenu} >
                    <Ionicons name="flag" size={24} color="#B7B9BE" />
                    <Text style={{
                        fontSize: 16,
                        color: '#B7B9BE',
                        fontWeight: '600',
                        marginLeft: 8
                    }}>Report</Text>
                </MenuOption>
                <MenuOption onSelect={showBlockMenu} >
                    <Ionicons name="md-eye-off" size={24} color="#B7B9BE" />
                    {/* <Ionicons name="flag" size={24} color="#B7B9BE" /> */}
                    <Text style={{
                        fontSize: 16,
                        color: '#B7B9BE',
                        fontWeight: '600',
                        marginLeft: 8
                    }}>Block User</Text>
                </MenuOption>
            </MenuOptions>
        </Menu >
    );
}


export default ContentMenu;

export const MemoContentMenu = React.memo(ContentMenu);