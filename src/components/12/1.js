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
            camera.position.x=0
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
        {
            for(let x=-5;x<5;x++){
                for(let y=-5;y<5;y++){
                    let material=new THREE.SpriteMaterial({color:0xff0000*Math.random()})
                    let sprite=new THREE.Sprite(material)
                    let ad=Math.PI/180*(360*Math.random())
                    let bd=Math.PI/180*(360*Math.random())
                    sprite.position.set(40*Math.cos(ad)*Math.cos(bd),40*Math.cos(ad)*Math.sin(bd),40*Math.sin(ad))
                    pointmove(0,0,0,sprite)
                    scene.add(sprite)
                }
            }
        }
        function pointmove( mx, my, mz, point) {
            let tween = new TWEEN.Tween( point.position ).to( {
                x: mx,
                y: my,
                z: mz }, 3000 )
                .easing( TWEEN.Easing.Linear.None).start();
            tween.repeat(Infinity); // repeats forever
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
        function renderScene() {

            stats.update()
            TWEEN.update()
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
