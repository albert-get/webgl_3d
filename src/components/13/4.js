import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";

function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera',Math.PI/2,Math.PI/4,8,new BABYLON.Vector3.Zero(),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0,200,200))
            let light=new BABYLON.HemisphericLight('light',new BABYLON.Vector3(1,1,0),scene)

            let groundMaterial=new BABYLON.StandardMaterial('groundMaterial',scene)
            groundMaterial.diffuseTexture=new BABYLON.Texture('/textures/ground.jpg',scene)

            let ground=BABYLON.MeshBuilder.CreateGroundFromHeightMap('gdhm','/textures/default.png',{width:257,height:257,subdivisions:257,maxHeight:128},scene)
            ground.material=groundMaterial


            return scene
        }

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
