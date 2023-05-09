import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { getPastelColor } from "../utils";

export default function AnonAvatar(props: any) {
    if (props.author_name == 'Packer') return <View>
        <ImageBackground style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '#3C3D3F'
        }}
            source={require('../assets/smallicon.png')}
        />
    </View>


    return <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: getPastelColor(props.author_name),
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Text style={{
            fontFamily: 'Rubik_500Medium'
        }}>{
                props.author_name[0].toUpperCase()
            }</Text>
    </View>

}