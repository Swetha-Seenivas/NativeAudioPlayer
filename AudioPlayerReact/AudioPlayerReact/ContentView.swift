//
//  ContentView.swift
//  AudioPlayerNative
//
//  Created by Srinivas Mummidi on 24/07/25.
//

import SwiftUI
import WebKit
import NativeAudioPlayerReact

struct ContentView: View {
    @State private var showSheet: Bool = false
    var callRecApiKey: String {
        ProcessInfo.processInfo.environment["CALLREC_API_KEY"] ?? ""
    }
    var accessToken: String {
        ProcessInfo.processInfo.environment["ACCESS_TOKEN"] ?? ""
    }
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome to the Native App")
                    .padding()
//                Button("Present WebView") {
//                    showSheet = true
//                }
                
                        NavigationLink("Push React Native Screen") {
                            ReactNativeView(moduleName: "NativeAudioPlayer",
                                            initialProperties: ["callRecApiKey":  "\(callRecApiKey)", "getAccessToken": "\(accessToken)" ]
                            )
                        }
                          NavigationLink("Push Web view") {
                            WebView(url: URL(string: "https://phonesystem-apps-qa-14908427417.us-central1.run.app/webview")!)
                          }
                
            }
//            .sheet(isPresented: $showSheet) {
//                WebView(url: URL(string: "https://wsk66k6v-3000.inc1.devtunnels.ms/webview")!)
//            }
        }
    }
}

//#Preview {
//    ContentView()
//}
