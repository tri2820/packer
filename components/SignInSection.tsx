import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { memo } from 'react';
import { ImageBackground, Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { signIn } from '../auth';
import { scaledown } from '../utils';


function SignInSection(props: any) {
    const [videoStatus, setVideoStatus] = React.useState({});

    const signInAndUpdateProfile = async (provider: 'apple' | 'google') => {
        const user = await signIn(provider);
        if (!user) return;

        // props.setUserListMode('normal');
        // props.changeState('minimize')
        console.log('debug user', JSON.stringify(user));
        props.setUser(user);
        props.navProps.navigation.navigate('TheTab', { screen: 'Packs' })
        // // Round trip
        // await upsertProfile(user);
        // await syncProfile();
    }

    // const animatedStyles = useAnimatedStyle(() => {
    //     return {
    //         opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
    //     };
    // });

    const signInWithApple = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        signInAndUpdateProfile('apple')
    }

    const signInWithGoogle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        signInAndUpdateProfile('google')
    }

    const openPrivacyPolicy = () => {
        Linking.openURL('https://github.com/tri2820/packer-policies/blob/main/privacy_policy.md')
    }

    const openTermsAndConditions = () => {
        Linking.openURL('https://github.com/tri2820/packer-policies/blob/main/terms_and_conditions.md')
    }

    const openEULA = () => {
        Linking.openURL('https://github.com/tri2820/packer-policies/blob/main/EULA.md')
    }

    // console.log('debug sign in section')
    const video = React.useRef(null);

    return (
        <Animated.View
            style={[
                // animatedStyles,
                {
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    flex: 1,
                }]}
            exiting={FadeOut}
        >

            <ImageBackground style={styles.background}
                source={require('../assets/loginBackground2.jpg')}
            >
                <LinearGradient colors={['rgba(21,19,22,0)', 'rgba(21,19,22,0.9)', 'rgba(21,19,22,0.95)', 'rgba(21,19,22,1)']}
                    style={styles.linear}
                    pointerEvents='none'
                />
            </ImageBackground>

            <View style={{
                justifyContent: 'center',
                height: '100%'
            }}>
                {/* <Image
                    style={styles.icon}
                    source={require('../assets/icon.png')}
                /> */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    alignSelf: 'center'
                }}>
                    <Text style={{
                        color: 'white',
                        fontSize: scaledown(72),
                        // fontWeight: '700',
                        alignSelf: 'center',
                        textAlign: 'center',
                        fontFamily: 'Domine_500Medium',
                    }}>clue</Text>
                    <View style={{
                        backgroundColor: '#FFF200',
                        width: scaledown(20),
                        height: scaledown(20),
                        borderRadius: scaledown(10),
                        marginBottom: scaledown(16),
                        marginLeft: scaledown(4)
                    }} />
                </View>
                <Text style={styles.text}>Unveiling truth</Text>
                {/* <Text style={styles.text}>Meet Clue.</Text> */}

                <View style={styles.loginButtons}>
                    <View style={styles.loginButton}>
                        <Ionicons.Button name='logo-apple' style={styles.brandLogo}
                            iconStyle={styles.brandIconApple}
                            color='black'
                            onPress={signInWithApple}>
                            <Text style={styles.brandText}>
                                Sign in with Apple
                            </Text>
                        </Ionicons.Button>
                    </View>

                    <View style={styles.loginButton}>
                        <Ionicons.Button name='logo-google' style={styles.brandLogo}
                            iconStyle={styles.brandIcon}
                            color='black'
                            onPress={signInWithGoogle}>
                            <Text style={styles.brandText}>
                                Sign in with Google
                            </Text>
                        </Ionicons.Button>
                    </View>
                </View>
                <Text style={styles.docHeader}>By signing in, you agree with our
                    <Text onPress={openEULA}> End-user license agreement</Text>,
                    <Text onPress={openTermsAndConditions}> Terms & Conditions</Text>, and
                    <Text onPress={openPrivacyPolicy}> Privacy Policy</Text>
                </Text>
            </View>

        </Animated.View>
    );
}

export default SignInSection;
const styles = StyleSheet.create({
    view: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        // backgroundColor: 'blue'
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    linear: {
        width: '100%',
        height: '100%'
    },
    icon: {
        marginBottom: scaledown(12),
        width: 80,
        height: 80,
        borderRadius: 4,
        // left: 'auto',
        // right: 'auto',
        alignSelf: 'center'
    },
    text: {
        color: 'white',
        fontSize: scaledown(26),
        // fontWeight: '700',
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'Domine_400Regular',
    },
    loginButtons: {
        marginTop: scaledown(24)
    },
    loginButton: {
        marginVertical: 10,
        width: 250,
        marginLeft: 'auto',
        marginRight: 'auto',
        shadowColor: 'black',
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        borderRadius: 40,
        overflow: 'hidden',
    },
    brandLogo: {
        backgroundColor: "white",
        paddingTop: 12,
        paddingBottom: 10,
        // paddingHorizontal: 32,
        paddingLeft: 32,
        alignItems: 'center',
    },
    brandIconApple: {
        // backgroundColor: 'red',
        marginRight: 8,
        marginBottom: 4.5,
        // marginVertical: 3
    },
    brandIcon: {
        // backgroundColor: 'red',
        marginRight: 8,
        // marginBottom: 4.5,
        marginVertical: 3
    },
    brandText: {
        fontWeight: '600',
        fontSize: scaledown(18),
        // paddingTop: 2,
        // backgroundColor: 'blue'
    },
    docHeader: {
        color: '#A3A3A3',
        fontWeight: '300',
        marginTop: scaledown(32),
        fontSize: scaledown(14),
        marginHorizontal: scaledown(64),
        textAlign: 'center'
    },
    docText: {
        color: '#A3A3A3',
        fontWeight: '300',
        fontSize: scaledown(12),
        marginVertical: 4
    }
})


export const MemoSignInSection = memo(SignInSection);