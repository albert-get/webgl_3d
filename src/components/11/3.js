import {useEffect, useRef} from "react";
import * as THREE from 'three'

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
        plane.position.y=-5
        plane.position.z=-2
        scene.add(plane)
        camera.position.x=30
        camera.position.y=30
        camera.position.z=30
        camera.lookAt(scene.position)

        function addGeometry(){
            let geometryArray=[]
            geometryArray.push(new THREE.BoxGeometry(4,4,4))
            geometryArray.push(new THREE.CylinderGeometry(1,4,4))
            geometryArray.push(new THREE.SphereGeometry(2))
            geometryArray.push(new THREE.IcosahedronGeometry(4))
            geometryArray.push(new THREE.OctahedronGeometry(3))
            geometryArray.push(new THREE.TetrahedronGeometry(3))
            geometryArray.push(new THREE.TorusGeometry(3,1,10,10))
            geometryArray.push(new THREE.TorusKnotGeometry(3,0.5,50,20))
            geometryArray.push(new THREE.PlaneGeometry(4,2))
            geometryArray.push(new THREE.CircleGeometry(4,18))
            let material=new THREE.MeshNormalMaterial()
            for(let i=0,l=geometryArray.length;i<l;i++){
                let mesh=new THREE.Mesh(geometryArray[i],material)
                mesh.position.x=-24+Math.floor(i/2)*10
                mesh.position.y=0
                mesh.position.z=(i%2)===0?-4:4
                scene.add(mesh)
            }

        }
        addGeometry()
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {

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
