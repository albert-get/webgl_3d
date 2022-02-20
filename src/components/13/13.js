import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import {addMesh,createBoxSky} from '../../babylon/util'


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        BABYLON.Animation.AllowMatricesInterpolation = true;
        engine.enableOfflineSupport=false
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            scene.ambientColor=new BABYLON.Color3(1,1,1)
            let camera=new BABYLON.ArcRotateCamera('camera', -Math.PI/2, Math.PI/3, 100, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)

            const directionLight=new BABYLON.DirectionalLight('directionLight',new BABYLON.Vector3(0,-20,-40),scene)
            directionLight.intensity=0.7
            let hemiLight=new BABYLON.HemisphericLight('hemiLight',new BABYLON.Vector3(0,1,0),scene)
            hemiLight.intensity=0.5
            createBoxSky(scene)
            addMesh(scene,directionLight)
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
