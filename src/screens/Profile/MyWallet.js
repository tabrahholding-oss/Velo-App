import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {RoundedDarkButton} from '../../components/Buttons';
import PageLoader from '../../components/PageLoader';
import {WalletController} from '../../controllers/WalletController';
import {UserContext} from '../../../context/UserContext';
import {ModalView} from '../../components/ModalView';
import {Input} from '../../components/Input/input';
import {useToast} from 'react-native-toast-notifications';
import {API_BASE, API_SUCCESS} from '../../config/ApiConfig';
import WebView from 'react-native-webview';
import {assets} from '../../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';
import useKeyboardHeight from 'react-native-use-keyboard-height';

const height = Dimensions.get('window').height;

const MyWallet = () => {
  const [loading, setLoading] = useState(true);
  const {getToken} = useContext(UserContext);
  const [balance, setBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const keyboardHeight = useKeyboardHeight();

  const toast = useToast();
  const navigation = useNavigation();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getMyBanance();
    });
    return focusHandler;
  }, [navigation]);

  const getMyBanance = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new WalletController();
    const result = await instance.getBalance(token);
    setLoading(false);
    if (result?.attributes?.balance) {
      setBalance(result.attributes.balance);
    }
  };

  const openModal = () => {
    setAmount(0);
    setOpen(true);
  };

  const payNow = () => {
    if (amount > 0) {
      setOpen(false);
      navigation.navigate('WalletPay', {amount: amount});
    } else {
      toast.show('Please enter amount');
    }
  };

 
  return (
    <>
      <PageLoader loading={loading} />

      <PageContainer>
        <ScrollView contentContainerStyle={{flex: 1}}>
          <Text
            style={{
              paddingLeft: 15,
              fontFamily: 'Gotham-Medium',
              color: '#161415',
              marginTop: 10,
            }}>
            WALLET
          </Text>

          <View style={styles.form}>
            <View style={styles.walletBox}>
              <Text style={styles.amountText}>{balance} QR</Text>
            </View>
            <View style={styles.btnBox}>
              <RoundedDarkButton
                label={'TOP UP'}
                style={{marginTop: 20, width: width / 2 - 50}}
                onPress={openModal}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </PageContainer>

      <ModalView
        visible={open}
        heading="AMOUNT TO ADD"
        setVisible={() => setOpen(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: Platform.OS === 'android' ? 0 : keyboardHeight,
        }}>
        <View style={{paddingHorizontal: 30, marginTop: 30, paddingBottom: 80}}>
          <Input
            value={amount}
            label={'ENTER AMOUNT'}
            onChang={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => payNow()}>
            <Text style={styles.btnText}>GO TO CHECKOUT</Text>
            <Image source={assets.chevron} style={styles.btnImage} />
          </TouchableOpacity>
        </View>
      </ModalView>
    </>
  );
};
export default MyWallet;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  form: {
    width: width - 40,
    alignSelf: 'center',
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  btnBox: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  walletBox: {
    backgroundColor: '#fff',
    textAlign: 'center',
    paddingVertical: 70,
    borderRadius: 24,
    shadowColor: '#161415',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  amountText: {
    fontSize: 28,
    fontFamily: 'Gotham-Black',
    textAlign: 'center',
    color: '#161415',
  },
  checkoutBtn: {
    backgroundColor: '#161415',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  btnImage: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    transform: [{rotate: '-90deg'}],
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
});
