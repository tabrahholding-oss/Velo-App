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
  RoundedThemeLightButton,
} from '../../components/Buttons';
import {FlatList} from 'react-native-gesture-handler';
import {useState} from 'react';
import {ClassItem} from '../../components/ClassItem';
import moment from 'moment-timezone';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../../../context/UserContext';
import {ClassContoller} from '../../controllers/ClassController';
import {useNavigation} from '@react-navigation/native';
import {SkeltonCard, SkeltonStudio} from '../../components/Skelton';
import analytics from '@react-native-firebase/analytics';
import {ProfileController} from '../../controllers/ProfileController';

moment.tz.setDefault('Asia/Qatar');

const Classes1 = props => {
  console.log('props in classes 1  ' ,props)
  const [classes, setClasses] = useState();

  const [allData, setAllData] = useState([]);
  const {getToken, getUser} = useContext(UserContext);
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
  const [monthName, setMonthName] = useState('');
  
  const [allDates, setAllDates] = useState([]);

  React.useEffect(() => {
    getAllDates();
  },[]);

  React.useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setForseReload(!forceReload);
      setAllData([]);
      setClasses();
      getData();
    });
    return focusHandler;
  }, [props.route.params, navigation]);


  const getAllDates = async() => {
    const instance = new ClassContoller();
    console.log('instance is  ', instance)
    const res = await instance.get15Dates();
    console.log('res inn   ', res)
    let data = [];
    let str = '';
    res.map((i,index)=> {
      data.push(moment(i).format('YYYY-MM-DD'));
      if(index === 0){
        str = moment(i).format('MMMM');
      }
      if(index === res.length - 1){
        if(moment(i).format('MMMM') !== str){
          str = str + ' - ' + moment(i).format('MMMM')
        }
      }
    })
    setMonthName(str)
    setAllDates(data);
  }

  const callRefresh = async () => {
    setClasses();
    getData();
    const result = AsyncStorage.getItem('date');
    if (result) {
      var date = moment(result).format('YYYY-MM-DD');
      setSelectedDate(date);
    } else {
      let dt = moment(new Date()).format('YYYY-MM-DD')
      setSelectedDate(dt)
    }
  };
  

  const getData = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new ClassContoller();
    const result = await instance.getAllClasses(token);
    console.log('result is    ', result)
    console.log(result,'all _________classes______ result1')
    setAllData(result.locations);
    const aStudio = await AsyncStorage.getItem('activeStudio');

    const instance1 = new ProfileController();
    const userDetail = await instance1.getUserDetail(token);
    setUid(userDetail.user.id);
    console.log(result.locations[0]?.studio_classes,'result.locations')

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
    const result = await AsyncStorage.getItem('date');
    if (result) {
      activeDate = moment(result).format('YYYY-MM-DD');
      setSelectedDate(activeDate);
    } else {
      activeDate = moment(new Date()).format('YYYY-MM-DD');
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

  const isToday = (item) => {
    let dt = moment(item).format('YYYY-MM-DD');
    let today = moment().format('YYYY-MM-DD');
    if(dt === today){
      return true;
    }
    else{
      return false
    }
  }

  const isActive = (item) => {
    let dt = moment(item).format('YYYY-MM-DD');
    let selected = moment(selectedDate).format('YYYY-MM-DD');
    if(dt === selected){
      return true;
    }
    else{
      return false
    }
  }

  const onClickDate = async(date) => {
    setSelectedDate(date);

    setLoading(true);
    var dt = moment(date).format('YYYY-MM-DD');
    AsyncStorage.setItem('date', dt);

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

  }

  return (
    <>
      {/* <PageLoader loading={loading} /> */}
      <PageContainer>
        <View style={{paddingHorizontal: 10, }}>
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
            <View style={styles.calender}>
            <Text style={styles.visibleMonthAndYear}>
              {monthName}
            </Text>
            <FlatList
                data={allDates}
                pagingEnabled
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                decelerationRate={'normal'}
                renderItem={({item, index}) => (
                  <View style={{display:'flex'}}>
                    <TouchableOpacity onPress={() => onClickDate(item)} style={[isActive(item) ? styles.selectedBox : styles.dateBox,isToday(item) === true ? {borderColor:'#000'} : '']}>
                      <Text style={isActive(item) ?  styles.dayTextActive : styles.dayText}>{moment(item).format('ddd')}</Text>
                      <Text style={isActive(item) ?  styles.dayNumActive : styles.dayNum}>{moment(item).format('DD')}</Text>
                    </TouchableOpacity>
                    {isToday(item) ? <Text style={styles.lineBottom}></Text> : <></>}
                  </View>
                )}
              />
            </View>
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
                contentContainerStyle={{paddingBottom: 80}}
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
export default Classes1;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({

  lineBottom:{
    height: 2,
    backgroundColor: '#000',
    marginTop: 4,
    width: 30,
    alignSelf: 'center',
    borderRadius: 20,
  },
  visibleMonthAndYear: {
    color: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 10,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  selectedBox:{
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: '#f2f2f2',
    marginHorizontal: 2,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#161415',
    backgroundColor: '#161415',
  },
  dateBox:{
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: '#f2f2f2',
    marginHorizontal: 2,
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    
  },
  dayText:{
    fontSize: 9,
    fontFamily: 'Gotham-Medium',
    textAlign:'center',
    color: '#161415',
  },
  dayNum:{
    fontSize: 10,
    color: '#161415',
    fontFamily: 'Gotham-Medium',
    marginTop: 2,
    textAlign:'center'
  },
  dayTextActive:{
    fontSize: 9,
    fontFamily: 'Gotham-Medium',
    textAlign:'center',
    color:'#fff'
  },
  dayNumActive:{
    fontSize: 10,
    fontFamily: 'Gotham-Medium',
    marginTop: 2,
    textAlign:'center',
    color:'#fff'
  },


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
    // marginBottom: 270,
    // flexGrow:1,
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
