import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";

function Index(){
    let canvas=useRef(null)
    let fps=useRef(null)
    let version=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        version.current.innerHTML='&nbsp;Version&nbsp;<br>WebGL'+engine.webGLVersion
        let createScene=function (){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera1',0,0,0,new BABYLON.Vector3(0,0,0),scene)
            camera.setPosition(new BABYLON.Vector3(0,40,40))
            camera.attachControl(canvas.current,true)

            let light=new BABYLON.DirectionalLight('DirectionalLight',new BABYLON.Vector3(-1,-1,-1),scene)
            light.position=new BABYLON.Vector3(30,30,30)
            let materialSphere1=new BABYLON.StandardMaterial('materialSphere1',scene)
            materialSphere1.wireframe=true
            let sphere=BABYLON.MeshBuilder.CreateSphere('sphere',{diameter:30},scene)
            sphere.material=materialSphere1
            let angle=0
            scene.onBeforeRenderObservable.add(()=>{
                angle+=0.01
                sphere.rotation.set(0,angle,0)
            })
            return scene
        }
        let scene=createScene()
        engine.runRenderLoop(function (){
            if(scene){
                fps.current.innerHTML=`&nbsp;FPS&nbsp;<br>&nbsp;${Math.floor(engine.getFps())}`
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
            <span ref={fps} style={{position:'fixed',top:'10px',left:'10px',background:'#7283a0',color:"white"}}>fps</span>
            <span ref={version} style={{position:'fixed',top:'10px',left:'100px',background:'#7283a0',color:"white"}}>version</span>
            <canvas ref={canvas} style={{width:'100%',height:'100%'}}/>
        </>
    )
}

export default Index
