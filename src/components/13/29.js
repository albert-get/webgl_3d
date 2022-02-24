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
            scene.enablePhysics()

            let physicsViewer=new BABYLON.Debug.PhysicsViewer(scene)
            let physicsHelper=new BABYLON.PhysicsHelper(scene)

            let camera=new BABYLON.FreeCamera('camera1',new BABYLON.Vector3(0,16,-32),scene)
            camera.setTarget(BABYLON.Vector3.Zero())
            camera.attachControl(canvas.current,true)

            let light=new BABYLON.HemisphericLight('light1',new BABYLON.Vector3(0,1,0),scene)
            light.intensity=0.7
            let ground=BABYLON.Mesh.CreateGround('ground1',64,64,2,scene)
            ground.physicsImpostor=new BABYLON.PhysicsImpostor(ground,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0,restitution:1},scene)

            let boxSize=2
            let boxPadding=4
            let minXY=-12
            let maxXY=12
            let maxZ=8
            let boxParams={height:boxSize,width:boxSize,depth:boxSize}
            let boxImpostorParams={mass:boxSize,restitution:0,friction:1}
            let boxMaterial=new BABYLON.StandardMaterial('boxMaterial',scene)
            boxMaterial.diffuseColor=new BABYLON.Color3(1,0,0)
            for(let x=minXY;x<=maxXY;x+=boxSize+boxPadding){
                for(let z=minXY;z<=maxXY;z+=boxSize+boxPadding){
                    for(let y=boxSize/2;y<=maxZ;y+=boxSize){
                        let boxName='box:'+x+','+y+','+z
                        let box=BABYLON.MeshBuilder.CreateBox(boxName,boxParams,scene)
                        box.position=new BABYLON.Vector3(x,y,z)
                        box.material=boxMaterial
                        box.physicsImpostor=new BABYLON.PhysicsImpostor(box,BABYLON.PhysicsImpostor.BoxImpostor,boxImpostorParams,scene)
                        physicsViewer.showImpostor(box.physicsImpostor)
                    }
                }
            }
            let origin=new BABYLON.Vector3(0,0,0)
            let radius=8
            let strength=20

            setTimeout(function (origin){
                let event=physicsHelper.applyRadialExplosionImpulse(
                    origin,
                    radius,
                    strength,
                    BABYLON.PhysicsRadialImpulseFalloff.Linear
                )
                let eventData=event.getData()
                let debugData=showExplosionDebug(eventData)
                setTimeout(function (debugData){
                    hideExplosionDebug(debugData)
                    event.dispose()
                },1500,debugData)

            },1000,origin)

            function addMaterialToSphere(sphere){
                let sphereMaterial=new BABYLON.StandardMaterial('sphereMaterial',scene)
                sphereMaterial.alpha=0.5
                sphere.material=sphereMaterial
            }

            function showExplosionDebug(data){
                addMaterialToSphere(data.sphere)
                data.sphere.isVisible=true
                let rayHelpers=[]
                if(data.rays.length){
                    for(let i=0;i<data.rays.length;i++){
                        let rayHelper=new BABYLON.RayHelper(data.rays[i])
                        rayHelper.show(scene,new BABYLON.Color3(1,1,0))
                        rayHelpers.push(rayHelper)
                    }
                }
                return {
                    sphere:data.sphere,
                    rays:data.rays,
                    rayHelpers:rayHelpers,
                }
            }
            function hideExplosionDebug(debugData){
                debugData.sphere.isVisible=false
                if(debugData.rayHelpers.length){
                    for(let i=0;i<debugData.rayHelpers.length;i++){
                        debugData.rayHelpers[i].hide()
                    }
                }
            }




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
