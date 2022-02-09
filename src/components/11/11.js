import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{

        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xffffff))
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
            let sphereMaterial=new THREE.MeshBasicMaterial({color:0x000000,wireframe:true})
            sphere=new THREE.Mesh(sphereGeometry,sphereMaterial)
            scene.add(sphere)
            let controls=new function (){
                this.color=sphereMaterial.color.getStyle()
                this.wireframe=sphereMaterial.wireframe
                this.wireframeLinewidth=sphereMaterial.wireframeLinewidth
                this.shading=THREE.SmoothShading
                this.transparent=false
                this.opacity=1
                this.side=THREE.FrontSide
                this.shading=THREE.FlatShading
            }
            let gui=new dat.GUI()
            gui.addColor(controls,'color','材质颜色').onChange(function (e){
                sphereMaterial.color=new THREE.Color(e)
            })
            gui.add(controls,'wireframe','是否使用线框').onChange(function (e){
                sphereMaterial.wireframe=e
            })
            gui.add(controls,'wireframeLinewidth',0,3,'线框宽度').onChange(function (e){
                sphereMaterial.wireframeLinewidth=e
                sphereMaterial.needsUpdate=true
            })
            gui.add(controls,'transparent','是否开启透明').onChange(function (e){
                sphereMaterial.transparent=e

            })
            gui.add(controls,'opacity',0,1,'不透明度').onChange(function (e){
                sphereMaterial.opacity=e
            })
            gui.add(controls,'side',['front','back','double'],'材质应用的面').onChange(function (e){
                switch (e){
                    case 'front':
                        sphereMaterial.side=THREE.FrontSide
                        break;
                    case 'back':
                        sphereMaterial.side=THREE.BackSide
                        break;
                    case 'double':
                        sphereMaterial.side=THREE.DoubleSide
                        break;
                }
                sphereMaterial.needsUpdate=true
            })

            gui.add(controls,'shading',['FlatShading','SmoothShading'],'着色方式').onChange(function (e){
                switch (e){
                    case 'FlatShading':
                        sphereMaterial.shading=THREE.FlatShading
                        break;
                    case 'SmoothShading':
                        sphereMaterial.shading=THREE.SmoothShading
                        break;
                }
                sphereMaterial.needsUpdate=true
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
