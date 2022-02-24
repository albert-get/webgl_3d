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
            let camera=new BABYLON.ArcRotateCamera('arcRoatateCamera',0,0,0,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.setPosition(new BABYLON.Vector3(0, 10, -50));

            let pl=new BABYLON.PointLight('pl',new BABYLON.Vector3(0,0,0),scene)
            pl.diffuse=new BABYLON.Color3(1,1,1)
            pl.intensity=1.0
            let nb=20000
            let fact=30
            function myPositionFunction(particle,i,s){
                particle.position.x=(Math.random()-0.5)*fact
                particle.position.y=(Math.random()-0.5)*fact
                particle.position.z=(Math.random()-0.5)*fact
                particle.rotation.x=Math.random()*3.15
                particle.rotation.y=Math.random()*3.15
                particle.rotation.z=Math.random()*1.5
                particle.color=new BABYLON.Color4(particle.position.x/fact+0.5,particle.position.y/fact+0.5,particle.position.z/fact+0.5,1.0)

            }
            let triangle=BABYLON.MeshBuilder.CreateDisc('t',{
                tessellation:3,
            },scene)
            let SPS=new BABYLON.SolidParticleSystem('SPS',scene)
            SPS.addShape(triangle,nb)
            let mesh=SPS.buildMesh()
            triangle.dispose()
            SPS.initParticles=function (){
                for(let p=0;p<SPS.nbParticles;p++){
                    myPositionFunction(SPS.particles[p])
                }
            }
            SPS.updateParticle=function (particle){
                particle.rotation.x+=particle.position.z/100
                particle.rotation.z+=particle.position.x/100
            }
            SPS.initParticles()
            SPS.setParticles()

            SPS.computeParticleColor=false
            SPS.computeParticleTexture=false
            scene.registerBeforeRender(function (){
                pl.position=camera.position
                SPS.mesh.rotation.y+=0.01
                SPS.setParticles()
            })


            return scene
        }
        let scene=createScene()
        engine.runRenderLoop(function (){
            scene.render()

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
