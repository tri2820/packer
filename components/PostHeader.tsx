import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import * as React from 'react';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { constants, normalizedHostname } from '../utils';
import { MemoContentMenu } from './ReportMenu';

function PostHeader(props: any) {
    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname).toUpperCase();
    }
    const menuref = useRef<any>(null)
    const openMenu = () => {
        menuref.current.open();
    }



    return (
        <TouchableOpacity
            style={styles.touch}
            onPress={() => {
                props.setMode({
                    tag: 'App',
                    value: props.post.source_url
                })
            }}
            onLongPress={openMenu}
        >
            {
                props.imageLoaded && <Animated.Image
                    style={styles.image}
                    source={{
                        uri: props.post.image
                    }}
                    entering={FadeIn}
                />
            }

            <View style={styles.textheader}>
                <Ionicons name='link' color='#A3A3A3' size={14} />
                <Text style={styles.source}>
                    {
                        getSourceName(props.post.source_url)
                    }
                </Text>
            </View>
            <Text style={styles.title}>
                {props.post.title}
            </Text>


            <View style={styles.text_header_2}>
                <Text style={styles.author_name}>{props.post.author_name}</Text>

                <Text style={styles.created_at}> • {
                    moment.utc(props.post.created_at).local().startOf('seconds').fromNow()
                }</Text>

                <View style={styles.contentmenu}>
                    <MemoContentMenu
                        menuref={menuref}
                        post={props.post}
                        triggerOuterWrapper={styles.triggerOuterWrapper} />
                </View>
            </View>
        </TouchableOpacity >
    );
}

export default PostHeader;
const styles = StyleSheet.create({
    image: {
        width: constants.width - 32,
        height: constants.width / 4 * 2,
        marginBottom: 16,
        borderRadius: 8
    },
    touch: {
        marginBottom: 8,
        marginHorizontal: 16
    },
    source: {
        color: '#A3A3A3',
        fontSize: 12,
        marginLeft: 4
        // backgroundColor: 'red'
    },
    textheader: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center'
    },
    title: {
        color: 'white',
        // fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        fontFamily: 'Rubik_500Medium'
    },
    triggerOuterWrapper: {
        // backgroundColor: 'red',
        paddingLeft: 8
    },
    contentmenu: {
        marginLeft: 'auto',
        marginRight: 0,
    },
    created_at: {
        color: '#A3A3A3'
    },
    author_name: {
        color: '#A3A3A3',
        fontFamily: 'Rubik_500Medium'
    },
    text_header_2: {
        marginBottom: 4,
        flexDirection: 'row',
        // backgroundColor: 'blue',
        alignItems: 'center'
    }
})