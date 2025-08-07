//
//  ContentView.swift
//  AudioPlayerNative
//
//  Created by Srinivas Mummidi on 24/07/25.
//

import SwiftUI
import WebKit
import EnterpriseReact

struct ContentView: View {
    @State private var showSheet: Bool = false
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome to the Native App")
                    .padding()
//                Button("Present WebView") {
//                    showSheet = true
//                }
                
                        NavigationLink("Push React Native Screen") {
                          ReactNativeView(moduleName: "Enterprise")
                        }
                          NavigationLink("Push Web view") {
                            WebView(url: URL(string: "https://wsk66k6v-3000.inc1.devtunnels.ms/webview")!)
                          }
                
            }
//            .sheet(isPresented: $showSheet) {
//                WebView(url: URL(string: "https://wsk66k6v-3000.inc1.devtunnels.ms/webview")!)
//            }
        }
    }
}

#Preview {
    ContentView()
}
