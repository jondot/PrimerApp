//
//  Core.m
//  PrimerApp
//
//  Created by Dotan Nahum on 9/25/16.
//
typedef  void (^UpdateBlock)(int iter);

#import "Core.h"
@implementation PMRCTBlockWrapper{
  UpdateBlock _block;
}
- (void)setBlock: (UpdateBlock)block{
  self->_block = block;
}
- (void)do: (int) iter {
  self->_block(iter);
}

@end


@implementation Core
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(bench: (RCTResponseSenderBlock)done){
  GoPrimerBench();
  done(@[[NSNull null]]);
}
- (NSArray<NSString *> *)supportedEvents {
  return @[@"OnPrimerUpdate"];
}
RCT_EXPORT_METHOD(processImage:(NSString *)path
                  iters:(int)iters
                  size:(int)size
                  workers:(int)workers
                  mode:(int)mode
                  oniter:(RCTResponseSenderBlock)oniter
                  )
{
  PMRCTBlockWrapper *p = [PMRCTBlockWrapper new];
  [p setBlock: ^(int iter){
    [self sendEventWithName:@"OnPrimerUpdate" body:@{
                                                        @"currentIteration": [NSNumber numberWithInt:iter],
                                                        @"iterations": [NSNumber numberWithInt:iters]
                                                        }];
   
  }];
  
  dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSLog(@"Starting");
    //Let's take the longer but more illustrative path, supply a
    //block wrapper to our Go function:
    GoPrimerProcess(path,iters, size, workers, mode, ((GoPrimerOnIterationDone *)p));
    oniter(@[[NSNull null]]);

    //That is, we could have had a "done" RCTResponseSender block, which is simpler:
    //done(nil);
    NSLog(@"Ending");
  });
}
@end
