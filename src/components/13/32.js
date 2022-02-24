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
            scene.enablePhysics()
            let camera=new BABYLON.FreeCamera('camera',new BABYLON.Vector3(0,0,-40),scene)
            let light=new BABYLON.HemisphericLight('light1',new BABYLON.Vector3(0,1,0),scene)
            light.intensity=0.7
            let sphere=BABYLON.Mesh.CreateSphere('sphere',8,2,scene)
            sphere.position.y=8
            sphere.material=new BABYLON.StandardMaterial('s-mat',scene)
            let sphere1=BABYLON.Mesh.CreateSphere('sphere1',8,5,scene)
            sphere1.position.y=-12
            sphere1.material=new BABYLON.StandardMaterial('sphere1',scene)

            sphere.physicsImpostor=new BABYLON.PhysicsImpostor(sphere,BABYLON.PhysicsImpostor.SphereImpostor,{mass:0,restitution:0.9},scene)
            sphere1.physicsImpostor=new BABYLON.PhysicsImpostor(sphere1,BABYLON.PhysicsImpostor.SphereImpostor,{mass:1,restitution:0.9},scene)

            let distanceJoint=new BABYLON.DistanceJoint({maxDistance:20})
            sphere.physicsImpostor.addJoint(sphere1.physicsImpostor,distanceJoint)
            sphere1.physicsImpostor.applyImpulse(new BABYLON.Vector3(16,0,0),sphere1.getAbsolutePosition())


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
