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
import {assets} from '../../config/AssetsConfig';
import {GreyBox} from '../../components/GreBox';
import {Input} from '../../components/Input/input';
import {
  DarkButton,
  RoundedDarkButton,
  RoundedThemeButton,
} from '../../components/Buttons';
import {UserContext} from '../../../context/UserContext';
import {useToast} from 'react-native-toast-notifications';
import {ProfileController} from '../../controllers/ProfileController';
import PageLoader from '../../components/PageLoader';

const ChangePassword = ({navigation}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {getToken} = useContext(UserContext);
  const toast = useToast();

  useEffect(() => {
    setOldPassword('');
    setPassword('');
    setConfirmPassword('');
  }, [navigation])

  const submit = async () => {
    const token = await getToken();
    const validate = validatePassword();
    if (!validate.msg) {
      setLoading(true);
      const data = {
        oldPassword: oldPassword,
        password: password,
        confirmPassword: confirmPassword,
      };
      const instance = new ProfileController();
      const result = await instance.changePassword(data, token);
      if (result.status === 'success') {
        toast.show(result.message);
        setLoading(false);
        setOldPassword('');
        setPassword('');
        setConfirmPassword('');
        navigation.navigate('Profile');
      } else {
        toast.show(result.message);
        setLoading(false);
      }
    } else {
      toast.show(validate.msg);
    }
  };

  function validatePassword() {
    if (oldPassword !== '' && password !== '' && confirmPassword !== '') {
      if (password == confirmPassword) {
        if (password.length > 7) {
          return true;
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
          <Text style={{paddingLeft: 15,fontFamily:'Gotham-Medium',color: '#161415',}}>CHANGE PROFILE</Text>

          <View style={styles.form}>
            <Input
              value={oldPassword}
              label={'Current Password'}
              onChang={setOldPassword}
              secureTextEntry={true}
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
                onPress={() => navigation.navigate('Profile')}
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
