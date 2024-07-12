import SwiftUI
import Combine

struct ModelInput: Codable {
    var basket: [String]
    var riskFreeRate: Double
    var totalAmount: Double
    var startDate: Date
    var endDate: Date
    var useChinese: Bool
}

struct ModelOutput: Codable {
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

struct HomeView: View {
    @Binding var useChinese: Bool
    @Binding var isDarkMode: Bool
    @State private var selectedStocks: [String] = []
    @State private var searchTerm: String = ""
    @State private var basket: [String] = []
    @State private var riskFreeRate: String = "0.0"
    @State private var totalAmount: String = "1000"
    @State private var startDate: Date = Calendar.current.date(byAdding: .day, value: -30, to: Date())!
    @State private var endDate: Date = Date()
    @State private var results: ModelOutput? = nil
    @Environment(\.colorScheme) var colorScheme
    @State private var showingAlert: Bool = false
    @State private var isLoading: Bool = false // Loading state to control the overlay

    struct Results {
        var meanReturns: [Double]
        var maxSharpeWeights: [Double]
        var ercWeights: [Double]
    }
    
    let stocks = [
        "aapl", "amd", "amzn", "f", "goog", "gs", "intc", "ko", "meta", "msft", "nflx", "nvda", "tsla", "v", "axp", "ba", "cat", "csco", "cvx", "dis", "dow", "hd", "hon", "ibm", "jnj", "jpm", "mcd", "mmm", "mrk", "nke", "pg", "trv", "unh"
    ]
    
    var filteredStocks: [String] {
        if searchTerm.isEmpty {
            return Array(stocks.prefix(10))
        } else {
            return Array(stocks.filter { $0.uppercased().contains(searchTerm.uppercased()) }.prefix(10))
        }
    }
    
    func toggleStockSelection(stock: String) {
        if selectedStocks.contains(stock) {
            selectedStocks.removeAll { $0 == stock }
        } else {
            selectedStocks.append(stock)
        }
        selectedStocks.sort() // Sort selected stocks alphabetically
    }
    
    func addToBasket() {
        let newStocks = selectedStocks.filter { !basket.contains($0) }
        basket.append(contentsOf: newStocks)
        basket.sort() // Sort basket alphabetically
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

        isLoading = true // Show loading overlay

        let dataToSend = ModelInput(
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
            print("Failed to encode data")
            isLoading = false // Hide loading overlay
            return
        }

        // Create the URL request
        let url = URL(string: "http://172.210.178.32:6000/process")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData

        // Send the request
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error: \(error)")
                DispatchQueue.main.async {
                    isLoading = false // Hide loading overlay
                }
                return
            }
            guard let data = data else {
                print("No data received")
                DispatchQueue.main.async {
                    isLoading = false // Hide loading overlay
                }
                return
            }
            
            // Print raw JSON response for debugging
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Raw JSON response: \(jsonString)")
            }
            
            // Decode the response
            do {
                let modelOutput = try JSONDecoder().decode(ModelOutput.self, from: data)
                DispatchQueue.main.async {
                    results = modelOutput
                    isLoading = false // Hide loading overlay
                }
            } catch {
                print("Failed to decode response: \(error)")
                DispatchQueue.main.async {
                    isLoading = false // Hide loading overlay
                }
            }
        }
        task.resume()
    }
    
    var body: some View {
        ZStack {
            NavigationView {
                VStack {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            HStack {
                                Text("Select stocks for your portfolio:")
                                    .font(.headline)
                                Spacer()
                                NavigationLink(destination: SettingsView(useChinese: $useChinese, isDarkMode: $isDarkMode)) {
                                    Image(systemName: "ellipsis")
                                        .font(.title2)
                                        .padding()
                                }
                            }
                            
                            TextField("Search stocks...", text: $searchTerm)
                                .padding()
                                .background(Color(UIColor.secondarySystemBackground))
                                .cornerRadius(8)
                                .onReceive(Just(searchTerm)) { newValue in
                                    let allowedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                                    let filtered = newValue.filter { allowedCharacters.contains($0) }
                                    if filtered != newValue {
                                        self.searchTerm = filtered
                                    }
                                }
                            
                            VStack(spacing: 10) {
                                ForEach(filteredStocks.chunked(into: 5), id: \.self) { row in
                                    HStack {
                                        ForEach(row, id: \.self) { stock in
                                            Button(action: {
                                                toggleStockSelection(stock: stock)
                                            }) {
                                                Text(stock.uppercased())
                                                    .foregroundColor(.white)
                                                    .frame(maxWidth: .infinity)
                                                    .frame(height: 40)
                                                    .background(selectedStocks.contains(stock) ? Color.green : Color.gray)
                                                    .cornerRadius(8)
                                                    .font(.system(size: 16))
                                                    .fixedSize(horizontal: false, vertical: true) // Ensure text size doesn't affect height
                                            }
                                        }
                                    }
                                }
                            }
                            
                            HStack {
                                Button(action: addToBasket) {
                                    Text("Add to Basket")
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.blue)
                                        .cornerRadius(8)
                                }
                                Button(action: clearBasket) {
                                    Text("Clear Basket")
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.red)
                                        .cornerRadius(8)
                                }
                            }
                            
                            if !basket.isEmpty {
                                VStack(alignment: .leading) {
                                    Text("Basket:")
                                        .font(.headline)
                                    ForEach(basket.chunked(into: 6), id: \.self) { row in
                                        HStack {
                                            ForEach(row, id: \.self) { stock in
                                                Text(stock.uppercased())
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
                                Text("Risk-Free Rate:")
                                    .font(.headline)
                                TextField("Enter risk-free rate", text: $riskFreeRate)
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
                                Text("Total Amount to Allocate:")
                                    .font(.headline)
                                TextField("Enter total amount", text: $totalAmount)
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
                                    Text("Select Start Date")
                                        .font(.subheadline)
                                    DatePicker("", selection: $startDate, displayedComponents: .date)
                                        .labelsHidden()
                                }
                                VStack {
                                    Text("Select End Date")
                                        .font(.subheadline)
                                    DatePicker("", selection: $endDate, displayedComponents: .date)
                                        .labelsHidden()
                                }
                            }
                            .padding()
                            
                            
                            Button(action: fetchDataAndRunModel) {
                                Text("Start")
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue)
                                    .cornerRadius(8)
                            }
                            .alert(isPresented: $showingAlert) {
                                Alert(title: Text("No Stocks Selected"), message: Text("Please select at least one stock before running the model."), dismissButton: .default(Text("OK")))
                            }
                            
                            if let results = results {
                                VStack(alignment: .leading, spacing: 10) {
                                    Text("Mean Returns %:")
                                        .font(.headline)
                                        .padding()
                                        .background(Color.yellow.opacity(0.2))
                                        .cornerRadius(8)
                                    ForEach(0..<results.meanReturns.count, id: \.self) { index in
                                        Text("\(basket[index].uppercased()): \(results.meanReturns[index])")
                                    }

                                    Text("Allocated Weights:")
                                        .font(.headline)
                                        .padding()
                                        .background(Color.blue.opacity(0.2))
                                        .cornerRadius(8)
                                    ForEach(0..<results.Allocated_Weights.count, id: \.self) { index in
                                        Text("\(basket[index].uppercased()): \(results.Allocated_Weights[index])")
                                    }
                                    
                                    Text("Expected Annual Return:\(results.Expected_annual_return)")
                                        .font(.headline)
                                        .padding()
                                        .background(Color.green.opacity(0.2))
                                        .cornerRadius(8)
                                    
                                    Text("Annual Volatility:\(results.Annual_volatility)")
                                        .font(.headline)
                                        .padding()
                                        .background(Color.blue.opacity(0.2))
                                        .cornerRadius(8)
                                    
                                    
                                    Text("Sharpe Ratio:\(results.Sharpe_Ratio)")
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
            
            if isLoading {
                ZStack {
                    Color.black.opacity(0.5)
                        .edgesIgnoringSafeArea(.all)
                    ProgressView("Loading...")
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                }
            }
        }
    }
    
    func saveSettings() {
        // Save the settings, e.g., to UserDefaults or your app's state management
        UserDefaults.standard.set(useChinese, forKey: "useChinese")
        UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
        // Any additional logic to handle the settings changes
        print("Settings saved: useChinese=\(useChinese), isDarkMode=\(isDarkMode)")
    }
}

// Helper function to chunk an array into subarrays of a given size
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}

#Preview {
    HomeView(useChinese: .constant(false), isDarkMode: .constant(false))
}
