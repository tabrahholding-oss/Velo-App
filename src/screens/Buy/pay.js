import React, {useContext, useEffect, useRef, useState} from 'react';
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
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {BuyContoller} from '../../controllers/BuyController';
import {useToast} from 'react-native-toast-notifications';
import PageLoader from '../../components/PageLoader';
import WebView from 'react-native-webview';
import {Modal} from 'react-native-paper';
import {ProfileController} from '../../controllers/ProfileController';
import {API_BASE, API_SUCCESS} from '../../config/ApiConfig';
import {useNavigation} from '@react-navigation/native';

import {
  GooglePayButton,
  GooglePayButtonConstants,
  PaymentRequest,
} from "@google/react-native-make-payment";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

/** Injected into the DDC page — listens for profile.complete and relays device data to RN. */
const DDC_INJECTED_JS = `
(function() {
  window.addEventListener('message', function(e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.MessageType === 'profile.complete') {
        var deviceData = {
          browserLanguage: navigator.language || 'en-US',
          colorDepth: screen.colorDepth || 24,
          screenHeight: screen.height,
          screenWidth: screen.width,
          timeDifference: new Date().getTimezoneOffset(),
        };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'DDC_COMPLETE',
          sessionId: d.Nonce || '',
          deviceData: deviceData,
        }));
      }
    } catch(err) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DDC_FAILED', error: err.message }));
    }
  });
})();
true;
`;

/** Injected into the step-up (3DS challenge) page — listens for payment.validated. */
const CHALLENGE_INJECTED_JS = `
(function() {
  window.addEventListener('message', function(e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.MessageType === 'payment.validated') {
        var cancelled =
          d.Payment &&
          d.Payment.ExtendedData &&
          d.Payment.ExtendedData.ChallengeCancel === '01';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'CHALLENGE_COMPLETE',
          success: !cancelled,
        }));
      }
    } catch(err) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CHALLENGE_FAILED', error: err.message }));
    }
  });
})();
true;
`;

const Pay = props => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState();
  const {getToken} = useContext(UserContext);
  const [paymentUrl, setPaymentUrl] = useState();
  const [paymentModal, setPaymentModal] = useState(false);
  const [user, setUser] = useState({});

  const navigation = useNavigation();

  const [webViewMode, setWebViewMode] = useState(null);
  const [webViewUrl, setWebViewUrl] = useState("");
  const [webViewToken, setWebViewToken] = useState("");
  const [transactionId, setTransactionId] = useState("");


  const formatPayAmount = value => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed.toFixed(2);
  };

  const [amount, setAmount] = useState(item?.attributes?.amount);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const timerRef = useRef(null);


  const paymentIdRef = useRef("");
  const paymentTokenRef = useRef("");
  const cardNetworkRef = useRef("");
  const deviceDataRef = useRef("");


  const toast = useToast();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      const routeItem = props.route.params.item;
      setItem(routeItem);
      setAmount(formatPayAmount(routeItem?.attributes?.amount));
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

  const showGooglePaySuccess = () => {
    setIsLoading(false);
    setPaymentSuccessModal(true);
    setTimeout(() => {
      setPaymentSuccessModal(false);
      toast.show('Package purchased successfully');
      navigation.navigate('Home', {
        screen: 'Buy',
        params: {
          purchase: 'success',
        },
      });
    }, 2000);
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
    } 
    // else if (val === 'apple') {
    //   completePaymentDebit('ApplePay');
    // } 
    else if (val === 'gpay') {
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

  useEffect(() => {
    if (webViewMode === "challenge") {
      setTimer(0);
      setStartTimer(true);
    } else {
      setStartTimer(false);
    }
  }, [webViewMode]);

  const handleStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/skipcash/gp/status?id=${paymentIdRef.current}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const json = await response.json();
      console.log('handleStatus response -> ', json);
      if (json?.resultObj?.isFinished === true && json?.resultObj?.statusId === 2) {
        setStartTimer(false);
        setWebViewMode(null);
        showGooglePaySuccess();
      } else {
        setIsLoading(false);
        Alert.alert('Payment Failed', 'Payment could not be completed.');
      }
    } catch (err) {
      console.log('Error calling /status', err);
      setIsLoading(false);
      Alert.alert('Payment Failed');
    }
  };

  const buildGooglePayRequest = payAmount => ({
    apiVersion: 2,
    apiVersionMinor: 0,
    merchantInfo: {
      merchantName: "Velo",
      merchantId: "BCR2DN5T37LY3XKH",
    },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPrice: payAmount,
      currencyCode: "QAR",
      countryCode: "QA",
    },
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: [
            // "AMEX",
            // "DISCOVER",
            // "INTERAC",
            // "JCB",
            "MASTERCARD",
            "VISA",
          ],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "cybersource",
            gatewayMerchantId: "qnb_skipcag_qar",
          },
        },
      },
    ],
  });

  const checkCanMakePayment = () => {
    const payAmount = formatPayAmount(item?.attributes?.amount);
    if (!payAmount) {
      toast.show('Invalid payment amount');
      return;
    }

    const googlePayRequest = buildGooglePayRequest(payAmount);
    const paymentMethods = [
      { supportedMethods: "google_pay", data: googlePayRequest },
    ];
    const paymentDetails = {
      total: { amount: { currency: "QAR", value: payAmount } },
    };

    console.log('Google Pay request:', googlePayRequest);

    const paymentRequest = new PaymentRequest(paymentMethods, paymentDetails);
    setIsLoading(true);
    paymentRequest.canMakePayment().then((canMakePayment) => {
      console.log(canMakePayment, 'canMakePayment');
      if (canMakePayment) {
        paymentRequest
          .show()
          .then(async response => {
            console.log(response, 'response');
            const paymentToken =
              response.paymentMethodData.tokenizationData.token;
            const cardNetwork = response.paymentMethodData.info.cardNetwork;
            console.log('Card network', cardNetwork);
            console.log('Payment token', paymentToken);
            await handleGPPreparePayment(paymentToken, cardNetwork);
          })
          .catch(err => {
            console.log('Error calling show()', err?.message || err);
            if (err?.message !== 'CANCELED') {
              toast.show('Google Pay failed. Please try again.');
            }
            setIsLoading(false);
          });
      } else {
        console.log('Google Pay unavailable');
        toast.show('Google Pay is not available on this device');
        setIsLoading(false);
      }
    }).catch(err => {
      console.log('Error calling canMakePayment()', err?.message || err);
      toast.show('Google Pay is not available on this device');
      setIsLoading(false);
    });
  };

  const handleGPPreparePayment = async (paymentToken, cardNetwork) => {
    paymentTokenRef.current = paymentToken;
    cardNetworkRef.current = cardNetwork;
    let packageId = item.id;
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/skipcash/gp/package/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ package_id: packageId }),
      });
      const json = await response.json();
      console.log("handleGPPreparePayment response -> ", json);
      if (json?.transaction_id) {
        setTransactionId(json?.transaction_id);
        handlePaySetup(paymentToken, cardNetwork);
      }
    } catch (error) {
      console.log('Error calling /preparePayment', error);
      setIsLoading(false);
    }
  };
  
  const handlePaySetup = async (paymentToken, cardNetwork) => {
    paymentTokenRef.current = paymentToken;
    cardNetworkRef.current = cardNetwork;
    try {
      const body = {
        amount,
        paymentToken,
        cardNetwork,
        userAgent: Platform.OS + "/" + Platform.Version,
        transactionId: transactionId
      };
      console.log("handlePaySetup body -> ", body);
      setIsLoading(true);
      fetch(`${API_BASE}/skipcash/gp/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((response) => {
          console.log("handlePaySetup response -> ", response);
          const ro = response?.resultObj;
          if (ro?.paymentId) {
            paymentIdRef.current = ro.paymentId;
          }
          if (ro?.deviceDataCollectionURL && ro?.accessToken) {
            setWebViewUrl(ro.deviceDataCollectionURL);
            setWebViewToken(ro.accessToken);
            setWebViewMode('ddc');
          } else {
            setIsLoading(false);
            Alert.alert('Payment Failed', 'Unable to start payment setup.');
          }
        })
        .catch((err) => {
          console.log('Error calling /setup', err);
          setIsLoading(false);
          Alert.alert('Payment Failed', 'Unable to start payment setup.');
        });
    } catch (error) {
      console.log('Error calling /setup', error);
      setIsLoading(false);
    }
  };

  const handleEnroll = (deviceData) => {
    const body = {
      paymentId: paymentIdRef.current,
      paymentToken: paymentTokenRef.current,
      cardNetwork: cardNetworkRef.current,
      deviceData,
    };
    console.log("handleEnroll body -> ", body);
    fetch(`${API_BASE}/skipcash/gp/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        const json = await response.json();
        console.log("handleEnroll response -> ", json);
        const ro = json?.resultObj;


        if (ro?.accessToken && ro?.stepUpUrl) {
          setWebViewUrl(ro.stepUpUrl);
          setWebViewToken(ro.accessToken);
          setWebViewMode("challenge");
        } else if (ro?.isFinished && ro?.statusId === 2) {
          handlePay();
        } else {
          setIsLoading(false);
          Alert.alert('Payment Failed -> ' + (ro?.visaId || ''));
        }
      })
      .catch((err) => {
        console.log('Error calling /enroll', err);
        setIsLoading(false);
        Alert.alert('Payment Failed');
      });
  };

  const handleMessage = (event) => {
    try {
      console.log("handleMessage raw ->", event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "DDC_COMPLETE") {
        console.log(
          "DDC complete, sessionId:",
          data.sessionId,
          "deviceData:",
          data.deviceData,
        );
        setWebViewMode(null);
        deviceDataRef.current = data.deviceData;
        handleEnroll(data.deviceData);
      } else if (data.type === 'DDC_FAILED') {
        console.log('DDC failed:', data.error);
        setWebViewMode(null);
        setIsLoading(false);
        Alert.alert('Payment Failed', 'Device verification failed.');
      } else if (data.type === 'CHALLENGE_COMPLETE') {
        console.log('Challenge complete, success:', data.success);
        setWebViewMode(null);
        if (data.success) {
          handleStatus();
        } else {
          setIsLoading(false);
          Alert.alert('Payment Failed', '3DS challenge was not completed.');
        }
      } else if (data.type === 'CHALLENGE_FAILED') {
        console.log('Challenge failed:', data.error);
        setWebViewMode(null);
        setIsLoading(false);
        Alert.alert('Payment Failed');
      }
    } catch (error) {
      console.log("handleMessage error:", error);
    }
  };

  const parseApiJson = async (response, label) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log(
        `${label} non-JSON response:`,
        response.status,
        text.slice(0, 300),
      );
      throw new Error(
        `Server returned ${response.status} instead of JSON for ${label}`,
      );
    }
  };

  const handlePay = async() => {
  const accessToken =  webViewToken;

    const payAmount = item?.attributes?.amount;
  

    try {
      const token = await getToken();
      const body = {
        amount: payAmount,
        token: accessToken,
      };
      console.log('handlePay body -> ', body);

      const response = await fetch(`${API_BASE}/skipcash/gp/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(body),
      });

      const json = await parseApiJson(response, '/skipcash/gp/pay');
      console.log('handlePay response -> ', json);

      if (!response.ok) {
        setIsLoading(false);
        Alert.alert(
          'Payment Failed',
          json?.message || json?.Message || `HTTP ${response.status}`,
        );
        return;
      }

      if (json?.returnCode == 200) {
        await handleStatus();
      } else {
        setIsLoading(false);
        Alert.alert(
          'Payment Failed',
          json?.resultObj?.visaId || json?.message || json?.Message || '',
        );
      }
    } catch (err) {
      console.log('Error calling /pay', err);
      setIsLoading(false);
      Alert.alert('Payment Failed', err?.message || 'Unable to complete payment');
    }
  };

  const isWebViewOpen = webViewMode !== null && webViewUrl && webViewToken;
  const isDdc = webViewMode === "ddc";

  return (
    <>
      <PageLoader loading={loading} />

      {isLoading && (
        <View style={styles.gpayProcessingOverlay}>
          <View style={styles.gpayProcessingBox}>
            <ActivityIndicator size="large" color="#161415" />
            <Text style={styles.gpayProcessingText}>
              Your payment is processing
            </Text>
          </View>
        </View>
      )}

      <Modal
        visible={paymentSuccessModal}
        dismissable={false}
        contentContainerStyle={styles.successModalContainer}>
        <View style={styles.successModalBox}>
          <Text style={styles.successModalTitle}>Payment Successful</Text>
          <Text style={styles.successModalMessage}>
            Package purchased successfully
          </Text>
        </View>
      </Modal>

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
          {/* {Platform.OS === 'ios' && (
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
          )} */}

          {Platform.OS === 'android' && (
          <GooglePayButton
            style={styles.googlepaybutton}
            onPress={checkCanMakePayment}
            allowedPaymentMethods={
              buildGooglePayRequest(amount || '0.00').allowedPaymentMethods
            }
            theme={GooglePayButtonConstants.Themes.Dark}
            type={GooglePayButtonConstants.Types.Buy}
            radius={4}
          />
          )}
          {/* <CurvedGreyButton
            label={
              <>
                <Image source={assets.google} style={{height: 24, width: 24}} />
                <Text> PAY</Text>
              </>
            }
            style={{marginTop: 15, borderRadius: 12}}
            onPress={() => payNow('gpay')}
          /> */}

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

        {/* Full-screen challenge WebView — rendered in a Modal so it overlays everything */}
        <Modal
        visible={isWebViewOpen && !isDdc}
        transparent={false}
        animationType="slide"
        statusBarTranslucent
      >
        <WebView
          source={{
            uri: webViewUrl,
            method: "POST",
            body: `JWT=${encodeURIComponent(webViewToken)}`,
          }}
          injectedJavaScriptBeforeContentLoaded={CHALLENGE_INJECTED_JS}
          injectedJavaScript={CHALLENGE_INJECTED_JS}
          onMessage={handleMessage}
          onError={(e) => console.log("Challenge WebView error", e.nativeEvent)}
          onHttpError={(e) =>
            console.log(
              "Challenge WebView HTTP error",
              e.nativeEvent.statusCode,
            )
          }
          style={styles.challengeWebView}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
        />
      </Modal>

      {/* Hidden DDC WebView — container is off-screen so layout is never affected */}
      {isWebViewOpen && isDdc && (
        <View style={styles.ddcContainer}>
          <WebView
            source={{
              uri: webViewUrl,
              method: "POST",
              body: `JWT=${encodeURIComponent(webViewToken)}`,
            }}
            injectedJavaScriptBeforeContentLoaded={DDC_INJECTED_JS}
            onMessage={handleMessage}
            onLoad={() => console.log("DDC WebView loaded")}
            onError={(e) => console.log("DDC WebView error", e.nativeEvent)}
            onHttpError={(e) =>
              console.log("DDC WebView HTTP error", e.nativeEvent.statusCode)
            }
            style={styles.ddcWebView}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
          />
        </View>
      )}

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
  googlepaybutton: {
    width: width - 80,
    height: 48,
    backgroundColor:'#000000',
    borderRadius:12,
  },
  gpayProcessingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpayProcessingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: width * 0.7,
  },
  gpayProcessingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    textAlign: 'center',
  },
  successModalContainer: {
    marginHorizontal: 32,
  },
  successModalBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  successModalTitle: {
    fontSize: 18,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    marginBottom: 10,
  },
  successModalMessage: {
    fontSize: 14,
    color: '#161415',
    fontFamily: 'Gotham-Light',
    textAlign: 'center',
  },
});
