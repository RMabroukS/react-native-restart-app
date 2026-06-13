import Foundation
import React

@objc(RestartApp)
class RestartApp: NSObject {

  // requiresMainQueueSetup=false: module initialisation runs off the main
  // thread, which is correct — only the restart() call itself needs the main
  // queue (handled inside the method).
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(restart)
  func restart() {
    // RCTTriggerReloadCommandListeners notifies every RCTReloadCommand listener
    // registered with the bridge (including RCTBridge itself, which then calls
    // [bridge reload]). The function is available in both Old Architecture
    // (bridge) and New Architecture (Bridgeless / ReactHost) builds because
    // ReactHost also registers a reload listener via RCTReloadCommand.
    //
    // Dispatching to the main queue is required: [RCTBridge reload] internally
    // posts to the main run-loop. Calling RCTTriggerReloadCommandListeners from
    // a background thread causes a race between the listener notification and
    // the bridge's main-thread lifecycle — observed as silent failures on
    // devices with aggressive thread scheduling (iPhone 15 family, iOS 17+).
    DispatchQueue.main.async {
      RCTTriggerReloadCommandListeners("restart-app: restart requested")
    }
  }
}
