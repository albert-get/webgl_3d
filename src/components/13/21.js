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
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0, 20, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0,0,20))
            let light=new BABYLON.HemisphericLight('directionLight',new BABYLON.Vector3(-1,1,0),scene)
            light.intensity=1.5

            let sphereMaterial=new BABYLON.StandardMaterial('groundMaterial',scene)
            sphereMaterial.specularPower=10
            sphereMaterial.diffuseTexture=new BABYLON.Texture('/textures/Earth.png',scene,false,false)
            sphereMaterial.specularTexture=new BABYLON.Texture('/textures/EarthSpec.png',scene,false,false)
            sphereMaterial.bumpTexture=new BABYLON.Texture('/textures/EarthNormal.png',scene,false,false)

            let sphere=BABYLON.MeshBuilder.CreateSphere('shpere',{diameter:10},scene)
            sphere.material=sphereMaterial
            let alpha=0
            scene.registerBeforeRender(function (){
                alpha+=0.01
                sphere.rotation.y=alpha
            })

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
