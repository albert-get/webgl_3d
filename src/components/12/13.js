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
    let scene
    let camera
    let renderer
    let ambientLight
    let hemisphereLight
    let group
    let params={
        clipIntersection:true,
        planeConstant:0,
        showHelpers:false
    }
    let clipPlanes=[
        new THREE.Plane(new THREE.Vector3(1,0,0),0),
        new THREE.Plane(new THREE.Vector3(0,-1,0),0),
        new THREE.Plane(new THREE.Vector3(0,0,-1),0)
    ]
    let material
    function init(){
        scene=new THREE.Scene()
        camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        renderer=new THREE.WebGLRenderer({antialias:true})
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true
        renderer.localClippingEnabled=true

        camera.position.x=-5
        camera.position.y=10
        camera.position.z=-5
        camera.lookAt(new THREE.Vector3())
        scene.add(camera)
        let helpers=new THREE.Group()
        helpers.add(new THREE.AxesHelper(20))
        helpers.add(new THREE.PlaneHelper(clipPlanes[0],30,0xff0000))
        helpers.add(new THREE.PlaneHelper(clipPlanes[1],30,0x00ff00))
        helpers.add(new THREE.PlaneHelper(clipPlanes[2],30,0x0000ff))
        helpers.visible=false
        scene.add(helpers)

        addControls()
        addLight()
        addGeometry()
        addGUI()
        renderScene()
        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function addControls(){
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.minDistance=10
            controls.maxDistance=1000
            controls.enablePan=false
            controls.zoomSpeed=3.0
        }
        function addLight(){
            let ambiColor='#383845'
            ambientLight=new THREE.AmbientLight(ambiColor)
            scene.add(ambientLight)
            hemisphereLight=new THREE.HemisphereLight(0xffffff,0x000000,1)
            hemisphereLight.position.set(-10,5,-10)
            hemisphereLight.rotation.x=-Math.PI
            scene.add(hemisphereLight)
        }
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        function addGUI(){
            let gui=new dat.GUI({width:300})
            gui.open()
            let myTitle=gui.addFolder('设置')
            myTitle.add(params,'clipIntersection').name('剪裁开关').onChange(function (e){
                let children=group.children
                for(let i=0;i<children.length;i++){
                    children[i].material.clipIntersection=e
                }
            })
            myTitle.add(params,'planeConstant',-16,16).step(1).name('剪裁平面位置').onChange(function (e){
                for(let j=0;j<clipPlanes.length;j++){
                    clipPlanes[j].constant=e
                }
            })
            myTitle.add(params,'showHelpers').name('显示辅助剪裁平面').onChange(function (e){
                helpers.visible=e
            })
        }
        function addGeometry(){
            let texture=['','/img/1.png','/img/1.png','/img/1.png','/img/1.png','/img/1.png','/img/1.png','/img/1.png','/img/1.png',"/img/earth.png"]
            let myColor=['','#e8cd66','#e4c133','#ce9b32','#cd9a2f','#c98f24','#c3760a','#c34900','#ae1601','#ffffff']
            group=new THREE.Group()
            for(let i=1;i<10;i++){
                let geometry=new THREE.SphereGeometry(i/2,48,24)
                new THREE.TextureLoader().load(texture[i],function (e){
                    let material=new THREE.MeshLambertMaterial({
                        color:new THREE.Color(myColor[i]),
                        side:THREE.DoubleSide,
                        clippingPlanes:clipPlanes,
                        clipIntersection: params.clipIntersection,
                        map:e
                    })
                    group.add(new THREE.Mesh(geometry,material))
                })


            }
        }
        scene.add(group)
    }
    function renderScene(){
        requestAnimationFrame(renderScene)
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
