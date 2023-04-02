import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';


function UserList(props: any) {
    const signOutAndUpdateProfile = async () => {
        const signedOut = await signOut();
        if (!signedOut) return;
        props.setUser(null);
    }

    const userStyles = useAnimatedStyle(() => {
        return {
            display: props.offset.value == 0 ? 'none' : 'flex',
            opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
        };
    });

    const createDeleteConfirmationAlert = () =>
        Alert.alert(
            'Confirm account deletion',
            'Are you sure you want to delete your account? Your data will be permanently deleted, but you can restore your account within 14 days by signing back in.', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Delete Account',
                onPress: async () => {
                    const { error } = await supabaseClient.from('deletions').upsert({
                        user_id: props.user.id
                    })
                    signOutAndUpdateProfile()
                },
                style: 'destructive'
            },
        ]);

    const openSettings = () => {
        props.setMode('settings')
    }

    const setModeNormal = () => {
        props.setMode('normal')
    }

    return (

        <Animated.View style={[{
            marginHorizontal: 20,
            height: props.listHeight,
            // backgroundColor: 'blue'
        }, userStyles]}
            exiting={FadeOut}
        >
            {props.mode == 'normal' ?
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                >
                    <View>
                        <View style={styles.header}>
                            <Text style={styles.heading}>
                                {
                                    props.user.user_metadata.full_name
                                }
                            </Text>

                            <TouchableOpacity onPress={openSettings} style={styles.icon} >
                                <Ionicons name="settings-sharp" size={28} color='#C2C2C2' />
                            </TouchableOpacity>
                        </View>

                        {/* <Text style={styles.username}>
                            {
                                // props.user.user_metadata.email
                                '@default'
                            }
                        </Text> */}

                        <Text style={styles.introduction}>
                            Just joined Packer to connect with interesting people from all over the world. Looking forward to discovering new perspectives and making new friends!
                        </Text>

                        <Text style={styles.h1}>
                            My Discussions
                        </Text>
                    </View>
                    <FlatList
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        listKey='userList'
                        style={styles.discussions}
                        data={[0, 1, 2, 3, 4]}
                        // keyExtractor={keyExtractor}
                        renderItem={() =>
                            <View style={styles.discussion}>

                            </View>
                        }
                    />
                </Animated.View> :
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                >
                    <View>
                        <View style={styles.header}>
                            <Text style={styles.heading}>
                                Settings
                            </Text>

                            <TouchableOpacity onPress={setModeNormal} style={styles.icon} >
                                <Ionicons name="close" size={28} color='#C2C2C2' />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={signOutAndUpdateProfile} style={styles.button} >
                                {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                                <Text style={styles.button_text}>Sign Out</Text>
                            </TouchableOpacity>

                            <View
                                style={styles.hair}
                            />

                            <TouchableOpacity
                                onPress={createDeleteConfirmationAlert}
                                style={styles.button} >
                                {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                                <Text style={styles.deletion_text}>Request account deletion</Text>
                            </TouchableOpacity>

                            <Text style={styles.deletion_info}>
                                Please note that it may take up to 14 days for us to process your request. During this time, your account will remain active. If you change your mind, you can cancel the request by signing in to your account. Thank you for your understanding.
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            }
        </Animated.View>

    );
}

export default UserList;
const styles = StyleSheet.create({
    username: {
        color: '#C2C2C2',
        fontWeight: '300',
    },
    introduction: {
        color: '#F1F1F1',
        // backgroundColor: 'red'
    }, h1: {
        marginTop: 40,
        marginBottom: 4,
        color: '#F1F1F1',
        fontSize: 24,
        fontWeight: '800'
    },
    discussions: {
        marginTop: 8,
    },
    discussion: {
        height: 60,
        width: '100%',
        // backgroundColor: 'blue',
        borderRadius: 8,
        marginVertical: 8,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#5D5F64'
    },
    heading: {
        color: '#F1F1F1',
        fontSize: 24,
        fontWeight: '800',
        flexGrow: 1
    },
    icon: {
        height: 60,
        width: 60,
        alignItems: 'flex-end',
        justifyContent: 'center',
        // backgroundColor: 'red'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    button: {
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#2B2D31',
        alignItems: 'center'
    },
    button_text: {
        color: '#ed4339',
        fontSize: 18
    },
    hair: {
        marginVertical: 20,
        borderBottomColor: '#3C3D3F',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    deletion_info: {
        color: '#929196',
        marginTop: 20,
        textAlign: 'center'
    },
    buttons: {
        marginTop: 16
    },
    deletion_text: {
        color: '#ed4339',
        fontSize: 18
    }
})