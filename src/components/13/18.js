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
            scene.clearColor=new BABYLON.Color3(0.5,0.5,0.5)
            let camera=new BABYLON.ArcRotateCamera('camera', 0, 0, 0, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0,0,-20))

            const directionLight=new BABYLON.DirectionalLight('directionLight',new BABYLON.Vector3(0.0,1,0),scene)
            directionLight.intensity=0.7
            let pl=new BABYLON.PointLight('pl',BABYLON.Vector3.Zero(),scene)
            pl.intensity=0.5
            let mat=new BABYLON.StandardMaterial('mat',scene)
            let texture=new BABYLON.Texture('/textures/box.jpg',scene)
            mat.diffuseTexture=texture

            let columns=6
            let rows=4
            let faceUV=new Array(6)
            for(let i=0;i<6;i++){
                faceUV[i]=new BABYLON.Vector4(i/columns,0,(i+1)/columns,1/rows)
            }
            let options={
                width:5,
                height:5,
                depth:5,
            }
            let box=BABYLON.MeshBuilder.CreateBox('box',options,scene)
            box.material=mat
            scene.registerBeforeRender(function (){
                pl.position=camera.position
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
