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

    let stats
    let container
    let geometrySize
    let meshCount=500
    let renderer
    let camera
    let dirLight
    let mousePoint=new THREE.Vector2()
    let ray
    let material
    let mesh
    let scene
    function init(){
        initScene()
        addMesh()
        addLight()
        addControls()
        addSupport()
        renderScene()

        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onWindowResize,false)
    }
    function addSupport(){
        ray=new THREE.Raycaster(20)
        let axes=new THREE.AxisHelper(20)
        scene.add(axes)
        stats=new Stats()
        stats.domElement.style.position='fixed'
        webglOutput.current.appendChild(stats.domElement)
    }
    function addLight(){
        let target=new THREE.Object3D()
        // target.position=new THREE.Vector3(0,0,0)
        let pointColor='#bbbbbb'
        dirLight=new THREE.DirectionalLight(pointColor)
        dirLight.position.set(0,50,50)
        dirLight.castShadow=true

        dirLight.shadowCameraNear=0.1
        dirLight.shadowCameraFar=100
        dirLight.shadowCameraTop=200
        dirLight.shadowCameraBottom=0
        dirLight.shadowMapWidth=2048
        dirLight.shadowMapHeight=2048
        let dirLight0=dirLight.clone()
        dirLight0.position.set(0,50,-50)
        scene.add(dirLight0)
        scene.add(dirLight)
        let ambientLight=new THREE.AmbientLight('#aaaaaa')
        scene.add(ambientLight)
    }
    function addControls(){
        let controls=new THREE.OrbitControls(camera,renderer.domElement)
        setTimeout(function (){
            window.addEventListener('mousemove',mouseMove)
            window.addEventListener('touchmove',mouseMove)
        },70)
    }
    function mouseMove(){
        if(!mesh){
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
        }
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
        webglOutput.current.appendChild(renderer.domElement)
        camera=new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,0.1,5000)
        camera.position.z=1000
        camera.position.y=1000
        camera.position.x=1000
        camera.lookAt(new THREE.Vector3())
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
    function addMesh(){
        let jsLoader=new THREE.JSONLoader()
        jsLoader.load('/obj/2.js',function (object){
            object.computeBoundingBox()
            geometrySize=object.boundingBox.getSize()
            let objTemp=object.clone()
            for(let i=0;i<meshCount;i++){
                material=new THREE.MeshLambertMaterial({color:getColor()})
                let object=new THREE.Mesh(objTemp,material)
                object.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI)
                object.position.set(Math.random()*1000,Math.random()*1000,Math.random()*1000)
                scene.add(object)
            }
            mesh=new THREE.Mesh(objTemp,material)
            mesh.rotation.x=-Math.PI*0.5
            scene.add(mesh)
        })
    }
    function renderScene(){
        requestAnimationFrame(renderScene)
        render()
    }
    function render(){
        stats.update()
        renderer.render(scene,camera)
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div style={{width:'100vw'}}>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>

        </div>
    )
}
