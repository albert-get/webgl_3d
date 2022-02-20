import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";

function Index(){
    let canvas=useRef(null)

    function init(){
        let engine
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('Camera',3*Math.PI/2,Math.PI/8,20,BABYLON.Vector3.Zero(),scene)
            camera.attachControl(canvas.current,true)
            camera.setTarget(BABYLON.Vector3.Zero())
            let light=new BABYLON.HemisphericLight('light1',new BABYLON.Vector3(0,1,0),scene)
            light.intensity=0.7
            scene.fogMode=BABYLON.Scene.FOGMODE_EXP
            scene.fogColor=new BABYLON.Color3(1,1,1)
            scene.fogDensity=0.008
            let ground=BABYLON.MeshBuilder.CreateGround('gd',{width:60,height:40,subdivisions:4},scene)
            for(let i=0;i<100;i++){
                let size=5*Math.random()
                let meshMaterial=new BABYLON.StandardMaterial('meshMaterial',scene)
                meshMaterial.diffuseColor=new BABYLON.Color3(Math.random(),Math.random(),Math.random())
                let meshBox=BABYLON.MeshBuilder.CreateBox('box'+i,{size:size},scene)
                meshBox.material=meshMaterial
                meshBox.position.x=60*Math.random()-30
                meshBox.position.z=40*Math.random()-20
                meshBox.position.y=5*Math.random()
            }
            let deleteNum=0
            window.addEventListener('click',()=>{
                scene.removeMesh(scene.getMeshByName('box'+deleteNum),false)
                if(deleteNum>99){
                    alert('立方体已清空')
                }
                deleteNum++
            })
            return scene
        }
        engine=new BABYLON.Engine(canvas.current)
        let scene=createScene()
        engine.runRenderLoop(function (){
            if(scene){
                scene.render()
            }
        })
        window.addEventListener('resize',function (){
            engine.resize()
        })
    }
    useEffect(()=>{
        init()
    })

    return (
        <>
            <canvas ref={canvas} style={{width:'100%',height:'100%'}}/>
        </>
    )
}

export default Index
