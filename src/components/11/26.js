import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
// import '../../utils/JSONLoader'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{

        let renderer=new THREE.WebGLRenderer()
        {//render
            renderer.setClearColor(new THREE.Color(0xffffff,1.0))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enabled=true
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)


        {//camera
            camera.position.x=0
            camera.position.y=0
            camera.position.z=4

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }

        let stats=new Stats()
        {
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
        }

        let light=new THREE.SpotLight(0xffffff)
        {
            light.position.set(0,50,30)
            light.intensity=2
            scene.add(light)
        }
        let tween=new TWEEN.Tween({pos:-1})
            .to({pos:0},3000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .onUpdate(onUpdate)

        let mesh
        let clock=new THREE.Clock()
        function onUpdate () {
            var pos = this.pos;
            // rotate the fingers
            mesh.skeleton.bones[5].rotation.set(0, 0, pos);
            mesh.skeleton.bones[6].rotation.set(0, 0, pos);
            mesh.skeleton.bones[10].rotation.set(0, 0, pos);
            mesh.skeleton.bones[11].rotation.set(0, 0, pos);
            mesh.skeleton.bones[15].rotation.set(0, 0, pos);
            mesh.skeleton.bones[16].rotation.set(0, 0, pos);
            mesh.skeleton.bones[20].rotation.set(0, 0, pos);
            mesh.skeleton.bones[21].rotation.set(0, 0, pos);

            // rotate the wrist
            mesh.skeleton.bones[1].rotation.set(pos, 0, 0);
        };
        {
            let loader=new THREE.JSONLoader()
            loader.load('/models/hand-1.js',function (geometry){
                let mat=new THREE.MeshLambertMaterial({color:0xf0c8c9,shinning:true})
                mesh=new THREE.SkinnedMesh(geometry,mat)
                mesh.rotation.x=0.5*Math.PI
                mesh.rotation.z=0.7*Math.PI
                scene.add(mesh)
                tween.start()
            },onProgress,onError)
        }

        {
            window.addEventListener('resize',onResize,false)
            function onResize(){
                renderer.setSize(window.innerWidth,window.innerHeight)
                camera.aspect=(window.innerWidth/window.innerHeight)
                camera.updateProjectionMatrix()
            }
        }
        renderScene()

        function renderScene() {

            stats.update()
            TWEEN.update()
            let delta=clock.getDelta()
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        function onProgress (xhr){
            if(xhr.lengthComputable){
                let percentComplete=xhr.loaded/xhr.total*100
                console.log(Math.round(percentComplete,2)+'% downloaded')
            }
        }
        function onError (xhr){

        }

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
