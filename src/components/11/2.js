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
        let planeGeometry=new THREE.PlaneGeometry(60,20)
        let planeMaterial=new THREE.MeshBasicMaterial({color:0xcccccc})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=0
        plane.position.z=0
        scene.add(plane)
        scene.fog = new THREE.Fog(0xffffff,1,100);
        camera.position.x=30
        camera.position.y=30
        camera.position.z=30
        camera.lookAt(scene.position)
        let controls=new function (){
            this.addCube=function (){
                let cubeSize=Math.random()*3
                let cubeGeometry=new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize)
                let cubeMaterial=new THREE.MeshBasicMaterial({color:Math.random()*0xffffff})
                let cube=new THREE.Mesh(cubeGeometry,cubeMaterial)
                cube.position.x=Math.random()*planeGeometry.parameters.width-planeGeometry.parameters.width/2-10
                cube.position.y=Math.round((Math.random()*5))
                cube.position.z=Math.random()*planeGeometry.parameters.height-planeGeometry.parameters.height/2
                scene.add(cube)
            }
            this.removeCube=function (){
                let childrenOfScene=scene.children
                let lastObject=childrenOfScene[childrenOfScene.length-1]
                if(lastObject instanceof THREE.Mesh&&lastObject!==plane){
                    scene.remove(lastObject)
                }
            }
        }
        let gui=new dat.GUI()
        gui.add(controls,'addCube','添加立方体')
        gui.add(controls,'removeCube','删除立方体')
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            scene.traverse(function (e) {
                //如果对象为网个体且不是长方形平面
                if (e instanceof THREE.Mesh && e != plane){
                    e.rotation.x += 0.02;//不断改变正方体的旋转角度
                    e.rotation.y += 0.02;
                    e.rotation.z += 0.02;
                }
            });
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        renderScene()
    }

    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}
