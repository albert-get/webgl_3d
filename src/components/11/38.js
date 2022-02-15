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
        let canvas=new Array(6);
        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.setPixelRatio(window.devicePixelRatio)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,10,1000)

        {//camera
            camera.position.x=-5
            camera.position.y=10
            camera.position.z=30

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
            let geometry=new THREE.BoxGeometry(10,10,10)
            let loader=new THREE.TextureLoader()
            let texture=loader.load('/models/UV_Grid_Sm.jpg',renderScene)
            texture.wrapS=THREE.RepeatWrapping
            texture.wrapT=THREE.RepeatWrapping
            texture.matrixAutoUpdate=false
            let material=new THREE.MeshBasicMaterial({map:texture})
            let mesh=new THREE.Mesh(geometry,material)
            scene.add(mesh)
        }

        {
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.addEventListener('change',renderScene)
            controls.minDistance=3
            controls.maxDistance=1000
            controls.enablePan=true
            controls.zoomSpeed=3.0
        }
        {
            let GuiParams={
                offsetX: 0,
                offsetY: 0,
                repeatX: 0.25,
                repeatY: 0.25,
                rotation: Math.PI / 4, // positive is counter-clockwise
                centerX: 0.5,
                centerY: 0.5,
                //color:0xffffff
            };
            let gui=new dat.GUI()
            gui.open()
            let myTitle=gui.addFolder('设置')
            myTitle.add(GuiParams,'offsetX',0.0,1.0).name('x偏移量').onChange(updateUvTransform)
            myTitle.add(GuiParams,'offsetY',0.0,1.0).name('y偏移量').onChange(updateUvTransform)
            myTitle.add(GuiParams,'repeatX',0.25,2.0).name('x轴重复').onChange(updateUvTransform)
            myTitle.add(GuiParams,'repeatY',0.25,2.0).name('y轴重复').onChange(updateUvTransform)
            myTitle.add(GuiParams,'rotation',-2.0,2.0).name('纹理旋转').onChange(updateUvTransform)
            myTitle.add(GuiParams,'centerX',0.0,1.0).name('x轴中心点').onChange(updateUvTransform)
            myTitle.add(GuiParams,'centerY',0.0,1.0).name('y轴中心点').onChange(updateUvTransform)
            function updateUvTransform() {
                var texture = mesh.material.map;

                //设置当前纹理的属性  ===和!== 只有在类型相同的情况下才会比较其值
                if ( texture.matrixAutoUpdate === true ) {
                    texture.offset.set( GuiParams.offsetX, GuiParams.offsetY );
                    texture.repeat.set( GuiParams.repeatX, GuiParams.repeatY );
                    texture.center.set( GuiParams.centerX, GuiParams.centerY );
                    texture.rotation = GuiParams.rotation;
                } else {
                    //设置当前纹理uv属性
                    texture.matrix.setUvTransform( GuiParams.offsetX, GuiParams.offsetY, GuiParams.repeatX,
                        GuiParams.repeatY, GuiParams.rotation, GuiParams.centerX, GuiParams.centerY );
                }
            }
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
