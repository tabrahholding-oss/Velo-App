import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {API_BASE, API_SUCCESS} from '../../config/ApiConfig';
import moment from 'moment';
import {UserContext} from '../../../context/UserContext';
import {HappeningContoller} from '../../controllers/HappeningController';
import PageLoader from '../../components/PageLoader';
import {useToast} from 'react-native-toast-notifications';
import {ProfileController} from '../../controllers/ProfileController';

const height = Dimensions.get('window').height;

const HappeningReport = props => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState();
  const navigation = useNavigation();
  const {getToken} = useContext(UserContext);
  const toast = useToast();
  const [user, setUser] = useState({});
  const [data, setData] = useState([]);
  const [rides, setRides] = useState(0);
  const [seprateLocation, setSeperateLocation] = useState([])
  const [ticketsStamp, setTicketStamp] = useState([])
  const [isSeperate, setIsSeperate]= useState(false)

  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      setItem();
      setData([])
      setSeperateLocation([])
      setTicketStamp([])
      setIsSeperate(false)
      getDetail();
      getHappeningDetail();
    });
    return focusHandler;
    
  }, [props.route.params]);

  const getDetail = async () => {
    const token = await getToken();
    const instance = new ProfileController();
    const result = await instance.getUserDetail(token);
    setUser(result.user);
  };

  const getHappeningDetail = async () => {
    setLoading(true)
    const token = await getToken();
    const id = props.route.params.item.id;
    const instance = new HappeningContoller();
    const result = await instance.getChallenges(id, token);
    setItem(result?.happening);
    if (result?.happening) {
      let newData = [];
      let activeVal = false;
      let activeCount = 0;
      //  setSeperateLocation(result?.happening?.locations)  
     
      // if (false){
      if (result?.happening?.ChallengeTitle === "Combined"){
        if(result?.happening.milestone){
        activeCount = JSON.parse(result?.happening.milestone)
      } 
      for (var i = 0; i < result?.happening.attended_classes; i++) {
        
        if(activeCount > 0){
          if((i+1) === activeCount){
            activeVal = true;
            activeCount = activeCount + JSON.parse(result?.happening.milestone);
          }
          else{
            activeVal = false;
          }
        } 
        newData.push({index:i,active:activeVal});
      }
      setData(newData);

      }
      else if (result?.type === 'trainers'){
        setTicketStamp(result?.happening?.trainer_spots)
      }
      else {
        const updatedArray = []
        setIsSeperate(true)
        result?.happening?.locations?.length &&  result?.happening?.locations?.map((item)=>{
          let obj = {...item}
          let modifiedArray =[]
          for (i=1; i<=item?.target; i++){
            if (item?.rides > 0){
              if (i<= item?.rides){
                modifiedArray.push({index: i, active :true, icon: result?.happening?.milestone_icon})

              }
              else {
                modifiedArray.push({index: i, active :false, icon: result?.happening?.icon})
              }

            }
            else {
               modifiedArray.push({index: i, active :false, icon: result?.happening?.icon})
            }
            

          }
           obj.arrayToRender = modifiedArray
           updatedArray.push(obj)
        })
        setSeperateLocation(updatedArray)

      }
      
    }
    if (result?.rides) {
      setRides(result?.rides);
    }
    setLoading(false)
  };

  const getNameOnTheBasisOfLength = () =>{
    let fullName =  `${user.first_name} ${user.last_name}`
     if (fullName?.length > 10) {
      return user.first_name
     } 
     return fullName
  }

  return (
    <>
      <PageLoader loading={loading} />
      <View style={styles.mainContainer}>
        <View
          style={{
            paddingHorizontal: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
          {item?.image && 
            <Image
              source={{uri: API_SUCCESS + '/' + item?.image}}
              style={styles.itemImage}
            />
          }
        </View>
        <View style={styles.detailBox}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{flex: 1, height: height}}>
            <View
              style={{
                width: isSeperate ? '90%': 300,
                alignSelf: 'center',
                marginTop: 20,
                paddingBottom: 30,
              
              }}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={styles.uname}>
                  {getNameOnTheBasisOfLength()}
                </Text>
                {item?.start_date &&
                  <Text style={styles.date}>
                    {moment(item?.start_date).format('DD MMM, YYYY')} - {' '}
                    {moment(item?.end_date).format('DD MMM, YYYY')}
                  </Text>
                }
              </View>
              <Text style={styles.hd}>{item?.title}</Text>

              <View style={styles.cirBx}>
                {!!data?.length && data.map((i, index) => (
                  <View style={[styles.circle, styles.blackfilled,]}>


                    {((index < rides) && (i.active == false)) &&(
                      <Image
                        source={{uri: API_SUCCESS + '/' + item?.icon}}
                        style={styles.filled}
                      />
                    )}


                    {((index < rides) && (i.active == true)) &&(
                      <Image
                        source={{uri: API_SUCCESS + '/' + item?.milestone_icon}}
                        style={[styles.filled]}
                      />
                    )}

                    {(i.active === true && (index > rides)) && (
                      <Image
                        source={{uri: API_SUCCESS + '/' + item?.milestone_icon}}
                        style={[styles.filled,{opacity:0.4}]}
                      />
                    )}
                  </View>
                ))}
              </View>

              {
                !!seprateLocation?.length && seprateLocation?.map((item, index)=>{
                  return (
                    <View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between'}} key={index}>
                      <Text style={{marginRight:10, color:'black', fontSize:16, fontFamily: 'Gotham-Medium'}}>
                        {item?.name?.toUpperCase()}
                      </Text>
                      <View style={styles.cirBxSeperate}>
                {!!item?.arrayToRender.length && item?.arrayToRender.map((i, childIndex) => (
                  <View style={[styles.circleSeperate, styles.blackfilled]} key={childIndex}>
                      <Image
                        source={{uri: API_SUCCESS + i?.icon}}
                        style={[styles.seperateFilled]}
                      />
                  </View>
                ))}
              </View>

                    </View>  
                  )
                })
              }
              {
                !!ticketsStamp?.length && (
                  <View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-evenly'}}>
                    {ticketsStamp.map((item, index) => (
                      (item?.completed && item?.trainer_stamp?.length) ? (
                        // <View style={{backgroundColor:'grey'
                          
                        // }}>
                        <Image key={index} source={{uri: `${API_SUCCESS}/${item?.trainer_stamp}`}} style={{width:60, height:60, margin: 4}} />
                        // </View>
                      ) : (
                        <View key={index} style={{width:60, height:60, borderRadius:30  , borderWidth:0.3, margin: 4, marginRight:10}} />
                      )
                    
                    ))}
                  </View>
                )
              }
             
             {
              !ticketsStamp?.length && (
                  <Text style={styles.hd3}>{item?.description}</Text>

              )
             }
            
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
};
export default HappeningReport;

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? 10 : 60,
    fontFamily: 'Gotham-Black',
    color: '#161415',
  },
  itemImage: {
    width: width,
    height: 260,
    alignSelf: 'center',
    marginTop: 0,
  },
  mainContainer: {
    backgroundColor: '#e2e3e5',
    height: '100%',
    display: 'flex',
  },
  detailBox: {
    backgroundColor: '#fff',
    display: 'flex',
    flex: 1,
    bottom: 0,
    paddingTop: 20,
    marginTop: -75,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  date: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 0,
    lineHeight: 18,
    fontFamily: 'Gotham-Medium',
  },
  cirBx: {
    backgroundColor: '#000',
    width: 300,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cirBxSeperate: {
    backgroundColor: '#000',
    // width: 310,
    width:'80%',
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  circle: {
    borderWidth: 1,
    borderColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 20,
    margin: 6 ,
    backgroundColor: '#fff',
    zIndex: 999,
    position: 'relative',
  },
  circleSeperate: {
    borderWidth: 1,
    borderColor: '#000',
    width: 25,
    height: 25,
    borderRadius: 20,
    margin: 6 ,
    backgroundColor: '#fff',
    zIndex: 999,
    // position: 'relative',
    justifyContent:'center',
    alignItems:'center'
  },
  filled: {
    textAlign: 'center',
    lineHeight: 25,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 28,
    margin: 2,
    width: 26,
    height: 26,
  },
  seperateFilled: {
    textAlign: 'center',
    // lineHeight: 25,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 28,
    // margin: 2,
    width: 18,
    height: 18,
  },
  blackfilled: {},
  uname: {
    color: '#000',
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
  },

  back: {
    margin: 20,
  },
  backImage: {
    width: 24,
    height: 20,
  },

  p3: {
    position: 'absolute',
    zIndex: 999,
    bottom: -10,
    right: -20,
    width: 100,
    height: 100,
    tintColor: '#000',
  },
  logov: {
    position: 'absolute',
    zIndex: 999,
    top: 220,
    left: width / 2 - 140,
    right: 0,
    margin: 'auto',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    opacity: 0.1,
  },
  hd: {
    color: '#000',
    fontSize: 22,
    marginTop: 6,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
  },
  hd2: {
    fontFamily: 'Gotham-Medium',
  },
  hd3: {
    color: '#000',
    fontSize: 24,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Black',
  },
});
