import Ionicons from '@expo/vector-icons/Ionicons';
import * as React from 'react';
import { memo, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from '../auth';
import { supabaseClient } from '../supabaseClient';
import { constants, getSourceName, hookListener, isVideoPost, randomNickName, sharedAsyncState, sourceName, title, unhookListener } from '../utils';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import * as Application from 'expo-application';
import { FlatList } from 'react-native-gesture-handler';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import SignInSection from './SignInSection';
import { Canvas, Group, ImageSVG, fitbox, rect, useSVG } from '@shopify/react-native-skia';
import ImageWithPlaceholder from './ImageWithPlaceholder';


function Settings(props: any) {
    const [mode, setMode] = useState('normal')
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)
    const [stepper, setStepper] = useState(false)
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const svg = useSVG(require("../assets/empty_drawing.svg"));
    const size = constants.width / 3;
    const src = rect(0, 0, 279, 242);
    const dst = rect(0, 0, size, size);
    console.log('debug UserList isFocused', isFocused);

    const bookmarked_posts: any[] = Object.values(sharedAsyncState.bookmarks).filter(x => x).sort((a: any, b: any) => a.bookmark_index - b.bookmark_index)
    // .slice(0, 3);
    // console.log(bookmarked_posts?.map(b => b.bookmark_index))
    // console.log('debug data', data)

    useEffect(() => {
        const key = `BookmarksChanged`;
        const mySubkey = hookListener(key, () => {
            // console.log('update!', props.post.id);
            // setBookmarked(sharedAsyncState.bookmarks[props.post.id] ? true : false)
            setStepper((s) => !s);
        })
        return () => unhookListener(key, mySubkey)
    }, [])


    const signOutAndUpdateProfile = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        const signedOut = await signOut();
        if (!signedOut) return;
        props.setUser(null);
        setMode('normal');
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


    const renderItem = ({ item }: any) =>
        <TouchableOpacity onPress={item ? () => {
            props.navProps.navigation.push('SinglePost', {
                singlePost: item
            })
        } : undefined}
            style={{
                marginVertical: 4
            }}
        >

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
                {item.image_url && <ImageWithPlaceholder
                    url={item.image_url}
                    placeholder={require('../assets/empty.jpg')}
                    imageStyle={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: '#222324',
                        marginRight: 12,
                    }}
                />

                }
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: 'red'
                }}>
                    <View style={{
                        flex: 1
                    }}>

                        <Text style={{
                            color: '#a3a3a3',
                            // marginLeft: 4,
                            fontWeight: '300',
                        }}
                            numberOfLines={1}
                        >
                            {
                                sourceName(item)
                            }
                        </Text>
                        <Text style={{
                            color: '#f1f1f1',
                            fontSize: 15,
                            fontFamily: 'Rubik_500Medium'
                        }}
                            numberOfLines={1}
                        >
                            {
                                title(item)
                            }
                        </Text>
                    </View>
                </View>
            </View>

        </TouchableOpacity>



    return <View style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#151316',
        paddingTop: insets.top,
    }}>
        {props.user ?

            <Animated.View style={{
                paddingHorizontal: 20,
                flex: 1,
                paddingTop: 16
            }}
                entering={FadeIn}
            >

                <View style={{
                    flexDirection: 'row',
                    marginTop: 8,
                    marginBottom: 16
                }}>
                    <TouchableOpacity style={{
                        backgroundColor: mode == 'normal' ? '#f1f1f1' : '#323233',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                        marginRight: 10,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                        onPress={() => {
                            setMode('normal')
                        }}
                    >
                        <Ionicons name="bookmark" size={20} color={
                            mode == 'normal' ? 'black' : '#f1f1f1'
                        } />
                        <Text style={{
                            marginLeft: 6,
                            color: mode == 'normal' ? 'black' : '#f1f1f1',
                            fontWeight: 'bold'
                        }}>Bookmark</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        backgroundColor: mode == 'settings' ? '#f1f1f1' : '#323233',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                        marginRight: 4,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                        onPress={() => {
                            setMode('settings')
                        }}
                    >
                        <Ionicons name="settings" size={20} color={
                            mode == 'settings' ? 'black' : '#f1f1f1'
                        } />
                        {/* <Text style={{
                            marginLeft: 6,
                            color: mode == 'settings' ? 'black' : '#f1f1f1',
                            fontWeight: 'bold'
                        }}>Settings</Text> */}
                    </TouchableOpacity>
                </View>


                <View
                    style={{
                        marginBottom: 8,
                        borderBottomColor: '#3C3D3F',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />

                {
                    mode == 'normal'
                        ? <View
                            // entering={FadeIn}
                            // exiting={FadeOut.duration(200)}
                            style={{
                                // backgroundColor: 'blue',
                                flex: 1
                            }}
                        >
                            {/* <Text style={{
                            fontFamily: 'Rubik_800ExtraBold',
                            fontSize: 28,
                            color: '#FFF200'
                        }}>{props.user.user_metadata.full_name}
                        </Text> */}
                            {/* 
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
                        </View> */}
                            {
                                bookmarked_posts.length == 0 ?
                                    <View style={{
                                        flex: 1,
                                        // backgroundColor: 'red',
                                        paddingBottom: 140,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Canvas style={{
                                            width: size,
                                            height: size,
                                            // backgroundColor: 'red'
                                        }}>
                                            {svg && (
                                                <Group transform={fitbox("contain", src, dst)}>
                                                    <ImageSVG
                                                        svg={svg}
                                                        width={279}
                                                        height={242}
                                                    />
                                                </Group>
                                            )
                                            }
                                        </Canvas>
                                        <Text style={{
                                            color: 'white',
                                            fontFamily: 'Rubik_700Bold',
                                            fontSize: 20,
                                            textAlign: 'center'
                                        }}>
                                            Your bookmarks are empty
                                        </Text>
                                        <Text style={{
                                            marginTop: 4,
                                            color: '#a3a3a3',
                                            textAlign: 'center'
                                        }}>
                                            Find captivating reads in Discover tab
                                        </Text>
                                    </View> :
                                    <FlatList
                                        overScrollMode={'always'}
                                        horizontal={false}
                                        showsVerticalScrollIndicator={false}
                                        contentInset={{
                                            bottom: useBottomTabBarHeight()
                                        }}
                                        // listKey='userList'
                                        style={{
                                            // marginTop: 8,
                                            // marginBottom: insets.bottom,
                                            // backgroundColor: 'red'
                                            // overflow: 'hidden'
                                        }}
                                        data={bookmarked_posts}
                                        // keyExtractor={keyExtractor}
                                        renderItem={renderItem}
                                    />
                            }

                        </View> :
                        <View
                        // entering={FadeIn}
                        // exiting={FadeOut}
                        >
                            <Text style={{
                                fontFamily: 'Rubik_800ExtraBold',
                                fontSize: 28,
                                color: '#FFF200',
                                marginBottom: 4
                            }}>{props.user.user_metadata.full_name}
                            </Text>
                            <Text style={{
                                fontFamily: 'Rubik_400Regular',
                                // fontSize: 28,
                                color: '#a3a3a3',
                                marginBottom: 32
                            }}>{props.user.user_metadata.email}
                            </Text>

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
            </Animated.View >
            : <Animated.View style={{
                width: '100%',
                height: '100%'
            }}
                entering={FadeIn}
            >
                <SignInSection
                    navProps={props.navProps}
                    setUser={props.setUser}
                />
            </Animated.View>}
    </View>

}

export default Settings;
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
