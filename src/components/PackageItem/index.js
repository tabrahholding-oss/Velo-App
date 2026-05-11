import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {RoundedDarkButton, RoundedGreyButton} from '../Buttons';
import moment from 'moment';

const width = Dimensions.get('window').width;

export const PackageItem = ({item, onPress}) => {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{item?.attributes?.name}</Text>

      <View style={styles.allStudio}>
        {item?.attributes?.studios?.map((i,index) => (
          <View style={styles.stBox}>
            <Text style={styles.stText}>{i?.location?.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.price}>{item?.attributes?.amount} QR</Text>
      <Text style={styles.class}>
        {item?.attributes?.rides}
        {item?.attributes?.type !== 'unlimited' ? (
          item?.attributes?.type === 'ride' ? (
            ' Class'
          ) : (
            item?.attributes?.type
          )
        ) : (
          <></>
        )}
      </Text>

      {item?.attributes?.show_package_text === 'True' ?
        <>
          {item?.attributes?.studio_start_time && item?.attributes?.studio_end_time ?
          <View style={styles.btweenBox}>
            <Text style={styles.btween}>Booking Timing {item?.attributes?.studio_start_time} to {item?.attributes?.studio_end_time}</Text>
          </View>
          :<></>}
          {item?.attributes?.studio_start_time && !item?.attributes?.studio_end_time ?
          <View style={styles.btweenBox}>
            <Text style={styles.btween}>Only For {item?.attributes?.studio_start_time}</Text>
          </View>
          :<></>}
        </>
      :<></>}


      {item?.attributes?.valid_from && item?.attributes?.valid_to ? (
        <Text style={styles.validity}>
          Validity {moment(item?.attributes?.valid_from).format('DD MMM')}{' '}
          {' - '}
          {moment(item?.attributes?.valid_to).format('DD MMM')}
        </Text>
      ) : (
        <Text style={styles.validity}>
          {item?.attributes?.validity} days validity
        </Text>
      )}
      <TouchableOpacity style={styles.buyBtn} onPress={() => onPress(item)}>
        <Text style={styles.btnText}>BUY NOW</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 30,
    paddingHorizontal: 5,
    borderRadius: 16,
    width: width / 2 - 25,
    marginBottom: 10,
  },
  allStudio:{
    flexDirection:'row',
    gap:4,
    marginBottom:5,
    justifyContent:'center'
  },
  stBox:{
    backgroundColor:'#161415',
    borderRadius:4,
    paddingHorizontal:4,
    paddingVertical:3
  },
  stText:{
    fontFamily: 'Gotham-Medium',
    color: '#fff',
    fontSize:10
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
    color: '#161415',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  class: {
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    marginBottom: 3,
  },
  btweenBox:{
    marginBottom: 5,
    marginTop: 5,
   // backgroundColor: '#161415',
    borderRadius:6
  },
  btween:{
    textAlign: 'center',
    fontSize: 9,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color:'#161415',
  },
  validity: {
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 0,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  buyBtn: {
    width: 130,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 100,
    borderRadius: 20,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Gotham-Black',
    textAlign: 'center',
    fontSize: 12,
  },
});
