import React, {useContext, useEffect} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {RoundedGreyButton} from '../../components/Buttons';
import {useState} from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PlannerClass} from '../../components/PlannerClass';
import {Heading} from '../../components/Typography';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {NotificationController} from '../../controllers/NotificationController';
import {SkeltonCard} from '../../components/Skelton';
import PageLoader from '../../components/PageLoader';

const Notification = ({navigation}) => {
  const {getToken} = useContext(UserContext);
  const [data, setData] = useState();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      getNotifications();
    });
    return focusHandler;
  }, [refresh]);

  const getNotifications = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new NotificationController();
    const result = await instance.getAllNotification(token);
    setLoading(false);
    setData(result?.data);
    if(result?.count > 0){
      readNotifications();
    }
  };

  const readNotifications = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new NotificationController();
    const result = await instance.readNotification(token);
    setLoading(false);
  };

  const deleteAll = async () => {
    setLoading1(true);
    const token = await getToken();
    const instance = new NotificationController();
    const result = await instance.deleteNotification(token);
    if (result.status === 'success') {
      getNotifications();
      setLoading1(false);
    } else {
      setLoading1(false);
    }
  };

  return (
    <>
      <PageContainer>
        <PageLoader loading={loading1} />
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            marginTop: 5,
          }}>
          <Heading style={{marginVertical: 5}}>Notifications</Heading>
          {data?.length > 0 && 
          <TouchableOpacity onPress={() => deleteAll()}>
            <Heading style={{marginVertical: 5}}>Clear</Heading>
          </TouchableOpacity>
          }
        </View>

        <ScrollView
          contentContainerStyle={{paddingHorizontal: 10, marginTop: 20}}>
          {data?.length > 0 ? (
            <View style={styles.classesList}>
              {data.map((item, index) => (
                <View key={index + 'keyy'} style={styles.notiTitle}>
                  <Image source={assets.vlogoDark} style={styles.img} />
                  <View style={styles.rightBox}>
                    <Text style={styles.titleText}>
                      {item.attributes.title}
                    </Text>
                    <Text style={styles.description}>
                      {item.attributes.message}
                    </Text>
                    <Text style={styles.date}>{item.attributes.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View>
              {loading === true ? (
                <>
                  <SkeltonCard />
                  <SkeltonCard />
                  <SkeltonCard />
                  <SkeltonCard />
                </>
              ) : (
                <>
                  <Text style={styles.noData}>No Record Found.</Text>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </PageContainer>
    </>
  );
};
export default Notification;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  notiTitle: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 5},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    fontFamily: 'Gotham-Book',
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: 30,
  },
  rightBox: {
    width: width - 145,
  },
  titleText: {
    fontFamily: 'Gotham-Medium',
    lineHeight: 16,
    fontSize: 14,
    marginTop: 10,
  },
  noData: {
    fontSize: 14,
    alignSelf: 'center',
    marginTop: height / 2 - 200,
    marginBottom: 20,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Gotham-Book',
    marginTop: 2,
    lineHeight: 16,
  },
  date: {
    fontSize: 12,
    right: 10,
    position: 'absolute',
    bottom: -20,
    color: '#333',
    fontFamily: 'Gotham-Medium',
  },
  img: {
    backgroundColor: '#000',
    borderRadius: 12,
    width: 52,
    height: 52,
    marginRight: 10,
    marginTop: 10,
  },
});
