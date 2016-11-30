//
//  Core.h
//  PrimerApp
//
//  Created by Dotan Nahum on 9/25/16.
//

#ifndef Core_h
#define Core_h

#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "primer/Primer.h"  // Gomobile bind generated header file in hello.framework

@interface PMRCTBlockWrapper :  NSObject<GoPrimerOnIterationDone>

@end

@interface Core : RCTEventEmitter <RCTBridgeModule>

@end

#endif /* Core_h */
