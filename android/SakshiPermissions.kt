package com.example.sakshi

import android.Manifest
import android.app.Notification
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.NotificationManagerCompat

/*
 AndroidManifest.xml (permissions go outside <application>, the service goes inside it):

   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.RECORD_AUDIO"/>
   <uses-permission android:name="android.permission.READ_SMS"/>
   <uses-permission android:name="android.permission.SEND_SMS"/>
   <uses-permission android:name="android.permission.READ_CONTACTS"/>
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

   <service
       android:name=".SakshiNotificationListener"
       android:label="Sakshi"
       android:exported="true"
       android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
     <intent-filter>
       <action android:name="android.service.notification.NotificationListenerService"/>
     </intent-filter>
   </service>

 build.gradle: implementation("androidx.core:core-ktx:<latest>") and androidx.activity.
 Note: Google Play only allows SMS permissions for default-SMS-style apps,
 so this setup is meant for personal / sideloaded use.
*/
class MainActivity : ComponentActivity() {

    private val prefs by lazy { getSharedPreferences("sakshi", MODE_PRIVATE) }

    private val runtimePermissions: Array<String> = buildList<String> {
        add(Manifest.permission.RECORD_AUDIO)
        add(Manifest.permission.READ_SMS)
        add(Manifest.permission.SEND_SMS)
        add(Manifest.permission.READ_CONTACTS)
        if (Build.VERSION.SDK_INT >= 33) add(Manifest.permission.POST_NOTIFICATIONS)
    }.toTypedArray()

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
            val denied = result.filterValues { !it }.keys.map { it.substringAfterLast('.') }
            if (denied.isNotEmpty()) toast("Not allowed: " + denied.joinToString())
            // Ask for notification access once only, not on every launch.
            if (!hasNotificationAccess() && !prefs.getBoolean("askedNotificationAccess", false)) {
                prefs.edit().putBoolean("askedNotificationAccess", true).apply()
                askNotificationAccess()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        askAllPermissions() // or call this from a "Setup" button instead
    }

    fun askAllPermissions() = permissionLauncher.launch(runtimePermissions)

    // Not a normal dialog: the user flips Sakshi's switch inside system Settings.
    // The app only appears in that list because SakshiNotificationListener is declared in the manifest.
    fun askNotificationAccess() = startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))

    private fun hasNotificationAccess() =
        NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
}

class SakshiNotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
        // sbn.packageName tells you which app it came from.
        // TODO: send (packageName, title, text) to your Sakshi server over HTTPS.
    }
}
