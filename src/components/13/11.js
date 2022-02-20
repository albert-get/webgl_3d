import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera', -Math.PI/2, 3*Math.PI/16, 15, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)

            let redMat=new BABYLON.StandardMaterial('redMat',scene)
            redMat.emissiveColor=new BABYLON.Color3(1,0,0)

            let greenMat=new BABYLON.StandardMaterial('greenMat',scene)
            greenMat.emissiveColor=new BABYLON.Color3(0,1,0)

            let blueMat=new BABYLON.StandardMaterial('blueMat',scene)
            blueMat.emissiveColor=new BABYLON.Color3(0,0,1)

            let whiteMat=new BABYLON.StandardMaterial('whiteMat',scene)
            whiteMat.emissiveColor=new BABYLON.Color3(1,1,1)

            let sphereCenter=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:0.01},scene)

            let lightRed=new BABYLON.SpotLight('spotLight',new BABYLON.Vector3(),new BABYLON.Vector3(0,-1,0),Math.PI/2,1.5,scene)
            lightRed.diffuse=new BABYLON.Color3(1,0,0)
            lightRed.position.set(3,2,3)
            lightRed.parent=sphereCenter

            let lightGreen=new BABYLON.SpotLight('spotLight1',new BABYLON.Vector3(),new BABYLON.Vector3(0,-1,0),Math.PI/2,1.5,scene)
            lightGreen.diffuse=new BABYLON.Color3(0,1,0)
            lightGreen.position.set(-3,2,3)
            lightGreen.parent=sphereCenter

            let lightBlue=new BABYLON.SpotLight('spotLight2',new BABYLON.Vector3(),new BABYLON.Vector3(0,-1,0),Math.PI/2,1.5,scene)
            lightBlue.diffuse=new BABYLON.Color3(0,0,1)
            lightBlue.position.set(-3,2,-3)
            lightBlue.parent=sphereCenter

            let lightWhite=new BABYLON.SpotLight('spotLight3',new BABYLON.Vector3(),new BABYLON.Vector3(0,-1,0),Math.PI/2,1.5,scene)
            lightWhite.diffuse=new BABYLON.Color3(1,1,1)
            lightWhite.position.set(3,2,-3)
            lightWhite.parent=sphereCenter

            let redSphere=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:0.25},scene)
            redSphere.material=redMat
            redSphere.position=lightRed.position
            redSphere.parent=sphereCenter

            let greenSphere=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:0.25},scene)
            greenSphere.material=greenMat
            greenSphere.position=lightGreen.position
            greenSphere.parent=sphereCenter

            let blueSphere=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:0.25},scene)
            blueSphere.material=blueMat
            blueSphere.position=lightBlue.position
            blueSphere.parent=sphereCenter

            let whiteSphere=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:0.25},scene)
            whiteSphere.material=whiteMat
            whiteSphere.position=lightWhite.position
            whiteSphere.parent=sphereCenter

            let groundMat=new BABYLON.StandardMaterial('groundMat',scene)

            let ground=BABYLON.MeshBuilder.CreateGround('ground',{width:15,height:15},scene)
            ground.material=groundMat

            let angle=0
            scene.onBeforeRenderObservable.add(()=>{
                angle+=0.01
                sphereCenter.rotation.set(0,angle,0)
            })
            let advancedTexture=BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
            let sceneAmbientColorFlag=false
            let leftPanel=createPanel(advancedTexture,BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)
            let sceneCheckBox=createCheckBox(leftPanel,'开启场景环境颜色',BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT)

            sceneCheckBox.onIsCheckedChangedObservable.add(function (value){
                sceneAmbientColorFlag=value
                if(!sceneAmbientColorFlag){
                    scene.ambientColor=new BABYLON.Color3(0,0,0)
                }
            })
            let sceneColorPicker=createColorPicker(leftPanel,false,'',scene.ambientColor,BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER)
            sceneColorPicker.onValueChangedObservable.add(function (value){
                if(sceneAmbientColorFlag){
                    scene.ambientColor.copyFrom(value)
                }
            })
            let groundColorPicker=createColorPicker(leftPanel,true,'设置地板环境颜色',groundMat.ambientColor,BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER)
            groundColorPicker.onValueChangedObservable.add(function (value){
                groundMat.ambientColor.copyFrom(value)
            })
            let rightPanel=createPanel(advancedTexture,GUI.Control.VERTICAL_ALIGNMENT_CENTER,GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT)
            let diffuseColorPicker=createColorPicker(rightPanel,true,'漫反射颜色',groundMat.diffuseColor,GUI.Control.HORIZONTAL_ALIGNMENT_CENTER)
            diffuseColorPicker.onValueChangedObservable.add(function (value){
                groundMat.diffuseColor.copyFrom(value)
            })
            let specularColorPicker=createColorPicker(rightPanel,true,'镜面反射颜色',groundMat.specularColor,GUI.Control.HORIZONTAL_ALIGNMENT_CENTER)
            sceneColorPicker.onValueChangedObservable.add(function (value){
                groundMat.specularColor.copyFrom(value)
            })
            let emissiveColorPicker=createColorPicker(rightPanel,true,'自发光颜色',groundMat.emissiveColor,GUI.Control.HORIZONTAL_ALIGNMENT_CENTER)
            emissiveColorPicker.onValueChangedObservable.add(function (value){
                groundMat.emissiveColor.copyFrom(value)
            })

            function createCheckBox(panel,text,horizontalAlignment){
                let checkBox=new GUI.Checkbox()
                checkBox.width='20px'
                checkBox.height='20px'
                checkBox.isChecked=false
                checkBox.color='green'
                checkBox.onIsCheckedChangedObservable.add(function (value){
                    console.log(value)
                })
                let header=GUI.Control.AddHeader(checkBox,text,'180px',{
                    isHorizontal:true,
                    controlFirst:true
                })
                header.height='30px'
                header.color='white'
                header.outlineWidth='4px'
                header.outlineColor='black'
                header.horizontalAlignment=horizontalAlignment

                panel.addControl(header)
                return checkBox
            }

            function createPanel(advancedTexture,verticalAlignment,horizontalAlignment){
                let panel=new GUI.StackPanel()
                panel.width='200px'
                panel.verticalAlignment=verticalAlignment
                panel.horizontalAlignment=horizontalAlignment
                advancedTexture.addControl(panel)

                return panel
            }

            function createColorPicker(panel,useText,text,defaultColor,horizontalAlignment){
                if(useText){
                    let textBlock=new GUI.TextBlock()
                    textBlock.text=text
                    textBlock.color='white'
                    textBlock.height='30px'
                    panel.addControl(textBlock)
                }
                let picker=new GUI.ColorPicker()
                picker.value=defaultColor
                picker.height='150px'
                picker.width='150px'
                picker.horizontalAlignment=horizontalAlignment
                picker.onValueChangedObservable.add(function (value){

                })
                panel.addControl(picker)
                return picker
            }

            return scene
        }

        let scene=createScene()
        engine.runRenderLoop(function (){
            if(scene){
                scene.render()
            }
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
