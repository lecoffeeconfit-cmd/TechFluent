import * as SecureStore from 'expo-secure-store';
export const sessionStorageAdapter = {
  getItem:(k:string)=>SecureStore.getItemAsync(k),
  setItem:(k:string,v:string)=>SecureStore.setItemAsync(k,v,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY}),
  removeItem:(k:string)=>SecureStore.deleteItemAsync(k),
};
