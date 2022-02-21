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
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0.8, 100, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            let light=new BABYLON.PointLight('point',new BABYLON.Vector3(0,100,0),scene)
            light.intensity=1
            let loader=new BABYLON.AssetsManager(scene)
            let pos=function (task){
                task.loadedMeshes.forEach(function (mesh){
                    mesh.material=new BABYLON.StandardMaterial('meshMaterial',scene)
                    mesh.material.diffuseTexture=new BABYLON.Texture('/textures/konglong.jpg',scene)
                    mesh.material.bumpTexture=new BABYLON.Texture('/textures/konglong.jpg',scene)
                })
            }
            let meshTask=loader.addMeshTask('','','/model/','konglong.obj')
            meshTask.onSuccess=pos

            loader.onTaskError=function (task){
                console.log('error with loading by assetsManager')
            }
            loader.onFinish=function (task){
                console.log('successful with loading by assetsManager')
            }
            loader.load()
            scene.registerBeforeRender(function (){
                light.position=camera.position
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
