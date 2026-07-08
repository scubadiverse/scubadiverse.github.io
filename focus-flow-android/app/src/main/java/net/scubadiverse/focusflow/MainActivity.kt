package net.scubadiverse.focusflow

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import android.os.Build
import android.os.Bundle
import android.widget.Toast
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
    private var notifId = 100

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
        Toast.makeText(this, "Focus \u0026 Flow v1.4 ready \u2713", Toast.LENGTH_LONG).show()
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

    private fun alarmPending(id: String, title: String, body: String): PendingIntent {
        val i = Intent(this, AlarmReceiver::class.java).apply {
            action = "net.scubadiverse.focusflow.ALARM.$id"
            putExtra("title", title)
            putExtra("body", body)
            putExtra("nid", id.hashCode())
        }
        var flags = PendingIntent.FLAG_UPDATE_CURRENT
        if (Build.VERSION.SDK_INT >= 23) flags = flags or PendingIntent.FLAG_IMMUTABLE
        return PendingIntent.getBroadcast(this, id.hashCode(), i, flags)
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

        // Schedule a one-shot reminder that fires even if the app is closed.
        @JavascriptInterface
        fun scheduleAlert(id: String, delaySec: Double, title: String, body: String) {
            val am = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val at = System.currentTimeMillis() + (delaySec * 1000).toLong()
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, alarmPending(id, title, body))
        }

        // Schedule a repeating reminder (e.g. water) even when closed.
        @JavascriptInterface
        fun scheduleRepeat(id: String, intervalMin: Double, title: String, body: String) {
            val am = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val interval = (intervalMin * 60000).toLong()
            am.setInexactRepeating(AlarmManager.RTC_WAKEUP,
                System.currentTimeMillis() + interval, interval, alarmPending(id, title, body))
        }

        @JavascriptInterface
        fun cancelAlert(id: String) {
            val am = getSystemService(Context.ALARM_SERVICE) as AlarmManager
            am.cancel(alarmPending(id, "", ""))
        }

        // Whole-screen break lock ("display over other apps").
        @JavascriptInterface
        fun hasOverlay(): Boolean = Settings.canDrawOverlays(this@MainActivity)

        @JavascriptInterface
        fun requestOverlay() {
            runOnUiThread {
                try {
                    startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + packageName)))
                } catch (e: Exception) {}
            }
        }

        @JavascriptInterface
        fun startGuard(limitMin: Double) {
            val i = Intent(this@MainActivity, ScreenGuardService::class.java)
                .putExtra("limitMin", limitMin.toLong())
            if (Build.VERSION.SDK_INT >= 26) startForegroundService(i) else startService(i)
        }

        @JavascriptInterface
        fun stopGuard() {
            stopService(Intent(this@MainActivity, ScreenGuardService::class.java))
        }
    }

    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
