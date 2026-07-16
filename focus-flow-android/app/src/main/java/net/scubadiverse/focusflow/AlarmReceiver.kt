package net.scubadiverse.focusflow

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat

// Fires even when the app is closed – posts a reminder notification.
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "ProjectSavvy"
        val body = intent.getStringExtra("body") ?: ""
        val nid = intent.getIntExtra("nid", 2)
        // Use the per-trigger channel so a minimised app plays that trigger's own sound.
        val channel = intent.getStringExtra("channel") ?: "focusflow"
        // Tapping the notification opens the full app.
        val open = Intent(ctx, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        var piFlags = android.app.PendingIntent.FLAG_UPDATE_CURRENT
        if (android.os.Build.VERSION.SDK_INT >= 23) piFlags = piFlags or android.app.PendingIntent.FLAG_IMMUTABLE
        val pi = android.app.PendingIntent.getActivity(ctx, 1, open, piFlags)
        val n = NotificationCompat.Builder(ctx, channel)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(body)
            .setContentIntent(pi)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        (ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(nid, n)
    }
}
