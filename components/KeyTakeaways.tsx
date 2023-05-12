import * as React from 'react';
import { memo } from 'react';
import { View } from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';
import { constants, markdownNERRules, mdstyles } from '../utils';


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
    {/* <Text style={{ color: 'white' }}>{props.content}</Text>
    console.log("@", props.content, "@") */}
    const content = <MarkdownView
        rules={markdownNERRules}
        styles={mdstyles}
    >
        {'​' + replaceSubstringsWithStars(ners, props.content.slice(0, 150)).trim() as any}
    </MarkdownView>


    return <View style={{
        // width: constants.width,
        // paddingHorizontal: 16,
        paddingVertical: 4
    }}>
        {content}
    </View>

}

export default KeyTakeaways;
export const MemoKeyTakeaways = memo(KeyTakeaways);