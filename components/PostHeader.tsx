import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { normalizedHostname } from '../utils';

function PostHeader(props: any) {
    const getSourceName = (source_url: string) => {
        const url = new URL(source_url);
        return normalizedHostname(url.hostname).toUpperCase();
    }

    return (<View style={{
        marginBottom: 8
    }}>
        <TouchableOpacity
            onPress={() => {
                props.setMode({
                    tag: 'App',
                    value: props.post.source_url,
                    // insetsColor: 'rgba(0, 0, 0, 0)'
                })
            }}
        >
            <View style={{
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                // justifyContent: 'center'
            }}>
                <Ionicons name='link' color='#A3A3A3' size={14} />
                <Text style={{
                    color: '#A3A3A3',
                    fontSize: 12,
                    marginLeft: 4
                    // backgroundColor: 'red'
                }}>
                    {
                        getSourceName(props.post.source_url)
                    }
                </Text>
            </View>

            <Text style={[{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 18,
                marginBottom: 8
            },
                // animatedStyles
            ]}>
                {props.post.title}
            </Text>
        </TouchableOpacity>

        <Text style={{
            color: '#A3A3A3',
            marginBottom: 4
        }}>
            <Text style={{
                fontWeight: 'bold',
            }}>{props.post.author_name}</Text> • {
                moment.utc(props.post.created_at).local().startOf('seconds').fromNow()
            }
        </Text>

    </View>);
}

export default PostHeader;