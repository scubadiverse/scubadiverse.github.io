package net.scubadiverse.focusflow

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private val channelId = "focusflow"
    private var notifId = 1

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createChannel()
        askNotifPermission()
        web = WebView(this)
        web.webViewClient = WebViewClient()
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.addJavascriptInterface(Bridge(), "AndroidBridge")
        setContentView(web)
        web.loadUrl("https://scubadiverse.github.io/focus-flow/")
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(channelId, "Focus & Flow", NotificationManager.IMPORTANCE_HIGH)
            ch.description = "Break, water and calm reminders"
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(ch)
        }
    }

    private fun askNotifPermission() {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 100)
        }
    }

    inner class Bridge {
        @JavascriptInterface
        fun notify(title: String, body: String) {
            runOnUiThread {
                val n = NotificationCompat.Builder(this@MainActivity, channelId)
                    .setSmallIcon(android.R.drawable.ic_popup_reminder)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .build()
                (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                    .notify(notifId++, n)
            }
        }

        @JavascriptInterface
        fun requestNotif() {
            runOnUiThread { askNotifPermission() }
        }
    }

    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
