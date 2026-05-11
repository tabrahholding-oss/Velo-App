import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {
  RoundedDarkButton2,
  RoundedGreyButton2,
  RoundedThemeButton2,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {PackageItem} from '../../components/PackageItem';
import {CartItem} from '../../components/CartItem';
import {useNavigation} from '@react-navigation/native';
import {assets} from '../../config/AssetsConfig';
import {DoubleJoyController} from '../../controllers/DoubleJoyController';
import {UserContext} from '../../../context/UserContext';
import PageLoader from '../../components/PageLoader';
import {Badge} from 'react-native-paper';

const DoubleJoy = props => {
  const [active, setActive] = useState({attributes: {name: 'All'}, id: 0});
  const navigation = useNavigation();
  const {getToken} = useContext(UserContext);
  const [cart, setCart] = useState([]);
  const [activeData, setActiveData] = useState([]);
  const [allData, setAllData] = useState();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([{attributes: {name: 'All'}, id: 0}]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setActive({attributes: {name: 'All'}, id: 0});
      console.log(props, 'propsprops');
      getAllData();
    });
    return focusHandler;
  }, [props.route.params, navigation]);

  useEffect(() => {
    getAllData();
  }, [refresh]);

  const getAllData = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new DoubleJoyController();
    const result = await instance.getAllDoubleJoy(token);
    console.log(result, 'result');

    let sortCat = result.sort((a, b) => a.attributes.position - b.attributes.position);

    const filterResult = sortCat.filter(
      i => i.relation.optional_items.length > 0,
    );

    const myActive = {attributes: {name: 'All'}, id: 0};

    setData([{attributes: {name: 'All'}, id: 0}, ...filterResult]);

    const myOrder = await instance.getMyCart(token);
    console.log(myOrder, 'myOrder');
    let newResult = [];
    sortCat.map((item, index) => {
      item?.relation?.optional_items.map((item1, index1) => {
        if (myOrder?.relation?.items?.length > 0) {
          let citem = myOrder?.relation?.items?.filter(
            i => i.attributes.optional_item_id === JSON.parse(item1.id),
          );

          if (citem.length > 0) {
            item1.quantity = citem[0].attributes.quantity;
            item1.cartAddon = citem[0].attributes.addons;

            newResult.push({catId: item.id, ...item1});
          } else {
            item1.quantity = 0;
            newResult.push({catId: item.id, ...item1});
          }
        } else {
          item1.quantity = 0;
          newResult.push({catId: item.id, ...item1});
        }
      });
    });
    console.log(newResult, 'newResult');
    setLoading(false);
    setActiveData(newResult);
    setAllData(newResult);
    setCart(myOrder);

    
      
        if(active.id != 0){
          const filterData = [{attributes: {name: 'All'}, id: 0}, ...filterResult].filter(i => i.id === active.id);
          setActiveData(filterData[0].relation.optional_items);
        }
        else{
          if (!myActive?.id) {
            setActiveData(newResult);
          } else {
          const filterData = [
            {attributes: {name: 'All'}, id: 0},
            ...filterResult,
          ].filter(i => i.id === active.id);
          setActiveData(filterData[0].relation.optional_items);
          }
        }

      

  };

  const selectItem = item => {
    navigation.navigate('DoubleJoyDetail', {item: item});
    // Alert.alert(item.name);
  };

  const addClick = async item => {
    const token = await getToken();
    const instance = new DoubleJoyController();
    let myNotes = '';
    let getAddons = [];

    if (item.quantity > 0) {
      let myCartItem = cart.relation.items.filter(
        i => i.attributes.optional_item_id == item.id,
      );
      if (myCartItem[0].attributes.addons.length > 0) {
        getAddons = JSON.parse(myCartItem[0].attributes.addons);
      }
      if (myCartItem[0].attributes.notes) {
        myNotes = myCartItem[0].attributes.notes;
      }
    }

    console.log(token, item.id, item.quantity + 1, myNotes, getAddons, 'sss');
    setLoading(true);
    const result = await instance.addItem(
      token,
      item.id,
      item.quantity + 1,
      myNotes,
      getAddons,
    );
    console.log(result, result?.status, result.status === 'success', 'addcart');
    if (result.status === 'success') {
      setRefresh(!refresh);
    } else {
      setLoading(false);
    }
  };
  const minusClick = async item => {
    const token = await getToken();
    const instance = new DoubleJoyController();

    let myNotes = '';
    let getAddons = [];

    if (item.quantity > 0) {
      let myCartItem = cart.relation.items.filter(
        i => i.attributes.optional_item_id == item.id,
      );
      if (myCartItem[0].attributes.addons.length > 0) {
        getAddons = JSON.parse(myCartItem[0].attributes.addons);
      }
      if (myCartItem[0].attributes.notes) {
        myNotes = myCartItem[0].attributes.notes;
      }
    }

    if (item.quantity > 1) {
      setLoading(true);
      const result = await instance.addItem(
        token,
        item.id,
        item.quantity - 1,
        myNotes,
        getAddons,
      );
      console.log(result.status, result.status === 'success', 'addcart');
      if (result.status === 'success') {
        // setRefresh(!refresh);
        getAllData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(true);
      const result = await instance.removeItem(token, item.id);
      console.log(result, 'remove');
      if (result.status === 'success') {
        setRefresh(!refresh);
      } else {
        setLoading(false);
      }
    }
  };

  const clickTab = item => {
    setActive(item);
    if (item.id === 0) {
      setActiveData(allData);
    } else {
      const filterData = data.filter(i => i.id === item.id);
      setActiveData(filterData[0].relation.optional_items);
    }
  };

  return (
    <>
      <PageLoader loading={loading} />
      <PageContainer>
        <View style={{paddingHorizontal: 10}}>
          <View style={styles.hdr}>
            <View style={{width: 20}}></View>
            <View>
              <RoundedDarkButton2
                onPress={() => navigation.navigate('MyOrder')}
                label={'My Orders'}
                style={{paddingHorizontal: 10}}
              />
            </View>
            <TouchableOpacity
              style={{marginTop: 0}}
              onPress={() => navigation.navigate('DoubleJoyCheckout')}>
              {cart?.relation?.items.length > 0 && (
                <Badge
                  style={[
                    {
                      padding: 0,
                      backgroundColor: 'red',
                      fontWeight: '700',
                      fontSize: 10,
                      position: 'absolute',
                      right: -10,
                      top: -10,
                    },
                  ]}>
                  {cart?.relation?.items.length}
                </Badge>
              )}
              <Image source={assets.cart} style={{width: 20, height: 20}} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.tab}>
              {/* <FlatList
              data={data}
              pagingEnabled
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              decelerationRate={'normal'}
              renderItem={({item, index}) => ( */}
              {data.map((item, index) => (
                <View key={index + 'cat'}>
                  {active.id === item.id ? (
                    <RoundedGreyButton2
                      label={item.attributes.name}
                      style={styles.tabBtn}
                      onPress={() => console.log()}
                    />
                  ) : (
                    <RoundedThemeButton2
                      label={item.attributes.name}
                      onPress={() => clickTab(item)}
                      style={styles.tabBtn}
                    />
                  )}
                </View>
              ))}
              {/* )}
            /> */}
            </View>
          </ScrollView>

          <View style={styles.classesList}>
            {/* <FlatList
              data={activeData}
              pagingEnabled
              numColumns={2}
              showsVerticalScrollIndicator={false}
              decelerationRate={'normal'}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              columnWrapperStyle={{
                justifyContent: 'space-between',
              }}
              renderItem={({item}, key) => ( */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 50}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {activeData.sort((a, b) => a.attributes.position - b.attributes.position).map((item, index) => (
                  <View style={{width: width / 2 - 20}} key={index + 'cat'}>
                    <CartItem
                      item={item}
                      onPress={selectItem}
                      addClick={addClick}
                      minusClick={minusClick}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
            {/* )}
            /> */}
          </View>
        </View>
      </PageContainer>
    </>
  );
};
export default DoubleJoy;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  hdr: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabBtn: {
    // width: width / 3 - 20,
    width: 'auto',
    minWidth: width / 3 - 20,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  classesList: {
    height: Platform.OS === 'ios' ? height - 200 : height - 200,
  },
  calander: {
    marginBottom: 20,
  },
  cartText: {
    position: 'absolute',
    backgroundColor: 'red',
    color: '#fff',
    fontSize: 10,
    width: 14,
    height: 14,
    textAlign: 'center',
    fontWeight: '700',
    borderRadius: 50,
    marginTop: -6,
    right: -7,
  },
});
