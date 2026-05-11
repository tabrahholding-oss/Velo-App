import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {RoundedDarkButton} from '../Buttons';
import moment from 'moment';
import {Badge} from 'react-native-paper';
const width = Dimensions.get('window').width;
import {assets} from '../../config/AssetsConfig';

export const MyOrderItem = props => {
  // const {item} = props;
  const [item, setItem] = useState({});
  const [showItem, setShowItem] = useState();


  useEffect(() => {
    let newItem = props.item;
    
    newItem.attributes.items.forEach(i => {
      let addonPrice = 0;
      if(i.addons !== null){
         let addons = JSON.parse(i.addons)
         i.newAddons = addons;
        addons.forEach(j => {
          addonPrice = addonPrice + JSON.parse(j.price)
        });
         i.addonPrice = addonPrice;
      }
      
     i.totalItemPrice = addonPrice + i.optional_item.price;
     console.log(i,'iii')
    })

    console.log(newItem,'newitem')
    setItem(newItem)
  },[props]);

  const getColor = status => {
    if (status === 'New') {
      return '#000';
    } else if (status === 'Inprogress') {
      return '#ffc107';
    } else if (status === 'Ready') {
      return '#06ba0e';
    } else if (status === 'Picked') {
      return '#fabbdd';
    }
  };

  const showItemCall = item => {
    if (showItem?.id === item.id) {
      setShowItem();
    } else {
      setShowItem(item);
    }
  };

  return (
    <View style={styles.box}>
      <View
        style={{
          width: '100%',
        }}>
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: width - 40,
            }}>
             <Text style={styles.title}>
            {moment(item?.attributes?.date).format('DD MMM, YYYY HH:mm A')}
          </Text>
            <Text style={[styles.title, {width: 80}]}>
              {item?.attributes?.items_total} QAR
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: width - 40,
              marginTop: 5,
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#000',
                borderRadius: 10,
                paddingHorizontal: 10,
                display: 'flex',
                flexDirection: 'row',
              }}
              onPress={() => showItemCall(item)}>
              <Text
                style={{
                  color: '#fff',
                  lineHeight: 16,
                  fontSize: 12,
                  marginTop: 2,
                  fontFamily: 'Gotham-Medium',
                  fontWeight: '800',
                }}>
                Items ({item?.attributes?.items?.length}){' '}
              </Text>
              <Image
                source={assets.chevron}
                style={{width: 16, height: 12, marginTop: 4, tintColor: '#fff'}}
              />
            </TouchableOpacity>
            <View
              style={{
                width: 80,
                display: 'flex',
                flexDirection: 'row',
                textAlign: 'center',
              }}>
              {item?.attributes?.status !== 'New' && (
                <Badge
                  style={[
                    styles.bedge,
                    {
                      backgroundColor: getColor(item?.attributes?.status),
                      color:
                        item?.attributes?.status === 'Picked' ? '#000' : '#000',
                      paddingHorizontal: 10,
                      fontWeight: '800',
                      marginLeft:-10
                    },
                  ]}>
                  {item?.attributes?.status === 'Picked'
                    ? 'Completed'
                    : item?.attributes?.status}
                </Badge>
              )}
            </View>
          </View>
          {showItem?.id === item?.id && (
            <View>
              {item?.attributes?.items.map((item1, index) => (
                <View style={styles.itemBox}>
                  <View>
                    <Text style={styles.itemText}>{item1?.optional_item?.name}</Text>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',width:width- 170}}>
                    {item1.newAddons?.map((i,index11) => (
                      <Text style={styles.addon}>{i.name}: {i.price}{item?.relation?.transaction.attributes.currency}</Text>
                    ))}
                    </View>
                  </View>
                  <View style={styles.itemBox2}>
                    <Text style={styles.itemText}>{item1.quantity}X</Text>
                    <Text style={[styles.itemText, {width: 80}]}>
                      {(item1?.totalItemPrice) * item1?.quantity} {item?.relation?.transaction.attributes.currency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.paraBox}>
        <Text style={styles.paraText}>{item?.attributes?.order_ref}</Text>
         
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    // backgroundColor: '#161415',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    width: width - 20,
    marginTop: 30,
    shadowColor: '#161415',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  itemBox: {
    width: width - 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addon:{
    fontFamily:'Gotham-Medium',
    fontSize:9,
    borderWidth:1,
    paddingHorizontal:5,
    paddingVertical:2,
    borderRadius:10,
    marginRight:2,
    marginVertical:2

  },
  itemBox2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width / 2.9,
  },
  itemText: {
    fontSize: 12,
    paddingTop: 10,
    paddingBottom: 5,
    fontFamily: 'Gotham-Medium',
  },
  paraBox: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 2,
    marginTop: 10,
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#000',
    marginBottom: 3,
  },
  paraText: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#000',
  },
  paraValue: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#000',
  },
});
