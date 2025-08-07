//
//  AudioPlayerNativeApp.swift
//  AudioPlayerNative
//
//  Created by Srinivas Mummidi on 24/07/25.
//


import SwiftUI
import EnterpriseReact

@main
struct AudioPlayerNativeApp: App {
    init() {
       ReactNativeBrownfield.shared.bundle = ReactNativeBundle
       ReactNativeBrownfield.shared.startReactNative {
           print("React Native bundle loaded from SwiftUI App init()")
       }
   }
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

