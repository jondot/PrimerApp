import React from 'react'
import {
  Image,
  StatusBar,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
  NativeEventEmitter,
  NativeModules,
  AppRegistry,
} from 'react-native'

import Camera from 'react-native-camera'
import now from 'fbjs/lib/performanceNow'
const Core = NativeModules.Core
const CoreEvents = new NativeEventEmitter(NativeModules.Core)
const { width } = Dimensions.get('window')
import ProgressBar from './progress-bar'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  typeButton: {
    padding: 5,
  },
  flashButton: {
    padding: 5,
  },
  buttonsSpace: {
    width: 10,
  },
})

export default class Example extends React.Component{
  constructor(props){
    super(props)

    this.camera = null

    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
      },
      mode: 'camera',
      currentImage: {},
      currentIteration: 0,
      progress: 0,
    }

    this.takePicture = this.takePicture.bind(this)
    this.switchType = this.switchType.bind(this)
    this.switchFlash = this.switchFlash.bind(this)
    this.bench = this.bench.bind(this)
    this.benchGo = this.benchGo.bind(this)
    this.previewDone = this.previewDone.bind(this)
  }

  previewDone(){
    console.log('done with preview')
    this.setState({mode: 'camera'})
  }
  benchGo(){
    const start = now()
    console.log('bench started:', start)
    Core.bench(() => console.log('end:', now() - start))
  }

  bench(){
    const start = now()
    console.log('bench started:', start)
    for (let i = 0; i < 10000000; i++){
      JSON.stringify({hello: 'world', meaning: 42})
    }
    console.log('end:', now() - start)
  }
  takePicture(){
    if (this.camera){
      this.camera.capture()
        .then(data => {
          console.log(data)
          this.setState({mode: 'preview'})
          const totalIterations = 130

          const newsrc = {uri: `${data.path}.out.png`}
          if (this.subscription){
            this.subscription.remove()
            this.subscription = null
          }
          this.subscription = CoreEvents.addListener('OnPrimerUpdate', (dt) => {
            const progress = dt.currentIteration / (totalIterations * 1.0)
            console.log('event', progress)
            this.setState({progress, currentIteration: dt.currentIteration})
          })
          Core.processImage(data.path, totalIterations, 100, 16, 0, (iter) => {
            console.log('DONE', [ newsrc ])
            // let data persist after process image before invoking
            setTimeout(() => this.setState({ currentImage: newsrc }), 100)
          })
          return data
        })
        .then((data) => this.setState({currentImage: {uri: data.path}}))// original image, will get overwritten when process ends
        .catch(err => console.error(err))
    }
  }

  switchType(){
    let newType
    const { back, front } = Camera.constants.Type

    if (this.state.camera.type === back){
      newType = front
    } else if (this.state.camera.type === front){
      newType = back
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType,
      },
    })
  }

  get typeIcon(){
    let icon
    const { back, front } = Camera.constants.Type

    if (this.state.camera.type === back){
      icon = require('./assets/ic_camera_rear_white.png')
    } else if (this.state.camera.type === front){
      icon = require('./assets/ic_camera_front_white.png')
    }

    return icon
  }

  switchFlash(){
    let newFlashMode
    const { auto, on, off } = Camera.constants.FlashMode

    if (this.state.camera.flashMode === auto){
      newFlashMode = on
    } else if (this.state.camera.flashMode === on){
      newFlashMode = off
    } else if (this.state.camera.flashMode === off){
      newFlashMode = auto
    }

    this.setState({
      camera: {
        ...this.state.camera,
        flashMode: newFlashMode,
      },
    })
  }

  get flashIcon(){
    let icon
    const { auto, on, off } = Camera.constants.FlashMode

    if (this.state.camera.flashMode === auto){
      icon = require('./assets/ic_flash_auto_white.png')
    } else if (this.state.camera.flashMode === on){
      icon = require('./assets/ic_flash_on_white.png')
    } else if (this.state.camera.flashMode === off){
      icon = require('./assets/ic_flash_off_white.png')
    }

    return icon
  }

  render(){
    return (
      <View style={styles.container}>
        <StatusBar
          animated
          hidden
        />
        <Camera
          ref={(cam) => {
            this.camera = cam
          }}
          style={styles.preview}
          aspect={this.state.camera.aspect}
          captureTarget={Camera.constants.CaptureTarget.disk}
          type={this.state.camera.type}
          flashMode={this.state.camera.flashMode}
          defaultTouchToFocus
          mirrorImage={false}
          />
        <View style={[styles.overlay, styles.topOverlay]}>
          <TouchableOpacity
            style={styles.typeButton}
            onPress={this.switchType}
            >
            <Image
              source={this.typeIcon}
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={this.switchFlash}
            >
            <Image
              source={this.flashIcon}
              />
          </TouchableOpacity>

          <TouchableOpacity onPress={this.benchGo}>
            <Text style={{color: 'gray', margin: 3}}>Bench Go</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.bench}>
            <Text style={{color: 'gray', margin: 3}}>Bench JS</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.mode === 'preview'}
          onRequestClose={() => { console.log('Modal has been closed.') }}
          >
          <ProgressBar
            fillStyle={{}}
            backgroundStyle={{ backgroundColor: '#cccccc', }}
            style={{width}}
            progress={this.state.progress}
          />
          <Image
            style={{flex: 1}}
            source={this.state.currentImage}
          />
          <TouchableOpacity onPress={this.previewDone}><Text style={{backgroundColor: '#000', textAlign: 'center', color: '#fff', fontSize: 23, padding: 10}}>Done</Text></TouchableOpacity>
        </Modal>
        <View style={[styles.overlay, styles.bottomOverlay]}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={this.takePicture}
            >
            <Image
              source={require('./assets/ic_photo_camera_36pt.png')}
              />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

AppRegistry.registerComponent('PrimerApp', () => Example)
