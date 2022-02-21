import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import 'babylonjs-loaders'

const createBoxSky=(scene,sphere)=>{
    let skybox = BABYLON.Mesh.CreateBox("skyBox", 2000.0, scene);//创建一个天空盒
    let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);//创建天空盒纹理
    skyboxMaterial.backFaceCulling = false;//关闭背面剪裁
    skyboxMaterial.disableLighting = true;//不接受任何光源
    skybox.material = skyboxMaterial;//设置纹理
    skybox.infiniteDistance = true;//设置天空盒相机移动
    skyboxMaterial.disableLighting = true;//去除光照反射
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('/pic/skyBox/skybox', scene);//加载纹理
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;//设置加载模式
}

const addMesh=(scene,directionLight)=>{
    let meshArray=[];
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionLight);
    let loader = new BABYLON.AssetsManager(scene);//创建资源管理
    let  kjzTask = loader.addMeshTask("ch_gltf", "","/model/", "DamagedHelmet.gltf");//创建加载任务
    kjzTask.onSuccess = (task)=> {//加载成功后任务
        for(let mesh of task.loadedMeshes)//遍历加载到的模型
        {
            mesh.position=new BABYLON.Vector3(0,2,0);//设置每个物体的位置
            mesh.scaling=new BABYLON.Vector3(3.0,3.0,3.0);
            meshArray.push(mesh);
            console.log(mesh.name);
            console.log(`${mesh.scaling}||${mesh.position}||${meshArray.length}`);
        }
    };
    console.log(`meshArray.length:${meshArray.length}`);
    //如果加载过程中出现错误，提示简单的错误信息
    kjzTask.onError =  (task, message, exception)=> {
        console.log(`kjzTask short error message:${message},specific error information:${exception}.`);//打印错误信息
    }


    setTimeout(()=>{
        console.log(`meshArray${meshArray.length}`);
        for(let tempMesh of meshArray)
        {
            tempMesh.receiveShadows=true;
            shadowGenerator.getShadowMap().renderList.push(tempMesh);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurBoxOffset = 2.0;
        }
    },1000);
    let planeMesh=new BABYLON.MeshBuilder.CreatePlane('plane_mesh',{size:100,sideOrientation:2,},scene);//新建一个平面对象
    planeMesh.position=new BABYLON.Vector3(0,-2,0);//设置平面位置
    planeMesh.rotation.x=Math.PI/2;//设置旋转
    let myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);//新建纹理对象
    let textureTask = loader.addTextureTask("image task", "/pic/floor2.png");//加载图片
    textureTask.onSuccess = function(task) {//资源加载成功
        myMaterial.diffuseTexture=task.texture;//设置纹理对象的散射纹理图为加载到的纹理图
        planeMesh.material=myMaterial;//设置平面的纹理为纹理对象
    }
    planeMesh.receiveShadows=true;//设置平面接收阴影
    loader.load();//开始所有任务
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
            let camera=new BABYLON.ArcRotateCamera('camera', -Math.PI/2, Math.PI/3, 100, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)


            const directionLight=new BABYLON.DirectionalLight('directionLight',new BABYLON.Vector3(0.0,-20.0,-20.0),scene)
            directionLight.intensity=0.5
            directionLight.diffuse=new BABYLON.Color3(1,1,1)
            let hemiLight=new BABYLON.HemisphericLight('hemiLight',new BABYLON.Vector3(0.0,1.0,0.0),scene)
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
