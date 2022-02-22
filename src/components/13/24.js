import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import 'babylonjs-loaders'


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        let object
        let emittertype
        let particleSystem
        let advancedTexture
        let scene
        let light0
        let camera
        let etype
        function createScene (){
            scene=new BABYLON.Scene(engine)
            light0=new BABYLON.PointLight('omni',new BABYLON.Vector3(0,2,8),scene)
            camera=new BABYLON.ArcRotateCamera('arcrotateCamera',-Math.PI/2,Math.PI/4,20,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            createparticleSystem()
            buildUI()
            createboxemitter()
            scene.registerBeforeRender(function (){
                object.rotation.z+=0.01
            })
            return scene
        }
        function createparticleSystem(){
            if(particleSystem){
                particleSystem.dispose()
            }
            particleSystem=new BABYLON.ParticleSystem('particles',2000,scene)
            particleSystem.particleTexture=new BABYLON.Texture('/pic/flare.png',scene)
            particleSystem.color1=new BABYLON.Color4(0.7,0.8,1.0,1.0)
            particleSystem.color2=new BABYLON.Color4(0.2,0.5,1.0,1.0)
            particleSystem.colorDead=new BABYLON.Color4(0,0,0.2,0.0)
            particleSystem.minsize=0.1
            particleSystem.maxSize=0.5
            particleSystem.minLifeTime=0.3
            particleSystem.maxSize=0.5

            particleSystem.minLifeTime=0.3
            particleSystem.maxLifeTime=1.5
            particleSystem.emitRate=2000
            particleSystem.minEmitPower=1
            particleSystem.maxEmitPower=3
            particleSystem.updateSpeed=0.005
            createEmitter()
            particleSystem.start()
        }
        function buildUI(){
            if(advancedTexture){
                advancedTexture.dispose()
            }
            advancedTexture=GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
            let leftPanel=new GUI.StackPanel()
            leftPanel.width='300px'
            leftPanel.isVertical=true
            leftPanel.paddingLeft='20px'
            leftPanel.horizontalAlignment=GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
            leftPanel.verticalAlignment=GUI.Control.VERTICAL_ALIGNMENT_CENTER
            leftPanel.fontSize=16
            advancedTexture.addControl(leftPanel)
            function addRadio(text,parent,index,ischeck){
                let button=new GUI.RadioButton()
                button.width='20px'
                button.height='20px'
                button.color='white'
                button.background='green'
                button.isChecked=ischeck
                button.onIsCheckedChangedObservable.add(function (state){
                    if(state){
                        if(index===0){
                            etype=0
                            object.dispose()
                            createparticleSystem()
                        }else if(index===1){
                            etype=1
                            object.dispose()
                            createparticleSystem()
                        }else if(index===2){
                            etype=2
                            object.dispose()
                            createparticleSystem()
                        }
                    }
                })
                let header=GUI.Control.AddHeader(button,text,'100px',{
                    isHorizontal:true,
                    controlFirst:true,
                })
                header.height='30px'
                parent.addControl(header)
            }
            addRadio('盒子发射器',leftPanel,0,true)
            addRadio('球形发射器',leftPanel,1,false)
            addRadio('锥形发射器',leftPanel,2,false)
        }
        function createEmitter(){
            if(etype===0){
                createboxemitter()
            }else if(etype===1){
                createsphereemitter()
            }else if(etype===2){
                createconemitter()
            }
        }
        function createboxemitter(){
            object=BABYLON.MeshBuilder.CreateBox('box',{
                width:2,
                height:4,
                depth:5,
            },scene)
            object.material=new BABYLON.StandardMaterial('mat',scene)
            object.material.wireframe=true
            particleSystem.emitter=object
            emittertype=particleSystem.createBoxEmitter(new BABYLON.Vector3(-5,2,1),new BABYLON.Vector3(5,2,-1),new BABYLON.Vector3(-1,-2,-2.5),new BABYLON.Vector3(1,2,2.5))
        }
        function createsphereemitter(){
            object=BABYLON.MeshBuilder.CreateSphere('sphere',{
                diameter:4,
                segments:8,
            },scene)
            object.material=new BABYLON.StandardMaterial('mat',scene)
            object.material.wireframe=true
            particleSystem.emitter=object
            emittertype=particleSystem.createSphereEmitter(2)
            emittertype.radiusRange=1
        }
        function createconemitter(){
            let radius=2
            let angle=Math.PI/3
            let height=radius/Math.tan(angle/2)
            object=BABYLON.MeshBuilder.CreateCylinder('cone',{
                diameterBottom:0,
                diameterTop:2*radius,
                height:height,
            },scene)
            object.position.y=height/2
            object.setPivotPoint(new BABYLON.Vector3(0,-height/2,0))
            object.material=new BABYLON.StandardMaterial('mat',scene)
            object.material.wireframe=true
            particleSystem.emitter=object
            emittertype=particleSystem.createConeEmitter(radius,angle)
            emittertype.radiusRange=1
            emittertype.heightRange=1
        }
        scene=createScene()
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
