import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0, 0, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0,30,35))

            let light=new BABYLON.PointLight('light',new BABYLON.Vector3(-20,20,20),scene)
            light.diffuse=new BABYLON.Color3(1,Math.random(),Math.random())
            light.range=100
            light.intensity=1.1

            let meshArray=[]
            meshArray.push(BABYLON.MeshBuilder.CreateBox('box',{height:6,width:6,depth:6},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateSphere('sphere',{diameter:5},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateCylinder('cone',{diameterTop:0,diameterBottom:6,height:5,tessellation:8},scene))
            meshArray.push(BABYLON.MeshBuilder.CreatePlane('plane',{width:4,height:4,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateDisc('disc',{radius:4,tessellation:3,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateTorusKnot('tk',{},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateTorus('torus',{diameter:5,thickness:1.5},scene))
            meshArray.push(BABYLON.MeshBuilder.CreateGround('gd',{width:6,height:6,subdivisions:4},scene))

            let groundMaterial=new BABYLON.StandardMaterial('groundMaterial',scene)
            let ground=BABYLON.MeshBuilder.CreateGround('gd',{width:60,height:35,subdivisions:4},scene)
            ground.material=groundMaterial
            let meshMaterial=new BABYLON.StandardMaterial('meshMaterial',scene)
            for(let i=0;i<meshArray.length;i++){
                meshArray[i].material=meshMaterial
                meshArray[i].material.diffuseColor=new BABYLON.Color3(1,Math.random(),Math.random())
                meshArray[i].position.x=-16+Math.floor(i/2)*10
                meshArray[i].position.y=4
                meshArray[i].position.z=(i%2===0)?-4:6
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
