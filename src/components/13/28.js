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
            scene.clearColor=BABYLON.Color4(1,0,0,1)
            let camera=new BABYLON.FreeCamera('freeCamera',new BABYLON.Vector3(0,0,-40),scene)
            camera.attachControl(canvas.current,true)
            camera.checkCollisions=true
            camera.applyGravity=true
            camera.setTarget(new BABYLON.Vector3(0,0,0))

            let light=new BABYLON.DirectionalLight('dir',new BABYLON.Vector3(0.2,-1,0),scene)
            light.position=new BABYLON.Vector3(0,80,0)

            let sphereMaterial=new BABYLON.StandardMaterial('amiga',scene)
            sphereMaterial.diffuseTexture=new BABYLON.Texture('/textures/amiga.jpg',scene)
            sphereMaterial.emissiveColor=new BABYLON.Color3(0.5,0.5,0.5)
            sphereMaterial.diffuseTexture.uScale=5
            sphereMaterial.diffuseTexture.vScale=5

            let shadowGenerator=new BABYLON.ShadowGenerator(2048,light)
            shadowGenerator.useBlurCloseExponentialShadowMap=true
            shadowGenerator.useKernelBlur=true
            shadowGenerator.blurKernel=32
            scene.enablePhysics(new BABYLON.Vector3(0,-9.8,0),new BABYLON.CannonJSPlugin())

            let y=0
            for(let index=0;index<50;index++){
                let sphere=BABYLON.Mesh.CreateSphere('sphere',16,3,scene)
                sphere.material=sphereMaterial
                sphere.position=new BABYLON.Vector3(Math.random()*20-10,Math.random()*10-5)
                sphere.physicsImpostor=new BABYLON.PhysicsImpostor(sphere,BABYLON.PhysicsImpostor.SphereImpostor,{mass:1},scene)
                y+=2
            }
            for(let i=0;i<10;i++){
                let box0=BABYLON.Mesh.CreateBox('box0',3,scene)
                box0.position=new BABYLON.Vector3(Math.random()*20-10,10+y,Math.random()*10-5)
                let materialWood=new BABYLON.StandardMaterial('wood',scene)
                materialWood.diffuseTexture=new BABYLON.Texture('/textures/box.png',scene)
                materialWood.emissiveColor=new BABYLON.Color3(0.5,0.5,0.5)
                box0.material=materialWood
                box0.physicsImpostor=new BABYLON.PhysicsImpostor(box0,BABYLON.PhysicsImpostor.BoxImpostor,{mass:2,friction:0.4,restitution:0.3},scene)
                shadowGenerator.addShadowCaster(box0)
                y++
            }
            let ground=BABYLON.Mesh.CreateBox('ground',1,scene)
            ground.scaling=new BABYLON.Vector3(100,1,100)
            ground.position.y=-5.0
            ground.checkCollisions=true
            let border0=BABYLON.Mesh.CreateBox('border0',1,scene)
            border0.scaling=new BABYLON.Vector3(1,100,100)
            border0.position.y=-5.0
            border0.position.x=-50.0
            border0.checkCollisions=true

            let border1=BABYLON.Mesh.CreateBox('border1',1,scene)
            border1.scaling=new BABYLON.Vector3(1,100,100)
            border1.position.y=-5.0
            border1.position.x=50.0
            border1.checkCollisions=true

            let border2=BABYLON.Mesh.CreateBox('border2',1,scene)
            border2.scaling=new BABYLON.Vector3(100,100,1)
            border2.position.y=-5.0
            border2.position.z=50.0
            border2.checkCollisions=true

            let border3=BABYLON.Mesh.CreateBox('border3',1,scene)
            border3.scaling=new BABYLON.Vector3(100,100,1)
            border3.position.y=-5.0
            border3.position.z=-50.0
            border3.checkCollisions=true

            let groundMat=new BABYLON.StandardMaterial('groundMat',scene)
            groundMat.diffuseColor=new BABYLON.Color3(0.5,0.5,0.5)
            groundMat.emissiveColor=new BABYLON.Color3(0.2,0.2,0.2)
            groundMat.backFaceCulling=false
            ground.material=groundMat
            border0.material=groundMat
            border1.material=groundMat
            border2.material=groundMat
            border3.material=groundMat
            ground.receiveShadows=true

            ground.physicsImpostor=new BABYLON.PhysicsImpostor(ground,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0,friction:0.5,restitution:0.7},scene)
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(border0,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0},scene)
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(border1,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0},scene)
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(border2,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0},scene)
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(border3,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0},scene)


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
