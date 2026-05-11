import React, {useContext, useEffect} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  RefreshControl,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {
  RoundedDarkButton2,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {PackageItem} from '../../components/PackageItem';
import {CartItem} from '../../components/CartItem';
import {useNavigation} from '@react-navigation/native';
import {assets} from '../../config/AssetsConfig';
import {DoubleJoyController} from '../../controllers/DoubleJoyController';
import {UserContext} from '../../../context/UserContext';
import {MyOrderItem} from '../../components/CartItem/MyOrderItem';
import PageLoader from '../../components/PageLoader';

const MyOrder = props => {
  const [active, setActive] = useState({name: 'New', id: 0});
  const [filterData, setFilterdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const {getToken} = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [show, setShow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      if (props.route.params !== undefined) {
        setActive({name: 'New', id: 0});
      }
      getAllData();
    });
    return focusHandler;
  }, [props.route.params, navigation]);

  const getAllData = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new DoubleJoyController();
    const result = await instance.getMyOrder(token);
    console.log(result, 'result');
    setLoading(false);
    setAllData(result.data);
    if (result.data.length > 5) {
      setData([
        result.data[0],
        result.data[1],
        result.data[2],
        result.data[3],
        result.data[4],
      ]);
    } else {
      setData(result.data);
      setShow(true)
    }
  };

  const statusData = [
    {name: 'New', id: 0},
    {name: 'Inprogress', id: 1},
    {name: 'Ready', id: 2},
    {name: 'Picked', id: 4},
  ];

  const loadHistory = () => {
    setData(allData);
    setShow(true)
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getAllData();
      setRefreshing(false);
    }, 2000);
  }, []); 

  return (
    <>
      <PageLoader loading={loading} />
      <PageContainer>
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          decelerationRate={'normal'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{paddingBottom: 40}}
          renderItem={({item}, key) => (
            <MyOrderItem key={key + 'my'} item={item} />
          )}
        />

        {show === false && (
          <RoundedDarkButton2
            label="Load History"
            onPress={() => loadHistory()}
            style={{marginBottom: 20}}
          />
        )}

        {data.length == 0 && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              alignItems: 'center',
              left: 0,
              right: 0,
            }}>
            <Text>No data found</Text>
          </View>
        )}
        {/* </ScrollView> */}
      </PageContainer>
    </>
  );
};
export default MyOrder;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  classesList: {
    paddingBottom: 130,
    paddingTop: 10,
    backgroundColor: '#333',
    height: height,
  },
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
    marginTop: Platform.OS === 'android' ? 0 : 20,
    marginBottom: 10,
    width: 'auto',
  },
  tabBtn: {
    width: 'auto',
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  calander: {
    marginBottom: 20,
  },
  buyBtn: {
    marginTop: 20,
    backgroundColor: '#ddd',
  },
});
