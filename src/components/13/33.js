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
            camera.attachControl(canvas.current,true)
            let light=new BABYLON.HemisphericLight('light1',new BABYLON.Vector3(0,1,0),scene)
            light.intensity=0.7
            let subdivisions=25
            let groundWidth=20
            let distanceBetweenPoints=groundWidth/subdivisions
            let clothMat=new BABYLON.StandardMaterial('texture3',scene)
            clothMat.diffuseTexture=new BABYLON.Texture('/textures/leaves.jpg',scene)
            clothMat.backFaceCulling=false

            let ground=BABYLON.Mesh.CreateGround('ground1',groundWidth,groundWidth,subdivisions-1,scene,true)
            ground.material=clothMat
            let positions=ground.getVerticesData(BABYLON.VertexBuffer.PositionKind)
            let spheres=[]
            for(let i=0;i<positions.length;i=i+3){
                let v=BABYLON.Vector3.FromArray(positions,i)
                let s=BABYLON.MeshBuilder.CreateSphere('s'+i,{diameter:0.01},scene)
                s.position.copyFrom(v)
                spheres.push(s)
            }
            function createJoint(imp1,imp2){
                let joint=new BABYLON.DistanceJoint({
                    maxDistance:distanceBetweenPoints
                })
                imp1.addJoint(imp2,joint)
            }
            spheres.forEach(function (point,idx){
                let mass=idx<subdivisions?0:1
                point.physicsImpostor=new BABYLON.PhysicsImpostor(point,BABYLON.PhysicsImpostor.ParticleImpostor,{mass:mass},scene)
                if(idx>=subdivisions){
                    createJoint(point.physicsImpostor,spheres[idx-subdivisions].physicsImpostor)
                    if(idx%subdivisions){
                        createJoint(point.physicsImpostor,spheres[idx-1].physicsImpostor)
                    }
                }
            })
            ground.registerBeforeRender(function (){
                let positions=[]
                spheres.forEach(function (s){
                    positions.push(s.position.x,s.position.y,s.position.z)
                })
                ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind,positions)
                ground.refreshBoundingInfo()
            })

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
