import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import '../../utils/SceneExporter'
import '../../utils/SceneLoader'
import {Stats} from '../../utils/stats'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const init=()=>{
        let stats=initStats()
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xEEEEEE,1.0))
        renderer.setSize(window.innerWidth,window.innerHeight)

        let planeGeometry=new THREE.PlaneGeometry(60,20,1,1)
        let planeMaterial=new THREE.MeshLambertMaterial({color:0xffffff})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=15
        plane.position.y=0
        plane.position.z=0
        scene.add(plane)

        let cubeGeometry=new THREE.BoxGeometry(4,4,4)
        let cubeMaterial=new THREE.MeshLambertMaterial({color:0xff0000})
        let cube=new THREE.Mesh(cubeGeometry,cubeMaterial)
        cube.position.x=-4
        cube.position.y=3
        cube.position.z=0
        scene.add(cube)

        let sphereGeometry=new THREE.SphereGeometry(4,20,20)
        let sphereMaterial=new THREE.MeshLambertMaterial({color:0x7777ff})
        let sphere=new THREE.Mesh(sphereGeometry,sphereMaterial)
        sphere.position.x=20
        sphere.position.y=0
        sphere.position.z=2
        scene.add(sphere)

        camera.position.x=-30
        camera.position.y=40
        camera.position.z=30

        camera.lookAt(scene.position)
        let ambientLight=new THREE.AmbientLight(0x0c0c0c)
        scene.add(ambientLight)
        let spotLight=new THREE.PointLight(0xffffff)
        spotLight.position.set(-40,60,-10)
        scene.add(spotLight)
        let step=0
        let controls=new function (){
            this.exportScene=function (){
                let exporter=new THREE.SceneExporter()
                let sceneJson=JSON.stringify(exporter.parse(scene))
                localStorage.setItem('scene',sceneJson)
            }
            this.clearScene=function (){
                scene=new THREE.Scene()
            }
            this.importScene=function (){
                let json=localStorage.getItem('scene')
                let sceneLoader=new THREE.SceneLoader()
                sceneLoader.parse(JSON.parse(json),function (e){
                    scene=e.scene
                },'.')
            }
        }
        let gui=new dat.GUI()
        gui.add(controls,'exportScene')
        gui.add(controls,'clearScene')
        gui.add(controls,'importScene')



        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {
            stats.update()
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        function initStats(){
            let stats=new Stats()
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
            return stats
        }
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>

    )
}
