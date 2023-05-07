import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { constants, randomColor, scaledown, sharedAsyncState } from '../utils';
import Post, { MemoPost } from './Post';
import { supabaseClient } from '../supabaseClient';
import { MemoSmallPost } from './SmallPost';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const theEmptyList: any[] = [];
const theEmptyMode = 'normal';
const theEmptyFunction = () => { };


function WelcomePost(props: any) {
    const translateY = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            width: 140,
            height: 140,
            transform: [{ translateY: translateY.value }]
        }
    });

    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(-20, { duration: 500 }),
            -1,
            true
        );
    }, []);

    return (
        <View style={{
            height: props.height,
            width: '100%',
            backgroundColor: '#151316',
            alignItems: 'center'
        }}>
            <View style={{
                marginTop: 'auto',
                marginBottom: 100,
                alignItems: 'center'
            }}>

                <Text style={{
                    color: 'white',
                    fontSize: scaledown(48),
                    fontFamily: 'Rubik_900Black',
                }}>PACKER</Text>
                <Text style={{
                    color: '#c2c2c2',
                    fontSize: scaledown(26),
                    marginLeft: 4,
                    marginRight: 20
                }}>
                    Scroll this way
                </Text>
                <Ionicons name="arrow-down"
                    size={26}
                    color='#C2C2C2'
                    style={{
                        marginRight: props.mode == 'comment' ? 8 : 0,
                    }} />

                {/* <View style={{
                    marginTop: 12,
                    marginHorizontal: 16
                }}>
                    <View style={{
                        alignSelf: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginVertical: 8,
                    }}>
                        <Ionicons name="bulb"
                            size={26}
                            color='#C2C2C2'
                            style={{
                                marginRight: props.mode == 'comment' ? 8 : 0,
                            }} />
                        <Text style={{
                            color: '#c2c2c2',
                            fontSize: scaledown(26),
                            marginLeft: 4,
                            marginRight: 20
                        }}>
                            Examples
                        </Text>
                    </View>
                    <Text style={{
                        marginVertical: 8,
                        color: '#c2c2c2',
                        fontSize: scaledown(20),
                        // textAlign: 'center'
                    }}>
                        Who will be affected by the new tax reform?
                    </Text>
                    <Text style={{
                        marginVertical: 8,
                        color: '#c2c2c2',
                        fontSize: scaledown(20),
                        // textAlign: 'center'
                    }}>How is Amazon's performance impacting the broader e-commerce industry?
                    </Text>
                    <Text style={{
                        marginVertical: 8,
                        color: '#c2c2c2',
                        fontSize: scaledown(20),
                        // textAlign: 'center'
                    }}>
                        How can my family clothing business in California pivot towards environmentally-friendly practices?
                    </Text>
                </View> */}
            </View>
            {/* <Animated.Image
                style={animatedStyles}
                resizeMode="contain"
                source={require('../assets/Point_down.png')}
            /> */}

            <LinearGradient
                colors={gradient}
                style={styles.gradient}
                pointerEvents='none'
            />

        </View>
    )
}
const MemoWelcomePost = memo(WelcomePost);
const analytics = async (user_id: any, post_id: any) => {
    // if (__DEV__) return;
    console.log('debug send analytics', user_id, post_id);
    const { data, error } = await supabaseClient.from('history').insert({
        user_id,
        post_id
    });
    console.log('debug data', data);
    if (error) {
        console.warn('Error Analytics', error);
        return;
    }
}

function Wall(props: any) {
    const [viewableMap, setViewableMap] = useState<any>({})
    // const [scrolling, setScrolling] = useState<boolean>(false)
    // console.log('debug props', props.posts)

    // const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        if (item.type == 'welcomePost') {
            return <MemoWelcomePost height={props.height} />
        }

        // console.log('debug ', viewableMap)
        const scrolledOn = viewableMap[item.id]
        // props.activePostIndex == index;
        const shouldActive = true;
        // props.activePostIndex == index || props.activePostIndex + 1 == index;
        // console.log('debug wall user', props.user, scrolledOn, sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`]);
        if (scrolledOn && props.user && !sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`]) {
            sharedAsyncState[`addHistoryRequested/${props.user.id}/${item.id}`] = true;
            console.log('analyticsss')
            analytics(props.user.id, item.id);
        }
        // console.log('debug render index', index);
        return <MemoSmallPost
            navProps={props.navProps}
            offsetZoomStyles={props.offsetZoomStyles}
            key={item.id}
            index={index}
            mode={scrolledOn ? props.mode : 'normal'}
            height={props.height}
            post={item}
            shouldActive={shouldActive}
            scrolledOn={scrolledOn}
            setSelectedComment={props.setSelectedComment}
            setMode={props.setMode}
            user={props.user}
        // scrolling={scrolling}
        />
        // <MemoPost
        //     offsetZoomStyles={props.offsetZoomStyles}
        //     key={item.id}
        //     index={index}
        //     mode={scrolledOn ? props.mode : 'normal'}
        //     height={props.height}
        //     post={item}
        //     shouldActive={shouldActive}
        //     scrolledOn={scrolledOn}
        //     setSelectedComment={props.setSelectedComment}
        //     setMode={props.setMode}
        //     user={props.user}
        // />
    }

    const keyExtractor = (item: any) => item.id
    const onScroll = (event: any) => {
        let offset = event.nativeEvent.contentOffset.y;
        if (offset < props.height / 2) {
            props.setActivePostIndex(0)
            return;
        }
        offset -= props.height / 2;
        props.setActivePostIndex(Math.floor(offset / props.height) + 1);
    }

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        // Do something with the visible items
        // console.log('debug ', viewableItems)
        const idObj = viewableItems.reduce((acc: any, item: any) => {
            acc[item.item.id] = true;
            return acc;
        }, {});
        // console.log('debug idObj', idObj)

        setViewableMap(idObj)
    }, []);

    const insets = useSafeAreaInsets()

    return (

        <View style={{
            backgroundColor: '#151316'
        }}>
            <Animated.FlatList
                // onScrollBeginDrag={() => {
                //     console.log('debug true')
                //     setScrolling(true)
                // }}
                // onMomentumScrollEnd={() => {
                //     console.log('debug false')
                //     setScrolling(false)
                // }}
                scrollsToTop={false}
                ref={props.wallref}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                contentInset={{
                    top: insets.top
                }}
                // windowSize={2}
                initialNumToRender={1}
                // maxToRenderPerBatch={2}
                // updateCellsBatchingPeriod={500}
                showsVerticalScrollIndicator={false}
                scrollEnabled={props.mode == 'normal'}
                // Only works on IOS
                // pagingEnabled={true}
                data={props.posts}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onEndReachedThreshold={2}
                onEndReached={props.requestPost}
                ItemSeparatorComponent={() => <View style={styles.hair} />}
            // getItemLayout={getItemLayout}
            // onScroll={onScroll}
            // scrollEventThrottle={6}
            // DO NOT USE removeClippedSubviews: Making title not clickable
            // removeClippedSubviews
            // windowSize={7}
            />
        </View>
    );
}

export default Wall;

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 128
    },
    hair: {
        borderBottomColor: '#3C3D3F',
        borderBottomWidth: StyleSheet.hairlineWidth,
        // marginBottom: 16,
        // marginTop: 16
        // StyleSheet.hairlineWidth
        // ,
        // marginHorizontal: 16
    }
});

const gradient = ['transparent', 'rgba(0, 0, 0, 0.9)']