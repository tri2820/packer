import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';

// somewhere in your app
import {
    Menu, MenuOption, MenuOptions, MenuTrigger
} from 'react-native-popup-menu';

function ReportMenu(props: any) {

    const report = (reason: string) => {
        showThanksReporting()
    }

    const showThanksReporting = () => {
        Alert.alert('Report Submitted', 'Thanks for helping make Packer safer.')
    }

    const showBlocked = () => {
        Alert.alert('User is blocked')
    }

    const showReportMenu = () =>
        Alert.alert('Report Content', 'Please select the option that best describes the problem.', [
            {
                text: 'Spam',
                onPress: () => report('spam'),
            },
            {
                text: 'Abuse or harassment',
                onPress: () => report('abuse_or_harassment'),
            },
            {
                text: 'Harmful misinformation',
                onPress: () => report('misinformation'),
            },
            {
                text: 'Something else',
                onPress: () => report('else'),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ])


    const showBlockMenu = () =>
        Alert.alert('Confirm blocking user', 'You will no longer receive content posted by this user.', [
            {
                text: 'Block',
                onPress: showBlocked,
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ])


    return (
        <Menu>
            <MenuTrigger customStyles={{
                triggerOuterWrapper: props.triggerOuterWrapper,
                triggerTouchable: {
                    activeOpacity: 0.2
                }
            }}>
                {/* <MaterialCommunityIcons name="dots-horizontal" size={16} color='#A3A3A3' /> */}
                <Ionicons name="ellipsis-horizontal" size={14} color="#A3A3A3" />
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
                    }}>Block user</Text>
                </MenuOption>
            </MenuOptions>
        </Menu >
    );
}


export default ReportMenu;

export const MemoReportMenu = React.memo(ReportMenu);