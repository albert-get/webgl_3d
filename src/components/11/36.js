import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/DecalGeometry'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
                return
            }
        }
        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0x666666))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.setPixelRatio(window.devicePixelRatio)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            camera.position.x=0
            camera.position.y=100
            camera.position.z=100

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
        let mouseHelper=new THREE.Mesh(new THREE.BoxGeometry(1,1,100))
        {

            mouseHelper.visible=false
            scene.add(mouseHelper)
        }

        {
            let hemisphereLight=new THREE.HemisphereLight(0xffffff,0x000000,0.7)
            hemisphereLight.position.set(0,50,50)
            hemisphereLight.rotation.x=-Math.PI
            scene.add(hemisphereLight)
            let ambientLight=new THREE.AmbientLight(0x111111,1.4)
            scene.add(ambientLight)
        }
        let mesh=[]
        let meshPoint
        {
            let loader=new THREE.JSONLoader()
            loader.load('/models/1.js',function (geometry){
                let material=new THREE.MeshLambertMaterial({map:THREE.ImageUtils.loadTexture('/models/ghxp.png')})
                mesh[0]=new THREE.Mesh(geometry,material)
                scene.add(mesh[0])
                mesh[0].rotation.z=Math.PI
                mesh[0].rotation.x=-Math.PI/2
            })
        }
        let declas=[]
        let declasParams={
            declasInterSectionFlag:false,                       //是否相交
            declasInterSectionPoint: new THREE.Vector3(),   //相交位置的XYZ
            declasInterSectionNoraml:new THREE.Vector3()    //相交位置的发现
        }
        let declasPoint=new THREE.Vector3()
        let declasSize=new THREE.Vector3(10,10,10)
        let declasDrection=new THREE.Euler()
        let declaMaterial
        {
            let declasTexTureLoader=new THREE.TextureLoader()
            let declasTexTure=declasTexTureLoader.load('/models/flower.png')
            declaMaterial=new THREE.MeshPhongMaterial({
                specular:0x444444,
                normalScale:new THREE.Vector2(1,1),
                shininess:30,
                transparent:true,
                depthTest:true,
                depthWrite:false,
                polygonOffset:true,
                polygonOffsetFactor:-4,
                map:declasTexTure,
            })
        }
        let guiParams={
            guiMinScale:2,
            guiMaxScale:7,
            guiDeclasClear:function (){
                declas.forEach(function (d){
                    scene.remove(d)
                })
                declas=[]
            }
        }
        {

            let gui=new dat.GUI()
            gui.open()
            gui.add(guiParams,'guiMinScale',2,7).name('贴花最小值')
            gui.add(guiParams,'guiMaxScale',7,14).name('贴花最大值')
            gui.add(guiParams,'guiDeclasClear').name('清除贴花')
        }
        let moveFlag=false
        {
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.addEventListener('change',renderScene)
            controls.minDistance=30
            controls.maxDistance=1000
            controls.addEventListener('change',function (){
                moveFlag=true
            })
            controls.addEventListener('mousedown',function (){
                moveFlag=false
            },false)
            window.addEventListener('mouseup',function (){
                checkIntersection()
                if(!moveFlag&&declasParams.declasInterSectionFlag){
                    declasOnObj()
                }
            })
            setTimeout(function (){
                window.addEventListener('mousemove',mouseMove)
                window.addEventListener('touchmove',mouseMove)
            },70)
        }
        let mousePoint=new THREE.Vector2();
        function mouseMove(event){
            if(!mesh[0]&&declasParams.declasInterSectionFlag){
                return
            }else{
                let x,y
                if(event.changedTouches){
                    x=event.changedTouches[0].pageX
                    y=event.changedTouches[0].pageY
                }else{
                    x=event.clientX
                    y=event.clientY
                }
                mousePoint.x=(x/window.innerWidth)*2-1
                mousePoint.y=-(y/window.innerHeight)*2+1
                checkIntersection()
            }
        }
        function checkIntersection(){
            if(!mesh[0]){
                return
            }else{
                let ray=new THREE.Raycaster()
                ray.setFromCamera(mousePoint,camera)
                let interSection=ray.intersectObject(mesh[0],true)
                if(interSection.length>0){
                    meshPoint=interSection[0].point
                    let p=interSection[0].point
                    mouseHelper.position.copy(p)
                    declasParams.declasInterSectionPoint.copy(p)
                    let n=interSection[0].face.normal.clone()
                    n.transformDirection(mesh[0].matrixWorld)
                    n.multiplyScalar(10)
                    n.add(interSection[0].point)
                    declasParams.declasInterSectionNoraml.copy(interSection[0].face.normal.clone())
                    mouseHelper.lookAt(n)
                    declasParams.declasInterSectionFlag=true
                }
            }
        }
        function declasOnObj(){
            declasPoint.copy(declasParams.declasInterSectionPoint)
            let scale=guiParams.guiMinScale+Math.random()*(guiParams.guiMaxScale-guiParams.guiMinScale)
            declasSize.set(scale,scale,scale)
            declasDrection.copy(mouseHelper.rotation)
            let material=declaMaterial.clone()
            let m=new THREE.Mesh(new THREE.DecalGeometry(mesh[0],declasPoint,declasDrection,declasSize),material)
            declas.push(m)
            scene.add(m)
        }




        {
            window.addEventListener('resize',onResize,false)
            function onResize(){
                renderer.setSize(window.innerWidth,window.innerHeight)
                camera.aspect=(window.innerWidth/window.innerHeight)
                camera.updateProjectionMatrix()
            }
        }
        let stats=new Stats()
        {
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
        }
        let clock=new THREE.Clock()
        let step=0
        function renderScene() {

            stats.update()

            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

        renderScene()
    }


    useEffect(()=>{
        webglRender()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>

    )
}
