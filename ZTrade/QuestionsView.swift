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

                SectionView(header: "Mean Return Percentage", text: "Mean return percentage is the average return of an investment over a specified period of time. It is calculated by taking the sum of all returns and dividing it by the number of periods.")
                
                SectionView(header: "Max Sharpe Ratio Weight", text: "Max Sharpe Ratio Weight refers to the asset allocation that maximizes the Sharpe ratio. The Sharpe ratio is a measure of risk-adjusted return, calculated by dividing the difference between the portfolio return and the risk-free rate by the portfolio's standard deviation. Please note, this information does not provide advice about buying short.")
                
                SectionView(header: "Equal Risk Contribution (ERC) Weight", text: "Equal Risk Contribution (ERC) Weight is an asset allocation strategy where each asset contributes equally to the overall portfolio risk. This method aims to achieve a balanced risk distribution among the assets. Please note, this information does not provide advice about buying short.")
                
                SectionView(header: "Risk-Free Rate", text: "The risk-free rate is the return on an investment with no risk of financial loss. It is often represented by the yield on government bonds, such as U.S. Treasury bonds.")
                
                SectionView(header: "Default Date Range", text: "The default date range for the investment model is set to a 30-day period. This means the analysis and calculations will be based on the stock data from the past 30 days.")
                
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
