package net.scubadiverse.focusflow

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

// Watches total screen-on time (even outside the app) and locks the WHOLE
// screen for a 2-minute break once you've been on too long.
class ScreenGuardService : Service() {

    private var limitMs = 60L * 60 * 1000
    private val breakMs = 3L * 60 * 1000        // screen off this long = a real break, reset
    private val lockSeconds = 120               // 2-minute lock
    private var onStart = System.currentTimeMillis()
    private var offAt = 0L
    private var overlayShown = false
    private val handler = Handler(Looper.getMainLooper())
    private var wm: WindowManager? = null
    private var overlay: View? = null

    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) {
            when (i.action) {
                Intent.ACTION_SCREEN_OFF -> offAt = System.currentTimeMillis()
                Intent.ACTION_SCREEN_ON -> {
                    val now = System.currentTimeMillis()
                    if (offAt > 0 && now - offAt >= breakMs) onStart = now
                }
            }
        }
    }

    private val ticker = object : Runnable {
        override fun run() {
            val now = System.currentTimeMillis()
            if (!overlayShown && isScreenOn() && now - onStart >= limitMs) showOverlay()
            handler.postDelayed(this, 20000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        val f = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
        ContextCompat.registerReceiver(this, screenReceiver, f, ContextCompat.RECEIVER_NOT_EXPORTED)
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(9, buildNote(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(9, buildNote())
        }
        handler.postDelayed(ticker, 20000)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val lim = intent?.getLongExtra("limitMin", 60L) ?: 60L
        if (lim > 0) limitMs = lim * 60 * 1000
        onStart = System.currentTimeMillis()
        return START_STICKY
    }

    private fun isScreenOn(): Boolean {
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isInteractive
    }

    private fun buildNote(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel("guard", "Screen-time guard", NotificationManager.IMPORTANCE_LOW)
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
        }
        return NotificationCompat.Builder(this, "guard")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Focus & Flow")
            .setContentText("Watching your screen time to give you breaks.")
            .setOngoing(true)
            .build()
    }

    private fun showOverlay() {
        if (!Settings.canDrawOverlays(this)) return
        overlayShown = true
        // Play the gong so the time-out is unmistakable even if you're not looking.
        try {
            android.media.MediaPlayer.create(this, R.raw.timeout)?.apply {
                setOnCompletionListener { it.release() }
                start()
            }
        } catch (e: Exception) {}
        wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE
        val lp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            type,
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            PixelFormat.OPAQUE
        )
        val root = FrameLayout(this)
        root.setBackgroundColor(Color.parseColor("#0c1218"))
        root.isClickable = true
        val tv = TextView(this)
        tv.setTextColor(Color.WHITE)
        tv.textSize = 22f
        tv.gravity = Gravity.CENTER
        tv.setPadding(48, 48, 48, 48)
        root.addView(
            tv,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ).apply { gravity = Gravity.CENTER }
        )
        // Emergency must NEVER be blocked. Every emergency button first drops the
        // whole-screen lock and stops the service, THEN opens the dialer, so the
        // overlay can never cover the call screen. Both 112 and any saved contact work.
        val prefs = getSharedPreferences("focusflow", Context.MODE_PRIVATE)
        val official = prefs.getString("official", "112") ?: "112"

        val emgCol = LinearLayout(this)
        emgCol.orientation = LinearLayout.VERTICAL
        emgCol.gravity = Gravity.CENTER_HORIZONTAL

        fun addEmergencyButton(label: String, number: String) {
            val b = Button(this)
            b.text = label
            b.setOnClickListener {
                removeOverlay()
                try {
                    val i = Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number))
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    startActivity(i)
                } catch (e: Exception) {}
                stopSelf()
            }
            val blp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT
            )
            blp.topMargin = 14
            emgCol.addView(b, blp)
        }

        addEmergencyButton("\uD83C\uDD98 Call " + official + " (emergency)", official)
        try {
            val arr = org.json.JSONArray(prefs.getString("contacts", "[]") ?: "[]")
            for (idx in 0 until arr.length()) {
                val c = arr.getJSONObject(idx)
                val name = c.optString("name")
                val number = c.optString("number")
                if (number.isNotBlank()) addEmergencyButton("\uD83D\uDCDE " + name + " (" + number + ")", number)
            }
        } catch (e: Exception) {}

        val elp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT
        )
        elp.gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
        elp.bottomMargin = 120
        root.addView(emgCol, elp)
        try {
            wm?.addView(root, lp)
        } catch (e: Exception) {
            overlayShown = false
            return
        }
        overlay = root

        val counter = intArrayOf(lockSeconds)
        val cd = object : Runnable {
            override fun run() {
                val left = counter[0]
                tv.text = "⏸️  TIME OUT\n\nYou've been on your phone a while.\n" +
                        "Look away, stand up and breathe.\n\n" +
                        (left / 60) + ":" + String.format("%02d", left % 60)
                if (left <= 0) {
                    removeOverlay()
                } else {
                    counter[0] = left - 1
                    handler.postDelayed(this, 1000)
                }
            }
        }
        handler.post(cd)
    }

    private fun removeOverlay() {
        try { overlay?.let { wm?.removeView(it) } } catch (e: Exception) {}
        overlay = null
        overlayShown = false
        onStart = System.currentTimeMillis()
    }

    override fun onDestroy() {
        super.onDestroy()
        try { unregisterReceiver(screenReceiver) } catch (e: Exception) {}
        handler.removeCallbacksAndMessages(null)
        removeOverlay()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
