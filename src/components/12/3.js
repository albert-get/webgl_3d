import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/OBJLoader'
import PHOTONS from '../../photons'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    let ParticleSystemIDs=Object.freeze({
        Smoke1:1,
        Smoke2:2,
        Flame:3,
        FlameEmbers:4
    })
    let ParticleEnvironmentIDs=Object.freeze({
        Campfire:1
    })
    let rendererContainer
    let screenWidth,screenHeight
    let pointLight,ambientLight
    let particleSystems,loadingManager
    let scene,camera,renderer,controls,stats,clock
    let currentEnvironmentID
    let smokeActive,smokeType
    let particleSystemsParent


    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
                return
            }
        }
        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.setPixelRatio(window.devicePixelRatio)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            camera.position.x=20
            camera.position.y=0
            camera.position.z=150

            camera.lookAt(scene.position)
        }


        {
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(camera.position)
            scene.add(spotLight)
            let ambientLight=new THREE.AmbientLight(0x404040)
            scene.add(ambientLight)
        }
        let controls=new function (){
            this.size=8
            this.transparent=true
            this.opacity=0.6
            this.vertexColors=true
            this.color=0xffffff
            this.sizeAttenuation=true
            this.rotateSystem=true
            this.redraw=function (){
                if(scene.getObjectByName('particles')){
                    scene.remove(scene.getObjectByName('particles'))
                }
                createParticles(controls.size,controls.transparent,controls.opacity,controls.vertexColors,controls.sizeAttenuation,controls.color)
            }
        }
        let cloud
        {
            let gui=new dat.GUI()
            gui.add(controls,'size',0,10).onChange(controls.redraw)
            gui.add(controls,'transparent').onChange(controls.redraw)
            gui.add(controls,'opacity',0,1).onChange(controls.redraw)
            gui.add(controls,'vertexColors').onChange(controls.redraw)
            gui.addColor(controls,'color').onChange(controls.redraw)
            gui.add(controls,'sizeAttenuation').onChange(controls.redraw)
            gui.add(controls,'rotateSystem').onChange(controls.redraw)
        }
        function createParticles(size,transparent,opacity,vertexColors,sizeAttenuation,color){
            let geom=new THREE.Geometry()
            let material=new THREE.PointCloudMaterial({
                size:size,
                map:THREE.ImageUtils.loadTexture('/texture/star.png'),
                transparent:transparent,
                opacity:opacity,
                vertexColors:vertexColors,
                sizeAttenuation:sizeAttenuation,
                color:color
            })
            let range=500
            for(let i=0;i<15000;i++){
                let particle=new THREE.Vector3(Math.random()*range-range/2,Math.random()*range-range/2,Math.random()*range-range/2)
                geom.vertices.push(particle)
                let color=new THREE.Color(0x00ff00)
                color.setHSL(color.getHSL().h,color.getHSL().s,Math.random()* color.getHSL().l)
                geom.colors.push(color)
            }
            cloud=new THREE.PointCloud(geom,material)
            cloud.name='particles'
            scene.add(cloud)
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
        let step = 0;
        function renderScene() {

            stats.update()
            if (cloud&&controls.rotateSystem) {
                step += 0.01;

                cloud.rotation.x = step;
                cloud.rotation.z = step;
            }
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

        renderScene()
    }
    function initializeSmokeSystem(){
        let _TPSV=PHOTONS.SingularVector
    }


    useEffect(()=>{
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>
    )
}
