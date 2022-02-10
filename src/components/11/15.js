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

        let box
        function addMaterialAndGUI(){
            let boxGeometry=new THREE.BoxGeometry(4,4,4)
            let boxMaterial=new THREE.MeshLambertMaterial({color:0x182793})
            box=new THREE.Mesh(boxGeometry,boxMaterial)
            scene.add(box)
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(30,30,30)
            scene.add(spotLight)
            let ambientLight=new THREE.AmbientLight('#1a1010')
            scene.add(ambientLight)
            let controls=new function (){
                this.ambient=0xffaa00
                this.emissive=0x000000
                this.ambientLightColor=0xffffff
                this.color=0x182793
            }
            let gui=new dat.GUI()
            gui.addColor(controls,'ambientLightColor','环境光颜色').onChange(function (e){
                ambientLight.color=new THREE.Color(e)

            })
            gui.addColor(controls,'ambient','材质的环境色').onChange(function (e){
                boxMaterial.ambient=new THREE.Color(e)
            })
            gui.addColor(controls,'emissive','材质的发射光').onChange(function (e){
                boxMaterial.color=new THREE.Color(e)
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
            box.rotation.y+=0.02
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
