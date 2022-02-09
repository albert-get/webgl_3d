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
        let axes=new THREE.AxesHelper(6)
        scene.add(axes)
        camera.position.x=10
        camera.position.y=10
        camera.position.z=10

        camera.lookAt(scene.position)

        let sphere
        function addMaterialAndGUI(){
            let sphereGeometry=new THREE.SphereGeometry(4,20,20)
            let sphereMaterial=new THREE.MeshNormalMaterial({wireframe:true})
            sphere=new THREE.Mesh(sphereGeometry,sphereMaterial)
            scene.add(sphere)
            sphereMaterial.wireframe=true
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(30,30,30)
            scene.add(spotLight)
            let controls=new function (){
                this.wireframe=true
                this.wireframeLinewidth=20
                this.shading=THREE.FlatShading
            }
            let gui=new dat.GUI()
            gui.add(controls,'wireframe','是否开启线程').onChange(function (e){
                sphereMaterial.wireframe=e
            })
            gui.add(controls,'wireframeLinewidth',10,50,'线框宽度').onChange(function (e){
                sphereMaterial.wireframeLinewidth=e
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
