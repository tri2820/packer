import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo } from 'react';
import { Platform, Text, View, Image, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { constants, randomColor } from '../utils';
import { MemoPost } from './Post';

const theEmptyList: any[] = [];
const theEmptyMode = {
    tag: 'Normal'
};

function WelcomePost(props: any) {
    return (
        <View style={{
            height: props.height,
            width: '100%',
            backgroundColor: '#151316',
            alignItems: 'center'
        }}>
            <View style={{
                marginTop: 200,
                marginBottom: 40,
                alignItems: 'center'
            }}>

                <Text style={{
                    color: 'white',
                    fontSize: 48,
                    fontFamily: 'Rubik_900Black',
                }}>PACKER</Text>
                <View style={{
                    marginTop: 8
                }}>
                    <Text style={{
                        marginVertical: 4,
                        color: 'white',
                        fontSize: 20,
                    }}>1. Read News</Text>
                    <Text style={{
                        marginVertical: 4,
                        color: 'white',
                        fontSize: 20,
                    }}>2. Learn by chatting</Text>
                    <Text style={{
                        marginVertical: 4,
                        color: 'white',
                        fontSize: 20,
                    }}>3. Swipe this way</Text>
                </View>
            </View>
            <Image
                style={{
                    width: 140,
                    height: 140,
                }}
                resizeMode="contain"
                source={require('../assets/Point_down.png')}
            />

            <LinearGradient
                colors={gradient}
                style={styles.gradient}
                pointerEvents='none'
            />

        </View>
    )
}
const MemoWelcomePost = memo(WelcomePost);

function Wall(props: any) {
    const _setMode = React.useCallback(props.setMode, []);
    const _setSelectedComment = React.useCallback(props.setSelectedComment, []);
    const _requestComments = React.useCallback(props.requestComments, []);
    const welcomeData = { type: 'welcomePost', id: 'welcome' }
    const data = [welcomeData, ...props.posts]

    const getItemLayout = (data: any, index: number) => ({ length: props.height, offset: props.height * index, index })
    const renderItem = ({ index, item }: any) => {
        if (item.type == 'welcomePost') {
            return <MemoWelcomePost height={props.height} />
        }

        const scrolledOn = props.activePostIndex == index;
        const shouldActive = props.activePostIndex == index || props.activePostIndex + 1 == index;
        const cs = scrolledOn ? props.comments.filter((c: any) => c.post_id == item.id) : theEmptyList;
        return <MemoPost
            mode={scrolledOn ? props.mode : theEmptyMode}
            height={props.height}
            post={shouldActive ? item : null}
            shouldActive={shouldActive}
            scrolledOn={scrolledOn}
            comments={cs}
            setSelectedComment={_setSelectedComment}
            requestComments={_requestComments}
            setMode={_setMode}
        />
    }

    const keyExtractor = (item: any) => item.id
    const onEndReached = () => {
        console.log('wall on end reached')
        props.requestPost()
    }
    const onScroll = (event: any) => {
        let offset = event.nativeEvent.contentOffset.y;
        if (offset < props.height / 2) {
            props.setActivePostIndex(0)
            return;
        }
        offset -= props.height / 2;
        props.setActivePostIndex(Math.floor(offset / props.height) + 1);
    }

    return (
        <Animated.FlatList
            showsVerticalScrollIndicator={false}
            style={{
                width: constants.width,
                height: props.height
            }}
            scrollEnabled={props.mode.tag == 'Normal'}
            // Only works on IOS
            pagingEnabled={true}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={2}
            onEndReached={onEndReached}
            getItemLayout={getItemLayout}
            onScroll={onScroll}
            // DO NOT USE removeClippedSubviews: Making title not clickable
            // removeClippedSubviews
            windowSize={7}
        />
    );
}

export default Wall;

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 128
    }
});

const gradient = ['transparent', 'rgba(0, 0, 0, 0.9)']