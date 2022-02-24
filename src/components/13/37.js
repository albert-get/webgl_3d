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
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionLight);//新建阴影
    shadowGenerator.useBlurExponentialShadowMap = true;//设置采样为指数
    shadowGenerator.blurKernel = 32;//设置阴影内核数量
    shadowGenerator.blurBoxOffset = 4.0;//设置阴影偏移量
    let meshArray=[];
    let loader = new BABYLON.AssetsManager(scene);//创建资源管理
    let  task = loader.addMeshTask("Bloom_model", "","/model/", "chair.babylon");//创建加载任务
    task.onSuccess = (task)=> {//加载成功后任务
        for(let mesh of task.loadedMeshes)//遍历加载到的模型
        {
            mesh.position=new BABYLON.Vector3(0,7,10);//设置每个物体的位置
            //mesh.scaling=new BABYLON.Vector3(0.5,0.5,0.5);
            mesh.receiveShadows=false;
            shadowGenerator.getShadowMap().renderList.push(mesh);
        }
    };
    //如果加载过程中出现错误，提示简单的错误信息
    task.onError =  (task, message, exception)=> {
        console.log(`task short error message:${message},specific error information:${exception}.`);//打印错误信息
    }

    const planeMesh=new BABYLON.MeshBuilder.CreatePlane('plane_mesh',{size:100,sideOrientation:2,},scene);//新建一个平面对象
    planeMesh.position=new BABYLON.Vector3(0,0,0);//设置平面位置
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

let addBloomAndGUI=(scene,cameraArry)=>{
    let GUICamera=new BABYLON.ArcRotateCamera("BGCamera", Math.PI / 2 + Math.PI / 7, Math.PI / 2, 100,
        new BABYLON.Vector3(0, 20, 0),
        scene);
    GUICamera.layerMask = 0x10000000;
    let pipeline = new BABYLON.DefaultRenderingPipeline(
        "pipeline", // The name of the pipeline
        true, // Do you want HDR textures ?
        scene, // The scene instance
        cameraArry // The list of cameras to be attached to
    );
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.layer.layerMask = 0x10000000;
    advancedTexture.renderScale = 1.0;
    const MyPanel = new BABYLON.GUI.StackPanel();
    MyPanel.width = "400px";
    MyPanel.fontFamily = "25px";
    MyPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    MyPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(MyPanel);
    let addCheckbox = function(text, func, initialValue,  panel) {
        if(!panel){
            panel=MyPanel;
        }
        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.width = "20px";
        checkbox.height = "20px";
        checkbox.isChecked = initialValue;
        checkbox.color = "green";
        checkbox.onIsCheckedChangedObservable.add(function(value) {
            func(value);
        });
        var header = BABYLON.GUI.Control.AddHeader(checkbox, text, "280px", { isHorizontal: true, controlFirst: true});
        header.height = "30px";
        header.color = "white";
        header.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(header);
    }

    let addSlider=(text, func, initialValue, min, max, panel)=>{
        if(!panel){
            panel=MyPanel;
        }
        let header = new BABYLON.GUI.TextBlock();
        header.text = text;
        header.height = "30px";
        header.color = "blank";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(header);
        let slider = new BABYLON.GUI.Slider();
        slider.minimum = min;
        slider.maximum = max;
        slider.value = initialValue;
        slider.height = "20px";
        slider.color = "green";
        slider.background = "white";
        slider.onValueChangedObservable.add((value)=> {
            func(value);
        });
        panel.addControl(slider);
    }

    addCheckbox("色像差", function(value) {
        pipeline.chromaticAberrationEnabled = value;
    }, pipeline.chromaticAberrationEnabled);

    addSlider("差量", function(value) {
        pipeline.chromaticAberration.aberrationAmount = value;
    },  0, -1000, 1000, );
    addSlider("径向强度", function(value) {
        pipeline.chromaticAberration.radialIntensity = value;
    },  0, 0.1, 5,);
    addSlider("方向", function(value) {
        if(value == 0){
            pipeline.chromaticAberration.direction.x = 0
            pipeline.chromaticAberration.direction.y = 0
        }else{
            pipeline.chromaticAberration.direction.x = Math.sin(value)
            pipeline.chromaticAberration.direction.y = Math.cos(value)
        }

    },  0, 0, Math.PI*2, );
    scene.activeCameras.push(GUICamera);
}

function Index(){
    let canvas=useRef(null)

    function init(gravity, plugin){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        BABYLON.Animation.AllowMatricesInterpolation=true
        engine.enableOfflineSupport=false
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            scene.ambientColor=new BABYLON.Color3(1,1,1)

            let camera=new BABYLON.ArcRotateCamera('camera',-Math.PI/2,Math.PI/3,100,new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)
            camera.lowerRadiusLimit=5
            camera.upperRadiusLimit=100
            camera.wheelDeltaPercentage=0.01
            scene.activeCameras.push(camera)

            const directionLight=new BABYLON.DirectionalLight('directionalLight1',new BABYLON.Vector3(0,-20,-40),scene)
            directionLight.intensity=0.7
            let hemiLight=new BABYLON.HemisphericLight('hemiLight',new BABYLON.Vector3(0,1,0),scene)
            hemiLight.intensity=0.3
            createBoxSky(scene)

            let cameraArray=[]
            cameraArray.push(camera)
            addBloomAndGUI(scene,cameraArray)
            addMesh(scene,directionLight)

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
