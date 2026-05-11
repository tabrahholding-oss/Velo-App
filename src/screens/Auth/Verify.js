import React, {Component, useEffect, useState} from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {AuthContoller} from '../../controllers/AuthController';
import {useNavigation} from '@react-navigation/native';
import {PageContainer} from '../../components/Container';
import {AuthHeader} from '../../components/AuthHeader';
import {
  DarkButton,
  RoundedDarkButton,
  RoundedDarkButton2,
  ThemeButton,
} from '../../components/Buttons';
import {Input} from '../../components/Input/input';
import {useToast} from 'react-native-toast-notifications';
import {TextInput} from 'react-native-paper';
import { OTPInput, OtpInput } from 'react-native-otp-entry';
import PageLoader from '../../components/PageLoader';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const Verify = props => {
  const [otp, setOTP] = useState();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const email = props.route.params.email;

  const resendOtp = async () => {
    setLoading(true);
    const instance = new AuthContoller();
    const otpResult = await instance.resendOtp(props.route.params.email);
    if (otpResult.status === 'success') {
      toast.show(otpResult.message);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    if (otp && otp?.length === 6) {
      setLoading(true)
      const instance = new AuthContoller();
      const result = await instance.verifyOtp(props.route.params.email, otp);
      if (result.status === 'success') {
        toast.show(result.message);
        setLoading(false)
        navigation.navigate('Login');
      } else {
        setLoading(false)
        toast.show(result.message);
      }
    } else {
      toast.show('Invalid OTP');
    }
  };

  return (
    <>
    <PageLoader loading={loading} />
      <PageContainer>
        <ScrollView contentContainerStyle={{flex: 1}}>
          <View style={{width: '100%', maxWidth: 320, alignSelf: 'center'}}>
            <AuthHeader title={'Verify'} />
            <View style={styles.form}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#333',
                  fontSize: 12,
                  lineHeight: 16,
                  marginBottom: 20,
                  fontFamily: 'Gotham-Medium',
                }}>
                We have sent a verification code on your email{' '}
                <Text style={{color: '#000', fontWeight: '700'}}>{email}</Text>{' '}
                please enter and verify.
              </Text>

              <OtpInput 
                  numberOfDigits={6}
                  focusColor="#161415"
                  onTextChange={(text) => setOTP(text)}
              />

              <RoundedDarkButton onPress={() => verifyOtp()} style={{marginTop:20}} label="Verify" onPress={() => verifyOtp()} />

              <TouchableOpacity
                style={{marginTop: 30}}
                onPress={() => resendOtp()}>
                <Text style={styles.skipText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  otpBox:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    width:270,
    alignSelf:'center',
    marginBottom:20
  },
  otpInput:{
    width:42,
    height:42,
    borderWidth:1,
    borderColor:'#161415',
    borderRadius:5
  },
  input: {
    backgroundColor: 'transparent',
    color: '#161415',
    border: 0,
    textTransform: 'uppercase',
    fontSize: 32,
    fontFamily: 'Gotham-Medium',
    position:'absolute',
    marginTop:40,
    letterSpacing:32,
    width:270,
    alignSelf:'center',

  },
  loader: {
    position: 'absolute',
    marginTop: 10,
    flex: 1,
  },
  forget: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  forgetText: {
    color: '#161415',
    textAlign: 'center',
  },

  form: {
    marginTop: 180,
  },
  skip: {
    textAlign: 'center',
    marginTop: 30,
    bottom: Platform.OS === 'ios' ? 10 : 10,
    position: 'absolute',
    zIndex: 3,
    left: 0,
    right: 0,
  },
  skipText: {
    color: '#161415',
    textAlign: 'center',
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
  },
});
export default Verify;
