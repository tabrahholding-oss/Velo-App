import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Badge} from 'react-native-paper';
import {assets} from '../../config/AssetsConfig';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';

const width = Dimensions.get('window').width;

export const isClassStartingWithinOneHour = item => {
  if (!item?.start_date || !item?.start_time) {
    return false;
  }

  const now = new Date();

  const [year, month, day] = item.start_date.split('-').map(Number);
  const [hours, minutes] = item.start_time.split(':').map(Number);

  const startDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(year, month - 1, day);

  const isToday = todayStart.getTime() === startDay.getTime();

  if (!isToday) {
    return true;
  }

  const minutesUntilStart = (startDateTime.getTime() - now.getTime()) / 60000;
  console.log('minutesUntilStart', minutesUntilStart);

  return minutesUntilStart > 60;
};


export const ClassItem = props => {
  const {item} = props;
  console.log('item   ', item)
  const isNotStartingWithinOneHour = isClassStartingWithinOneHour(item);
  const [booking, setBooking] = useState();

  const time = moment(item.start_date + ' ' + item.start_time).format(
    'hh:mm A',
  );
  const navigation = useNavigation();

  useEffect(() => {
    if (item?.attributes?.user_waiting === true) {
      let users = item?.attributes?.waitingUsers.filter(
        user => user.user_id === props.uid,
      );
      setBooking(users[0]);
    }
  }, []);

  const gotoClassDetail = () => {
    if (item.attributes?.expired === true) {
    } else {
      navigation.navigate('ClassDetail', {
        item: item,
        isNotStartingWithinOneHour: isNotStartingWithinOneHour,
      });
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => gotoClassDetail(item)}
        style={[
          styles.outerBox,
          {opacity: item.attributes?.expired === true ? 0.4 : 1},
        ]}>
        <View style={styles.imageBox}>
          <Image
            source={
              item?.trainer?.image
                ? {uri: item?.trainer?.image}
                : require('../../../assets/images/bg.png')
            }
            style={styles.mainImage}
          />
          {item.indoor === 0 && <Text style={styles.outdoor}>Outdoor</Text>}
        </View>

        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: width - 120,
          }}>
          <View style={styles.centerBox}>
            <Text style={styles.title} ellipsizeMode="tail" numberOfLines={1}>
              {item.title}{' '}
              {item.theme_name && (
                <Text>
                  | <Text style={styles.subTitle}>{item.theme_name}</Text>
                </Text>
              )}
            </Text>
            <View style={styles.timeBox}>
              <Image source={assets.clock} style={styles.timeImage} />
              <Text style={styles.time}>{time}</Text>
            </View>
            <Text style={styles.trainerName}>{item?.trainer?.first_name}</Text>
          </View>
          <View style={styles.lastBox}>
            {item.gender === 'Female' && (
              <Text style={styles.lastBoxText}>LADIES ONLY</Text>
            )}

            {( isNotStartingWithinOneHour ? item.attributes.booking_count_status.waiting_available === 0:true ) &&
              item.attributes.booking_count_status.available === 0 &&
              item.attributes.user_waiting === false &&
              item.attributes.mine_booking === false && (
                <Badge
                  style={[
                    styles.bedge,
                    {backgroundColor: '#161415', color: '#fff'},
                  ]}>
                  Fully Booked
                </Badge>
              )}

            {item.attributes.mine_booking === true &&
              item.attributes.user_waiting === false && (
                <Badge
                  style={[
                    styles.bedge,
                    {backgroundColor: '#161415', color: '#fff'},
                  ]}>
                  Booked
                </Badge>
              )}

            {
              !!isNotStartingWithinOneHour &&
            item.attributes.booking_count_status.waiting_available !== 0 &&
              item.attributes.booking_count_status.available === 0 &&
              item.attributes.user_waiting === false &&
              item.attributes.mine_booking === false && (
                <Badge
                  style={[
                    styles.bedge,
                    {backgroundColor: '#161415', color: '#fff'},
                  ]}>
                  Join Waitlist
                </Badge>
              )}

            {(item.attributes.user_waiting === true &&  !!isNotStartingWithinOneHour) && (
              <Badge
                style={[
                  styles.bedge,
                  {backgroundColor: '#161415', color: '#fff'},
                ]}>
                Waiting: {booking?.waiting_no}
              </Badge>
            )}

            {item.attributes.available_seat_text !== '' &&
              item.attributes.mine_booking === false && (
                <Badge
                  style={[
                    styles.bedge,
                    {backgroundColor: 'red', color: '#fff'},
                  ]}>
                  {item.attributes.available_seat_text}
                </Badge>
              )}
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  outerBox: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-evenly',
    backgroundColor: '#f2f2f2',
    marginVertical: 5,
    borderRadius: 14,
    padding: 8,
    justifyContent: 'space-between',
  },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  outdoor: {
    position: 'absolute',
    width: 60,
    textAlign: 'center',
    backgroundColor: '#000',
    alignItems: 'center',
    bottom: 0,
    zIndex: 999,
    left: 0,
    fontSize: 12,
    lineHeight: 16,
    color: '#fff',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  lastBox: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  lastBoxText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
    marginBottom: 5,
  },
  bedge: {
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 8,
    textTransform: 'uppercase',
    height: 20,
    borderRadius: 10,
    lineHeight: 20,
    fontFamily: 'Gotham-Black',
    color: '#161415',
  },
  timeBox: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 4,
  },
  timeImage: {
    width: 8,
    height: 8,
    marginRight: 5,
    marginTop: 1.5,
  },
  time: {
    fontSize: 10,
    lineHeight: 12,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
  },
  centerBox: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  trainerName: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
  },
  title: {
    fontSize: 12,
    width: width - 220,
    overflow: 'hidden',
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
    color: '#161415',
  },
  subTitle: {
    fontSize: 9,
    lineHeight: 16,
    justifyContent: 'center',
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#000',
  },
});
