//
//  SettingsView.swift
//  ZTrade
//
//  Created by Zihan Dong on 7/8/24.
//

import SwiftUI


struct SettingsView: View {
    @Binding var useChinese: Bool
    @State private var tempUseChinese: Bool
    @Binding var isDarkMode: Bool



    init(useChinese: Binding<Bool>, isDarkMode: Binding<Bool>) {
        _useChinese = useChinese
        _isDarkMode = isDarkMode
        _tempUseChinese = State(initialValue: useChinese.wrappedValue)

    }

    var body: some View {
        VStack {
            Text("Settings Page")
                .font(.largeTitle)
                .padding()

            HStack {
                Text("US Stock | A 股")
                    .font(.title2)
                Spacer()
                Toggle(isOn: $tempUseChinese) {
                    Text("")
                }
                .labelsHidden()
            }
            .padding()

            HStack {
                Text("Dark Mode")
                    .font(.title2)
                Spacer()
                Toggle(isOn: $isDarkMode) {
                    Text("")
                }
                .labelsHidden()
            }
            .padding()
        }
        .padding()
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            useChinese = tempUseChinese
        }
    }
}

#Preview {
    SettingsView(useChinese: .constant(false), isDarkMode: .constant(false))
}
