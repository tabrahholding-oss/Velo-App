import {View, ActivityIndicator, Dimensions} from 'react-native';

const height = Dimensions.get('window').height;

const PageLoader = ({loading}) => {
  return (
    <>
      {loading === true ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            height: height,
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 999,
          }}>
          <ActivityIndicator
            color={'#161415'}
            size={42}
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              right: 0,
              top: 0,
              margin: 'auto',
            }}
          />
        </View>
      ) : (
        <></>
      )}
    </>
  );
};
export default PageLoader;
