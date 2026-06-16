import React, {useContext, useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Text, View} from 'react-native';
import {PageContainer} from '../../components/Container';
import {assets} from '../../config/AssetsConfig';
import {GreyBox} from '../../components/GreBox';
import {UserContext} from '../../../context/UserContext';
import {ProfileController} from '../../controllers/ProfileController';
import {API_BASE, API_SUCCESS} from '../../config/ApiConfig';
import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';

const Profile = ({navigation}) => {
  const {getToken} = useContext(UserContext);
  const [user, setUser] = useState({});
  const toast = useToast();
  const userCtx = React.useContext(UserContext);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getDetail();
    });
    return focusHandler;
  }, [navigation]);

  const getDetail = async () => {
    const token = await getToken();
    const instance = new ProfileController();
    const result = await instance.getUserDetail(token);
    console.log(result,'prrr')
    setUser(result.user);
  };

  const deleteAccount = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure? you want to delete your account.',
      [
        {
          text: 'No',
          onPress: () => {},
        },
        {
          text: 'Yes',
          onPress: async () => {
            const token = await getToken();
            const instance = new ProfileController();
            const result = await instance.deleteAccount(token);
            console.log(result, 'resultt');
            toast.show(
              'We have successfully received your request.,We will contact you on your email address.',
            );
            userCtx.signOut();
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <PageContainer>
      <View>
        {user?.image == '' ? (
          <Image source={assets.bg} style={styles.prImg} />
        ) : (
          <Image
            source={{uri: API_SUCCESS + '/' + user.image}}
            style={styles.prImg}
          />
        )}

        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>

        <View style={{marginTop: 30}}>
          <GreyBox
            label="My Packages"
            textStyle={{textAlign: 'center'}}
            onPress={() => navigation.navigate('Home',{
          screen:'buy',
          params:{
            active: 'My'
          }
        })}
          />
          <GreyBox
            label="Change password"
            textStyle={{textAlign: 'center'}}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <GreyBox
            label="My Wallet"
            textStyle={{textAlign: 'center'}}
            onPress={() => navigation.navigate('MyWallet')}
          />
          <GreyBox
            label="Journey"
            textStyle={{textAlign: 'center'}}
            onPress={() => navigation.navigate('Home',{
          screen:'journey'})}
          />
          <GreyBox
            label="Transaction History"
            textStyle={{textAlign: 'center'}}
            onPress={() => navigation.navigate('TransactionHistory')}
          />
          <GreyBox
            label="Delete my account"
            textStyle={{textAlign: 'center'}}
            onPress={() => deleteAccount()}
          />
        </View>
      </View>
    </PageContainer>
  );
};
export default Profile;

const styles = StyleSheet.create({
  prImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    textAlign: 'center',
    color: '#161415',
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
  },
  email: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    color: '#333',
    fontFamily: 'Gotham-Medium',
  },
  phone: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    color: '#333',
    fontFamily: 'Gotham-Medium',
  },
});
