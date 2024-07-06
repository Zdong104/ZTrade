import React, { useContext, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Pressable, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as PortfolioAllocation from 'portfolio-allocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from './AppContext';  // Import the AppContext


const stockMap = {
  'sh600519': '贵州茅台',
  'sh601318': '中国平安',
  'sh600036': '招商银行',
  'sh601899': '紫金矿业',
  'sh600900': '长江电力',
  'sh601166': '兴业银行',
  'sh601398': '工商银行',
  'sh600276': '恒瑞医药',
  'sh600030': '中信证券',
  'sh600887': '伊利股份',
  'sh600309': '万华化学',
  'sh601288': '农业银行',
  'sh601088': '中国神华',
  'sh600028': '中国石化',
  'sh600809': '山西汾酒',
  'sh601668': '中国建筑',
  'sh601857': '中国石油',
  'sh601012': '隆基绿能',
  'sh600690': '海尔智家',
  'sh601225': '陕西煤业',
  'sh601601': '中国太保',
  'sh600031': '三一重工',
  'sh601919': '中远海控',
  'sh601988': '中国银行',
  'sh601728': '中国电信',
  'sh600406': '国电南瑞',
  'sh688981': '中芯国际',
  'sh600050': '中国联通',
  'sh603259': '药明康德',
  'sh600150': '中国船舶',
  'sh600089': '特变电工',
  'sh600048': '保利发展',
  'sh601888': '中国中免',
  'sh600436': '片仔癀',
  'sh603501': '韦尔股份',
  'sh601390': '中国中铁',
  'sh688041': '海光信息',
  'sh600104': '上汽集团',
  'sh600438': '通威股份',
  'sh603288': '海天味业',
  'sh688111': '金山办公',
  'sh603986': '兆易创新',
  'sh601628': '中国人寿',
  'sh601669': '中国电建',
  'sh601633': '长城汽车',
  'sh600941': '中国移动',
  'sh601328': '交通银行',
  'sh601658': '邮储银行',
  'sh601985': '中国核电',
  'sh688012': '中微公司',
};

const stocks = Object.keys(stockMap);

const Home = () => {

  const navigation = useNavigation();
  const { isDarkMode } = useContext(AppContext);  // Access context here
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
    const sortedBasket = [...basket].sort();
    console.log('\n\nSelected Stocks: ', sortedBasket);
    try {
      const stockData = await fetchStockData(sortedBasket, startDate, endDate);
      console.log('\n\nStockData:', stockData);
      const modelResults = runModel(stockData, sortedBasket);
      setResults(modelResults);
    } catch (error) {
      Alert.alert('Error', 'The input list cannot be empty. Please check the basket or date length.');
    }
  };

  const fetchStockData = async (tickers, start, end, scale = 240) => {
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
  
    const fetchTickerData = async (ticker) => {
      const startDate = formatDate(start);
      const endDate = formatDate(end);
      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();
      const DataLen = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)); // 计算天数差
  
      console.log(`Start Date: ${startDate}`);
      console.log(`End Date: ${endDate}`);
      console.log(`DataLen: ${DataLen}`);
  
      const timestamp = new Date().getTime();
      const url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${ticker}_${scale}_${timestamp}=/CN_MarketDataService.getKLineData?symbol=${ticker}&scale=${scale}&ma=no&datalen=${DataLen}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ticker ${ticker}`);
      }
  
      const blob = await response.blob();
  
      // Use FileReader to read the Blob content as text
      const reader = new FileReader();
      const textPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsText(blob, 'GBK'); // Specify the encoding
  
      const text = await textPromise;
      const jsonpData = text.match(/\((.*)\)/)[1]; // 提取JSONP数据
      const data = JSON.parse(jsonpData);
  
      // 提取 close 值并格式化数据
      const formattedData = data.map(item => ({
        date: item.day,
        tic: ticker,
        close: parseFloat(item.close)
      }));
      console.log('formattedData',formattedData)
  
      return formattedData;
    };
  
    const allData = await Promise.all(tickers.map(ticker => fetchTickerData(ticker)));
    return allData.flat();
  };

  const runModel = (data, sortedBasket) => {
    const processDfForMvo = (df) => {
      const stockDimension = df.length / sortedBasket.length;
      df.sort((a, b) => (a.date > b.date ? 1 : -1));

      let tic = [...new Set(df.map((item) => item.tic))];
      let mvo = {};

      tic.forEach((t) => {
        mvo[t] = [];
      });

      for (let i = 0; i < df.length; i++) {
        mvo[df[i].tic].push(df[i].close);
      }

      let dates = [...new Set(df.map((item) => item.date))];
      let result = dates.map((date) => {
        let row = { date: date };
        tic.forEach((t) => {
          let index = df.findIndex((item) => item.date === date && item.tic === t);
          row[t] = index !== -1 ? df[index].close : 0;
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
    console.log('First Step Process', stockData, '\n\n\n\n\n\n\n');
    const arStockPrices = stockData.map((row) => {
      const { date, ...prices } = row;
      return Object.keys(prices).sort().map(key => prices[key]);
    });

    console.log('\n\n arStockPrices:', arStockPrices);
    const [rows, cols] = [arStockPrices.length, arStockPrices[0].length];

    const arReturns = stockReturnsComputing(arStockPrices); //arReturns is Asset return in 100% scale
    console.log('\n\n arReturns:', arReturns);

    const meanReturns = calculateMeanReturns(arReturns); // still in 100%
    console.log('\n\n meanReturns:', meanReturns);

    const covReturns = calculateCovarianceMatrix(arReturns, meanReturns); // Calculate the Covariance value
    console.log('Con Variance Value: ', covReturns);

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
    setResults(null);
  };

  const onChangeStart = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const onChangeEnd = (event, selectedDate) => { // 这个event 不能删， 不知道为啥，但是有用
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  const capitalize = (str) => (str ? str.toUpperCase() : '');


  // 搜索股票的名字与代码
  const filteredStocks = stocks.filter(stock => {
    const stockName = stockMap[stock];
    return stock.toUpperCase().includes(searchTerm.toUpperCase()) ||
           stockName.toUpperCase().includes(searchTerm.toUpperCase());
  });
  



  const styles = StyleSheet.create({
    container: {
      marginTop: 40,
      padding: 20,
      paddingBottom: 50,
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',  // Use isDarkMode here
      flex: 1,
    },
    header: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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


  return (
    <FlatList
      style={styles.container}
      data={filteredStocks}
      keyExtractor={(item) => item}
      ListHeaderComponent={() => (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>搜索选股:</Text>
            <Pressable onPress={() => navigation.navigate('Settings')}>
              <Icon name="ellipsis-horizontal" size={24} color="black" />
            </Pressable>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="请选择股票..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {filteredStocks.slice(0, 10).reduce((rows, stock, index) => {
            if (index % 5 === 0) rows.push([]);
            rows[rows.length - 1].push(stock);
            return rows;
          }, []).map((row, rowIndex) => (
            <View key={rowIndex} style={styles.stockRow}>
              {row.map((stock) => (
                <TouchableOpacity
                  key={stock}
                  onPress={() => toggleStockSelection(stock)}
                  style={[
                    styles.stockItem,
                    selectedStocks.includes(stock) && styles.selectedStockItem,
                  ]}
                >
                  <Text style={styles.stockText}> {stockMap[stock]} </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}


          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={addToBasket}>
              <Text style={styles.buttonText}>添加股票</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={clearBasket}>
              <Text style={styles.buttonText}>清除选中</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.basketContainer}>
            <Text style={styles.basketHeader}>已选股票:</Text>
            <View style={styles.basketItems}>
              {basket.sort().map((stock, index) => (
                <Text key={index} style={styles.basketItem}>{stockMap[stock]}</Text>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>零风险利率:</Text>
            <TextInput
              style={styles.input}
              value={riskFreeRate ? String(riskFreeRate) : ''}
              onChangeText={(text) => setRiskFreeRate(parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="输入零风险利率"
              placeholderTextColor="#C7C7CD" //
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>可分配总金额:</Text>
            <TextInput
              style={styles.input}
              value={totalAmount ? String(totalAmount) : ''}
              onChangeText={(text) => setTotalAmount(parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder="输入可分配总金额"
              placeholderTextColor="#C7C7CD"
            />
          </View>

          <View style={styles.datePickerContainer}>
            <View style={styles.datePicker}>
              <Text style={styles.datePickerText}>选取起始日</Text>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onChangeStart}
                style={styles.datePickerWrapper}
              />
            </View>
            <View style={styles.datePicker}>
              <Text style={styles.datePickerText}>选取结束日</Text>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onChangeEnd}
                style={styles.datePickerWrapper}
              />
            </View>
          </View>

          <Button title="开始" onPress={fetchDataAndRunModel} style={styles.runButton} />
        </>
      )}
      ListFooterComponent={() => (
        results && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderContainer}>
                <Text style={styles.resultHeader}>平均回报率:</Text>
              </View>
              {results.meanReturns.map((returnVal, index) => (
                <Text key={basket[index]} style={styles.resultContent}>
                  {stockMap[basket[index]]}: {returnVal.toFixed(4)}
                </Text>
              ))}
            </View>
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderContainer}>
                <Text style={styles.resultHeader}>最大夏普比率权重:</Text>
              </View>
              {results.maxSharpeWeights.map((weight, index) => (
                <Text key={basket[index]} style={styles.resultContent}>
                  {stockMap[basket[index]]}: {weight.toFixed(2)}
                </Text>
              ))}
            </View>
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderContainer}>
                <Text style={styles.resultHeader}>等风险贡献（ERC）权重:</Text>
              </View>
              {results.ercWeights.map((weight, index) => (
                <Text key={basket[index]} style={styles.resultContent}>
                  {stockMap[basket[index]]}: {weight.toFixed(2)}
                </Text>
              ))}
            </View>
          </View>
        )
      )}
    />
  );
};

export default Home;
