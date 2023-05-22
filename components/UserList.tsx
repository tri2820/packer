import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Animated, Pressable, Platform } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';
import { getSourceName, randomNickName, sharedAsyncState } from '../utils';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as Application from 'expo-application';
import { FlatList } from 'react-native-gesture-handler';


function UserList(props: any) {
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    console.log('debug UserList isFocused', isFocused);
    const bookmarked_posts = Object.values(sharedAsyncState.bookmarks).filter(x => x).sort((a: any, b: any) => (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime());
    bookmarked_posts.length = Math.max(bookmarked_posts.length, 15);
    const data = bookmarked_posts;
    // console.log('debug data', data)

    const signOutAndUpdateProfile = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        const signedOut = await signOut();
        if (!signedOut) return;
        props.setUser(null);
        props.setMode('normal');
    }

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

    // console.log('debug userlist')
    return (
        <View style={{
            marginHorizontal: 20,
            flex: 1,
            // backgroundColor: 'yellow'
        }}
        >
            <View style={{
                flexDirection: 'row',
                marginTop: 8,
                marginBottom: 16
            }}>
                <TouchableOpacity style={{
                    backgroundColor: props.mode == 'normal' ? '#f1f1f1' : '#323233',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    marginRight: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                    onPress={() => {
                        props.setMode('normal')
                    }}
                >
                    <Ionicons name="person" size={20} color={
                        props.mode == 'normal' ? 'black' : '#f1f1f1'
                    } />
                    <Text style={{
                        marginLeft: 6,
                        color: props.mode == 'normal' ? 'black' : '#f1f1f1',
                        fontWeight: 'bold'
                    }}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{
                    backgroundColor: props.mode == 'settings' ? '#f1f1f1' : '#323233',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    marginRight: 4,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                    onPress={() => {
                        props.setMode('settings')
                    }}
                >
                    <Ionicons name="settings-sharp" size={20} color={
                        props.mode == 'settings' ? 'black' : '#f1f1f1'
                    } />
                    <Text style={{
                        marginLeft: 6,
                        color: props.mode == 'settings' ? 'black' : '#f1f1f1',
                        fontWeight: 'bold'
                    }}>Settings</Text>
                </TouchableOpacity>
            </View>


            <View
                style={{
                    marginBottom: 20,
                    borderBottomColor: '#3C3D3F',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                }}
            />

            {
                props.mode == 'normal'
                    ? <View
                        // entering={FadeIn}
                        // exiting={FadeOut.duration(200)}
                        style={{
                            // backgroundColor: 'blue',
                            flex: 1
                        }}
                    >
                        <Text style={{
                            fontFamily: 'Rubik_800ExtraBold',
                            fontSize: 28,
                            color: '#FFF200'
                        }}>{props.user.user_metadata.full_name}
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Ionicons name="bookmark" size={14} color='#F1F1F1' />
                            <Text style={{
                                marginLeft: 4,
                                // fontWeight: '500',
                                fontSize: 16,
                                color: '#F1F1F1',
                                fontFamily: 'Rubik_600SemiBold'
                            }}>{
                                    'Bookmarks'
                                    // randomNickName()
                                }</Text>
                        </View>

                        <FlatList
                            overScrollMode={'always'}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            // listKey='userList'
                            style={{
                                marginTop: 8,
                                // marginBottom: insets.bottom,
                                // backgroundColor: 'red'
                                // overflow: 'hidden'
                            }}
                            data={data}
                            // keyExtractor={keyExtractor}
                            renderItem={({ item }: any) =>
                                <TouchableOpacity onPress={item ? () => {
                                    props.navProps.navigation.push('SinglePost', {
                                        singlePost: item
                                    })
                                } : undefined}
                                    style={{
                                        marginVertical: 4
                                    }}
                                >
                                    {
                                        item ?
                                            <View style={{
                                                height: 60,
                                                width: '100%',
                                                // backgroundColor: '#323233',
                                                borderRadius: 8,
                                                // marginVertical: 8,
                                                // borderStyle: 'dashed',
                                                // borderWidth: 2,
                                                borderColor: '#5D5F64',
                                                flexDirection: 'row',
                                                // paddingHorizontal: 8,
                                            }}>
                                                <Image
                                                    style={{
                                                        alignSelf: 'center',
                                                        width: 50,
                                                        height: 50,
                                                        // borderRadius: 2
                                                    }}
                                                    source={{
                                                        uri: item.image
                                                    }}
                                                    placeholder={require('../assets/empty.jpg')}
                                                    placeholderContentFit='cover'
                                                />
                                                <View style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    // backgroundColor: 'red'
                                                }}>
                                                    <View style={{
                                                        marginLeft: 12,
                                                        flex: 1
                                                    }}>
                                                        <Text style={{
                                                            color: '#f1f1f1',
                                                            fontSize: 15,
                                                            fontFamily: 'Rubik_500Medium'
                                                        }}
                                                            numberOfLines={1}
                                                        >
                                                            {item.title}
                                                        </Text>
                                                        <Text style={{
                                                            color: '#A3A3A3',
                                                            fontSize: 12
                                                        }}
                                                            numberOfLines={1}
                                                        >
                                                            {getSourceName(item.url, true)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            :
                                            <View style={styles.emptyBookmark} />
                                    }
                                </TouchableOpacity>
                            }
                        />

                    </View> :
                    <View
                    // entering={FadeIn}
                    // exiting={FadeOut}
                    >

                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={signOutAndUpdateProfile} style={[styles.button, {
                                marginBottom: 32
                            }]} >
                                {/* <FontAwesome name='close' color='#E6E6E6' size={24} /> */}
                                <Text style={styles.button_text}>Sign Out</Text>
                            </TouchableOpacity>
                            {/* <View
                                    style={{
                                        // marginVertical: 20,
                                        borderBottomColor: '#3C3D3F',
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                    }}
                                /> */}

                            {
                                showDeleteAccount
                                    ?
                                    <View style={{
                                        marginBottom: 16
                                    }}>
                                        <Pressable style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 12
                                        }}
                                            onPress={() => {
                                                setShowDeleteAccount(false)
                                            }}
                                        >
                                            <Ionicons name="chevron-down" size={20} color='#c2c2c2' />
                                            <Text style={{
                                                color: '#c2c2c2'
                                            }}>Advanced Settings</Text>
                                        </Pressable>
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
                                    :
                                    <Pressable style={{
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                        onPress={() => {
                                            setShowDeleteAccount(true)
                                        }}
                                    >
                                        <Ionicons name="chevron-forward" size={20} color='#c2c2c2' />
                                        <Text style={{
                                            color: '#c2c2c2'
                                        }}>Advanced Settings</Text>
                                    </Pressable>
                            }

                        </View>

                        <View style={{
                            marginTop: 16,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <Ionicons name="logo-twitter"
                                size={20}
                                color='#c2c2c2'
                                style={{
                                    // backgroundColor: 'red',
                                }}
                            />
                            <Text style={{
                                color: '#c2c2c2'
                            }}>
                                @fixedp0int | {Platform.OS}.{Application.nativeBuildVersion}
                            </Text>
                        </View>

                    </View>
            }
        </View >

    );
}

export default UserList;
const styles = StyleSheet.create({
    full_name: {
        color: '#F1F1F1',
        fontWeight: '700',
        marginBottom: 4,
        fontSize: 16,
        // marginHorizontal: 16
    },
    introduction: {
        // marginHorizontal: ,
        color: '#F1F1F1',
        // backgroundColor: 'red'
    }, h1: {
        marginTop: 40,
        marginBottom: 4,
        color: '#F1F1F1',
        fontSize: 24,
        fontWeight: '800'
    },
    emptyBookmark: {
        height: 60,
        width: '100%',
        // backgroundColor: 'blue',
        borderRadius: 8,
        // marginVertical: 8,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#5D5F64'
    },
    heading: {
        paddingTop: 8,
        // backgroundColor: 'blue',
        fontFamily: 'Rubik_700Bold',
        color: '#A3A3A3',
        fontSize: 24,
        // fontWeight: '800',
        flexGrow: 1
    },
    icon: {
        paddingTop: 8,
        paddingBottom: 16,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginLeft: 'auto',
        marginRight: 0,
        // backgroundColor: 'red'
    },
    header: {
        // backgroundColor: 'blue',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#323233',
        alignItems: 'center'
    },
    button_text: {
        color: '#ed4339',
        fontSize: 18
    },
    deletion_info: {
        color: '#929196',
        marginTop: 4,
        textAlign: 'center'
    },
    buttons: {
        marginTop: 0
    },
    deletion_text: {
        color: '#ed4339',
        fontSize: 18
    }
})


export const MemoUserList = memo(UserList);