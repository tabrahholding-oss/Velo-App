import React, {useContext, useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View, FlatList, ImageBackground, Dimensions} from 'react-native';
import {PageContainer} from '../../components/Container';
import {assets} from '../../config/AssetsConfig';
import {UserContext} from '../../../context/UserContext';
import {JourneyContoller} from '../../controllers/JourneyController';
import PageLoader from '../../components/PageLoader';
import { API_SUCCESS } from '../../config/ApiConfig';

const width = Dimensions.get('window').width;

const Achievements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const {getToken} = useContext(UserContext);

  useEffect(() => {
    getBadges();
  }, []);
  const getBadges = async () => {
    setLoading(true);
    const token = await getToken();
    const instance = new JourneyContoller();
    const result = await instance.getAllBedges(token);
    console.log(result,'result')
    setLoading(false);
    setData(result.badges);
  };

  return (
    <>
      <PageLoader loading={loading} />
      <PageContainer>
        <View style={styles.achBoxTitle}>
          <Text style={styles.achTitle}>Achievements</Text>
        </View>
        <View style={{paddingBottom: 40}}>
          <FlatList
            data={data}
            pagingEnabled
            numColumns={3}
            showsVerticalScrollIndicator={false}
            decelerationRate={'normal'}
            columnWrapperStyle={{
              justifyContent: 'flex-start',
            }}
            renderItem={({item}, key) => (
              <View style={styles.achBox} key={key+'ach'}>
                <ImageBackground source={{uri: API_SUCCESS+'/'+item.image}} resizeMode="contain" style={[styles.image,{opacity:!item?.status ? 0.3 : 1}]}>
                 
                </ImageBackground>
                {!item?.status && 
                   <Image source={assets.lock} style={styles.achImg} />
                  }
              </View>
            )}
          />
        </View>
      </PageContainer>
    </>
  );
};
export default Achievements;

const styles = StyleSheet.create({
  achBoxes: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  achBoxTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  achTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontFamily:'Gotham-Medium',
    color: '#161415',
  },
  achBox: {
    backgroundColor: '#f2f2f2',
    width:72,
    height:72,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth:1,
    borderColor: '#f2f2f2',
    overflow:'hidden',
    marginLeft:(width - 236)/6,
    marginRight:(width - 236)/6
  },
  achImg: {
    width: 32,
    height: 32,
    tintColor: '#000',
    alignSelf:'center',
    position:'absolute',
    marginTop:19
  },
  image:{
    flex: 1,
    justifyContent: 'center',
    borderRadius: 16,
    overflow:'hidden'
  }
});
