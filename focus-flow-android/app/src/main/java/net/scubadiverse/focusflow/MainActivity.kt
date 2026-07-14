package net.scubadiverse.focusflow

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.provider.Settings
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private val channelId = "focusflow"
    private var notifId = 100

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Phones stay in portrait; tablets (>= 600dp wide) may rotate to use the wide layout.
        requestedOrientation = if (resources.configuration.smallestScreenWidthDp >= 600)
            ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        else
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        createChannel()
        askNotifPermission()
        web = WebView(this)
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.startsWith("tel:")) {
                    try { startActivity(Intent(Intent.ACTION_DIAL, request.url)) } catch (e: Exception) {}
                    return true
                }
                if (url.startsWith("mailto:")) {
                    try { startActivity(Intent(Intent.ACTION_SENDTO, request.url)) } catch (e: Exception) {}
                    return true
                }
                return false
            }
        }
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.addJavascriptInterface(Bridge(), "AndroidBridge")
        // Android 15 (API 35) draws edge-to-edge by default, which slides the WebView
        // under the status and navigation bars. Pad the WebView by the system-bar
        // insets so no content is ever hidden behind them, and colour the padded
        // area to match the app's light/dark background so it looks seamless.
        val night = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES
        web.setBackgroundColor(Color.parseColor(if (night) "#0f1720" else "#eef3f7"))
        ViewCompat.setOnApplyWindowInsetsListener(web) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
        setContentView(web)
        web.loadUrl("https://scubadiverse.github.io/focus-flow/")
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val gen = NotificationChannel(channelId, "Reminders", NotificationManager.IMPORTANCE_HIGH)
            gen.description = "General reminders"
            nm.createNotificationChannel(gen)
            // One channel per trigger, each with its OWN sound, so a minimised app
            // still plays a distinct sound you can recognise by ear.
            val attrs = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION).build()
            fun soundCh(cid: String, name: String, raw: Int) {
                val ch = NotificationChannel(cid, name, NotificationManager.IMPORTANCE_HIGH)
                ch.setSound(Uri.parse("android.resource://$packageName/$raw"), attrs)
                nm.createNotificationChannel(ch)
            }
            soundCh("wx_water", "Water reminder", R.raw.water)
            soundCh("wx_eye",   "Eye-rest reminder", R.raw.eye)
            soundCh("wx_stand", "Stand reminder", R.raw.stand)
            soundCh("wx_end",   "End of sprint", R.raw.end)
        }
    }

    // Map a reminder id to its sound channel (falls back to the generic channel).
    private fun channelFor(id: String): String = when (id) {
        "water" -> "wx_water"
        "eye"   -> "wx_eye"
        "stand" -> "wx_stand"
        "end"   -> "wx_end"
        else    -> channelId
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
            putExtra("channel", channelFor(id))
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

        @JavascriptInterface
        fun dial(number: String) {
            runOnUiThread {
                try { startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number))) } catch (e: Exception) {}
            }
        }

        @JavascriptInterface
        fun setEmergency(number: String) {
            getSharedPreferences("focusflow", Context.MODE_PRIVATE).edit().putString("official", number).apply()
        }

        // Saved emergency contacts (JSON array of {name, number}) so the whole-screen
        // lock can offer them alongside 112, and never block reaching them.
        @JavascriptInterface
        fun setEmergencyContacts(json: String) {
            getSharedPreferences("focusflow", Context.MODE_PRIVATE).edit().putString("contacts", json).apply()
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

        // Single source of truth for the always-on background service: reminders
        // (fired by the service itself, spaced out, surviving swipe) + the lock.
        @JavascriptInterface
        fun syncAlerts(json: String) {
            try {
                val o = org.json.JSONObject(json)
                val p = getSharedPreferences("focusflow", Context.MODE_PRIVATE)
                val alertsOn = o.optBoolean("alertsOn", false)
                val guardOn = o.optBoolean("guardOn", false)
                val e = p.edit()
                e.putBoolean("alertsOn", alertsOn)
                e.putBoolean("guardOn", guardOn)
                e.putLong("guardLimitMs", (o.optDouble("limitMin", 60.0) * 60000).toLong())
                o.optJSONObject("water")?.let { e.putInt("waterEvery", it.optInt("every", 45)) }
                o.optJSONObject("eye")?.let { e.putBoolean("eyeOn", it.optBoolean("on", true)); e.putInt("eyeEvery", it.optInt("every", 20)) }
                o.optJSONObject("stand")?.let { e.putBoolean("standOn", it.optBoolean("on", true)); e.putInt("standEvery", it.optInt("every", 30)) }
                val now = System.currentTimeMillis()
                if (alertsOn) {
                    if (p.getLong("waterLast", 0L) <= 0L) e.putLong("waterLast", now)
                    if (p.getLong("eyeLast", 0L) <= 0L) e.putLong("eyeLast", now)
                    if (p.getLong("standLast", 0L) <= 0L) e.putLong("standLast", now)
                } else {
                    e.putLong("waterLast", 0L); e.putLong("eyeLast", 0L); e.putLong("standLast", 0L)
                }
                if (guardOn) {
                    if (p.getLong("guardStart", 0L) <= 0L) e.putLong("guardStart", now)
                } else {
                    e.remove("guardStart")
                }
                e.apply()
                val svc = Intent(this@MainActivity, ScreenGuardService::class.java)
                if (alertsOn || guardOn) {
                    if (Build.VERSION.SDK_INT >= 26) startForegroundService(svc) else startService(svc)
                } else {
                    stopService(svc)
                }
            } catch (ex: Exception) {}
        }

        @JavascriptInterface
        fun stopGuard() {
            // Clear the saved counter so turning the lock off then on starts fresh.
            getSharedPreferences("focusflow", Context.MODE_PRIVATE).edit().remove("guardStart").apply()
            stopService(Intent(this@MainActivity, ScreenGuardService::class.java))
        }
    }

    override fun onPause() {
        super.onPause()
        web.onPause()
        web.pauseTimers()
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
        web.resumeTimers()
    }

    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
