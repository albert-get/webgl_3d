import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)
    let audioInput=useRef(null)
    let box=useRef(null)

    let file
    let fileUrl

    function fileChange(){
        file=audioInput.current.files[0]
        fileUrl=URL.createObjectURL(file)

        box.current.style.display='none'
        addAudio()
    }
    let scene
    let renderer
    let camera
    let fftSize=32
    let analyser
    let misicDataArray=new Array(16)
    let plane
    let dirLight
    let material
    let mesh=[]
    let temGeometry=new Array(fftSize)
    function init(){
        initScene()
        addMesh()
        addControls()
        addLight()
        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onWindowResize,false)
    }
    function addAudio(){
        let audioLoder=new THREE.AudioLoader()
        let listener=new THREE.AudioListener()
        let audio=new THREE.Audio(listener)
        audioLoder.load(fileUrl,function (audioBuffer){
            audio.setBuffer(audioBuffer)
            audio.setLoop(true)
            audio.play()
        })
        analyser=new THREE.AudioAnalyser(audio,fftSize)
        console.log(analyser.data.length)
        misicDataArray=analyser.data
        for(let i=0;i<fftSize*0.5;i++){
            temGeometry[i]=new THREE.BoxGeometry(12,misicDataArray[i]/4,12)
            material=new THREE.MeshPhongMaterial({color:getColor()})
            mesh[i]=new THREE.Mesh(temGeometry[i],material)
            mesh[i].position.x=20*i-160
            mesh[i].castShadow=true
            mesh[i].rotation.y=Math.PI/4
            scene.add(mesh[i])
        }
        renderScene()
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
        dirLight0.position.set(0,50,50)
        scene.add(dirLight0)
        scene.add(dirLight)
        let ambientLight=new THREE.AmbientLight('#0c0c0c')
        scene.add(ambientLight)
    }
    function addControls(){
        let controls=new THREE.OrbitControls(camera,renderer.domElement)
        controls.addEventListener('change',renderScene)
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
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true
        renderer.shadowMap.type=THREE.PCFSoftShadowMap
        camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        camera.position.z=270
        camera.position.y=40
        camera.lookAt(new THREE.Vector3(0,0,0))

    }
    function addMesh(){
        let planeGeometry=new THREE.PlaneGeometry(500,500)
        let planeMaterial=new THREE.MeshLambertMaterial({color:0xaaaaaa})
        plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-Math.PI/2
        plane.position.x=0
        plane.position.y=0
        plane.position.z=0
        plane.receiveShadow=true
        scene.add(plane)
    }
    function getColor(){
        let colorElements='0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f'
        let colorArray=colorElements.split(',')
        let color='#'
        for(let i=0;i<6;i++){
            color+=colorArray[Math.floor(Math.random()*16)]
        }
        return color
    }
    function renderScene(){
        analyser.getFrequencyData()
        misicDataArray=analyser.data
        for(let i=0;i<fftSize*0.5;i++){
            if(misicDataArray[i]/4===0){
                misicDataArray[i]=4
            }
            mesh[i].scale.y=misicDataArray[i]/4
            mesh[i].position.y=0
        }
        renderer.render(scene,camera)
        requestAnimationFrame(renderScene)
    }



    useEffect(()=>{
        init()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
            <div ref={box} style={{position:'fixed',top:'50%',left:'50%'}} >
                打开本地音频文件
                <input ref={audioInput} type='file' accept='audio/*' onChange={fileChange}/>
            </div>
        </div>
    )
}
