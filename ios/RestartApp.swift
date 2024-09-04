import Foundation
import React

@objc(RestartApp)
class RestartApp: NSObject {

  @objc(restart)
  func restart() {
      RCTTriggerReloadCommandListeners("")
  }
}
