# Keep JavaScript-interface methods callable from the WebView (the AndroidBridge).
# Without this, R8 would strip/rename them and break notifications, alarms,
# the screen-lock and the emergency dialer.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep the native components in full (they are wired to the WebView / manifest).
-keep class net.scubadiverse.focusflow.MainActivity { *; }
-keep class net.scubadiverse.focusflow.MainActivity$* { *; }
-keep class net.scubadiverse.focusflow.ScreenGuardService { *; }
-keep class net.scubadiverse.focusflow.AlarmReceiver { *; }

# WebView + JS interface safety.
-keepclassmembers class * extends android.webkit.WebViewClient { *; }
