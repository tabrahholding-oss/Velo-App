import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {JourneyContoller} from '../../controllers/JourneyController';
import PageLoader from '../../components/PageLoader';
import {API_SUCCESS} from '../../config/ApiConfig';

const Journey = ({navigation}) => {
  const [data, setData] = useState([{}, {}, {}]);
  const [locations, setLocations] = useState([]);
  const {getToken} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [bedges, setBedges] = useState([]);
  const [allBadges, setAllBadges] = useState();

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getBookings();
      getBadges();
    });
    return focusHandler;
  }, []);

  const getBookings = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new JourneyContoller();
    const result = await instance.getAllBooking(token);
    setLoading(false);
    console.log(result, 'resultresult');
    setLocations(result.locations);
    setTotal(getTotal(result.locations));
  };

  const getBadges = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new JourneyContoller();
    const result = await instance.getAllBedges(token);
    setLoading(false);
    const mybedge = result.badges.filter(item => item?.status === true);
    setBedges(mybedge);
  };

  const getTotal = allLocation => {
    let totalVal = 0;
    allLocation.forEach(element => {
      totalVal = totalVal + element.bookings_count;
    });
    return totalVal;
  };

  return (
    <>
      <PageLoader loading={loading} />
      <PageContainer>
        <ScrollView contentContainerStyle={{paddingHorizontal: 10}}>
          <View style={styles.totalClass}>
            <Text style={styles.subTitle}>Your Journey</Text>
            <Text style={styles.title}>{total}</Text>
            <Text style={styles.para}>Total Classes</Text>
          </View>
          <View style={styles.rideBoxes}>
            {locations.map((item, index) => (
              <View style={styles.rideBox} key={index + 'booking'}>
                <Text style={styles.rideText1}>{item.name}</Text>
                <Text style={styles.count}>{item.bookings_count}</Text>
              </View>
            ))}
          </View>

          <View style={styles.achBoxTitle}>
            <Text style={styles.achTitle}>Achievements</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Achievement')}>
              <Text style={styles.achTitle}>See all</Text>
            </TouchableOpacity>
          </View>

          <>
            {bedges?.length > 0 ? (
              <View style={styles.achBoxes}>
                {bedges?.map((item, index) => (
                  <View
                    key={index + 'in'}
                    style={index > 2 ? {display: 'none'} : styles.achBox}>
                    <ImageBackground
                      source={{uri: API_SUCCESS + '/' + item.image}}
                      resizeMode="contain"
                      style={styles.image}></ImageBackground>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.achBoxes}>
                <Text
                  style={[styles.achTitle, {marginVertical: 50, fontSize: 10}]}>
                  You don't have any achievement's yet.
                </Text>
              </View>
            )}
          </>
        </ScrollView>
      </PageContainer>
    </>
  );
};
export default Journey;
const styles = StyleSheet.create({
  totalClass: {
    marginVertical: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 82,
    fontFamily: 'Gotham-Medium',
    lineHeight: 82,
    marginTop: 5,
    color: '#161415',
  },
  subTitle: {
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  para: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    marginTop: -2,
    color: '#161415',
  },
  rideBoxes: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row-reverse',
  },
  rideBox: {
    backgroundColor: '#fff',
    textAlign: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#161415',
    shadowOffset: {width: 2, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rideText1: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  count: {
    fontSize: 32,
    fontFamily: 'Gotham-Medium',
    textAlign: 'center',
    marginTop: 5,
    color: '#161415',
  },
  achBoxes: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  achBoxTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 70,
    marginBottom: 15,
  },
  achTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  achBox: {
    backgroundColor: '#f2f2f2',
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    overflow: 'hidden',
  },
  achImg: {
    width: 28,
    height: 28,
    tintColor: '#000',
    alignSelf: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
