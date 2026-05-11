import React from 'react';
import {Dimensions, View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const width = Dimensions.get('window').width;

export const SkeltonBlackCard = () => {
    return (
      
        <SkeletonPlaceholder borderRadius={12}>
          <SkeletonPlaceholder.Item
            width={width - 20} marginTop={10} height={90}  />
        </SkeletonPlaceholder>
    );
  };

export const SkeltonCard = () => {
  return (
    <View
      style={{
        width: width - 40,
        height: 70,
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        marginTop: 10,
        padding: 7,
      }}>
      <SkeletonPlaceholder borderRadius={12}>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between">
          <SkeletonPlaceholder.Item flexDirection="row">
            <SkeletonPlaceholder.Item width={60} height={56} />
            <SkeletonPlaceholder.Item marginLeft={10}>
              <SkeletonPlaceholder.Item height={16} marginTop={5} width={120} />
              <SkeletonPlaceholder.Item height={12} marginTop={3} width={80} />
              <SkeletonPlaceholder.Item height={12} marginTop={3} width={100} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item height={20} marginTop={20} width={80} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export const SkeltonStudio = () => {
  return (
    <SkeletonPlaceholder borderRadius={32}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        width={width - 40}
        justifyContent="space-between">
        <SkeletonPlaceholder.Item
          marginTop={10}
          width={width / 3 - 25}
          height={35}
        />
        <SkeletonPlaceholder.Item
          marginTop={10}
          width={width / 3 - 25}
          height={35}
        />
        <SkeletonPlaceholder.Item
          marginTop={10}
          width={width / 3 - 25}
          height={35}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
