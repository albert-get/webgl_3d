import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera', 3 * Math.PI / 2, Math.PI / 8, 20,new BABYLON.Vector3.Zero(),scene)
            camera.attachControl(canvas.current,true)
            camera.lowerRadiusLimit=6
            camera.upperAlphaLimit=20
            camera.useAutoRotationBehavior=true

            let light=new BABYLON.HemisphericLight('hemi',new BABYLON.Vector3(0,1,0),scene)

            let material=new BABYLON.StandardMaterial('boxMaterial',scene)

            material.diffuseTexture=new BABYLON.Texture('/textures/crate.png',scene)
            let box1=BABYLON.MeshBuilder.CreateBox('box1',{height:3,width:3,depth:3},scene)
            box1.position.set(3,0,0)
            box1.material=material
            let box2=box1.clone()
            box2.position.set(-3,0,0)


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
