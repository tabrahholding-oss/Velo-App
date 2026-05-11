import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {Badge} from 'react-native-paper';
import {assets} from '../../config/AssetsConfig';
import {useNavigation} from '@react-navigation/native';

const width = Dimensions.get('window').width;
export const PlannerClass = props => {
  const {item} = props;

  console.log(item.relation, 'ddd', item.attributes, 'item');
  const navigation = useNavigation();

  return (
    <>
      <View style={styles.outerBox}>
        <View
          style={[
            styles.imageBox,
            {opacity: item.attributes.waiting_no ? 0.5 : 1},
          ]}>
          <Image
            source={{
              uri: item.relation.classes.relations.trainer.attributes.image,
            }}
            style={styles.mainImage}
          />
          {item.relation.classes.attributes.location_type === 'Outdoor' && (
            <Text style={styles.outdoor}>OUTDOOR</Text>
          )}
        </View>
        <View
          style={[
            styles.centerBox,
            {opacity: item.attributes.waiting_no ? 0.5 : 1},
          ]}>
          <Text style={styles.title} ellipsizeMode="tail" numberOfLines={1}>
            {item.relation.classes.attributes.title}
          </Text>
          {item.relation.classes.attributes.theme_name && (
            <Text
              style={styles.subTitle}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {item.relation.classes.attributes.theme_name}
            </Text>
          )}
          <Text style={styles.trainerName}>
            {item.relation.classes.relations.trainer.attributes.first_name}
          </Text>
        </View>
        <View
          style={[
            styles.dateBox,
            {opacity: item.attributes.waiting_no ? 0.5 : 1},
          ]}>
          <View style={styles.timeBox}>
            <Image source={assets.calendar} style={styles.timeImage} />
            <Text style={styles.dateText}>{item.attributes.booked_date}</Text>
          </View>
          <View style={styles.timeBox}>
            <Image source={assets.clock} style={styles.timeImage} />
            <Text style={styles.dateText}>{item.attributes.timing}</Text>
          </View>
          {!item.attributes.waiting_no && (
            <>
              {item.relation.classes.attributes.location_type === 'Indoor' && (
                <View style={styles.timeBox}>
                  <Image source={assets.circle} style={styles.timeImage} />

                  <Text style={styles.dateText}>
                    {
                      item.relation.classes.relations.location.attributes
                        .spot_name
                    }{' '}
                    -{' '}
                    {item.attributes.seat_text
                      ? item.attributes.seat_text
                      : item.attributes.seat}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <View style={styles.lastBox}>
          {item.attributes.waiting_no ? (
            <Badge
              style={[styles.bedge, {backgroundColor: '#000'}]}
              onPress={() =>
                navigation.navigate('ClassDetail', {
                  item: item.relation.classes,
                })
              }>
              Waitlist : {item.attributes.waiting_no}
            </Badge>
          ) : (
            <Badge
              style={[styles.bedge, {backgroundColor: '#161415'}]}
              onPress={() =>
                navigation.navigate('ClassDetail', {
                  item: item.relation.classes,
                })
              }>
              Go to Class
            </Badge>
          )}
          <Badge
            style={[styles.bedge, {backgroundColor: 'red'}]}
            onPress={() => props.cancelModalOpen(item.id)}>
            {item.attributes.waiting_no ? 'Leave Waitlist' : 'Cancel Booking'}
          </Badge>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f2f2f2',
    marginVertical: 5,
    borderRadius: 14,
    padding: 5,
  },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
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
    fontSize: 9,
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
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  bedge: {
    fontSize: 7,
    fontFamily: 'Gotham-Medium',
    textTransform: 'uppercase',
    paddingHorizontal: 5,
    marginVertical: 2,
    width: 80,
  },
  dateBox: {
    justifyContent: 'center',
  },
  timeBox: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 2,
  },
  timeImage: {
    width: 8,
    height: 8,
    marginRight: 5,
    marginTop: 2,
  },
  dateText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#161415',
    textTransform: 'uppercase',
  },
  centerBox: {
    justifyContent: 'center',
    marginLeft: 5,
  },
  trainerName: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Gotham-Light' : 'Gotham-Medium',
    width: 80,
    textTransform: 'uppercase',
    overflow: 'hidden',
    color: '#161415',
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Gotham-Black',
    overflow: 'hidden',
    textTransform: 'uppercase',
    color: '#161415',
    width: 90,
  },
  subTitle: {
    fontSize: 8,
    lineHeight: 16,
    fontFamily: 'Gotham-Medium',
    justifyContent: 'center',
    textTransform: 'uppercase',
    color: '#161415',
    width: 90,
  },
});
