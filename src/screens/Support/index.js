import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PageContainer} from '../../components/Container';
import {assets} from '../../config/AssetsConfig';
import {SupportController} from '../../controllers/SupportController';
import {UserContext} from '../../../context/UserContext';

const Support = ({navigation}) => {

  const [data, setData] = useState([]);
  const [supportData, setSupportData] = useState();
  const [active, setActive] = useState({});
  const {getToken} = useContext(UserContext);
  const [faqs, setFaqs] = useState([]);

  const toggleActive = async item => {
    if (active.id === item.id) {
      setActive('');
    } else {
      setActive(item);
    }
  };

  useEffect(() => {
    getSupportData();
    getFaqsData();
  }, []);

  const getSupportData = async () => {
    const instance = new SupportController();
    const result = await instance.getSupport();
    if (result.status === 'success') {
      setSupportData(result.contact_us);
    }
  };

  const getFaqsData = async () => {
    const token = await getToken();
    const instance = new SupportController();
    const result = await instance.getFaqs(token);
    if (result.status === 'success') {
      setFaqs(result.faqs);
    }
  };

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={{paddingBottom: 50}}>
        <Text style={styles.heading}>FAQ</Text>

        <View style={styles.allFaq}>
          {faqs.map((item, index) => (
            <View style={styles.faqItem} key={index + 'faq'}>
              <TouchableOpacity
                style={styles.faqTitle}
                onPress={() => toggleActive(item)}>
                <Text style={styles.titleText}>{item.questions}</Text>
                <Image
                  source={assets.chevron}
                  style={
                    active.id !== item.id
                      ? styles.chevronImage
                      : styles.chevronImageOpen
                  }
                />
              </TouchableOpacity>
              {active.id === item.id && (
                <View style={styles.faqPara}>
                  <Text style={styles.paraText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <>
          <Text
            style={{
              paddingLeft: 15,
              height: 30,
              marginTop: 50,
              textTransform: 'uppercase',
              color: '#161415',
              fontFamily: 'Gotham-Medium',
            }}>
            Contact
          </Text>

          <View style={styles.supportData}>
            <TouchableOpacity
              onPress={() => {
                let url = 'whatsapp://send?text=Hello&phone=+97444800204';

                Linking.openURL(url);
              }}
              style={styles.supportList}>
              <View style={styles.iconBox}>
                <Image source={assets.whatsapp} style={styles.supportIcon} />
              </View>
              <Text style={styles.supportText}>+974 4480 0204</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${+97444800204}`)}
              style={styles.supportList}>
              <View style={styles.iconBox}>
                <Image source={assets.phone} style={styles.supportIcon} />
              </View>
              <Text style={styles.supportText}>+974 4480 0204</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:info@velo.qa')}
              style={styles.supportList}>
              <View style={styles.iconBox}>
                <Image source={assets.email} style={styles.supportIcon} />
              </View>
              <Text style={styles.supportText}>info@velo.qa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://www.instagram.com/veloqatar/')
              }
              style={styles.supportList}>
              <View style={styles.iconBox}>
                <Image source={assets.instagram} style={styles.supportIcon} />
              </View>
              <Text style={styles.supportText}>@veloqatar</Text>
            </TouchableOpacity>
          </View>
        </>

        {/* {supportData && (
          <>
            <Text
              style={{paddingLeft: 15, height: 30, textTransform: 'uppercase'}}>
              {supportData.heading}
            </Text>

            <View style={styles.support}>
              <Text style={styles.supportText}>{supportData.description}</Text>
            </View>
          </>
        )} */}
      </ScrollView>
    </PageContainer>
  );
};
export default Support;

const styles = StyleSheet.create({
  allFaq: {},
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heading: {
    paddingLeft: 15,
    fontSize: 16,
    lineHeight: 20,
    marginTop: 10,
    textTransform: 'uppercase',
    fontFamily: 'Gotham-Medium',
    color: '#161415',
  },
  support: {
    padding: 15,
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Gotham-Medium',
    lineHeight: 18,
    color: '#161415',
  },
  faqTitle: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 5},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    fontFamily: 'Gotham-Book',
    marginBottom: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#161415',
  },
  titleText: {
    fontFamily: 'Gotham-Medium',
    lineHeight: 16,
    fontSize: 14,
    color: '#161415',
  },
  paraText: {
    fontFamily: 'Gotham-Book',
    lineHeight: 16,
    fontSize: 14,
    color: '#161415',
  },
  faqPara: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 5},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    fontFamily: 'Gotham-Book',
    color: '#161415',
  },
  chevronImage: {
    width: 22,
    height: 22,
  },
  chevronImageOpen: {
    width: 22,
    height: 22,
    transform: [{rotate: '180deg'}],
  },
  supportList: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 15,
  },
  iconBox: {
    width: 22,
    height: 22,
    backgroundColor: '#000',
    padding: 4,
    borderRadius: 20,
  },
  supportIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  supportText: {
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'Gotham-medium',
    color: '#161415',
  },
  supportData: {
    marginLeft: '25%',
    marginTop: 15,
  },
});
