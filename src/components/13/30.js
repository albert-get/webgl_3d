import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import 'babylonjs-loaders'


function Index(){
    let canvas=useRef(null)

    function init(gravity, plugin){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.FreeCamera('camera',new BABYLON.Vector3(0,0,-40),scene)
            camera.attachControl(canvas.current,true)
            camera.checkCollisions=true
            camera.applyGravity=true
            camera.setTarget(new BABYLON.Vector3(0,0,0))

            let light=new BABYLON.DirectionalLight('dir02',new BABYLON.Vector3(0.2,-1,0),scene)
            light.position=new BABYLON.Vector3(0,80,0)

            let shadowGenerator=new BABYLON.ShadowGenerator(2048,light)
            shadowGenerator.useBlurCloseExponentialShadowMap=true
            shadowGenerator.useKernelBlur=true
            shadowGenerator.blurKernel=32

            scene.enablePhysics(new BABYLON.Vector3(0,-9.8,0),new BABYLON.CannonJSPlugin())
            let tex1=new BABYLON.Texture('/textures/amiga.jpg',scene)
            let tex2=new BABYLON.Texture('/textures/football.jpg',scene)
            let texs=[tex1,tex2]
            let i=0
            let sphereMaterial=new BABYLON.StandardMaterial('amiga',scene)
            sphereMaterial.diffuseTexture=tex1
            sphereMaterial.emissiveColor=new BABYLON.Color3(0.5,0.5,0.5)
            sphereMaterial.diffuseTexture.uScale=5
            sphereMaterial.diffuseTexture.vScale=5

            let sphere=BABYLON.Mesh.CreateSphere('shpere0',16,3,scene)
            sphere.material=sphereMaterial
            sphere.position=new BABYLON.Vector3(0,20,0)
            shadowGenerator.addShadowCaster(sphere)
            sphere.physicsImpostor=new BABYLON.PhysicsImpostor(sphere,BABYLON.PhysicsImpostor.SphereImpostor,{mass:1,restitution:0.9},scene)

            let groundMaterial=new BABYLON.StandardMaterial('groundMaterial',scene)
            groundMaterial.scaling=new BABYLON.Vector3(100,1,100)

            let ground=BABYLON.Mesh.CreateBox('Ground',1,scene)
            ground.scaling=new BABYLON.Vector3(100,1,100)
            ground.position.y=-5.0
            ground.material=groundMaterial
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(ground,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0,restitution:0.9},scene)

            sphere.physicsImpostor.registerOnPhysicsCollide(
                ground.physicsImpostor,
                (main,collide)=>{
                    i++;
                    main.object.material.diffuseTexture=texs[i%2]
                }
            )







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
