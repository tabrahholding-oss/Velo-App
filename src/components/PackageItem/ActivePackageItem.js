import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {RoundedDarkButton} from '../Buttons';
import moment from 'moment';

const width = Dimensions.get('window').width;

export const ActivePackageItem = (props) => {
  const {item} = props;
  console.log(item,'item')
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{item?.attributes?.name}</Text>
      <View style={styles.paraBox}>
        
        {(item?.attributes?.valid_from != null && item?.attributes?.valid_to != null) ? 
       <>
       <Text style={styles.paraText}>Validity</Text>
       <Text style={styles.paraValue}>: {moment(item?.attributes?.valid_from).format('DD MMM')} - {moment(item?.attributes?.valid_to).format('DD MMM')}</Text>
       </>
       :
       <>
       <Text style={styles.paraText}>Expires</Text>
        <Text style={styles.paraValue}>:  {item?.attributes?.valid_till == '-' ? '-' : moment(item?.attributes?.valid_till).format('MMM DD, YYYY')}</Text>
        </>
        }
        </View>

      {item?.attributes?.show_package_text === 'True' ?
        <>
        {item?.attributes?.studio_start_time && item?.attributes?.studio_end_time ?
          <View style={styles.paraBox}>
            <Text style={styles.paraText}>Booking Timing</Text>
            <Text style={styles.paraValue}>
              :  {item?.attributes?.studio_start_time} to {item?.attributes?.studio_end_time}
            </Text>
          </View>
        :<></>}

        {item?.attributes?.studio_start_time && !item?.attributes?.studio_end_time ?
          <View style={styles.paraBox}>
            <Text style={styles.paraText}>Only For</Text>
            <Text style={styles.paraValue}>
              :  {item?.attributes?.studio_start_time}
            </Text>
          </View>
        :<></>}
        </>
      :<></>}


      <View style={styles.paraBox}>
        <Text style={styles.paraText}>Remaining</Text>
        <Text style={styles.paraValue}>
          :  {item?.attributes?.remaining_rides}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#161415',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    width: width - 40,
    marginTop: 10,
  },
  paraBox: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical:8,
  },
  title: {
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
    color: '#fff',
    marginBottom: 15,
  },
  paraText: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#fff',
    width: '50%',
  },
  paraValue: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#fff',
  }

});
