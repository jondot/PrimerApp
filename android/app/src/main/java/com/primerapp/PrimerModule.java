package com.primerapp;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PrimerModule extends ReactContextBaseJavaModule
{
    public PrimerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    @Override
    public String getName() {
        return "Core";
    }
    @ReactMethod
    public void bench(final Callback successCallback){
        go.primer.Primer.bench();
        successCallback.invoke();
    }
    @ReactMethod
    public void processImage(String path, int iters, int size, int workers, int mode, final Callback successCallback) {
        go.primer.Primer.process(path, iters, size, workers, mode, new go.primer.OnIterationDone(){
            @Override
            public void do_() {
                successCallback.invoke();
            }
        });
    }
}
