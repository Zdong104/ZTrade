import React, { useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as PortfolioAllocation from 'portfolio-allocation';
import Icon from 'react-native-vector-icons/Ionicons';

const stocks = ['aapl', 'amd', 'amzn', 'f', 'goog', 'gs', 'intc', 'ko', 'meta', 'msft', 'nflx', 'nvda', 'tsla', 'v'];

const Home = () => {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 30);
  const [startDate, setStartDate] = useState(tenDaysAgo);
  const [endDate, setEndDate] = useState(new Date());
  const [results, setResults] = useState(null);
  const [riskFreeRate, setRiskFreeRate] = useState(0.0);
  const [totalAmount, setTotalAmount] = useState(1000);
  const [searchTerm, setSearchTerm] = useState('');
  const [basket, setBasket] = useState([]);

// Section for Model
  const fetchDataAndRunModel = async () => {
    setResults(null);
    console.log('\n\nSelected Stocks: ', basket)
    try {
      const stockData = await fetchStockData(basket, startDate, endDate);
      console.log('\n\nStockData:', stockData)
      const modelResults = runModel(stockData);
      setResults(modelResults);
    } catch (error) {
      Alert.alert('Error', 'The input list cannot be empty. Please check the basket or date length.');
    }
  };

  const fetchStockData = async (tickers, startDate, endDate) => {
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const fetchTickerData = async (ticker) => {
      const url = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${Math.floor(new Date(startDate).getTime() / 1000)}&period2=${Math.floor(new Date(endDate).getTime() / 1000)}&interval=1d&events=history`;
      const response = await axios.get(url);
      console.log('\n Catched data from Server\n:', response, '\n\n')
      const rows = response.data.split('\n').slice(1);
      const formattedRows = rows.map(row => {
        const [date, , , , , adj_close,] = row.split(',');
        return { date, tic: ticker, adj_close: parseFloat(adj_close) };
      });
      console.log('\nFetched Data for', ticker, ':', formattedRows, '\n\n'); // Log the fetched data
      return formattedRows;
    };

    const promises = tickers.map(ticker => fetchTickerData(ticker));
    const results = await Promise.all(promises);
    return results.flat();
  };

  const runModel = (data) => {
    const processDfForMvo = (df) => {
      const stockDimension = df.length / selectedStocks.length;
      df.sort((a, b) => (a.date > b.date ? 1 : -1));

      let tic = [...new Set(df.map((item) => item.tic))];
      let mvo = {};

      tic.forEach((t) => {
        mvo[t] = [];
      });

      for (let i = 0; i < df.length; i++) {
        mvo[df[i].tic].push(df[i].adj_close);
      }

      let dates = [...new Set(df.map((item) => item.date))];
      let result = dates.map((date) => {
        let row = { date: date };
        tic.forEach((t) => {
          let index = df.findIndex((item) => item.date === date && item.tic === t);
          row[t] = index !== -1 ? df[index].adj_close : 0;
        });
        return row;
      });
      return result;
    };

    const stockReturnsComputing = (stockPrices) => {
      const rows = stockPrices.length;
      const cols = stockPrices[0].length; // Number of assets
      let stockReturn = Array(rows - 1)
        .fill()
        .map(() => Array(cols).fill(0));

      for (let j = 0; j < cols; j++) { // j: Assets
        for (let i = 0; i < rows - 1; i++) { // i: Daily Prices
          let prevPrice = stockPrices[i][j];
          let currPrice = stockPrices[i + 1][j];
          stockReturn[i][j] = ((currPrice - prevPrice) / prevPrice) * 100;
        }
      }

      return stockReturn;
    };

    const calculateMeanReturns = (arReturns) => {
      const rows = arReturns.length;
      const cols = arReturns[0].length;

      let meanReturns = Array(cols).fill(0);

      for (let j = 0; j < cols; j++) { // Loop through columns (assets)
        for (let i = 0; i < rows; i++) { // Loop through rows (daily returns)
          meanReturns[j] += arReturns[i][j];
        }
        meanReturns[j] /= rows; // Divide by the number of rows to get the mean
      }

      return meanReturns;
    };

    const calculateCovarianceMatrix = (returns, meanReturns) => {
      const rows = returns.length;
      const cols = returns[0].length;
      let covarianceMatrix = Array(cols)
        .fill()
        .map(() => Array(cols).fill(0));

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
          let cov = 0;
          for (let k = 0; k < rows; k++) {
            cov += (returns[k][i] - meanReturns[i]) * (returns[k][j] - meanReturns[j]);
          }
          covarianceMatrix[i][j] = cov / (rows - 1);
        }
      }

      return covarianceMatrix;
    };

    const calculateMaxSharpe = (meanReturns, covReturns) => {
      const nbPortfolios = 100; // Number of portfolios to generate on the efficient frontier
      const portfolios = PortfolioAllocation.meanVarianceEfficientFrontierPortfolios(meanReturns, covReturns, {
        nbPortfolios: nbPortfolios,
        discretizatinType: 'return', // Generate portfolios based on return
      });

      // Find the portfolio with the maximum Sharpe Ratio
      const riskFreeRate = 0; // Risk-free rate, adjust as needed
      let maxSharpeRatio = -Infinity;
      let maxSharpeWeights = [];

      portfolios.forEach(([weights, portfolioReturn, portfolioVolatility]) => {
        const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;
        if (sharpeRatio > maxSharpeRatio) {
          maxSharpeRatio = sharpeRatio;
          maxSharpeWeights = weights;
        }
      });

      const scaledWeights = maxSharpeWeights.map(weight => weight * totalAmount);

      return scaledWeights;
    };

    const calculateERC = (covReturns) => {
      const ercWeights = PortfolioAllocation.equalRiskContributionWeights(covReturns);

      const scaledWeights = ercWeights.map(weight => weight * totalAmount);

      return scaledWeights;
    };

    const stockData = processDfForMvo(data);
    console.log('First Step Process', stockData, '\n\n\n\n\n\n\n')
    const arStockPrices = stockData.map((row) => Object.values(row).slice(1)); // Exclude date column
    console.log('\n\n arStockPrices:', arStockPrices)
    const [rows, cols] = [arStockPrices.length, arStockPrices[0].length];

    const arReturns = stockReturnsComputing(arStockPrices); //arReturns is Asset return in 100% scale
    console.log('\n\n arReturns:', arReturns)

    const meanReturns = calculateMeanReturns(arReturns) // still in 100%
    console.log('\n\n meanReturns:', meanReturns)

    const covReturns = calculateCovarianceMatrix(arReturns, meanReturns); // Calculate the Covariance value
    console.log('Con Variance Value: ', covReturns)

    // Compute the maximum Sharpe ratio portfolio weights
    const maxSharpeWeights = calculateMaxSharpe(meanReturns, covReturns);
    console.log('Max Sharpe Weights: ', maxSharpeWeights);

    const ercWeights = calculateERC(covReturns); // Implement ERC calculation
    console.log('ERC Weights: ', ercWeights);

    return { meanReturns, covReturns, maxSharpeWeights, ercWeights };
  };



  // Below just display and the visualization

  const toggleStockSelection = (stock) => {
    setSelectedStocks((prevSelected) =>
      prevSelected.includes(stock)
        ? prevSelected.filter((item) => item !== stock)
        : [...prevSelected, stock]
    );
  };

  const addToBasket = () => {
    const newStocks = selectedStocks.filter(stock => !basket.includes(stock));
    setBasket([...basket, ...newStocks]);
    setSelectedStocks([]);
  };
  

  const clearBasket = () => {
    setBasket([]);
  };

  const onChangeStart = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const onChangeEnd = (event, selectedDate) => { // 这个event 不能删， 不知道为啥，但是有用
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  const capitalize = (str) => str.toUpperCase();

  const filteredStocks = stocks.filter(stock => stock.toUpperCase().includes(searchTerm.toUpperCase()));

  return (
      <FlatList
        style={styles.container}
        data={filteredStocks}
        keyExtractor={(item) => item}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.header}>Search and Select Stocks:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {filteredStocks.reduce((rows, stock, index) => {
              if (index % 5 === 0) rows.push([]);
              rows[rows.length - 1].push(stock);
              return rows;
            }, []).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.stockRow}>
                {row.map((stock) => (
                  <TouchableOpacity  key={stock}  onPress={() => toggleStockSelection(stock)}  style={[ styles.stockItem,
                  selectedStocks.includes(stock) && styles.selectedStockItem,]} >
                  <Text style={styles.stockText}> {capitalize(stock)} </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}


            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={addToBasket}>
                <Text style={styles.buttonText}>Add to Basket</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={clearBasket}>
                <Text style={styles.buttonText}>Clear Basket</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.basketContainer}>
              <Text style={styles.basketHeader}>Basket:</Text>
              <View style={styles.basketItems}>
                {basket.map((stock, index) => (
                  <Text key={index} style={styles.basketItem}>{capitalize(stock)}</Text>
                ))}
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Risk-Free Rate:</Text>
              <TextInput
                style={styles.input}
                value={riskFreeRate ? String(riskFreeRate) : ''}
                onChangeText={(text) => setRiskFreeRate(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter risk-free rate"
                placeholderTextColor="#C7C7CD" //
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Total Amount to Allocate:</Text>
              <TextInput
                style={styles.input}
                value={totalAmount ? String(totalAmount) : ''}
                onChangeText={(text) => setTotalAmount(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter total amount"
                placeholderTextColor="#C7C7CD"
              />
            </View>


            <View style={styles.datePickerContainer}>
              <View style={styles.datePicker}>
                <Text style={styles.datePickerText}>Select Start Date</Text>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onChangeStart}
                  style={styles.datePickerWrapper}
                />
              </View>
              <View style={styles.datePicker}>
                <Text style={styles.datePickerText}>Select End Date</Text>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onChangeEnd}
                  style={styles.datePickerWrapper}
                />
              </View>
            </View>

            <Button title="Run Model" onPress={fetchDataAndRunModel} style={styles.runButton} />
          </>
        )}
        ListFooterComponent={() => (
          results && (
            <View style={styles.resultsContainer}>
              <View style={styles.resultCard}>
                <View style={styles.resultHeaderContainer}>
                  <Text style={styles.resultHeader}>Mean Returns %:</Text>
                </View>
                {results.meanReturns.map((returnVal, index) => (
                  <Text key={basket[index]} style={styles.resultContent}>
                    {capitalize(basket[index])}: {returnVal.toFixed(4)}
                  </Text>
                ))}
              </View>
              <View style={styles.resultCard}>
                <View style={styles.resultHeaderContainer}>
                  <Text style={styles.resultHeader}>Max Sharpe Ratio Weights:</Text>
                </View>
                {results.maxSharpeWeights.map((weight, index) => (
                  <Text key={basket[index]} style={styles.resultContent}>
                    {capitalize(basket[index])}: {weight.toFixed(2)}
                  </Text>
                ))}
              </View>
              <View style={styles.resultCard}>
                <View style={styles.resultHeaderContainer}>
                  <Text style={styles.resultHeader}>Equal Risk Contribution (ERC) Weights:</Text>
                </View>
                {results.ercWeights.map((weight, index) => (
                  <Text key={basket[index]} style={styles.resultContent}>
                    {capitalize(basket[index])}: {weight.toFixed(2)}
                  </Text>
                ))}
              </View>
            </View>
          )
        )}
      />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50, // Adjust paddingBottom as needed
    backgroundColor: '#f0f0f0',
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  stockItem: {
    flex: 1,
    height: 30,
    marginHorizontal: 5,
    backgroundColor: '#8E8E93', // iOS system gray color
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedStockItem: {
    backgroundColor: '#34C759', // iOS system green color
  },
  stockText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 30, // lineHeight 和 stockItem 的hight 要一致
  },
  inputContainer: {
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  datePicker: {
    flex: 1,
    marginRight: 10,
    alignContent: 'center'
  },
  datePickerText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  datePickerWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 20,
  },
  runButton: {
    marginVertical: 20,
  },
  resultsContainer: {
    marginVertical: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContent: {
    fontSize: 14,
    marginTop: 5,
  },
  resultHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  basketContainer: {
    marginBottom: 20,
  },
  basketHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  basketItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  basketItem: {
    fontSize: 14,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Home;