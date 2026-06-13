// RestartApp.mm
// Objective-C++ bridge that exposes the Swift RestartApp class to the React
// Native runtime. Using .mm (Objective-C++) allows both the legacy bridge
// (RCTBridgeModule) and the New Architecture interop layer to locate the
// module without any conditional compilation.
//
// For pure New Architecture (Bridgeless) builds the interop layer in RN 0.74+
// automatically wraps this legacy module registration. A full TurboModule
// implementation (via codegen) can be added later without breaking this file.

#import "React/RCTBridgeModule.h"
#import <react_native_restart_app-Swift.h>

@interface RCT_EXTERN_MODULE(RestartApp, NSObject)

RCT_EXTERN_METHOD(restart)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
