import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RoundedDarkButton2,
  RoundedGreyButton,
  RoundedOutlineButton,
  RoundedRedButton,
} from '../../components/Buttons';
import {useState} from 'react';
import PageLoader from '../../components/PageLoader';
import WebView from 'react-native-webview';
import {API_LAYOUT, API_SUCCESS} from '../../config/ApiConfig';
import {useNavigation} from '@react-navigation/native';
import {useToast} from 'react-native-toast-notifications';
import {UserContext} from '../../../context/UserContext';
import {ModalView} from '../../components/ModalView';
import {ClassContoller} from '../../controllers/ClassController';
import {BuyContoller} from '../../controllers/BuyController';
import {ProfileController} from '../../controllers/ProfileController';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const ClassDetail = props => {
  console.log('props in class Detail   ' , props)
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState();
  const [pageUrl, setPageUrl] = useState('');
  const {getToken} = useContext(UserContext);
  const toast = useToast();
  const navigation = useNavigation();
  const [payModal, setPayModal] = useState(false);
  const [item, setItem] = useState();
  const [userPackages, setUserPackages] = useState();
  const [forceReload, setForseReload] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [loadFooter, setLoadFooter] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [uid, setUid] = useState();
  const [booking, setBooking] = useState();
  const [selectedSeatText, setSelectedSeatText] = useState();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setPageUrl('');
      setItem();
      setWaiting(false);
      setSelectedSeatText('');
      setSelectedSeat();
      setForseReload(!forceReload);
      loadClassLayout();
      getDetail();
      getUserAllPackages();
      setPayModal(false);
    });
    return focusHandler;
  }, [props.route.params, navigation]);

  useEffect(() => {
    setPageUrl('');
    setItem();
    setSelectedSeat();
    setForseReload(!forceReload);
    loadClassLayout();
    getDetail();
    getUserAllPackages();
  }, [refresh]);

  useEffect(() => {}, [setItem, item]);

  const getUserAllPackages = async () => {
    const token = await getToken();
    const instance = new BuyContoller();
    const result = await instance.getUserAllPackages(token);
    if (result.status === 'error') {
      setUserPackages([]);
    } else {
      setUserPackages(result);

      var arr = [];
      for (var i = 0; i < result?.length; i++) {
        console.log(props.route.params.item.location_id,'ssss')

        let isStudio = true;
        let checkStudio = [];
        if(result[i].attributes.studios?.length){
          checkStudio = result[i].attributes.studios.filter(sitem => sitem.location_id === props.route.params.item.location_id);
          if(checkStudio?.length){
            isStudio = true;
          }
          else{
            isStudio = false;
          }
        }

        let isTimeMatch = true;
        if(result[i].attributes.studio_start_time && result[i]?.attributes?.studio_end_time){
          
          let startTime = result[i].attributes.studio_start_time;
          let endTime = result[i].attributes.studio_end_time;
          let checkTime = props.route.params.item.start_time;
          isTimeMatch = isTimeBetween(startTime, endTime, checkTime);
          console.log(isTimeBetween(startTime, endTime, checkTime),'checktime'); // Output: true
        }



        if (result[i].attributes.valid_from === null) {
          if(isStudio === true && isTimeMatch === true){
            arr.push(result[i]);
          }
        } else {
          var valid_from = moment(result[i].attributes.valid_from);
          var valid_to = moment(result[i].attributes.valid_to);
          var nowdate = moment(props.route.params.item.start_date);
          console.log(
            props.route.params.item.start_date,
            valid_from,
            valid_to,
            'validity',
          );

          if (nowdate >= valid_from && nowdate <= valid_to) {
            if(isStudio === true && isTimeMatch === true){
              arr.push(result[i]);
            }
          }
        }
      }
      setUserPackages(arr);
    }
  };

  function isTimeBetween(startTime, endTime, checkTime) {
    const start = moment(startTime, "HH:mm");
    const end = moment(endTime, "HH:mm");
    const check = moment(checkTime, "HH:mm");

    return check.isBetween(start, end, null, '[]');
}

  const getDetail = async () => {
    setLoading(true);
    const token = await getToken();
    const id = props.route.params.item.id;
    const instance = new ClassContoller();
    const result = await instance.getClassDetail(id, token);

    const instance1 = new ProfileController();
    const userDetail = await instance1.getUserDetail(token);

    if (result.class?.attributes?.user_waiting === true) {
      let users = result.class?.attributes?.waitingUsers.filter(
        user => user.user_id === userDetail.user.id,
      );
      setBooking(users[0]);
    }
    console.log(result.class);
    setItem(result.class);
    setLoading(false);
  };

  const loadClassLayout = async () => {
    const newToken = await getToken();
    const id = props.route.params.item.id;
    const pageHeight = height - 100;
    const url =
      API_LAYOUT +
      'app/class-layout?id=' +
      id +
      '&token=' +
      newToken +
      '&height=' +
      pageHeight;
      console.log(url,'urllll')
    setPageUrl(url);
    setLoading(false);
    setOpen(true);
  };

  const checkResponce = data => {
    if (data.url === API_SUCCESS + '/wallet/paymentsuccess') {
      toast.show('Class booked successfully');
      setOpen(false);
      navigation.navigate('Drawer');
    } else if (data.url.includes('transaction_cancelled')) {
      toast.show('Your transaction has been cancelled.');
      setOpen(false);
      navigation.navigate('Drawer');
    }
  };

  const bookNow = async () => {
    if (item?.indoor === 1 && selectedSeat) {
      setPayModal(true);
    } else if (item?.indoor === 0) {
      setPayModal(true);
    } else {
      toast.show('Please select seat.');
    }
  };

  const Checkout = async type => {
    if (waiting === true) {
      const data = {
        classes_id: item.id,
        type: type,
        device: 'mobile',
      };
      completeWaiting(data);
    } else {
      const data = {
        classes_id: item.id,
        type: type,
        seat: selectedSeat,
        seat_text: selectedSeatText,
        device: 'mobile',
      };
      completeBooking(data);
    }
  };

  const CheckoutFromPackage = async value => {
    if (waiting === true) {
      const data = {
        classes_id: item.id,
        type: 'Package',
        device: 'mobile',
        package_id: value.id,
      };
      completeWaiting(data);
    } else {
      const data = {
        classes_id: item.id,
        type: 'Package',
        seat: selectedSeat,
        seat_text: selectedSeatText,
        device: 'mobile',
        package_id: value.id,
      };
      completeBooking(data);
    }
  };

  const completeBooking = async data => {
    setLoading(true);
    const token = await getToken();
    const instance = new ClassContoller();
    const result = await instance.BookClass(data, token);
    console.log(result, 'res');
    if (result.status === 'success') {
      toast.show(result.msg);
      setPayModal(false);
      setLoading(false);
      navigation.goBack();
    } else {
      var value = '';
      if (result.errors) {
        var errors = result.errors;

        if (errors?.seat) {
          value = errors.seat + ' ,';
        }
        if (value === '') {
          value = JSON.stringify(result.error);
        }
      } else {
        value = result.msg;
      }
      toast.show(value);
      setLoading(false);
    }
  };

  const updateBooking = async () => {
    if (selectedSeat) {
      setLoading(true);
      const data = {
        seat: selectedSeat,
        seat_text: selectedSeatText,
        booking_id: item.bookings[0].id,
      };
      const token = await getToken();
      const instance = new ClassContoller();
      const result = await instance.UpdateClass(data, token);
      console.log(result, 'resultresult');
      if (result.status === 'success') {
        toast.show(result.msg);
        setLoading(false);
        setRefresh(!refresh);
      } else {
        toast.show(result.msg);
        setLoading(false);
      }
    } else {
      toast.show('Please select seat.');
    }
  };

  const cancelBooking = async () => {
    setLoading(true);
    let booking_id = '';
    if (item?.attributes?.mine_booking === true) {
      booking_id = item.bookings[0].id;
    }
    if (item?.attributes?.user_waiting === true) {
      booking_id = booking.id;
    }
    const data = {
      booking_id: booking_id,
    };

    const token = await getToken();
    const instance = new ClassContoller();
    const result = await instance.CancelClass(data, token);
    if (result.status === 'success') {
      toast.show(result.msg);
      setLoading(false);
      setCancelModal(false);
      navigation.goBack();
    } else {
      toast.show(result.msg);
      setLoading(false);
    }
  };

  const bookNowInWaing = () => {
    setWaiting(true);
    setLoading(true);
    setTimeout(() => {
      setPayModal(true);
      setLoading(false);
    }, 1000);
  };

  const completeWaiting = async data => {
    setLoading(true);
    const token = await getToken();
    const instance = new ClassContoller();
    const result = await instance.joinWaitingClass(data, token);
    if (result.status === 'success') {
      toast.show(result.msg);
      setPayModal(false);
      setLoading(false);
      navigation.goBack();
    } else {
      toast.show(result.msg);
      setLoading(false);
    }
  };

  const renderButton = () => {
    if (item?.attributes) {
      if (
        item?.attributes?.mine_booking === true &&
        item?.attributes?.user_waiting === false
      ) {
        return (
          <View
            style={{
              textAlign: 'center',
              alignItems: 'center',
              marginTop: item.indoor === 0 ? -20 : -45,
            }}>
            <Text style={{fontSize: 12}}>Booked</Text>
            <RoundedRedButton
              label={'CANCEL'}
              onPress={() => setCancelModal(true)}
              style={{width: 120, marginLeft: 5, marginTop: 5}}
            />
            {item.indoor === 1 && (
              <RoundedDarkButton2
                label={`UPDATE ${item?.location.spot_name}`}
                onPress={updateBooking}
                style={{width: 120, marginLeft: 5, marginTop: 5}}
              />
            )}
          </View>
        );
      } else if (item?.attributes?.user_waiting === true && !!props?.route?.params?.isNotStartingWithinOneHour) {
        return (
          <RoundedDarkButton2
            label={'LEAVE WAITLIST'}
            onPress={cancelBooking}
            style={{width: 120, marginLeft: 5}}
          />
        );
      } else if (
        item.attributes.user_waiting === false &&
        item.attributes.mine_booking === false &&
        item.attributes.booking_count_status.available === 0 &&
        item.attributes.booking_count_status.waiting_available !== 0 &&
        !!props?.route?.params?.isNotStartingWithinOneHour
      ) {
        return (
          <RoundedDarkButton2
            label={'JOIN WAITLIST'}
            onPress={bookNowInWaing}
            theme={{colors: {primary: 'green'}}}
            style={{width: 120, marginLeft: 5, marginTop: 5}}
          />
        );
      } else if (
        (!!props?.route?.params?.isNotStartingWithinOneHour ? item.attributes.booking_count_status.waiting_available === 0 : true) &&
        item.attributes.booking_count_status.available === 0 &&
        ( !!props?.route?.params?.isNotStartingWithinOneHour ?item.attributes.user_waiting === false : true) &&
        item.attributes.mine_booking === false
      ) {
        return (
          <Text style={{fontFamily: 'Gotham-Black', marginTop: 7}}>
            FULLY BOOKED
          </Text>
        );
      } else  {
        return (
          <RoundedDarkButton2
            label={'BOOK NOW'}
            onPress={bookNow}
            style={{width: 120, marginLeft: 5}}
          />
        );
      }
    }
  };

  const renderWaiting = () => {
    if (
      item.attributes.user_waiting === false &&
      item.attributes.mine_booking === false &&
      item.attributes.booking_count_status.available === 0 &&
      item.attributes.booking_count_status.waiting_available !== 0
    ) {
      return (
        <Text style={styles.waitlist}>
          WAITING LIST : {item.attributes.booking_count_status?.waiting}
        </Text>
      );
    } else if (item.attributes.user_waiting === true) {
      return (
        <Text style={styles.waitlist}>WAITING : {booking?.waiting_no}</Text>
      );
    } else {
      return <></>;
    }
  };

  return (
    <SafeAreaView style={{flex:1}}  edges={['left', 'right', 'bottom']}>
      <PageLoader loading={loading} />

      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 0 : 0,
          backgroundColor: '#fff',
          flex:1,
          // height: height - 70,
          paddingBottom: 20,
        }}>
        <View
          style={{
            flex:1,

          }}>
          {pageUrl && (
            <WebView
              style={{flex:1}}
              source={{
                uri: pageUrl,
                forceReload: forceReload,
                headers: {
                  Accept: 'application/json',
                },
              }}
              onMessage={event => {
                console.log('Event inside onMessage.  ', event)
                setSelectedSeat(JSON.parse(event.nativeEvent.data).seat);
                setSelectedSeatText(
                  JSON.parse(event.nativeEvent.data).seat_text,
                );
              }}
              onNavigationStateChange={data => checkResponce(data)}
              startInLoadingState={true}
              onLoadEnd={() => setLoadFooter(true)}
            />
          )}
        </View>
        {loadFooter === true && item ? (
          <View style={styles.footer}>
            {renderWaiting()}
            {item?.attributes?.user_waiting === true ? (
              <Text style={styles.smallPara}>
                YOU WILL AUTOMATICALLY BE ENROLLED IN THE CLASS WHEN THERE IS
                AVAILABILITY
              </Text>
            ) : (
              <Text style={styles.smallPara}>
                THOSE WHO ARRIVE 5 MINS AFTER THE START OF THE CLASS WILL NOT BE
                PERMITTED TO ENTER
              </Text>
            )}
            {renderButton()}
          </View>
        ) : (
          <></>
        )}
      </View>

      <ModalView
        visible={cancelModal}
        heading="CANCEL BOOKING"
        setVisible={() => setCancelModal(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
          zIndex: 999,
        }}>
        <View style={styles.summeryBox}>
          <View style={styles.modalTotalBox}>
            <Text style={{fontSize: 14, textAlign: 'center'}}>
              Are you sure you want to cancel your booking?
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 15,
            }}>
            <RoundedOutlineButton
              label={'NO'}
              onPress={() => setCancelModal(false)}
              style={{width: 100, marginLeft: 5, marginTop: 5}}
            />
            <RoundedGreyButton
              label={'YES'}
              onPress={() => cancelBooking()}
              style={{width: 100, marginLeft: 5, marginTop: 5}}
            />
          </View>
        </View>
      </ModalView>

      <ModalView
        visible={payModal}
        heading="PROCEED TO CHECKOUT"
        setVisible={() => setPayModal(false)}
        style={{
          height: 'auto',
          marginTop: 260,
          justifyContent: 'flex-end',
          marginBottom: 0,
          zIndex: 999,
        }}>
        <View style={styles.summeryBox}>
          {waiting === false ? (
            <>
              {item?.indoor === 1 && (
                <View style={styles.modalTotalBox}>
                  <Text style={styles.priceText}>
                    {item?.location.spot_name}
                  </Text>
                  <Text style={styles.priceText}>
                    {selectedSeatText ? selectedSeatText : selectedSeat}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.modalTotalBox}>
              <Text style={styles.priceText}>Waitlist</Text>
              <Text style={styles.priceText}>
                {item?.attributes?.booking_count_status?.waiting + 1}
              </Text>
            </View>
          )}
          {item?.priceType === 'Amount' && (
            <View style={styles.modalTotalBox}>
              <Text style={styles.priceText}>Amount</Text>
              <Text style={styles.priceText}>{item?.price} QR</Text>
            </View>
          )}

          {item?.priceType === 'Amount' && (
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => Checkout('Wallet')}>
              <Text style={styles.btnText}>Pay from wallet</Text>
              <Text style={styles.btnText}>{item?.price} QR</Text>
            </TouchableOpacity>
          )}
          {item?.priceType === 'Free' && (
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => Checkout('Free')}>
              <Text style={styles.btnText}>Free Checkout</Text>
              <Text style={styles.btnText}>0 QR</Text>
            </TouchableOpacity>
          )}

          {item?.priceType === 'Credit' && (
            <>
              {userPackages && userPackages?.length ? (
                <View>
                  <Text
                    style={[
                      {
                        marginTop: 10,
                        marginBottom: 0,
                        fontSize: 10,
                        textAlign: 'center',
                      },
                    ]}>
                    BOOK FROM PACKAGES
                  </Text>

                  {userPackages.map((item1, index) => (
                    <TouchableOpacity
                      key={index + 'btn'}
                      style={styles.checkoutBtn}
                      onPress={() => CheckoutFromPackage(item1)}>
                      <Text style={styles.btnText}>
                        {item1.attributes.name}
                      </Text>
                      {item.attributes.remaining_rides === 'unlimited' ? (
                        <Text style={styles.btnText}>
                          {item1.attributes.remaining_rides}{' '}
                          {item1.attributes.type !== 'unlimited' &&
                            (item1?.attributes?.type === 'ride' ? (
                              <Text style={{}}>Class</Text>
                            ) : (
                              <Text style={{}}>{item1.attributes.type}</Text>
                            ))}
                        </Text>
                      ) : (
                        <Text style={styles.btnText}>
                          {item1.attributes.remaining_rides}{' '}
                          {/* {item1.attributes.type !== 'unlimited' && (
                            <Text style={{}}>{item1.attributes.type}</Text>
                          )} */}
                          {item1?.attributes?.type !== 'unlimited' ? (
                            item1?.attributes?.type === 'ride' ? (
                              ' Class'
                            ) : (
                              item1?.attributes?.type
                            )
                          ) : (
                            <></>
                          )}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => navigation.navigate('Home', { screen: 'buy' })}>
                  <Text style={styles.btnText}>Purchase Package</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ModalView>
    </SafeAreaView>
  );
};
export default ClassDetail;

const styles = StyleSheet.create({
  smallPara: {
    fontSize: 8,
    fontFamily: 'Gotham-Medium',
    maxWidth: Platform.OS === 'adnroid' ? width - 180 : width - 160,
    lineHeight: 12,
  },
  waitlist: {
    position: 'absolute',
    fontSize: 10,
    left: 15,
    fontFamily: 'Gotham-Medium',
    marginTop: -3,
  },
  footer: {
    paddingHorizontal: 15,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 15,
  },
  checkoutBtn: {
    backgroundColor: '#161415',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
  },
  modalTotalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  summeryBox: {
    width: width - 70,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
