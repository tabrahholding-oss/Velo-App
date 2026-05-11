import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {
  CurvedGreyButton,
  RoundedDarkButton,
  RoundedGreyButton,
  RoundedThemeButton,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {PackageItem} from '../../components/PackageItem';
import {BuyContoller} from '../../controllers/BuyController';
import {UserContext} from '../../../context/UserContext';
import {Modal} from 'react-native-paper';
import WebView from 'react-native-webview';
import {useToast} from 'react-native-toast-notifications';
import {API_BASE, API_SUCCESS} from '../../config/ApiConfig';
import {ActivePackageItem} from '../../components/PackageItem/ActivePackageItem';
import PageLoader from '../../components/PageLoader';
import {assets} from '../../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';
import analytics from '@react-native-firebase/analytics';

const height = Dimensions.get('window').height;

const Buy = props => {
  const [active, setActive] = useState('All');
  const {getToken, getUser} = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);
  const [userPackages, setUserPackages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartModal, setCartModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [refresh, setRefresh] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      console.log('Buy Scree');
      if (props.route.params !== undefined) {
        setActive('My');
      } else {
        setActive('All');
      }
      getPackages();
      getUserAllPackages();
    });
    return focusHandler;
  }, [props.route.params, navigation]);

  useEffect(() => {
    getUserAllPackages();
    getPackages();
  }, [refresh]);

  const getPackages = async () => {
    const token = await getToken();
    const instance = new BuyContoller();
    const result = await instance.getAllPackages(token);

    if (result?.data?.length) {
      setData(result.data);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const getUserAllPackages = async () => {
    const token = await getToken();
    const instance = new BuyContoller();
    const result = await instance.getUserAllPackages(token);
    console.log(result, 'users package');
    if (result.status === 'error') {
      setUserPackages([]);
      setErrorMessage(result.msg);
    } else {
      setUserPackages(result);
    }
  };

  const logCustomeEvent = async (eventName, name, amount) => {
    const {gender} = await getUser();
    await analytics().logEvent(eventName, {
      name: name,
      amount: amount,
      gender: gender,
    });
  };

  const selectItem = item => {
    logCustomeEvent(
      'MostPackageClicked',
      item?.attributes?.name,
      item?.attributes?.amount,
    );
    setSelectedItem(item);
    setCartModal(true);
  };

  const bookingSummery = () => {
    if (selectedItem && selectedItem.attributes) {
      return (
        <View>
          <View style={styles.summary}>
            {/* <Text style={[styles.hding, {marginTop: 0, marginBottom: 10}]}>
              Booking Summary
            </Text> */}
            {selectedItem.attributes.disclaimer ?
            <Text style={{marginLeft:10,marginTop:-10,color: '#161415',fontFamily: 'Gotham-Light',fontSize:12,lineHeight:16}}>
              {selectedItem.attributes.disclaimer}
            </Text>:''}
            <View style={styles.summaryLine}>
              <Text style={styles.stext1}>
                {selectedItem?.attributes?.type !== 'unlimited' ? (
                  selectedItem?.attributes?.type === 'ride' ? (
                    ' Class'
                  ) : (
                    selectedItem?.attributes?.type
                  )
                ) : (
                  <></>
                )}
              </Text>
              <Text style={styles.stext2}>
                {selectedItem.attributes.rides}{' '}
              </Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.stext1}>{selectedItem.attributes.name}</Text>
              <Text style={styles.stext2}>
                {selectedItem.attributes.amount} QR
              </Text>
            </View>

            <View style={styles.summaryLine}>
              <Text style={styles.stext1}>VALIDITY</Text>
              <Text style={styles.stext2}>
                {selectedItem.attributes.validity} DAYS{' '}
              </Text>
            </View>
              {selectedItem.attributes.studio_start_time ?
            <View style={styles.summaryLine}>
              <Text style={styles.stext1}>Booking Timing</Text>
              <Text style={styles.stext2}>
                {selectedItem.attributes.studio_start_time} to {selectedItem.attributes?.studio_end_time}
              </Text>
            </View>
            :
            <></>}

            <View style={styles.summaryLineTotal}>
              <Text style={styles.stext1Bold}>TOTAL</Text>
              <Text style={styles.stext2Bold}>
                {selectedItem.attributes.amount} QR
              </Text>
            </View>
          </View>
          <View style={styles.payBtnBox}>
            {/* <RoundedGreyButton
              label="GO TO CHECKOUT"
              loading={payLoading2}
              onPress={() => {
                // setCartModal(false);
                // setPayModal(true);
                navigation.navigate('Pay', {item: selectedItem})
              }}
            /> */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => {
                setCartModal(false);
                navigation.navigate('Pay', {item: selectedItem});
              }}>
              <Text style={styles.btnText}>GO TO CHECKOUT</Text>
              <Image source={assets.chevron} style={styles.btnImage} />
            </TouchableOpacity>

            {/* <RoundedGreyButton
              label="PAY FROM CREDIT/DEBIT CARD"
              loading={payLoading1}
              onPress={() => PayFromCard()}
            />
            <RoundedGreyButton
              label="PAY FROM WALLET"
              loading={payLoading2}
              onPress={() => PayFromWallet()}
            /> */}
          </View>
        </View>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <PageLoader loading={loading} />
      <View
        style={{
          padding: 10,
          backgroundColor: '#fff',
          display: 'flex',
          height: height < 700 ? height - 95 : height - 135,
          paddingBottom: 10,
        }}>
        <View style={{paddingHorizontal: 10}}>
          <View style={styles.tab}>
            {active === 'All' ? (
              <RoundedGreyButton
                label={'ALL PACKAGES'}
                onPress={() => console.log()}
                style={styles.tabBtn}
              />
            ) : (
              <RoundedThemeButton
                label={'ALL PACKAGES'}
                onPress={() => setActive('All')}
                style={styles.tabBtn}
              />
            )}
            {active === 'My' ? (
              <RoundedGreyButton
                label={'My PACKAGES'}
                onPress={() => console.log()}
                style={styles.tabBtn}
              />
            ) : (
              <RoundedThemeButton
                label={'MY PACKAGES'}
                onPress={() => setActive('My')}
                style={styles.tabBtn}
              />
            )}
          </View>
          {active === 'All' ? (
            <View style={styles.classesList}>
              <FlatList
                data={data}
                // pagingEnabled
                numColumns={2}
                showsVerticalScrollIndicator={false}
                decelerationRate={'normal'}
                contentContainerStyle={{paddingBottom: 80}}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                }}
                renderItem={({item}, key) => (
                  <PackageItem key={key} item={item} onPress={selectItem} />
                )}
              />
            </View>
          ) : (
            <View style={styles.classesList}>
              {userPackages?.length ? (
                <ScrollView onScrollBeginDrag={() => setRefresh(!refresh)}>
                  {userPackages.map((item, index) => (
                    <ActivePackageItem key={index + 'my'} item={item} />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={cartModal}
        onDismiss={() => setCartModal(false)}
        style={{height: 'auto', justifyContent: 'flex-end', marginBottom: 0}}>
        <View style={styles.modalBox}>
          {/* <View style={styles.titleHeading}>
            <Text style={styles.titleText}>CHECKOUT</Text>
          </View> */}

          <ScrollView contentContainerStyle={styles.modalContent1}>
            {bookingSummery()}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};
export default Buy;

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  errorBox: {
    marginTop: '50%',
  },
  modalBox: {
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    //  marginTop: 160,
  },
  modalBoxFull: {
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#fff',
  },
  modalBox1: {
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 60,
  },
  titleHeading: {
    flexDirection: 'row',
  },
  titleText: {
    paddingHorizontal: 10,
    paddingTop: 30,
    fontSize: 22,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
  },
  closeBtnBox: {
    padding: 15,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  closeText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#161415',
  },
  modalContent: {
    padding: 10,
    bottom: 0,
    height: height - 100,
    backgroundColor: '#ffffff',
  },
  modalContent1: {
    padding: 10,
    bottom: 0,
    height: 'auto',
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Gotham-Medium',
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  tabBtn: {
    width: width / 2 - 30,
  },
  classesList: {
    paddingBottom: 130,
    paddingTop: 10,
  },
  calander: {
    marginBottom: 20,
  },
  summary: {
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: 20,
  },
  summaryLine: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
    paddingTop: 0,
    paddingBottom: 0,
  },
  summaryLineTotal: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    borderBottomWidth: 1,
  },
  stext2: {
    position: 'absolute',
    right: 0,
    lineHeight: 40,
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    marginTop: 0,
    textTransform: 'uppercase',
  },
  stext3: {
    position: 'absolute',
    right: 100,
    lineHeight: 40,
  },
  stext1: {
    lineHeight: 40,
    color: '#161415',
    fontSize: 14,
    marginTop: 0,
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
    minHeight: 40,
  },
  stext1Bold: {
    lineHeight: 40,
    fontWeight: 'bold',
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
  },
  stext2Bold: {
    position: 'absolute',
    right: 20,
    lineHeight: 40,
    fontWeight: 'bold',
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
  },
  payBtnBox: {
    justifyContent: 'space-around',
    marginBottom: 50,
  },
  checkoutBtn: {
    backgroundColor: '#161415',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
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
