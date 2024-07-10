//
//  ModelChinese.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//

import Foundation

struct ModelInputChinese {
    var selectedStocks: [String]
    var basket: [String]
    var riskFreeRate: Double
    var totalAmount: Double
    var startDate: Date
    var endDate: Date
}

struct ModelOutputChinese {
    var meanReturns: [Double]
    var maxSharpeWeights: [Double]
    var ercWeights: [Double]
}

func runModelChinese(with input: ModelInputChinese) -> HomeChineseView.Results {
    // Implement your model logic here
    // This is a placeholder implementation
    
    let meanReturns = input.basket.map { _ in Double.random(in: 0...0.1) }
    let maxSharpeWeights = input.basket.map { _ in Double.random(in: 0...1) }
    let ercWeights = input.basket.map { _ in Double.random(in: 0...1) }
    
    return HomeChineseView.Results(
        meanReturns: meanReturns,
        maxSharpeWeights: maxSharpeWeights,
        ercWeights: ercWeights
    )
}

