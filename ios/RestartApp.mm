#import "React/RCTBridgeModule.h"
#import <react_native_restart_app-Swift.h> // This imports the generated Swift header file.

@interface RCT_EXTERN_MODULE(RestartApp, NSObject)

RCT_EXTERN_METHOD(restart)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
