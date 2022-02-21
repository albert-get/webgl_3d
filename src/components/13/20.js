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
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0, 0, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0,20,-20))
            let light=new BABYLON.DirectionalLight('directionLight',new BABYLON.Vector3(-1,0.5,1),scene)
            light.lightmapMode=BABYLON.Light.LIGHTMAP_SHADOWSONLY
            light.intensity=2

            let groundMaterial=new BABYLON.StandardMaterial('groundMaterial',scene)
            groundMaterial.diffuseTexture=new BABYLON.Texture('/textures/floor-wood.jpg',scene)
            groundMaterial.lightmapTexture=new BABYLON.Texture('/textures/pm.png',scene)

            let ground=BABYLON.Mesh.CreateGround('ground',20,20,4,scene)
            ground.material=groundMaterial
            let meshMaterial=new BABYLON.StandardMaterial('meshMaterial',scene)
            meshMaterial.diffuseTexture=new BABYLON.Texture('/textures/ghxp.png',scene)
            let loader=new BABYLON.AssetsManager(scene)
            let pos=function (t){
                t.loadedMeshes.forEach(function (m){
                    m.scaling.x=0.3
                    m.scaling.y=0.3
                    m.scaling.z=0.3
                    m.material=meshMaterial
                    let mesh=m.clone()
                    mesh.position.set(3,0,4)
                    m.position.set(-2,0,-1)
                })
            }
            let meshTask=loader.addMeshTask('','','/model/','chahu.obj')
            meshTask.onSuccess=pos
            loader.onTaskError=function (){

            }
            loader.onFinish=function (){

            }
            loader.load()
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
