//
//  ContentView.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//

import SwiftUI

struct ContentView: View {
    @AppStorage("useChinese") var useChinese: Bool = false
    @AppStorage("isDarkMode") var isDarkMode: Bool = false



    var body: some View {
        TabView {
            if useChinese {
                HomeChineseView(useChinese: $useChinese, isDarkMode: $isDarkMode)
                    .tabItem {
                        Label("主页", systemImage: "house")
                    }
                QuestionsChineseView()
                    .tabItem {
                        Label("问题", systemImage: "questionmark.circle")
                    }
                MyPortfolioChineseView()
                    .tabItem {
                        Label("投资组合", systemImage: "book")
                    }
            } else {
                HomeView(useChinese: $useChinese, isDarkMode: $isDarkMode)
                    .tabItem {
                        Label("Home", systemImage: "house")
                    }
                QuestionsView()
                    .tabItem {
                        Label("Questions", systemImage: "questionmark.circle")
                    }
                MyPortfolioView()
                    .tabItem {
                        Label("Portfolio", systemImage: "book")
                    }
            }
        }
        .environment(\.colorScheme, isDarkMode ? .dark : .light)
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}



#Preview {
    ContentView()
}
