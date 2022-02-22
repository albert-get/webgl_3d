import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import 'babylonjs-loaders'


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('arcRoatateCamera',1,0.8,20,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.wheelPrecision=100
            let fountain=BABYLON.Mesh.CreateBox('fountain',0.1,scene)
            fountain.visibility=0.1
            let particleSystem
            let useGPUVersion=true
            let createNewSystem=function (){
                if(particleSystem){
                    particleSystem.dispose()
                }
                if(useGPUVersion&&BABYLON.GPUParticleSystem.IsSupported){
                    particleSystem=new BABYLON.GPUParticleSystem('particles',{
                        capacity:1000000
                    },scene)
                    particleSystem.activeParticleCount=200000
                }else{
                    particleSystem=new BABYLON.ParticleSystem('particles',50000,scene)
                }
                particleSystem.emitRate=10000
                particleSystem.particleEmitterType=new BABYLON.SphereParticleEmitter(1)
                particleSystem.particleTexture=new BABYLON.Texture('/pic/flare.png',scene)
                particleSystem.maxLifeTime=10
                particleSystem.minSize=0.01
                particleSystem.maxSize=0.1
                particleSystem.emitter=fountain

                particleSystem.start()
            }
            createNewSystem()

            let alpha=0
            let moveEmitter=false
            let rotateEmitter=false
            scene.registerBeforeRender(function (){
                if(moveEmitter){
                    fountain.position.x=5*Math.cos(alpha)
                    fountain.position.z=5*Math.sin(alpha)
                }
                if(rotateEmitter){
                    fountain.rotation.x+=0.01
                }
                alpha+=0.01
            })
            let advancedTexture
            function buildUI(){
                if(advancedTexture){
                    advancedTexture.dispose()
                }
                advancedTexture=GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
                let rightPanel=new GUI.StackPanel()
                rightPanel.width='300px'
                rightPanel.isVertical=true
                rightPanel.paddingRight='20px'
                rightPanel.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
                rightPanel.verticalAlignment=GUI.Control.VERTICAL_ALIGNMENT_CENTER
                rightPanel.fontSize=16
                advancedTexture.addControl(rightPanel)
                let bottomPanel=new GUI.StackPanel()
                bottomPanel.height='100px'
                bottomPanel.isVertical=true
                bottomPanel.paddingBottom='20px'
                bottomPanel.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
                bottomPanel.verticalAlignment=GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
                bottomPanel.fontSize=16
                advancedTexture.addControl(bottomPanel)
                let upPanel=new GUI.StackPanel()
                upPanel.height='100px'
                upPanel.isVertical=true
                upPanel.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
                upPanel.verticalAlignment=GUI.Control.VERTICAL_ALIGNMENT_TOP
                upPanel.fontSize=16
                advancedTexture.addControl(upPanel)

                let leftPanel=new GUI.StackPanel()
                leftPanel.width='300px'
                leftPanel.isVertical=true
                leftPanel.paddingLeft='20px'
                leftPanel.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                leftPanel.verticalAlignment=GUI.Control.VERTICAL_ALIGNMENT_CENTER
                leftPanel.fontSize=16
                advancedTexture.addControl(leftPanel)

                function getPropertyPath(property){
                    let dotIndex=property.indexOf('.')
                    if(dotIndex===-1){
                        return particleSystem[property]
                    }
                    let splits=property.split('.')
                    return particleSystem[splits[0]][splits[1]]

                }
                function setPropertyPath(property,value){
                    let dotIndex=property.indexOf('.')
                    if(dotIndex===-1){
                        particleSystem[property]=value
                        return
                    }
                let splits=property.split('.')
                    particleSystem[splits[0]][splits[1]]=value
                }

                function addColorPicker(text,property,left,panel){
                    let header=new GUI.TextBlock()
                    header.text=text
                    header.height='30px'
                    header.color='white'
                    header.outlineWidth='4px'
                    header.outlineColor='black'
                    header.textHorizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                    panel.addControl(header)

                    if(left){
                        header.left=left
                    }
                    let colorPicker=new GUI.ColorPicker()
                    colorPicker.onSync=function (){
                        colorPicker.value=particleSystem[property]
                    }
                    colorPicker.onSync()
                    colorPicker.size='100px'
                    colorPicker.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                    colorPicker.onValueChangedObservable.add(function (value){
                        particleSystem[property]=value
                    })
                    if(left){
                        colorPicker.left=left
                    }
                    panel.addControl(colorPicker)
                    return colorPicker
                }
                function addCheckBox(text,initial,onCheck,panel){
                    let checkBox=new GUI.Checkbox()
                    checkBox.width='20px'
                    checkBox.height='20px'
                    checkBox.color='green'
                    checkBox.isChecked=initial
                    checkBox.onIsCheckedChangedObservable.add(function (value){
                        onCheck(value)
                    })
                    let header=GUI.Control.AddHeader(checkBox,text,'180px',{
                        isHorizontal:true,
                        controlFirst:true,
                    })
                    header.height='30px'
                    header.color='white'
                    header.outlineWidth='4px'
                    header.outlineColor='black'
                    header.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                    panel.addControl(header)
                }
                function addSlider(text,property,min,max,left,panel,top,fixedPoint){
                    let topPanel=new GUI.StackPanel()
                    topPanel.height='30px'
                    topPanel.isVertical=false
                    panel.addControl(topPanel)

                    let header=new GUI.TextBlock()
                    header.text=text
                    header.width='150px'
                    header.color='white'
                    header.outlineWidth='4px'
                    header.outlineColor='black'
                    header.textHorizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
                    topPanel.addControl(header)
                    if(left){
                        header.left=left
                    }
                    let valueHeader=new GUI.TextBlock()
                    console.log(property,getPropertyPath(property))
                    valueHeader.text=getPropertyPath(property).toFixed(fixedPoint)
                    valueHeader.width='100px'
                    valueHeader.color='white'
                    valueHeader.outlineWidth='4px'
                    valueHeader.outlineColor='black'
                    valueHeader.textHorizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
                    topPanel.addControl(valueHeader)
                    let slider=new GUI.Slider()
                    slider.minimum=min
                    slider.maximum=max
                    slider.height='20px'
                    slider.color='green'
                    slider.background='white'
                    slider.onSync=function (){
                        slider.value=getPropertyPath(property)
                    }
                    slider.onSync()
                    slider.onValueChangedObservable.add(function (value){
                        valueHeader.text=value.toFixed(fixedPoint)
                        setPropertyPath(property,value)
                    })
                    if(left){
                        slider.paddingLeft=left
                    }
                    panel.addControl(slider)
                    return slider
                }
                function addSeparator(panel){
                    let rectangle=new GUI.Rectangle()
                    rectangle.height='15px'
                    rectangle.thickness=0
                    panel.addControl(rectangle)
                }
                function addHeader(text,panel){
                    let header=new GUI.TextBlock()
                    header.text=text
                    header.height='30px'
                    header.color='white'
                    header.outlineWidth='4px'
                    header.outlineColor='black'
                    header.textHorizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
                    panel.addControl(header)
                }
                if(particleSystem.activeParticleCount){
                    addSlider('particles count:','activeParticleCount',0,particleSystem.getCapacity(),'20px',bottomPanel,0,0)

                }else{
                    addHeader('particles count:'+particleSystem.getCapacity(),bottomPanel)
                }
                addSlider('updateSpeed','updateSpeed',0,0.1,'20px',rightPanel,0,2)
                addSeparator(rightPanel)
                addSlider('gravity:','gravity.y',-5,5,'20px',rightPanel,0,2)
                addSeparator(rightPanel)
                addSlider('minSize:','minSize',0.01,1,'20px',rightPanel,0,2)
                addSlider('maxSize:','maxSize',0.01,1,'20px',rightPanel,0,2)
                addSeparator(rightPanel)
                addSlider('minLifeTime:','minLifeTime',0.001,10,'20px',rightPanel,0,2)
                addSlider('maxLifeTime:','maxLifeTime',0.001,10,'20px',rightPanel,0,2)
                addSeparator(rightPanel)
                addSlider('minEmitPower:','minEmitPower',0,10,'20px',rightPanel,0,2)
                addSlider('maxEmitPower:','maxEmitPower',0,10,'20px',rightPanel,0,2)

                if(BABYLON.GPUParticleSystem.IsSupported){
                    addCheckBox('Use GPU particles',useGPUVersion,function (value){
                        useGPUVersion=value
                        createNewSystem()
                        buildUI()

                    },leftPanel)
                }else{
                    addHeader('Browser does not support WebGL2',leftPanel)
                    addHeader('Using CPU particles instead',leftPanel)
                }
                addCheckBox('Rotate emitter',false,function (value){
                    particleSystem.reset()
                    rotateEmitter=value
                },leftPanel)
                addCheckBox('Move emitter',false,function (value){
                    particleSystem.reset()
                    moveEmitter=value

                },leftPanel)
                addSeparator(leftPanel)
                addColorPicker('color1:','color1','20px',leftPanel)
                addColorPicker('color2:','color2','20px',leftPanel)
                addColorPicker('colorDead:','colorDead','20px',leftPanel)

            }
            buildUI()
            return scene
        }
        let scene=createScene()
        engine.runRenderLoop(function (){
            scene.render()

        })
        window.addEventListener('resize',function (){
            engine.setSize(window.innerWidth,window.innerHeight)
        })
    }
    useEffect(()=>{
        init()
    })

    return (
        <>
            <canvas ref={canvas}/>
        </>
    )
}

export default Index
