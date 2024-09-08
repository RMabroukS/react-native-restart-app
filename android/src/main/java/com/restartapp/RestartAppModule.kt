package com.restartapp

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod


class RestartAppModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun restart() {
    val reactInstanceManager = (reactApplicationContext.applicationContext as ReactApplication)
      .reactNativeHost
      .reactInstanceManager
    reactInstanceManager.devSupportManager.handleReloadJS()
  }

  companion object {
    const val NAME = "RestartApp"
  }
}
