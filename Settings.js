import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { AppContext } from './AppContext';  // Import the AppContext

const Settings = () => {
  const { isChinese, setIsChinese, isDarkMode, setIsDarkMode } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Page</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>US Stock | A 股</Text>
        <Switch 
          value={isChinese}
          onValueChange={value => setIsChinese(value)}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode (Beta)</Text>
        <Switch 
          value={isDarkMode}
          onValueChange={value => setIsDarkMode(value)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginVertical: 10,
  },
  settingText: {
    fontSize: 18,
  },
});

export default Settings;
