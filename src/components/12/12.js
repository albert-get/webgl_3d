import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/MTLLoader'
import '../../utils/OBJLoader'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)
    let tip=useRef(null)

    let [flag,setFlag]=useState(true)
    let audioLoader
    let listener

    function tipsClick(){
        if(flag){
            audioLoader=new THREE.AudioLoader()
            listener=new THREE.AudioListener()
            init()
            setFlag(false)
        }
    }
    let tempy
    let temp=0
    let scene
    let renderer
    let camera
    let bp
    let ball
    let plane
    let dirLight
    function init(){
        initScene()
        addMesh()
        addLight()
        addControls()
        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onWindowResize,false)
    }
    function addLight(){
        let target=new THREE.Object3D()
        // target.position=new THREE.Vector3(0,0,0)
        let pointColor='#bbbbbb'
        dirLight=new THREE.DirectionalLight(pointColor)
        dirLight.position.set(0,50,50)
        dirLight.castShadow=true
        dirLight.target=plane
        dirLight.shadow.CameraNear=0.1
        dirLight.shadow.CameraFar=100
        dirLight.shadow.CameraTop=200
        dirLight.shadow.CameraBottom=0
        dirLight.shadow.MapWidth=2048
        dirLight.shadow.MapHeight=2048
        let dirLight0=dirLight.clone()
        dirLight0.position.set(0,50,-50)
        scene.add(dirLight0)
        scene.add(dirLight)
        let ambientLight=new THREE.AmbientLight('#0c0c0c')
        scene.add(ambientLight)
    }
    function addControls(){
        let controls=new THREE.OrbitControls(camera,renderer.domElement)
        controls.enablePan=true
        controls.enableZoom=true
        controls.maxPolarAngle=Math.PI*4/9
    }
    function onWindowResize(){
        let width=window.innerWidth
        let height=window.innerHeight
        camera.aspect=width/height
        camera.updateProjectionMatrix()
        renderer.setSize(width,height)
    }
    function initScene(){
        scene=new THREE.Scene()
        renderer=new THREE.WebGLRenderer({antialias:true})
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true
        renderer.shadowMap.type=THREE.PCFSoftShadowMap

        camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000)
        camera.position.z=20
        camera.position.y=15
        camera.add(listener)
        camera.lookAt(new THREE.Vector3())
    }
    function addMesh(){
        let planeGeometry=new THREE.PlaneGeometry(200,200)
        let planeMaterial=new THREE.MeshLambertMaterial({color:0xaaaaaa})
        plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-Math.PI/2
        plane.position.x=0
        plane.position.y=0
        plane.position.z=0
        plane.receiveShadow=true
        scene.add(plane)

        let mtlLoader=new THREE.MTLLoader()
        mtlLoader.load('/obj/bp.mtl',function (materials){
            materials.preload()
            console.log(materials)
            let objLoader=new THREE.OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.setPath('/obj')
            objLoader.load('/bp.obj',function (object){
                object.scale.set(0.004,0.004,0.004)
                object.rotation.y=Math.PI/2
                object.position.set(0,0,0)
                bp=object.clone()
                bp.receiveShadow=true
                scene.add(bp)
                renderScene()
            })
        })
        audioLoader.load('/music/ping_pong.mp3',function (buffer){
            let ballGeometry=new THREE.SphereGeometry(0.5,20,20)
            let ballMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
            ball=new THREE.Mesh(ballGeometry,ballMaterial)
            ball.position.x=-10
            ball.position.y=8.2
            ball.position.z=0
            ball.castShadow=true
            let audio=new THREE.PositionalAudio(listener)
            audio.setBuffer(buffer)
            audio.setVolume(10)
            console.log(audio)
            tempy=ball.position.y
            ball.userData.flag=false
            ball.add(audio)
            scene.add(ball)
        })
    }
    function renderScene(){
        requestAnimationFrame(renderScene)
        render()
    }
    function render(){
        temp+=0.03
        tempy=ball.position.y
        ball.position.y=8.2+4*Math.abs(Math.sin(temp))
        ball.position.x=10*Math.cos(temp)
        let audio=ball.children[0]
        if(ball.position.y<tempy){
            ball.userData.flag=true
        }else{
            if(ball.userData.flag){
                audio.play()
                ball.userData.flag=false
            }
        }
        renderer.render(scene,camera)
    }


    useEffect(()=>{
        // init()
    },[])
    return (
        <div style={{width:'100vw'}}>
            {flag&&<h2 onClick={tipsClick} ref={tip} style={{width:'100%',textAlign:'center',color:'black',position:'fixed',top:'10%',left:'0'}}>请点击当前界面进入场景</h2>}
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>

        </div>
    )
}
