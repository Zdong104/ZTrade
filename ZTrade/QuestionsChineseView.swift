//
//  QuestionsChineseView.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//

import SwiftUI

struct QuestionsChineseView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("投资模型解释")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding(.top, 40)

                Chinese_SectionView(header: "平均回报率", text: "平均回报率是在指定时间段内投资的平均回报。它是通过将所有回报相加并除以期间数来计算的。")
                
                Chinese_SectionView(header: "最大夏普比率权重", text: "最大夏普比率权重指的是最大化夏普比率的资产配置。夏普比率是风险调整后的回报的衡量标准，它是通过将投资组合回报和无风险利率之间的差额除以投资组合的标准差来计算的。请注意，这些信息不提供关于做空的建议。")
                
                Chinese_SectionView(header: "等风险贡献（ERC）权重", text: "等风险贡献（ERC）权重是一种资产配置策略，每种资产对总体投资组合风险的贡献相同。这种方法旨在实现资产之间的平衡风险分布。请注意，这些信息不提供关于做空的建议。")
                
                Chinese_SectionView(header: "无风险利率", text: "无风险利率是没有财务损失风险的投资回报。它通常以政府债券（如美国国债）的收益率表示。")
                
                Chinese_SectionView(header: "默认日期范围", text: "投资模型的默认日期范围设置为30天。这意味着分析和计算将基于过去30天的股票数据。")
                
                Chinese_SymbolSectionView()
                
                Chinese_DisclaimerSectionView()
                
                Chinese_FeedbackSectionView()
            }
            .padding()
        }
    }
}

struct Chinese_SectionView: View {
    let header: String
    let text: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(header)
                .font(.headline)
                .fontWeight(.bold)
            
            Text(text)
                .font(.body)
                .lineSpacing(4)
        }
        .padding(5)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}

struct Chinese_SymbolSectionView: View {
    let symbols = [
        "sh600519: 贵州茅台", "sh601318: 中国平安", "sh600036: 招商银行",
        "sh601899: 紫金矿业", "sh600900: 长江电力", "sh601166: 兴业银行",
        "sh601398: 工商银行", "sh600276: 恒瑞医药", "sh600030: 中信证券",
        "sh600887: 伊利股份", "sh600309: 万华化学", "sh601288: 农业银行",
        "sh601088: 中国神华", "sh600028: 中国石化", "sh600809: 山西汾酒",
        "sh601668: 中国建筑", "sh601857: 中国石油", "sh601012: 隆基绿能",
        "sh600690: 海尔智家", "sh601225: 陕西煤业", "sh601601: 中国太保",
        "sh600031: 三一重工", "sh601919: 中远海控", "sh601988: 中国银行",
        "sh601728: 中国电信", "sh600406: 国电南瑞", "sh688981: 中芯国际",
        "sh600050: 中国联通", "sh603259: 药明康德", "sh600150: 中国船舶",
        "sh600089: 特变电工", "sh600048: 保利发展", "sh601888: 中国中免",
        "sh600436: 片仔癀", "sh603501: 韦尔股份", "sh601390: 中国中铁",
        "sh688041: 海光信息", "sh600104: 上汽集团", "sh600438: 通威股份",
        "sh603288: 海天味业", "sh688111: 金山办公", "sh603986: 兆易创新",
        "sh601628: 中国人寿", "sh601669: 中国电建", "sh601633: 长城汽车",
        "sh600941: 中国移动", "sh601328: 交通银行", "sh601658: 邮储银行",
        "sh601985: 中国核电", "sh688012: 中微公司"
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("股票代码和公司名称")
                .font(.headline)
                .fontWeight(.bold)
            
            ForEach(symbols, id: \.self) { symbol in
                Text(symbol)
                    .font(.footnote)
                    .lineSpacing(4)
            }
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}

struct Chinese_DisclaimerSectionView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("免责声明：本应用程序仅用于教育和信息目的，并不提供任何投资建议或推荐。用户应进行自己的研究，并在做出任何投资决策之前咨询财务顾问。")
                .font(.caption)
                .italic()
                .foregroundColor(Color.red)
                .lineSpacing(4)
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(8)
    }
}

struct Chinese_FeedbackSectionView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("发送反馈")
                .font(.headline)
                .fontWeight(.bold)
            
            Text("如果您有任何反馈或建议，请发送至")
                .font(.body)
            
            ShareLink(item: "puma122707@gmail.com") {
                Text("puma122707@gmail.com")
                    .font(.body)
                    .underline()
            }
        }
        .padding(10)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}



#Preview {
    QuestionsChineseView()
}
