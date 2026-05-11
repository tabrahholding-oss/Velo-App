import React, {Component, useState} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageLoader from '../../components/PageLoader';
import {assets} from '../../config/AssetsConfig';
import {AuthHeader} from '../../components/AuthHeader';
import {DarkButton, ThemeButton} from '../../components/Buttons';
import {Input} from '../../components/Input/input';
import {useToast} from 'react-native-toast-notifications';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();

  const submit = async () => {
    if (loading === false) {
      if (email !== '') {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (reg.test(email) === false) {
          toast.show('Email is Not Correct');
          return false;
        } else {
          setLoading(true);
          const instance = new AuthContoller();
          const result = await instance.forgotPassword(email);


          if (result.status === 'success') {
            toast.show(result.message);
            navigation.navigate('ResetPassword',{email: email});
            setLoading(false)
          } else {
            toast.show(result.message);
            setLoading(false)
          }
        }
      } else {
        toast.show('please enter your email address.');
      }
    }
  };

  return (
    <>
    {/* <PageLoader loading={loading} /> */}
      <PageContainer>
        <ScrollView contentContainerStyle={{flex: 1}}>
          <View style={{width: '100%', maxWidth: 320, alignSelf: 'center'}}>
            <AuthHeader title={'Forgot Password'} />
            <View style={styles.form}>
              <Input value={email} label={'E-MAIL ADDRESS'} onChang={setEmail} />

              <DarkButton
                label={'Reset Password'}
                onPress={submit}
                loading={loading}
                disabled={loading}
                style={{marginTop: 20}}
              />

              <TouchableOpacity
                style={{marginTop: 20}}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.skipText}>Go back</Text>
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
    fontFamily:'Gotham-Book'
  },
});
export default Forgot;
