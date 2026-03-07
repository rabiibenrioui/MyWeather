import * as SecureStore from 'expo-secure-store';

export const setData = async (key, value) => {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch(error) {
        console.log('Error storing value: ', error);
    }
};

export const getData = async (key) => {
    try {
        const value = await SecureStore.getItemAsync(key);
        return value;
    }catch(error) {
        console.log('Error retrieving value: ', error);
        return null;
    }
}