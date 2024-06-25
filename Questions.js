import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Your Questions component
const Questions = () => {
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
            Max Sharpe Ratio Weight refers to the asset allocation that maximizes the Sharpe ratio. The Sharpe ratio is a measure of risk-adjusted return, calculated by dividing the difference between the portfolio return and the risk-free rate by the portfolio's standard deviation.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.subHeader}>Equal Risk Contribution (ERC) Weight</Text>
          <Text style={styles.text}>
            Equal Risk Contribution (ERC) Weight is an asset allocation strategy where each asset contributes equally to the overall portfolio risk. This method aims to achieve a balanced risk distribution among the assets.
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
        
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimer}>
            Disclaimer: This application is for educational and informational purposes only and does not provide any investment advice or recommendations. Users should conduct their own research and consult with a financial advisor before making any investment decisions.
          </Text>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    padding: 20,
    paddingBottom: 50, // Adjust paddingBottom as needed
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
});

export default Questions;