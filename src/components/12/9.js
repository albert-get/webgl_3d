import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/ShaderPass'
import '../../utils/SSAOShader'
import '../../utils/CopyShader'
import '../../utils/EffectComposer'
import '../../utils/MaskPass'
import '../../utils/RenderPass'
import '../../utils/SSAOPass'
import '../../utils/OrbitControls'
import '../../utils/OBJLoader'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)



    const webglRender=()=>{
        let boxGeometry
        let boxMaterial
        let scene
        let renderer
        let camera
        let box
        let plane
        let stats,container
        let dirLight
        let ssaoPass
        let effectComposer
        let params={enabled:true,onlyAO:false,radius:32,aoClamp:0.25,lumInfluence:0.7}
        function init(){
            initScene()
            addMaterial()
            addControls()
            initPostprocessing()
            onWindowResize()
            webglOutput.current.appendChild(renderer.domElement)
            window.addEventListener('resize',onWindowResize,false)
            addGui()
        }
        function addControls(){
            stats=new Stats()
            stats.domElement.style.position="fixed"
            webglOutput.current.appendChild(stats.domElement)
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.enablePan=false
            controls.enableZoom=false
        }
        function addGui(){
            let gui=new dat.GUI({width:300})
            gui.open()
            let myTitle=gui.addFolder('设置')
            myTitle.add(params,'enabled').name('SSAO开关')
            myTitle.add(params,'onlyAO',false).name('AO开关').onChange(function (e){
                ssaoPass.onlyAO=e
            })
        }
        function initPostprocessing(){
            let renderPass=new THREE.RenderPass(scene,camera)
            ssaoPass=new THREE.SSAOPass(scene,camera)
            ssaoPass.renderToScreen= true
            effectComposer=new THREE.EffectComposer(renderer)
            effectComposer.addPass(renderPass)
            effectComposer.addPass(ssaoPass)
        }
        function onWindowResize(){
            let width=window.innerWidth
            let height=window.innerHeight
            camera.aspect=width/height
            camera.updateProjectionMatrix()
            renderer.setSize(width,height)
            ssaoPass.setSize(width,height)
            let pixelRatio=renderer.getPixelRatio()
            let newWidth=Math.floor(width/pixelRatio)||1
            let newHeight=Math.floor(height/pixelRatio)||1
            effectComposer.setSize(newWidth,newHeight)
        }
        function initScene(){
            scene=new THREE.Scene()
            renderer=new THREE.WebGLRenderer({antialias:false})
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
            camera.position.x=-24.24
            camera.position.y=48.6*6
            camera.position.z=-22.2*5
            camera.lookAt(scene.position)
        }
        function addMaterial(){
            let planeGeometry=new THREE.PlaneGeometry(500,500)
            let planeMaterial=new THREE.MeshLambertMaterial({color:0xaaaaaa})
            plane=new THREE.Mesh(planeGeometry,planeMaterial)
            plane.rotation.x=-Math.PI
            plane.position.x=0
            plane.position.y=0
            plane.position.z=0
            plane.receiveShadow=true
            scene.add(plane)
            let objloader=new THREE.OBJLoader()
            objloader.load('/obj/obj.obj',function (object){
                object.scale.set(0.01,0.01,0.01)
                boxGeometry=object.clone()
                scene.add(object)
                renderScene()
            })
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(0,400,400)
            scene.add(spotLight)
            let ambientLight=new THREE.AmbientLight('#111111')
            scene.add(ambientLight)
        }
        function renderScene(){
            if(params.enabled){
                effectComposer.render()
            }else{
                renderer.render(scene,camera)
            }
            stats.update()
            requestAnimationFrame(renderScene)
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
