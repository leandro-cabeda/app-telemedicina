import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Header } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Feather';

export default ({ data, action, style }) => {
  const actionBack = () => action ? action() : Actions.reset("Main");

  return (
    <Header
      statusBarProps={{
        barStyle: Platform.OS === 'ios' ? 'dark-content' : 'light-content',
        translucent: true,
      }}
      leftComponent={
        <TouchableOpacity onPress={actionBack}>
          <Icon size={30} name="chevron-left" color="#000" />
        </TouchableOpacity>
      }
      centerComponent={{
        text: data,
        style: styles.centerStyles,
      }}
      containerStyle={[styles.containerStyles, style]}
    />
  );

}

const styles = StyleSheet.create({
  containerStyles: {
    backgroundColor: '#C9EFE0',
    justifyContent: 'space-around',
  },
  centerStyles: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: "MuseoSans-300"
  }
});
