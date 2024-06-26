import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';

// Your Questions component
const Questions = () => {
  const handleLongPress = async (text) => {
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Investment Model Explanation</Text>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>Mean Return Percentage</Text>
        <Text style={styles.text}>
          Mean return percentage is the average return of an investment over a specified period of time. It is calculated by taking the sum of all returns and dividing it by the number of periods.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>Max Sharpe Ratio Weight</Text>
        <Text style={styles.text}>
          Max Sharpe Ratio Weight refers to the asset allocation that maximizes the Sharpe ratio. The Sharpe ratio is a measure of risk-adjusted return, calculated by dividing the difference between the portfolio return and the risk-free rate by the portfolio's standard deviation. Please note, this information does not provide advice about buying short.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Equal Risk Contribution (ERC) Weight</Text>
        <Text style={styles.text}>
          Equal Risk Contribution (ERC) Weight is an asset allocation strategy where each asset contributes equally to the overall portfolio risk. This method aims to achieve a balanced risk distribution among the assets. Please note, this information does not provide advice about buying short.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>Risk-Free Rate</Text>
        <Text style={styles.text}>
          The risk-free rate is the return on an investment with no risk of financial loss. It is often represented by the yield on government bonds, such as U.S. Treasury bonds.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>Default Date Range</Text>
        <Text style={styles.text}>
          The default date range for the investment model is set to a 30-day period. This means the analysis and calculations will be based on the stock data from the past 30 days.
        </Text>
      </View>
      
      <View style={styles.symbolSection}>
        <Text style={styles.subHeader}>Stock Symbols and Company Names</Text>
        <Text style={styles.text}>AAPL: Apple Inc.</Text>
        <Text style={styles.text}>AMD: Advanced Micro Devices Inc.</Text>
        <Text style={styles.text}>AMZN: Amazon.com Inc.</Text>
        <Text style={styles.text}>F: Ford Motor Co.</Text>
        <Text style={styles.text}>GOOG: Alphabet Inc. (Google)</Text>
        <Text style={styles.text}>GS: Goldman Sachs Group Inc.</Text>
        <Text style={styles.text}>INTC: Intel Corp.</Text>
        <Text style={styles.text}>KO: Coca-Cola Co.</Text>
        <Text style={styles.text}>META: Meta Platforms Inc. (Facebook)</Text>
        <Text style={styles.text}>MSFT: Microsoft Corp.</Text>
        <Text style={styles.text}>NFLX: Netflix Inc.</Text>
        <Text style={styles.text}>NVDA: NVIDIA Corp.</Text>
        <Text style={styles.text}>TSLA: Tesla Inc.</Text>
        <Text style={styles.text}>V: Visa Inc.</Text>
        <Text style={styles.text}>AXP: American Express Co.</Text>
        <Text style={styles.text}>BA: Boeing Co.</Text>
        <Text style={styles.text}>CAT: Caterpillar Inc.</Text>
        <Text style={styles.text}>CSCO: Cisco Systems Inc.</Text>
        <Text style={styles.text}>CVX: Chevron Corp.</Text>
        <Text style={styles.text}>DIS: Walt Disney Co.</Text>
        <Text style={styles.text}>DOW: Dow Inc.</Text>
        <Text style={styles.text}>HD: Home Depot Inc.</Text>
        <Text style={styles.text}>HON: Honeywell International Inc.</Text>
        <Text style={styles.text}>IBM: International Business Machines Corp.</Text>
        <Text style={styles.text}>JNJ: Johnson & Johnson</Text>
        <Text style={styles.text}>JPM: JPMorgan Chase & Co.</Text>
        <Text style={styles.text}>MCD: McDonald's Corp.</Text>
        <Text style={styles.text}>MMM: 3M Co.</Text>
        <Text style={styles.text}>MRK: Merck & Co. Inc.</Text>
        <Text style={styles.text}>NKE: Nike Inc.</Text>
        <Text style={styles.text}>PG: Procter & Gamble Co.</Text>
        <Text style={styles.text}>TRV: Travelers Companies Inc.</Text>
        <Text style={styles.text}>UNH: UnitedHealth Group Inc.</Text>
      </View>


      <View style={styles.disclaimerSection}>
        <Text style={styles.disclaimer}>
          Disclaimer: This application is for educational and informational purposes only and does not provide any investment advice or recommendations. Users should conduct their own research and consult with a financial advisor before making any investment decisions.
        </Text>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackHeader}>Send Feedback</Text>
        <Text style={styles.feedbackText}>If you have any feedback or suggestions, please send them to  </Text>
        <TouchableOpacity onLongPress={() => handleLongPress('puma122707@gmail.com')}>
          <Text style={styles.feedbackText}>
            puma122707@gmail.com.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  disclaimerSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 5,
  },
  disclaimer: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#a00',
  },
  feedbackSection: {
    marginTop: 20,
  },
  feedbackHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
  },
});

export default Questions;
