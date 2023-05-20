import { Text, Canvas, Morphology, useFont, Fill, Group, TextPath, Skia, vec, Shader } from "@shopify/react-native-skia";

// #38E8BE Money
// #39bef7 Tech
// #DDFF00 Food

export default function CategoryText(props: any) {
    const fontSize = 16
    const font = useFont(require("../assets/DM_Serif_Display/DMSerifDisplay-Regular.ttf"), fontSize);

    if (!font) return <></>
    return <Canvas style={{
        height: 20
    }}>
        <Text
            text={'Nothing'}
            color={'#DDFF00'}
            x={0}
            y={fontSize}
            font={font}
        >
            {/* <Morphology radius={0.3} operator="erode" /> */}
            <Morphology radius={0.3} />
        </Text>
    </Canvas>

}