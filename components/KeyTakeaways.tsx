import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MemoContentMenu } from './ReportMenu';
import { constants } from '../utils';


function KeyTakeaways(props: any) {
    // const [showKeyTakeaways, setShowKeyTakeaways] = useState(true);
    const [inited, setInited] = useState(false);

    // useEffect(() => {
    //     if (!inited) return;
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // }, [showKeyTakeaways])

    useEffect(() => {
        setInited(true);
    }, [])


    if (props.content == '') return <></>;

    const longPressed = useSharedValue(false);
    const menuref = useRef<any>(null)
    const openMenu = () => {
        longPressed.value = true;
        menuref.current?.open();
    }
    const onMenuClose = React.useCallback(() => {
        longPressed.value = false;
    }, [])
    const longPressedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: longPressed.value ? withTiming('rgba(0,0,0,0.5)', { duration: 100 }) : withTiming('rgba(0,0,0,0)', { duration: 200 })
        };
    });

    return <Animated.View style={[longPressedStyle, {
        width: constants.width
    }]}>


        <Pressable
            // onPress={() => {
            //     setShowKeyTakeaways(!showKeyTakeaways);
            // }}
            onLongPress={openMenu}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                // backgroundColor: '#303030',
                // marginHorizontal: 8,
                // borderRadius: 8,
                // borderColor: '#3C3D3F',
                // borderWidth: StyleSheet.hairlineWidth,
                // marginTop: 8
            }}
        >

            <View style={{
                // marginTop: 12,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center'
            }}>


                {/* <Text style={{
                    color: '#E6E6E6',
                    fontWeight: 'bold',
                    marginLeft: 8
                }}>Packer's Report</Text> */}



                {/* {
                    !showKeyTakeaways &&

                    <Animated.Text style={{
                        color: '#A3A3A3',
                        flex: 1,
                        // backgroundColor: 'red'
                    }}
                        numberOfLines={1}
                        entering={FadeInDown}
                    > • {props.content}
                    </Animated.Text>

                } */}

                <MemoContentMenu
                    menuref={menuref}
                    _content={props.content}
                    onClose={onMenuClose}
                    noUser
                    noReport
                />
            </View>


            <Animated.Text style={{
                color: '#E6E6E6',
                lineHeight: 18,

                // marginTop: 8
            }}
                entering={inited ? FadeInUp : undefined}
            >
                {/* <View style={{
                    marginLeft: 4
                }}>
                    <Image
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 2,
                        }}
                        source={require('../assets/smallicon.png')}
                    />
                </View> */}
                {props.content}
            </Animated.Text>

        </Pressable>

    </Animated.View>

}

export default KeyTakeaways;