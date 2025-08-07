//
//  WebView.swift
//  AudioPlayerReact
//
//  Created by Assistant on 30/07/25.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isInspectable = true
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebView
        
        init(_ parent: WebView) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Initialize the audio player once the page loads
            // Add a small delay to ensure page JavaScript is fully loaded
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                let initScript = """
                    console.log('Attempting to initialize audio player...');
                    if (typeof initializeAudioPlayer === 'function') {
                        initializeAudioPlayer(JSON.stringify({
                            getAccessToken: async () => "",
                            connectionId: "d6ae24f7-0528-4782-82c0-80247dc8a14c"
                        }));
                        console.log('Audio player initialization called');
                    } else {
                        console.log('initializeAudioPlayer function not found');
                        // Retry after another 1 second if function not found
                        setTimeout(function() {
                            if (typeof initializeAudioPlayer === 'function') {
                                initializeAudioPlayer(JSON.stringify({
                                    getAccessToken: async () => "",
                                    connectionId: "d6ae24f7-0528-4782-82c0-80247dc8a14c",
                                }));
                                console.log('Audio player initialization called (retry)');
                            } else {
                                console.log('initializeAudioPlayer function still not found after retry');
                            }
                        }, 1000);
                    }
                """
                
                webView.evaluateJavaScript(initScript) { result, error in
                    if let error = error {
                        print("JavaScript execution error: \(error)")
                    } else {
                        print("Audio player initialization script executed successfully")
                    }
                }
            }
        }
    }
}
