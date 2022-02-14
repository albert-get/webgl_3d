import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OBJLoader'


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
        let renderer=new THREE.WebGLRenderer()
        {//render
            renderer.setClearColor(new THREE.Color(0x000000,0.1))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enabled=true
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            camera.position.x=0
            camera.position.y=10
            camera.position.z=20

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }


        {
            let light=new THREE.DirectionalLight(0xffffff)
            light.position.set(10,10,-20)
            scene.add(light)
            let spotLight=new THREE.SpotLight(0xffffff)
            spotLight.position.set(0,10,0)
            scene.add(spotLight)
            let spotLight2=new THREE.SpotLight(0xffffff)
            spotLight2.position.set(0,2,5)
            scene.add(spotLight2)

        }

        function getBumpTextureMaterial(imageName,bumpName){//创建带有凹凸贴图的材质
            let texture =THREE.ImageUtils.loadTexture("/models/" + imageName);//读取纹理贴图的数据
            let bump =THREE.ImageUtils.loadTexture("/models/" + bumpName);//读取法相贴图的数据
            let mat = new THREE.MeshPhongMaterial();//新建Phong材质
            mat.map = texture;//将读取的纹理数据赋值给材质的map属性
            mat.bumpMap = bump;//将读取的凹凸数据赋值给材质的bump属性
            mat.bumpScale=0.15;//设置凹凸的高度
            return mat;//返回网格对象
        }
        {
            let boxGeometry=new THREE.BoxGeometry(13,13,2)
            let material=getBumpTextureMaterial('qiang.jpg','qiangat.jpg')
            let model1=new THREE.Mesh(boxGeometry,material)
            model1.material=material
            model1.position.set(7,0,0)
            model1.rotation.y=-0.5
            scene.add(model1)
            let mat2=getBumpTextureMaterial('qiang.jpg','qiangat.jpg')
            mat2.bumpScale=0
            let model2=new THREE.Mesh(boxGeometry,material)
            model2.position.set(-7,0,0)
            model2.rotation.y=0.5
            scene.add(model2)
            camera.position.x=0
            camera.position.y=10
            camera.position.z=20
            camera.lookAt(new THREE.Vector3(0,0,0))

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
