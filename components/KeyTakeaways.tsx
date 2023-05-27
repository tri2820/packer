import * as React from 'react';
import { memo } from 'react';
import { View, Text } from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';
import { constants, markdownNERRules, mdKeytakeawaysStyle, mdstyles, scaledown } from '../utils';


function KeyTakeaways(props: any) {
    if (props.content == '') return <></>;
    const ners = props.ners ?? []

    function replaceSubstringsWithStars(ners: any[], s: string): string {
        const added_ners: any = {}

        const enclose = (type: string, s: string) => {
            return `<${type}>${s}</${type}>`
        }
        let result = "";
        let lastIndex = 0;

        for (let i = 0; i < ners.length; i++) {
            const { start, end, type } = ners[i];
            result += s.substring(lastIndex, start);
            const ner = s.substring(start, end);
            result += added_ners[ner] ? ner : enclose(type, ner);
            added_ners[ner] = true;
            lastIndex = end;
        }

        result += s.substring(lastIndex);

        return result;
    }



    return <View style={{
        // backgroundColor: 'red'
    }}>
        <Text style={{
            color: '#b3b3b3',
            fontSize: scaledown(14),
            lineHeight: scaledown(18),
            fontFamily: 'Domine_500Medium'
        }}>
            {props.content.slice(0, 80).replace('\n', ' ')}
            {/* Chichim Shrine is located in Gerudo Desert. Guide for location, puzzles, and rewards. Interactive map available. */}
        </Text>
        {/* <MarkdownView
            rules={markdownNERRules}
            styles={mdKeytakeawaysStyle}
        >
            {'​' + replaceSubstringsWithStars(ners, props.content.slice(0, 80)).replace('\n', '') as any}
        </MarkdownView> */}
    </View>

}

export default KeyTakeaways;
export const MemoKeyTakeaways = memo(KeyTakeaways);