import {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateToken } from '../src/ErrorBoundary/UpdateToken';

export const UserContext = createContext();

export default function UserProvider({children}) {
  const [auth, setUserAuth] = useState();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {}, [auth]);

  const tokenRefresh = async() => {
    let token = await getToken();
    const updateToken = await UpdateToken(token);
    console.log(updateToken,'uptoken')
    if(updateToken.auth === 'Logout'){
      signOut();
    } 
    else{
      if(result.access_token){
        setUser(result.user);
        setToken(result.access_token);
        setAuth(true);
      }
    }
  }

  const checkAuth = async () => {
    const value = await getAuth();
    if (value != null) {
      console.log('checkAuth', value);
      setUserAuth(value);
    }
  };

  const getUser = async () => {
    try {
      const value = await AsyncStorage.getItem('user');
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (e) {
      console.log('error in user context setUser', e);
      return e;
      // error reading value
    }
  };
  const setUser = async user => {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem('user', jsonValue);
      setUserAuth(true);
    } catch (e) {
      console.log('error in user context setUser', e);
    }
  };

  const setAuth = async value => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('auth', jsonValue);
  };

  const getToken = async () => {
    const value = await AsyncStorage.getItem('token');
    return JSON.parse(value);
  };
  const setToken = async value => {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('token', jsonValue);
  };

  const getAuth = async () => {
    const value = await AsyncStorage.getItem('auth');
    return JSON.parse(value);
  };


  const signOut = async () => {
    await AsyncStorage.removeItem('auth');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.clear();
    setUserAuth(false);
  };

  return (
    <UserContext.Provider
      value={{
        setUser,
        getUser,
        setAuth,
        getAuth,
        setToken,
        getToken,
        auth,
        signOut,
        tokenRefresh,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
