import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";

const addMesh=(scene,directionLight)=>{
    let meshArray=[];//新建物体数组
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionLight);//新建阴影
    shadowGenerator.useBlurExponentialShadowMap = true;//设置采样为指数
    shadowGenerator.blurKernel = 32;//设置阴影内核数量
    shadowGenerator.blurBoxOffset = 4.0;//设置阴影偏移量
    const animationArray=[];//新建动画数组
    BABYLON.SceneLoader.ImportMesh("", "/model/", "chair.babylon", scene, (Meshes, particleSystems, skeletons)=> {
        const defaultEnvironment=scene.createDefaultEnvironment();
        defaultEnvironment.setMainColor(BABYLON.Color3.Gray());
        for(let tempMesh of Meshes)
        {
            console.log(`Meshes:${Meshes.length}||shadowGenerator:${shadowGenerator}${Date()}`);
            tempMesh.scaling=new BABYLON.Vector3(0.01,0.01,0.01);
            tempMesh.position=new BABYLON.Vector3(0.0,-4.0  ,0.0);
            tempMesh.receiveShadows=false;
            shadowGenerator.getShadowMap().renderList.push(tempMesh);
        }
    });
}
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
            let camera=new BABYLON.ArcRotateCamera('camera', -Math.PI/2, Math.PI/3, 30, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.lowerRadiusLimit=5
            camera.upperRadiusLimit=40
            camera.wheelDeltaPercentage=0.01

            const directionLight=new BABYLON.DirectionalLight('directionLight',new BABYLON.Vector3(0.0,-20.0,-40.0),scene)
            directionLight.intensity=0.7
            directionLight.diffuse=new BABYLON.Color3(1,1,1)
            let hemiLight=new BABYLON.HemisphericLight('hemiLight',new BABYLON.Vector3(0.0,1.0,0.0),scene)
            hemiLight.intensity=0.5
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
