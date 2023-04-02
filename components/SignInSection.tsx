import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, Image, ImageBackground, Linking, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signIn } from '../auth';
import { constants } from '../utils';


function SignInSection(props: any) {
    const insets = useSafeAreaInsets();
    const signInAndUpdateProfile = async (provider: 'apple' | 'google') => {
        const user = await signIn(provider);
        if (!user) return;

        props.setUserListMode('normal');
        console.log('debug user', JSON.stringify(user));
        props.setUser(user);

        // // Round trip
        // await upsertProfile(user);
        // await syncProfile();
    }

    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: Math.pow(props.offset.value / props.minOffset, 0.3)
        };
    });

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

    return (
        <Animated.View
            style={[animatedStyles, styles.view]}
            exiting={FadeOut}
        >
            <ImageBackground style={styles.background}
                source={require('../assets/loginBackground.jpg')}
            >
                <LinearGradient colors={['transparent', props.mode.tag == 'Comment' ? '#212121' : '#151316']} style={styles.linear}
                    pointerEvents='none'
                />
            </ImageBackground>


            <Image
                style={styles.icon}
                source={require('../assets/icon.png')}
            />

            <Text style={styles.text_1}>Unlock your curiosity.</Text>

            <Text style={styles.text_2}>Together with Packer.</Text>

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

            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: insets.bottom + props.INSETS_OFFSET_BOTTOM + 40,
                alignItems: 'center',
            }}>
                <TouchableOpacity onPress={openPrivacyPolicy}>
                    <Text style={styles.docText}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={openTermsAndConditions}>
                    <Text style={[{
                        marginTop: 4
                    }, styles.docText]}>
                        Terms & Conditions</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

export default SignInSection;
const styles = StyleSheet.create({
    view: {
        position: 'absolute',
        width: constants.width,
        height: '100%',
        // backgroundColor: 'blue'
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: 600,
    },
    linear: {
        width: '100%',
        height: '100%'
    },
    icon: {
        marginTop: 100,
        width: 60,
        height: 60,
        borderRadius: 4,
        // left: 'auto',
        // right: 'auto',
        alignSelf: 'center'
    },
    text_1: {
        marginTop: 24,
        color: 'white',
        fontSize: 30,
        fontWeight: '700',
        alignSelf: 'center',
        textAlign: 'center'
    },
    text_2: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700',
        alignSelf: 'center',
        textAlign: 'center'
    },
    loginButton: {
        marginTop: 32,
        width: 250,
        marginLeft: 'auto',
        marginRight: 'auto',
        shadowColor: 'black',
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
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
        fontSize: 18,
        // paddingTop: 2,
        // backgroundColor: 'blue'
    },
    docText: {
        color: '#f1f1f1',
        fontWeight: '300'
    }
})
