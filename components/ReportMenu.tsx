import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// somewhere in your app
import {
    Menu, MenuOption, MenuOptions, MenuTrigger
} from 'react-native-popup-menu';

function ReportMenu(props: any) {
    return (
        <Menu>
            <MenuTrigger customStyles={{
                triggerOuterWrapper: props.triggerOuterWrapper,
                triggerTouchable: {
                    activeOpacity: 0.2
                }
            }}>
                <MaterialCommunityIcons name="dots-horizontal" size={16} color='#A3A3A3' />
            </MenuTrigger>
            <MenuOptions
                optionsContainerStyle={{
                    // borderWidth: 10
                    shadowColor: 'black',
                    shadowOpacity: 0.7,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 10,
                    // borderWidth: 1,
                    // borderRadius: 10
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
                <MenuOption onSelect={() => alert(`Report`)} >
                    <MaterialIcons name="report" size={24} color="#B7B9BE" />
                    <Text style={{
                        fontSize: 16,
                        color: '#B7B9BE',
                        fontWeight: '600',
                        marginLeft: 5
                    }}>Report</Text>
                </MenuOption>
            </MenuOptions>
        </Menu>
    );
}


export default ReportMenu;

export const MemoReportMenu = React.memo(ReportMenu);