//
//  HomeChineseView.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//
import SwiftUI
import Combine


struct ModelInputChinese: Codable {
    var basket: [String]
    var riskFreeRate: Double
    var totalAmount: Double
    var startDate: Date
    var endDate: Date
    var useChinese: Bool
}

struct ModelOutputChinese: Codable {
    var meanReturns: [String]
    var Allocated_Weights: [String]
    var Expected_annual_return: String
    var Annual_volatility: String
    var Sharpe_Ratio: String
    
    enum CodingKeys: String, CodingKey {
        case meanReturns
        case Allocated_Weights
        case Expected_annual_return = "Expected_annual_return:"
        case Annual_volatility = "Annual_volatility:"
        case Sharpe_Ratio = "Sharpe_Ratio:"
    }
}

struct HomeChineseView: View {
    @Binding var useChinese: Bool
    @Binding var isDarkMode: Bool
    @State private var selectedStocks: [String] = []
    @State private var searchTerm: String = ""
    @State private var basket: [String] = []
    @State private var riskFreeRate: String = "0.0"
    @State private var totalAmount: String = "1000"
    @State private var startDate: Date = Calendar.current.date(byAdding: .day, value: -30, to: Date())!
    @State private var endDate: Date = Date()
    @State private var results: ModelOutputChinese? = nil
    @Environment(\.colorScheme) var colorScheme
    @State private var showingAlert = false

    struct Results {
        var meanReturns: [Double]
        var maxSharpeWeights: [Double]
        var ercWeights: [Double]
    }

    let stockMap: [String: String] = [
        "600028.SS": "中国石化",
        "600030.SS": "中信证券",
        "600031.SS": "三一重工",
        "600036.SS": "招商银行",
        "600048.SS": "保利发展",
        "600050.SS": "中国联通",
        "600089.SS": "特变电工",
        "600104.SS": "上汽集团",
        "600150.SS": "中国船舶",
        "600276.SS": "恒瑞医药",
        "600309.SS": "万华化学",
        "600406.SS": "国电南瑞",
        "600436.SS": "片仔癀",
        "600438.SS": "通威股份",
        "600487.SS": "山西汾酒",
        "600690.SS": "海尔智家",
        "600809.SS": "山西汾酒",
        "600887.SS": "伊利股份",
        "600900.SS": "长江电力",
        "600941.SS": "中国移动",
        "601012.SS": "隆基绿能",
        "601088.SS": "中国神华",
        "601166.SS": "兴业银行",
        "601225.SS": "陕西煤业",
        "601288.SS": "农业银行",
        "601318.SS": "中国平安",
        "601328.SS": "交通银行",
        "601390.SS": "中国中铁",
        "601398.SS": "工商银行",
        "601601.SS": "中国太保",
        "601628.SS": "中国人寿",
        "601633.SS": "长城汽车",
        "601658.SS": "邮储银行",
        "601668.SS": "中国建筑",
        "601669.SS": "中国电建",
        "601857.SS": "中国石油",
        "601888.SS": "中国中免",
        "601899.SS": "紫金矿业",
        "601919.SS": "中远海控",
        "601985.SS": "中国核电",
        "601988.SS": "中国银行",
        "603259.SS": "药明康德",
        "603288.SS": "海天味业",
        "603501.SS": "韦尔股份",
        "603986.SS": "兆易创新",
        "688012.SS": "中微公司",
        "688041.SS": "海光信息",
        "688111.SS": "金山办公",
        "688981.SS": "中芯国际"
    ]

    var filteredStocks: [String] {
        if searchTerm.isEmpty {
            return Array(stockMap.keys.prefix(12))
        } else {
            return Array(stockMap.keys.filter { $0.contains(searchTerm) || (stockMap[$0]?.contains(searchTerm) ?? false) }.prefix(10))
        }
    }

    func toggleStockSelection(stock: String) {
        if selectedStocks.contains(stock) {
            selectedStocks.removeAll { $0 == stock }
        } else {
            selectedStocks.append(stock)
        }
        selectedStocks.sort()
    }

    func addToBasket() {
        let newStocks = selectedStocks.filter { !basket.contains($0) }
        basket.append(contentsOf: newStocks)
        basket.sort()
        selectedStocks = []
    }

    func clearBasket() {
        basket = []
        results = nil
    }

    func fetchDataAndRunModel() {
        guard !basket.isEmpty else {
            showingAlert = true
            return
        }

        let dataToSend = ModelInputChinese(
            basket: basket,
            riskFreeRate: Double(riskFreeRate) ?? 0.0,
            totalAmount: Double(totalAmount) ?? 1000.0,
            startDate: startDate,
            endDate: endDate,
            useChinese: useChinese
        )
        
        // Log the collected data for debugging
        print("useChinese: \(useChinese)")
        print("Basket: \(basket)")
        print("Risk-Free Rate: \(riskFreeRate)")
        print("Total Amount: \(totalAmount)")
        print("Start Date: \(startDate)")
        print("End Date: \(endDate)")
        

        // Serialize the data to JSON
        guard let jsonData = try? JSONEncoder().encode(dataToSend) else {
            return
        }

        // Create the URL request
        let url = URL(string: "http://10.152.39.174:6000/process")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData

        // Send the request
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error: \(error)")
                return
            }
            guard let data = data else {
                print("No data received")
                return
            }
            
            // Print raw JSON response for debugging
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Raw JSON response: \(jsonString)")
            }
            
            // Decode the response
                do {
                    let modelOutput = try JSONDecoder().decode(ModelOutputChinese.self, from: data)
                    DispatchQueue.main.async {
                        // Update your results here
                        results = modelOutput
                    }
                } catch {
                    print("Failed to decode response: \(error)")
                }
            }
        task.resume()
    }

    var body: some View {
        NavigationView {
            VStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        HStack {
                            Text("选择股票:")
                                .font(.headline)
                            Spacer()
                            NavigationLink(destination: SettingsView(useChinese: $useChinese, isDarkMode: $isDarkMode)) {
                                Image(systemName: "ellipsis")
                                    .font(.title2)
                                    .padding()
                            }
                        }

                        TextField("搜索股票...", text: $searchTerm)
                            .padding()
                            .background(Color(UIColor.secondarySystemBackground))
                            .cornerRadius(8)


                        VStack(spacing: 12) {
                            ForEach(filteredStocks.chunkedChinese(into: 4), id: \.self) { row in
                                HStack {
                                    ForEach(row, id: \.self) { stock in
                                        Button(action: {
                                            toggleStockSelection(stock: stock)
                                        }) {
                                            Text(stockMap[stock] ?? stock)
                                                .foregroundColor(.white)
                                                .frame(maxWidth: .infinity)
                                                .frame(height: 40)
                                                .background(selectedStocks.contains(stock) ? Color.green : Color.gray)
                                                .cornerRadius(8)
                                                .font(.system(size: 16))
                                                .fixedSize(horizontal: false, vertical: true)
                                        }
                                    }
                                }
                            }
                        }

                        HStack {
                            Button(action: addToBasket) {
                                Text("添加股票")
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .cornerRadius(8)
                            }
                            Button(action: clearBasket) {
                                Text("清除选中")
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.red)
                                    .cornerRadius(8)
                            }
                        }

                        if !basket.isEmpty {
                            VStack(alignment: .leading) {
                                Text("已选股票:")
                                    .font(.headline)
                                ForEach(basket.chunked(into: 4), id: \.self) { row in
                                    HStack {
                                        ForEach(row, id: \.self) { stock in
                                            Text(stockMap[stock] ?? stock)
                                                .padding(5)
                                                .background(Color.gray.opacity(0.2))
                                                .cornerRadius(8)
                                                .fixedSize(horizontal: false, vertical: true)
                                        }
                                    }
                                }
                            }
                        }

                        VStack(alignment: .leading) {
                            Text("零风险利率:")
                                .font(.headline)
                            TextField("输入零风险利率", text: $riskFreeRate)
                                .padding()
                                .background(Color(UIColor.secondarySystemBackground))
                                .cornerRadius(8)
                                .onReceive(Just(riskFreeRate)) { newValue in
                                    let filtered = newValue.filter { "0123456789.".contains($0) }
                                    let decimalCount = filtered.filter { $0 == "." }.count
                                    if decimalCount > 1 {
                                        let firstDecimalIndex = filtered.firstIndex(of: ".")!
                                        self.riskFreeRate = String(filtered.prefix(through: firstDecimalIndex) + filtered.dropFirst(firstDecimalIndex.utf16Offset(in: filtered) + 1).filter { $0 != "." })
                                    } else {
                                        self.riskFreeRate = filtered
                                    }
                                }
                        }

                        VStack(alignment: .leading) {
                            Text("可分配总金额:")
                                .font(.headline)
                            TextField("输入总金额", text: $totalAmount)
                                .padding()
                                .background(Color(UIColor.secondarySystemBackground))
                                .cornerRadius(8)
                                .onReceive(Just(totalAmount)) { newValue in
                                    let filtered = newValue.filter { "0123456789.".contains($0) }
                                    let decimalCount = filtered.filter { $0 == "." }.count
                                    if decimalCount > 1 {
                                        let firstDecimalIndex = filtered.firstIndex(of: ".")!
                                        self.totalAmount = String(filtered.prefix(through: firstDecimalIndex) + filtered.dropFirst(firstDecimalIndex.utf16Offset(in: filtered) + 1).filter { $0 != "." })
                                    } else {
                                        self.totalAmount = filtered
                                    }
                                }
                        }
                        
                        HStack {
                            VStack {
                                Text("选择开始日期")
                                    .font(.subheadline)
                                DatePicker("", selection: $startDate, displayedComponents: .date)
                                    .labelsHidden()
                            }
                            VStack {
                                Text("选择结束日期")
                                    .font(.subheadline)
                                DatePicker("", selection: $endDate, displayedComponents: .date)
                                    .labelsHidden()
                            }
                        }
                        .padding()


                        

                        Button(action: fetchDataAndRunModel) {
                            Text("开始")
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(8)
                        }
                        .alert(isPresented: $showingAlert) {
                            Alert(title: Text("没有选择股票"), message: Text("请在运行模型之前至少选择一只股票。"), dismissButton: .default(Text("确定")))
                        }

                        if let results = results {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("平均收益率 %:")
                                    .font(.headline)
                                    .padding()
                                    .background(Color.yellow.opacity(0.2))
                                    .cornerRadius(8)
                                ForEach(0..<results.meanReturns.count, id: \.self) { index in
                                    Text("\(stockMap[basket[index]] ?? basket[index]): \(results.meanReturns[index])")
                                    }
                                Text("分配比例权重:")
                                    .font(.headline)
                                    .padding()
                                    .background(Color.blue.opacity(0.2))
                                    .cornerRadius(8)
                                ForEach(0..<results.Allocated_Weights.count, id: \.self) { index in
                                    Text("\(stockMap[basket[index]] ?? basket[index]): \(results.Allocated_Weights[index])")
                                    }
                                Text("期望回报值: \(results.Expected_annual_return)")
                                    .font(.headline)
                                    .padding()
                                    .background(Color.green.opacity(0.2))
                                    .cornerRadius(8)
                                
                                Text("年波动率: \(results.Annual_volatility)")
                                    .font(.headline)
                                    .padding()
                                    .background(Color.blue.opacity(0.2))
                                    .cornerRadius(8)
                                
                                Text("夏普比率: \(results.Sharpe_Ratio)")
                                    .font(.headline)
                                    .padding()
                                    .background(Color.orange.opacity(0.2))
                                    .cornerRadius(8)
                            }
                        }
                        
                        
                    }
                    .padding()
                }
                .navigationTitle("")
                .navigationBarTitleDisplayMode(.inline)
            }
            .ignoresSafeArea(.keyboard, edges: .bottom)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    func saveSettings() {
        UserDefaults.standard.set(useChinese, forKey: "useChinese")
        UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
        print("设置已保存: useChinese=\(useChinese), isDarkMode=\(isDarkMode)")
    }
}

extension Array {
    func chunkedChinese(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}

#Preview {
    HomeChineseView(useChinese: .constant(false), isDarkMode: .constant(false))
}
