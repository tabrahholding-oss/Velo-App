import React, {useContext, useEffect, useState} from 'react';
import {CurvedGreyButton} from '../../components/Buttons';
import {
  View,
  Text,
  Dimensions,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {BuyContoller} from '../../controllers/BuyController';
import {useToast} from 'react-native-toast-notifications';
import PageLoader from '../../components/PageLoader';
import WebView from 'react-native-webview';
import {Modal} from 'react-native-paper';
import {ProfileController} from '../../controllers/ProfileController';
import {API_SUCCESS} from '../../config/ApiConfig';
import {useNavigation} from '@react-navigation/native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const Pay = props => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState();
  const {getToken} = useContext(UserContext);
  const [paymentUrl, setPaymentUrl] = useState();
  const [paymentModal, setPaymentModal] = useState(false);
  const [user, setUser] = useState({});

  const navigation = useNavigation();

  const toast = useToast();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setItem(props.route.params.item);
      getDetail();
    });
    return focusHandler;
  }, [props.route.params.item]);

  const getDetail = async () => {
    const token = await getToken();
    const instance = new ProfileController();
    const result = await instance.getUserDetail(token);
    setUser(result.user);
  };

  const getUserToken = async () => {
    return await getToken();
  };

  const checkResponse = data => {
    console.log(data.url)
    if (data.url.includes('status')) {
      const url1 = data.url.split('?')[1];
      const url2 = url1.split('&')[0];
      const status = url2.split('=')[1];
      console.log(status,'status');
      if(status === 'Paid'){
        setLoading(true);
        setPaymentModal(false);
        setTimeout(() => {
          toast.show('Package purchased successfully');
          navigation.navigate('Home', {
            screen:'Buy',
            params:{
              purchase:'success'
            }
          })
          // navigation.navigate('buy', {purchase: 'success'});
          setLoading(false);
        }, 2000);
      }
      else{
        setPaymentModal(false);
        setPaymentUrl('');
        navigation.navigate('buy');
        toast.show('Payment has been ' + status);
      }
    }


    // if (data.url.includes('status=Paid')) {
    //   setLoading(true);
    //   setPaymentModal(false);
    //   setTimeout(() => {
    //     toast.show('Package purchased successfully');
    //     navigation.navigate('buy', {purchase: 'success'});
    //     setLoading(false);
    //   }, 3000);
    // } 
    // else if(data.url.includes('status=Canceled')){
    //   setPaymentModal(false);
    //   setPaymentUrl('');
    //   navigation.navigate('buy');
    //   toast.show('Payment has been failed');
    // }
    // else if(data.url.includes('status=Pending')){
    //   setPaymentModal(false);
    //   setPaymentUrl('');
    //   navigation.navigate('buy');
    //   toast.show('Your payment is in pending');
    // }
    // else if (data.url.includes('transaction_cancelled')) {
    //   setPaymentModal(false);
    //   navigation.navigate('buy');
    //   toast.show('transaction cancelled');
    // }
  };

  const payNow = val => {
    if (val === 'wallet') {
      PayFromWallet();
    } else if (val === 'debit') {
      completePaymentDebit('Package');
      // completePaymentDebit('Package');
    } else if (val === 'apple') {
      completePaymentDebit('ApplePay');
    } else if (val === 'gpay') {
      completePaymentDebit('Gpay');
    }
    else if (val === 'naps') {
      completePaymentDebit('Naps');
    }
  };

  const PayFromWallet = async () => {
    Alert.alert(
      'Confirm',
      'You want to book package from wallet?',
      [
        {
          text: 'No',
          onPress: () => {},
        },
        {
          text: 'Yes',
          onPress: () => {
            setLoading(true);
            completePaymentDebit('Wallet');
          },
        },
      ],
      {cancelable: false},
    );
  };

  const completePaymentDebit = async type => {
    const token = await getToken();
    setLoading(true);
    const instance = new BuyContoller();
    const result = await instance.executePayment(item, type, token);
    console.log(result,'resultttt')
    if (result.IsSuccess === true) {
      if(type === 'Wallet'){
        toast.show(result.Message);
        navigation.navigate('Home',{
          screen:'buy',
          params:{
            purchase:'success'
          }
        })
        setLoading(false);
      }
      else{
        setPaymentUrl(result.Data.PaymentURL);
        setPaymentModal(true);
        setLoading(false);
      }
    } else {
      if(result?.Message){
      toast.show(result.Message);
      }
      else{
        toast.show(result.msg)
      }
      setLoading(false);
    }
  };

  const completePayment = async () => {
    const data = {
      id: item.id,
      type: 'wallet',
    };
    const token = await getToken();
    const instance = new BuyContoller();
    const result = await instance.purchasePackage(data, token);
    if (result.status === 'success') {
      toast.show(result.msg);
      setLoading(false);
    } else {
      toast.show(result.msg);
      setLoading(false);
    }
  };

  return (
    <>
      <PageLoader loading={loading} />

      <View style={{marginTop: Platform.OS === 'android' ? 10 : 70}}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home',{screen:'buy'})}
            style={{position: 'absolute', left: 0}}>
            <Image
              source={assets.back}
              style={{width: 16, height: 16, marginLeft: 15, marginTop: 2}}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 16}}>PAYMENT METHOD</Text>
        </View>

        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '80%',
            height: height - 150,
            alignSelf: 'center',
            paddingBottom: 20,
          }}>
          {Platform.OS === 'ios' && (
            <CurvedGreyButton
              label={
                <>
                  <Image
                    source={assets.apple}
                    style={{tintColor: '#fff', height: 24, width: 24}}
                  />
                  <Text style={{paddingLeft: 5}}> PAY</Text>
                </>
              }
              style={{marginTop: 15, borderRadius: 12}}
              onPress={() => payNow('apple')}
            />
          )}

          <CurvedGreyButton
            label={
              <>
                <Image source={assets.google} style={{height: 24, width: 24}} />
                <Text> PAY</Text>
              </>
            }
            style={{marginTop: 15, borderRadius: 12}}
            onPress={() => payNow('gpay')}
          />

          <CurvedGreyButton
            label={
              <>
              <Image source={assets.wallet} style={{height: 24, width: 24}} />
              <Text >{' '}WALLET</Text>
              </>
            }
            style={{marginTop: 15, borderRadius: 12}}
            onPress={() => payNow('wallet')}
          />

          <CurvedGreyButton
            label={
              <>
                {/* <Text style={{fontSize: 16, width: '100%'}}>
                 VISA MASTER
                </Text> */}
                <Image source={assets.visamaster} style={{height:24,width:80}} />
              </>
            }
            style={{marginTop: 15, borderRadius: 12}}
            onPress={() => payNow('debit')}
          />
           {/* <CurvedGreyButton
            label={
              <> */}
                {/* <Text style={{fontSize: 16, width: '100%'}}>
                 QATAR DEBIT CARD
                </Text> */}
                {/* <Image source={assets.naps} style={{height:22,width:60}} /> */}
              {/* </>
            }
            style={{marginTop: 15, borderRadius: 12}}
            onPress={() => payNow('naps')}
          /> */}
        </View>
      </View>

      <Modal
        visible={paymentModal}
        onDismiss={() => setPaymentModal(false)}
        style={{height: 'auto'}}>
        <View style={styles.modalBox1}>
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderColor: '#161415',
              marginTop: 70,
            }}>
            <TouchableOpacity onPress={() => setPaymentModal(false)}>
              <Image
                source={assets.back}
                style={{width: 16, height: 16, marginLeft: 15, marginTop: 15}}
              />
            </TouchableOpacity>

            <Text
              style={{
                padding: 15,
                fontSize: 16,
                color: '#161415',
                fontFamily: 'Gotham-Medium',
                textAlign: 'center',
              }}>
              PAY
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              bottom: 0,
              height: height,
              backgroundColor: '#f9f9f9',
            }}>
            <WebView
              source={{
                uri: paymentUrl,
                headers: {
                  Authorization: 'Bearer ' + getUserToken(),
                  Accept: 'application/json',
                },
              }}
              onNavigationStateChange={data => checkResponse(data)}
              startInLoadingState={true}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default Pay;

const styles = StyleSheet.create({
  modalBox1: {
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 0,
  },
});
