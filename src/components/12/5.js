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



    const webglRender=()=>{
        let stats
        let container
        let scene
        let renderer
        let camera
        let dirLight
        let material
        let plane
        let mesh
        let params={fog:true,fogExp2:false}
        function init(){
            initScene()
            addMesh()
            addLight()
            addControls()
            addSupport()
            addGui()
            renderScene()

            webglOutput.current.appendChild(renderer.domElement)
            window.addEventListener('resize',onWindowResize,false)

        }
        function addSupport(){
            let axes=new THREE.AxesHelper(20)
            stats=new Stats()
            stats.domElement.style.position='fixed'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            webglOutput.current.appendChild(stats.domElement)
        }
        function addGui(){
            let gui=new dat.GUI({width:300})
            gui.open()
            let myTitle=gui.addFolder('设置')
            let controls=new function (e){
                this.fogType='线性雾'
            }
            let fog=myTitle.add(controls,'fogType',['线性雾','指数雾'])
            fog.onChange(function (e){
                if(e=='线性雾'){
                    params.fog=true
                    params.fogExp2=false
                }else{
                    params.fog=false
                    params.fogExp2=true
                }
                fogSelect(params)
            })

        }
        function fogSelect(type){
            if(type.fog){
                scene.fog=new THREE.Fog(0xffffff,1,100)
            }
            if(type.fogExp2){
                scend.fog=new THREE.FogExp2(0xffffff,0.02)
            }
        }
        function addMesh(){
            let planeGeometry=new THREE.PlaneGeometry(50,30)
            let planeMaterial=new THREE.MeshBasicMaterial({color:0xcccccc})
            plane=new THREE.Mesh(planeGeometry,planeMaterial)
            plane.rotation.x=-0.5*Math.PI
            plane.position.x=-10
            plane.position.y=0
            plane.position.z=0
            scene.add(plane)
            for(let i=0;i<100;i++){
                let cubeSize=Math.random()*3
                let cubeGeometry=new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize)
                let cubeMaterial=new THREE.MeshBasicMaterial({color:Math.random()*0xffffff})
                let cube=new THREE.Mesh(cubeGeometry,cubeMaterial)
                cube.position.x=Math.random()*planeGeometry.parameters.width-planeGeometry.parameters.width/2-10
                cube.position.y=Math.round((Math.random()*5))
                cube.position.z=Math.random()*planeGeometry.parameters.height-planeGeometry.parameters.height/2
                scene.add(cube)
            }
        }
        function addLight(){
            // let target=new THREE.Object3D()
            // target.position=new THREE.Vector3(0,0,0)
            let pointColor='#bbbbbb'
            dirLight=new THREE.DirectionalLight(pointColor)
            dirLight.position.set(0,50,50)
            dirLight.castShadow=true
            dirLight.shadow.CameraNear=0.1
            dirLight.shadow.CameraFar=100
            dirLight.shadow.CameraTop=200
            dirLight.shadow.CameraBottom=0
            dirLight.shadow.MapWidth=2048
            dirLight.shadow.MapHeight=2048
            scene.add(dirLight)
            let dirLight0=dirLight.clone()
            dirLight0.position.set(0,50,-50)
            scene.add(dirLight0)
            let ambientLight=new THREE.AmbientLight('#aaaaaa')
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
            scene.fog=new THREE.Fog(0xffffff,1,100)
            renderer=new THREE.WebGLRenderer({antialias:true})
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enable=true
            renderer.shadowMap.type=THREE.PCFSoftShadowMap
            camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
            camera.position.x=30
            camera.position.y=30
            camera.position.z=30
        }
        function renderScene(){
            render()
            requestAnimationFrame(renderScene)
        }
        function render(){
            stats.update()
            renderer.render(scene,camera)
        }
        init()
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
