import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur sauvegarde token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Erreur récupération token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Erreur suppression token:', error);
  }
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Erreur sauvegarde user:', error);
  }
};

export const getUser = async () => {
  try {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Erreur récupération user:', error);
    return null;
  }
};
