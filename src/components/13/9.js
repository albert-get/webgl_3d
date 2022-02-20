import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let ambientColor=new BABYLON.Color3(0.2,0.2,0.2)
            let scene=new BABYLON.Scene(engine)
            scene.ambientColor=new BABYLON.Color3(1,1,1)
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0.8, 90, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(-20,11,-20))
            camera.lowerBetaLimit=0.1
            camera.upperBetaLimit=(Math.PI/2)*0.9
            camera.lowerRadiusLimit=1
            camera.upperRadiusLimit=150

            let light=new BABYLON.SpotLight('light',new BABYLON.Vector3(-40,40,40), new BABYLON.Vector3(1, -1, 1), Math.PI / 5, 30,scene)
            light.position=new BABYLON.Vector3(-40,40,-40)
            light.shadowMaxZ=100
            light.shadowMinZ=10

            let shadowGenerator=new BABYLON.ShadowGenerator(1024,light)
            shadowGenerator.bias=0.001
            shadowGenerator.normalBias=0.02
            shadowGenerator.useContactHardeningShadow=true
            shadowGenerator.contactHardeningLightSizeUVRatio=0.05
            shadowGenerator.setDarkness(0.5)

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
            let ground=BABYLON.MeshBuilder.CreateGround('gd',{width:60,height:60,subdivisions:4},scene)
            ground.material=groundMaterial
            ground.receiveShadow=true
            let meshMaterial=new BABYLON.StandardMaterial('meshMaterial',scene)
            meshMaterial.ambientColor=ambientColor
            for(let i=0;i<meshArray.length;i++){
                shadowGenerator.getShadowMap().renderList.push(meshArray[7-i])
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
