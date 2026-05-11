import React, {useContext, useEffect} from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {
  RoundedDarkButton,
  RoundedThemeButton,
  RoundedThemeLightButton,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {ClassItem} from '../../components/ClassItem';
import Calendar from '../../components/calendar/Calendar';
import moment from 'moment-timezone';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../context/UserContext';
import {ClassContoller} from '../../controllers/ClassController';
import {useNavigation} from '@react-navigation/native';
import {assets} from '../../config/AssetsConfig';
import {SkeltonCard, SkeltonStudio} from '../../components/Skelton';
import analytics from '@react-native-firebase/analytics';
import {ProfileController} from '../../controllers/ProfileController';

moment.tz.setDefault('Asia/Qatar');

const Classes = props => {
  const [classes, setClasses] = useState();

  const [allData, setAllData] = useState([]);
  const {getToken, getUser} = useContext(UserContext);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [active, setActive] = useState();
  const [loading, setLoading] = useState(true);
  const [forceReload, setForseReload] = useState(false);
  const navigation = useNavigation();
  const [activeStudios, setActiveStudios] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [catIndex, setCatIndex] = useState([]);
  const [uid, setUid] = useState();

  React.useEffect(() => {
    AsyncStorage.removeItem("di");
    setGlobalIndex(0);
    var date = moment(new Date()).format('YYYY-MM-DD');
    setSelectedDate(date);
  },[]);

  React.useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setForseReload(!forceReload);
      setAllData([]);
      setClasses();
      getData();
      const result = AsyncStorage.getItem('di');
     
      if (result) {
        setGlobalIndex(result);
        var date = moment(new Date(), 'YYYY-MM-DD')
          .add(result, 'days')
          .format('YYYY-MM-DD');
          console.log(result,date,'reffff')
        setSelectedDate(date);
      } else {
        
        setGlobalIndex(0);
      }
    });
    return focusHandler;
  }, [props.route.params, navigation]);

  // useEffect(() => {
  //   Alert.alert(refresh)
  //   setClasses();
  //   getData();
  //   const result = AsyncStorage.getItem('di');
  //   if (result) {
  //     setGlobalIndex(result);
  //     var date = moment(new Date(), 'YYYY-MM-DD')
  //       .add(result, 'days')
  //       .format('YYYY-MM-DD');
  //     setSelectedDate(date);
  //   } else {
  //     setGlobalIndex(0);
  //   }
  // }, [refresh]);

  const callRefresh = async () => {
    setClasses();
    getData();
    const result = AsyncStorage.getItem('di');
    if (result) {
      
      setGlobalIndex(result);
      var date = moment(new Date(), 'YYYY-MM-DD')
        .add(result, 'days')
        .format('YYYY-MM-DD');
        console.log(result,date,'reffffneww')
      setSelectedDate(date);
    } else {
      
      setGlobalIndex(0);
    }
  };
  

  console.log(moment().format("LLLL"),moment(),'timexonnee')

  const getData = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new ClassContoller();
    const result = await instance.getAllClasses(token);
    console.log(result,'all _________classes______ result')
    setAllData(result.locations);
    const aStudio = await AsyncStorage.getItem('activeStudio');

    const instance1 = new ProfileController();
    const userDetail = await instance1.getUserDetail(token);
    setUid(userDetail.user.id);

    if (props.route.params?.activeId) {
      const activeLocation = result.locations.filter(
        item => item.id === props.route.params?.activeId,
      );
      setActiveStudios([activeLocation[0]]);
      setActive(activeLocation[0]?.studio_classes);
      setFilteredClass(activeLocation[0].studio_classes);
    } else {
      if (aStudio?.length) {
        const allCatIndex = JSON.parse(aStudio);
        setCatIndex(allCatIndex);

        let studios = [];
        result.locations.forEach((item, index) => {
          const exist = allCatIndex.filter(item => item === index);
          if (exist.length) {
            studios.push(item);
          }
        });

        setActiveStudios(studios);
        const allClasses = getAllFilteredClassess(studios);
        setActive(allClasses);
        setFilteredClass(allClasses);
      } else {
        selectCategory(result.locations[0], 0);
      }
    }
  };

  const setFilteredClass = async activeData => {
    setLoading(true);
    const newData = activeData;
    const date = new Date();
    let activeDate = '';
    const result = await AsyncStorage.getItem('di');
    if (result) {
      activeDate = moment(date, 'YYYY-MM-DD')
        .add(result, 'days')
        .format('YYYY-MM-DD');
      setSelectedDate(activeDate);
    } else {
      activeDate = moment(date).format('YYYY-MM-DD');
      setSelectedDate(activeDate);
    }


    const filterData = newData.filter(item =>
      moment(item.start_date).isSame(activeDate),
    );

    const sortedArray = filterData.sort((a, b) => {
      if (
        moment(a.start_date + ' ' + a.start_time + ':00').isBefore(
          moment(b.start_date + ' ' + b.start_time + ':00'),
        )
      ) {
        return -1;
      } else {
        return 1;
      }
    });


    setClasses(sortedArray);
    setLoading(false);
  };

  const onSelectDate = (date, i) => {
    setLoading(true);
    var dt = moment(date).format('YYYY-MM-DD');
    AsyncStorage.setItem('date', dt);
    AsyncStorage.setItem('di', JSON.stringify(i));

    console.log(date,i,'datei')

    if(active?.length > 0){
      const filterData = active.filter(item =>
        moment(item.start_date).isSame(dt),
      );

      const sortedArray = filterData.sort((a, b) => {
        if (
          moment(a.start_date + ' ' + a.start_time + ':00').isBefore(
            moment(b.start_date + ' ' + b.start_time + ':00'),
          )
        ) {
          return -1;
        } else {
          return 1;
        }
      });

      setClasses(sortedArray);
    }
    setLoading(false);
  };

  const selectCategory = async (item, index) => {
    const filterData = activeStudios.filter(item1 => item1.id === item.id);

    if (filterData.length) {
      if (activeStudios.length > 1) {
        const filterData1 = activeStudios.filter(item1 => item1.id !== item.id);
        const filterData2 = catIndex.filter(item1 => item1 !== index);

        setActiveStudios(filterData1);

        setCatIndex(filterData2);
        AsyncStorage.setItem('activeStudio', JSON.stringify(filterData2));
        setCatIndex(filterData2);
        let allClasses = getAllFilteredClassess(filterData1);
        setActive(allClasses);
        setFilteredClass(allClasses);
      }
    } else {
      const allData = [...activeStudios, item];
      setActiveStudios(allData);

      const catIndexData = [...catIndex, index];
      setCatIndex(catIndexData);
      AsyncStorage.setItem('activeStudio', JSON.stringify(catIndexData));

      let allClasses = getAllFilteredClassess(allData);

      setActive(allClasses);
      setFilteredClass(allClasses);
    }
  };

  const getAllFilteredClassess = allStudioData => {
    let allClasses = [];
    allStudioData.forEach((val, index) => {
      val.studio_classes.forEach((classVal, index2) => {
        allClasses.push(classVal);
      });
    });
    return allClasses;
  };

  const isInclude = id => {
    const filterData = activeStudios.filter(item => item.id === id);
    if (filterData.length) {
      return true;
    }
  };

  const logCustomeEvent = async (eventName, name) => {
    const {gender} = await getUser();
    await analytics().logEvent(eventName, {
      name: name,
      gender: gender,
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      callRefresh();
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <>
      {/* <PageLoader loading={loading} /> */}
      <PageContainer>
        <View style={{paddingHorizontal: 10}}>
          <View style={styles.tab}>
            {!allData?.length ? (
              <SkeltonStudio />
            ) : (
              <FlatList
                data={allData}
                pagingEnabled
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                decelerationRate={'normal'}
                renderItem={({item, index}) => (
                  <>
                    {isInclude(item.id) ? (
                      <RoundedDarkButton
                        label={item.name}
                        onPress={() => selectCategory(item, index)}
                        style={styles.tabBtn}
                      />
                    ) : (
                      <RoundedThemeLightButton
                        label={item.name}
                        onPress={() => {
                          logCustomeEvent('MostStudioClicked', item.name);
                          selectCategory(item, index);
                        }}
                        style={styles.tabBtn}
                      />
                    )}
                  </>
                )}
              />
            )}
          </View>
          {/* <View style={styles.refreshIcon}>
            <TouchableOpacity onPress={() => setRefresh(!refresh)}>
              <Image source={assets.refresh} style={{width: 24, height: 24}} />
            </TouchableOpacity>
          </View> */}
          <View style={styles.calander}>
            <Calendar onSelectDate={onSelectDate} globalIndex={globalIndex} />
          </View>

          <View style={styles.classesList}>
            {classes?.length > 0 ? (
              <FlatList
                data={classes}
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
                  <ClassItem key={key} item={item} uid={uid} />
                )}
              />
            ) : (
              <>
                {!classes ? (
                  <>
                    <SkeltonCard />
                    <SkeltonCard />
                  </>
                ) : (
                  <Text style={styles.noData}>No data available</Text>
                )}
              </>
            )}
          </View>
        </View>
      </PageContainer>
    </>
  );
};
export default Classes;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  tab: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noData: {
    fontSize: 14,
    alignSelf: 'center',
    marginTop: height / 2 - 200,
  },
  tabBtn: {
    width: width / 3 - 23,
    marginRight: 8,
    marginVertical: 10,
    marginLeft: 3,
  },
  classesList: {
    marginBottom: 270,
    height: height - 310,
  },
  calander: {
    marginBottom: 10,
    marginTop: 0,
  },
  refreshIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    right: 10,
    top: 60,
    zIndex: 999,
  },
});
