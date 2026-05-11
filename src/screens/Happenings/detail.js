import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  RoundedDarkButton,
  RoundedGreyButton,
  RoundedThemeButton,
} from '../../components/Buttons';
import {useNavigation} from '@react-navigation/native';
import {API_SUCCESS} from '../../config/ApiConfig';
import moment from 'moment';
import {UserContext} from '../../../context/UserContext';
import {HappeningContoller} from '../../controllers/HappeningController';
import PageLoader from '../../components/PageLoader';
import {useToast} from 'react-native-toast-notifications';

const HappeningDetail = props => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState();
  const navigation = useNavigation();
  const {getToken} = useContext(UserContext);
  const toast = useToast();

  useEffect(() => {
    setItem(props.route.params.item);
    console.log(API_SUCCESS + '/' + props.route.params.item?.image)
  }, [props.route.params]);

  const acceptChallenge = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new HappeningContoller();
    const result = await instance.addChallenges(item.id, token);
    setLoading(false);
    if (result.status === 'success') {
      toast.show(result.msg);
      navigation.navigate('HappeningsReport', {item: item});
    }
  };

  return (
    <>
      <PageLoader loading={loading} />
      <View style={styles.mainContainer}>
        <View
          style={{
            paddingHorizontal: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
          <Image
            source={{uri: API_SUCCESS + '/' + item?.image}}
            style={styles.itemImage}
          />
        </View>
        <View style={styles.detailBox}>
          <View style={styles.detailInnerBox}>
            <View
              style={{
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={styles.title}>{item?.title}</Text>
                <Text style={styles.subTitle}>Start from</Text>
                <Text style={styles.subTitle1}>
                  {moment(item?.start_date).format('DD MMM, YYYY')} -{' '}
                  {moment(item?.end_date).format('DD MMM, YYYY')}
                </Text>
              </View>
            </View>
            <Text style={styles.desc}>{item?.description}</Text>
            {item?.type === 'challenge_event' && (
              <RoundedGreyButton
                style={styles.buyBtn}
                label={`ENROLL NOW`}
                onPress={() => acceptChallenge()}
              />
            )}
          </View>
        </View>
      </View>
    </>
  );
};
export default HappeningDetail;

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 10 : 60,
    fontFamily: 'Gotham-Black',
    color: '#161415',
  },
  itemImage: {
    width: width,
    height: 260,
    alignSelf: 'center',
    marginTop: 0,
  },
  mainContainer: {
    backgroundColor: '#e2e3e5',
    height: '100%',
    display: 'flex',
  },
  addToCart: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    height: 24,
    borderRadius: 6,
    width: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  incrementBox: {
    backgroundColor: '#161415',
    padding: 3,
    height: 24,
    width: 24,
    textAlign: 'center',
    borderRadius: 6,
  },
  incText: {
    color: '#fff',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    lineHeight: 17,
  },
  decrementBox: {
    backgroundColor: '#161415',
    padding: 3,
    height: 24,
    width: 24,
    textAlign: 'center',
    borderRadius: 6,
  },
  decrText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    lineHeight: 17,
  },
  qty: {
    textAlign: 'center',
    lineHeight: 24,
    width: 24,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  buyBtn: {
    marginTop: 20,
    backgroundColor: '#ddd',
  },
  detailBox: {
    backgroundColor: '#f2f2f2',
    display: 'flex',
    flex: 1,
    bottom: 0,
    paddingTop: 50,
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  cartBox: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    bottom: 0,
    paddingTop: 20,
    marginTop: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: '15%',
  },
  greyBox: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    textAlign: 'center',
    borderRadius: 15,
  },
  unitTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Medium',
    color: '#000000',
  },
  unit: {
    fontSize: 10,
    fontFamily: 'Gotham-Medium',
    color: '#000000',
    textAlign: 'center',
  },
  detailInnerBox: {
    paddingHorizontal: '15%',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Gotham-Black',
    textTransform: 'uppercase',
    marginBottom: 15,
    color: '#161415',
  },
  subTitle1: {
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  subTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 16,
    fontFamily: 'Gotham-Book',
    color: '#161415',
    marginBottom:3
  },
  desc: {
    fontSize: 12,
    textTransform: 'uppercase',
    lineHeight: 18,
    fontFamily: 'Gotham-Book',
    color: '#161415',
  },
});
