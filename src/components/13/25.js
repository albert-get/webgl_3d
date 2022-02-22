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
            scene.clearColor=new BABYLON.Color4(0.0,0.0,0.0,1)
            let camera=new BABYLON.ArcRotateCamera('arcRotateCamera',1,0.8,5,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            let light=new BABYLON.PointLight('pointLight',new BABYLON.Vector3(0,3,3),scene)
            let ambientLight=new BABYLON.HemisphericLight('hemiLight',new BABYLON.Vector3(0,1,0),scene)
            ambientLight.intensity=0.9
            let emitter=new BABYLON.ConeParticleEmitter()

            let fountain=new BABYLON.MeshBuilder.CreateCylinder('fountain',{
                height:0.01,
                diameter:0.2,
            },scene)
            fountain.position.y=0.5
            let child=new BABYLON.TransformNode()
            child.psrent=fountain
            child.position.y=0.5
            let cup=new BABYLON.MeshBuilder.CreateCylinder('cup',{
                height:1,
                diameter:0.9,
            },scene)

            let cupMat=new BABYLON.StandardMaterial('doreMat',scene)
            cupMat.diffuseColor=new BABYLON.Color3(0.3773,0.0930,0.0266)
            fountain.material=cupMat
            cup.material=cupMat
            let particleSystem=new BABYLON.ParticleSystem('particles',30,scene,null,true)
            particleSystem.particleTexture=new BABYLON.Texture('/pic/fog.png',scene,true,false,BABYLON.Texture.TRILINEAR_SAMPLINGMODE)

            particleSystem.startSpriteCellID=0
            particleSystem.endSpriteCellID=31
            particleSystem.spriteCellHeight=256
            particleSystem.spriteCellWidth=128
            particleSystem.spriteCellChangeSpeed=4
            particleSystem.minScaleX=1.0
            particleSystem.minScaleY=2.0
            particleSystem.maxScaleX=1.0
            particleSystem.maxScaleY=2.0

            particleSystem.addSizeGradient(0,0.0,0.0)
            particleSystem.addSizeGradient(1.0,1,1)

            particleSystem.translationPivot=new BABYLON.Vector2(0,-0.5)

            let radius=0.4
            let angle=Math.PI
            let coneEmitter=new BABYLON.ConeParticleEmitter(radius,angle)
            particleSystem.particleEmitterType=coneEmitter
            particleSystem.emitter=child

            particleSystem.minLifeTime=4.0
            particleSystem.maxLifeTime=4.0

            particleSystem.addColorGradient(0,new BABYLON.Color4(1,1,1,0))
            particleSystem.addColorGradient(0.5,new BABYLON.Color4(1,1,1,70/255))
            particleSystem.addColorGradient(1.0,new BABYLON.Color4(1,1,1,0))
            particleSystem.emitRate=6
            particleSystem.blendMode=BABYLON.ParticleSystem.BLENDMODE_ADD
            particleSystem.gravity=new BABYLON.Vector3(0,0,0)
            particleSystem.minEmitPower=0
            particleSystem.maxEmitPower=0
            particleSystem.updateSpeed=1/60
            particleSystem.start()

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
