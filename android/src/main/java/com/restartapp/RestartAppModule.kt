package com.restartapp

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

class RestartAppModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  @ReactMethod
  fun restart() {
    val activity = currentActivity
    if (activity != null) {
      // Foreground path: start a fresh instance of the app entry Activity,
      // then kill the current process. The OS delivers the intent before the
      // process dies because the new task is enqueued in the system's activity
      // manager independently of this process's lifecycle.
      UiThreadUtil.runOnUiThread { launchFreshInstance(activity) }
    } else {
      // Background path: no Activity reference is available. Schedule a delayed
      // launch via AlarmManager so the OS relaunches the app after the process
      // terminates. AlarmManager delivery happens in a separate system process,
      // so killing this process immediately is safe.
      scheduleDelayedLaunch()
    }
  }

  private fun launchFreshInstance(activity: android.app.Activity) {
    val ctx = activity.applicationContext
    val launchIntent = buildLaunchIntent(ctx) ?: return

    ctx.startActivity(launchIntent)

    // Give the activity manager time to enqueue the intent before the process
    // exits. 300 ms is sufficient on all tested devices; the delay does not
    // affect the user-perceived restart time because the new activity starts
    // in parallel and becomes visible while the old process is still alive.
    Handler(Looper.getMainLooper()).postDelayed({
      Process.killProcess(Process.myPid())
    }, KILL_DELAY_MS)
  }

  private fun scheduleDelayedLaunch() {
    val ctx = reactApplicationContext.applicationContext
    val launchIntent = buildLaunchIntent(ctx) ?: return

    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

    val pendingIntent = PendingIntent.getActivity(ctx, REQUEST_CODE, launchIntent, flags)

    val alarmManager = ctx.getSystemService(android.content.Context.ALARM_SERVICE) as AlarmManager
    // setExact is not needed here — a 500 ms window is acceptable for a
    // restart scenario, and set() avoids triggering Doze exact-alarm restrictions.
    alarmManager.set(
      AlarmManager.RTC,
      System.currentTimeMillis() + ALARM_DELAY_MS,
      pendingIntent
    )

    Process.killProcess(Process.myPid())
  }

  private fun buildLaunchIntent(ctx: android.content.Context): Intent? {
    val intent = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName) ?: return null
    // FLAG_ACTIVITY_NEW_TASK: required when starting from a non-Activity context.
    // FLAG_ACTIVITY_CLEAR_TASK: finish every Activity in the existing task before
    //   starting the new one, giving the app a clean back stack on launch.
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    return intent
  }

  companion object {
    const val NAME = "RestartApp"
    private const val KILL_DELAY_MS = 300L
    private const val ALARM_DELAY_MS = 500L
    private const val REQUEST_CODE = 0
  }
}
