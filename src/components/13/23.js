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

            new BABYLON.PointLight('omni',new BABYLON.Vector3(0,2,8),scene)
            let camera=new BABYLON.ArcRotateCamera('arcrotatecamera',1,0.8,20,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)

            let fountain=BABYLON.Mesh.CreateBox('fountain',1.0,scene)

            let ground=BABYLON.Mesh.CreatePlane('ground',50,scene)
            ground.position=new BABYLON.Vector3(0,-10,0)
            ground.rotation=new BABYLON.Vector3(Math.PI/2,0,0)

            ground.material=new BABYLON.StandardMaterial('groundMat',scene)
            ground.material.backFaceCulling=false
            ground.material.diffuseColor=new BABYLON.Color3(0.3,0.3,1)

            let particleSystem=new BABYLON.ParticleSystem('particles',2000,scene)
            particleSystem.particleTexture=new BABYLON.Texture('/pic/flare.png',scene)
            particleSystem.emitter=fountain
            particleSystem.color1=new BABYLON.Color4(0.7,0.8,1.0,1.0)
            particleSystem.color2=new BABYLON.Color4(0.2,0.5,1.0,1.0)
            particleSystem.colorDead=new BABYLON.Color4(0,0,0.2,0.0)

            particleSystem.minSize=0.1
            particleSystem.maxSize=0.5

            particleSystem.minLifeTime=0.3
            particleSystem.maxLifeTime=1.5

            particleSystem.emitRate=1500

            particleSystem.blendMode=BABYLON.ParticleSystem.BLENDMODE_ONEONE
            particleSystem.gravity=new BABYLON.Vector3(0,-9.81,0)

            particleSystem.direction1=new BABYLON.Vector3(-7,8,3)
            particleSystem.direction2=new BABYLON.Vector3(7,8,-3)

            particleSystem.minAngularSpeed=0
            particleSystem.maxAngularSpeed=Math.PI

            particleSystem.minEmitPower=1
            particleSystem.maxEmitPower=3

            particleSystem.updateSpeed=0.005
            particleSystem.preWarmCycles=100
            particleSystem.preWarmStepOffset=5
            particleSystem.start()

            let keys=[]
            let animation=new BABYLON.Animation('animation','rotation.x',30,BABYLON.Animation.ANIMATIONTYPE_FLOAT,BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
            keys.push({
                frame:0,
                value:0,
            })
            keys.push({
                frame:50,
                value:Math.PI,
            })
            keys.push({
                frame:100,
                value:0,
            })
            animation.setKeys(keys)
            fountain.animations.push(animation)
            scene.beginAnimation(fountain,0,100,true)

            return scene
        }

        let scene=createScene()
        let time=0
        engine.runRenderLoop(function (){
            if(scene){
                time+=1
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
