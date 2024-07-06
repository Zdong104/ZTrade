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

  const styles = StyleSheet.create({
    container: {
      marginTop: 40,
      marginVertical:30,
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
      marginBottom:20,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>投资模型说明</Text>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>平均回报率</Text>
        <Text style={styles.text}>
          平均回报率是指在特定时间段内投资的平均回报。它通过将所有回报相加，然后除以期间数来计算。
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>最大夏普比率权重</Text>
        <Text style={styles.text}>
          最大夏普比率权重指的是最大化夏普比率的资产配置。夏普比率是衡量风险调整回报的指标，通过将投资组合回报与无风险利率的差额除以投资组合的标准差来计算。请注意，此信息不提供关于做空的建议。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>等风险贡献（ERC）权重</Text>
        <Text style={styles.text}>
          等风险贡献（ERC）权重是一种资产配置策略，其中每种资产对整体投资组合风险的贡献是相等的。该方法旨在实现资产之间的风险平衡。请注意，此信息不提供关于做空的建议。
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>无风险利率</Text>
        <Text style={styles.text}>
          无风险利率是指没有财务损失风险的投资回报。它通常由政府债券的收益率来表示，例如美国国债。
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subHeader}>默认日期范围</Text>
        <Text style={styles.text}>
          投资模型的默认日期范围设置为30天。这意味着分析和计算将基于过去30天的股票数据。
        </Text>
      </View>
      
      <View style={styles.symbolSection}>
        <Text style={styles.subHeader}>股票代码和公司名称</Text>
        <Text style={styles.text}>sh600519: 贵州茅台</Text>
        <Text style={styles.text}>sh601318: 中国平安</Text>
        <Text style={styles.text}>sh600036: 招商银行</Text>
        <Text style={styles.text}>sh601899: 紫金矿业</Text>
        <Text style={styles.text}>sh600900: 长江电力</Text>
        <Text style={styles.text}>sh601166: 兴业银行</Text>
        <Text style={styles.text}>sh601398: 工商银行</Text>
        <Text style={styles.text}>sh600276: 恒瑞医药</Text>
        <Text style={styles.text}>sh600030: 中信证券</Text>
        <Text style={styles.text}>sh600887: 伊利股份</Text>
        <Text style={styles.text}>sh600309: 万华化学</Text>
        <Text style={styles.text}>sh601288: 农业银行</Text>
        <Text style={styles.text}>sh601088: 中国神华</Text>
        <Text style={styles.text}>sh600028: 中国石化</Text>
        <Text style={styles.text}>sh600809: 山西汾酒</Text>
        <Text style={styles.text}>sh601668: 中国建筑</Text>
        <Text style={styles.text}>sh601857: 中国石油</Text>
        <Text style={styles.text}>sh601012: 隆基绿能</Text>
        <Text style={styles.text}>sh600690: 海尔智家</Text>
        <Text style={styles.text}>sh601225: 陕西煤业</Text>
        <Text style={styles.text}>sh601601: 中国太保</Text>
        <Text style={styles.text}>sh600031: 三一重工</Text>
        <Text style={styles.text}>sh601919: 中远海控</Text>
        <Text style={styles.text}>sh601988: 中国银行</Text>
        <Text style={styles.text}>sh601728: 中国电信</Text>
        <Text style={styles.text}>sh600406: 国电南瑞</Text>
        <Text style={styles.text}>sh688981: 中芯国际</Text>
        <Text style={styles.text}>sh600050: 中国联通</Text>
        <Text style={styles.text}>sh603259: 药明康德</Text>
        <Text style={styles.text}>sh600150: 中国船舶</Text>
        <Text style={styles.text}>sh600089: 特变电工</Text>
        <Text style={styles.text}>sh600048: 保利发展</Text>
        <Text style={styles.text}>sh601888: 中国中免</Text>
        <Text style={styles.text}>sh600436: 片仔癀</Text>
        <Text style={styles.text}>sh603501: 韦尔股份</Text>
        <Text style={styles.text}>sh601390: 中国中铁</Text>
        <Text style={styles.text}>sh688041: 海光信息</Text>
        <Text style={styles.text}>sh600104: 上汽集团</Text>
        <Text style={styles.text}>sh600438: 通威股份</Text>
        <Text style={styles.text}>sh603288: 海天味业</Text>
        <Text style={styles.text}>sh688111: 金山办公</Text>
        <Text style={styles.text}>sh603986: 兆易创新</Text>
        <Text style={styles.text}>sh601628: 中国人寿</Text>
        <Text style={styles.text}>sh601669: 中国电建</Text>
        <Text style={styles.text}>sh601633: 长城汽车</Text>
        <Text style={styles.text}>sh600941: 中国移动</Text>
        <Text style={styles.text}>sh601328: 交通银行</Text>
        <Text style={styles.text}>sh601658: 邮储银行</Text>
        <Text style={styles.text}>sh601985: 中国核电</Text>
        <Text style={styles.text}>sh688012: 中微公司</Text>
      </View>


      <View style={styles.disclaimerSection}>
        <Text style={styles.disclaimer}>
          免责声明：此应用程序仅用于教育和信息目的，不提供任何投资建议或推荐。用户应进行自己的研究，并在做出任何投资决策之前咨询财务顾问。
        </Text>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackHeader}>发送反馈</Text>
        <Text style={styles.feedbackText}>如果您有任何反馈或建议，请发送到</Text>
        <TouchableOpacity onLongPress={() => handleLongPress('puma122707@gmail.com')}>
          <Text style={styles.feedbackText}>
            puma122707@gmail.com.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};



export default Questions;
