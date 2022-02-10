import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{

        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)

        camera.position.x=10
        camera.position.y=10
        camera.position.z=10

        camera.lookAt(scene.position)

        let sphere
        function addMaterialAndGUI(){
            let sphereGeometry=new THREE.SphereGeometry(4,20,20)
            let sphereMaterial=new THREE.MeshPhongMaterial()
            sphere=new THREE.Mesh(sphereGeometry,sphereMaterial)
            scene.add(sphere)
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(30,30,30)
            scene.add(spotLight)
            let controls=new function (){
                this.color='#ffffff'
                this.specular='#ffffff'
                this.shininess=30
            }
            let gui=new dat.GUI()
            gui.addColor(controls,'color','球体颜色').onChange(function (e){
                sphereMaterial.color=new THREE.Color(e)
            })
            gui.addColor(controls,'specular','specular颜色').onChange(function (e){
                sphereMaterial.specular=new THREE.Color(e)
            })
            gui.add(controls,'shininess',0,100,'shininess属性值').onChange(function (e){
                sphereMaterial.shininess=e
            })

        }
        addMaterialAndGUI()

        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {
            sphere.rotation.y+=0.02
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}
