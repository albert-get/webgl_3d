import * as BABYLON from 'babylonjs';
import {useEffect, useRef} from "react";


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.FollowCamera('follow', new BABYLON.Vector3(0,10,-10),scene)
            camera.attachControl(canvas.current,true)
            camera.radius=30
            camera.heightOffset=10
            camera.rotationOffset=0
            camera.cameraAcceleration=0.005
            camera.maxCameraSpeed=10

            let light=new BABYLON.HemisphericLight('hemi',new BABYLON.Vector3(0,1,0),scene)

            let mat=new BABYLON.StandardMaterial('mat1',scene)
            let texture=new BABYLON.Texture('/textures/crate.png',scene)
            mat.diffuseTexture=texture

            let box=BABYLON.MeshBuilder.CreateBox('box',{size:2},scene)
            box.position=new BABYLON.Vector3(20,0,10)
            box.material=mat
            let boxesSPS=new BABYLON.SolidParticleSystem('boxes',scene,{updatable:false})
            let set_boxes=function (particle,i,s){
                particle.position=new BABYLON.Vector3(-50+Math.random()*100,-50+Math.random()*100,-50+Math.random()*100)

            }
            boxesSPS.addShape(box,400,{positionFunction:set_boxes})
            let boxes=boxesSPS.buildMesh()
            camera.lockedTarget=box
            let alpha=0
            let orbit_radius=20
            scene.registerBeforeRender(function (){
                alpha+=0.01
                box.position.x=orbit_radius*Math.cos(alpha)
                box.position.y=orbit_radius*Math.sin(alpha)
                box.position.z=10*Math.sin(2*alpha)
                camera.rotationOffset=(18*alpha)%360
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
