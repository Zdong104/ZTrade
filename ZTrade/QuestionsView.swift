//
//  QuestionsView.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//

import SwiftUI

struct QuestionsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Investment Model Explanation")
                    .font(.title2)
                    .fontWeight(.bold)
                    .padding(.top, 40)

                SectionView(header: "Mean Return Percentage", text: "Mean return percentage is the average return of an investment over a year. It is calculated by taking the sum of all returns and dividing it by the number of periods.")
                
                SectionView(header: "Allocated Weights:", text: "Allocated weights represent the proportion of the total investment allocated to each asset in the portfolio. It reflects the distribution of investment across different assets.")
                    
                SectionView(header: "Expected Annual Return:", text: "Expected annual return is the anticipated return on an investment over one year, based on historical performance or other predictive methods. It provides an estimate of future returns.")
                    
                SectionView(header: "Sharpe Ratio", text: "Sharpe ratio measures the performance of an investment compared to a risk-free asset, after adjusting for its risk. It is calculated by dividing the excess return by the standard deviation of the investment's returns.")
                
                SectionView(header: "Risk-Free Rate", text: "The risk-free rate is the return on an investment with no risk of financial loss. It is often represented by the yield on government bonds, such as U.S. Treasury bonds.")
                
                SectionView(header: "Default Date Range", text: "The default date range for the investment models are set to 2012-05-18 to Today. This means the analysis and calculations will be based on the stock data from the past 30 days.")
                
                SymbolSectionView()
                
                DisclaimerSectionView()
                
                FeedbackSectionView()
            }
            .padding()
        }
    }
}

struct SectionView: View {
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

struct SymbolSectionView: View {
    let symbols = [
        "AAPL: Apple Inc.", "AMD: Advanced Micro Devices Inc.", "AMZN: Amazon.com Inc.",
        "F: Ford Motor Co.", "GOOG: Alphabet Inc. (Google)", "GS: Goldman Sachs Group Inc.",
        "INTC: Intel Corp.", "KO: Coca-Cola Co.", "META: Meta Platforms Inc. (Facebook)",
        "MSFT: Microsoft Corp.", "NFLX: Netflix Inc.", "NVDA: NVIDIA Corp.", "TSLA: Tesla Inc.",
        "V: Visa Inc.", "AXP: American Express Co.", "BA: Boeing Co.", "CAT: Caterpillar Inc.",
        "CSCO: Cisco Systems Inc.", "CVX: Chevron Corp.", "DIS: Walt Disney Co.", "DOW: Dow Inc.",
        "HD: Home Depot Inc.", "HON: Honeywell International Inc.", "IBM: International Business Machines Corp.",
        "JNJ: Johnson & Johnson", "JPM: JPMorgan Chase & Co.", "MCD: McDonald's Corp.",
        "MMM: 3M Co.", "MRK: Merck & Co. Inc.", "NKE: Nike Inc.", "PG: Procter & Gamble Co.",
        "TRV: Travelers Companies Inc.", "UNH: UnitedHealth Group Inc."
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Stock Symbols and Company Names")
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

struct DisclaimerSectionView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Disclaimer: This application is for educational and informational purposes only and does not provide any investment advice or recommendations. Users should conduct their own research and consult with a financial advisor before making any investment decisions.")
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

struct FeedbackSectionView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Send Feedback")
                .font(.headline)
                .fontWeight(.bold)
            
            Text("If you have any feedback or suggestions, please send them to")
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
    QuestionsView()
}
