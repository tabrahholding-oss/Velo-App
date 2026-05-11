import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {Input} from '../../components/Input/input';
import {
  RoundedDarkButton,
  RoundedThemeButton,
} from '../../components/Buttons';
import {UserContext} from '../../../context/UserContext';
import {useToast} from 'react-native-toast-notifications';
import {ProfileController} from '../../controllers/ProfileController';
import PageLoader from '../../components/PageLoader';
import { AuthContoller } from '../../controllers/AuthController';
import { useNavigation } from '@react-navigation/native';

const ChangePassword = (props) => {
  const [otp, setOTP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {getToken} = useContext(UserContext);
  const toast = useToast();
  const navigation = useNavigation();

  useEffect(() => {
    setOTP('');
    setPassword('');
    setConfirmPassword('');
  }, [navigation])

  const submit = async () => {
    const token = await getToken();
    const validate = validatePassword();
    if (!validate.msg) {
      setLoading(true);
      const data = {
        email: props.route.params.email,
        otp: otp,
        password: password,
        confirmPassword: confirmPassword,
      };
      const instance = new AuthContoller();
      const result = await instance.ResetPassword(data, token);
      console.log(result,'result')
      if (result.status === 'success') {
        toast.show(result.message);
        setLoading(false);
        setOTP('');
        setPassword('');
        setConfirmPassword('');
        navigation.navigate('Login');
      } else {
        toast.show(result.message);
        setLoading(false);
      }
    } else {
      toast.show(validate.msg);
    }
  };

  function validatePassword() {
    if (otp !== '' && password !== '' && confirmPassword !== '') {
      if (password == confirmPassword) {
        if (password.length > 7) {
          if (otp.length === 6) {
            return true;
          }
          else{
            return {msg: 'Invalid OTP'};
          }
        } else {
          return {msg: 'Password must be 8 characters.'};
        }
      } else {
        return {msg: 'New Password and Confirm Password does not each other.'};
      }
    } else {
      return {msg: 'please fill all details'};
    }
  }

  return (
    <>
      {/* <PageLoader loading={loading} /> */}
      <PageContainer>
        <ScrollView contentContainerStyle={{flex: 1}}>
          <Text style={{paddingLeft: 15,fontFamily:'Gotham-Medium',color: '#161415',}}>RESET PASSWORD</Text>

          <View style={styles.form}>
            <Input
              value={otp}
              label={'OTP'}
              onChang={setOTP}
              keyboardType={'numeric'}
            />
            <Input
              value={password}
              label={'New Password'}
              onChang={setPassword}
              secureTextEntry={true}
            />
            <Input
              value={confirmPassword}
              label={'Confirm password'}
              onChang={setConfirmPassword}
              secureTextEntry={true}
            />

            <View style={styles.btnBox}>
              <RoundedThemeButton
                label={'CANCEL'}
                style={{marginTop: 20, width: width / 2 - 50}}
                onPress={() => navigation.navigate('Login')}
                loading={false}
              />
              <RoundedDarkButton
                label={'SAVE'}
                style={{marginTop: 20, width: width / 2 - 50}}
                onPress={submit}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
};
export default ChangePassword;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  form: {
    width: width - 40,
    alignSelf: 'center',
    marginTop: 50,
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  prImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
});
