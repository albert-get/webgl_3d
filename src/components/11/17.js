import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{

        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0x000000,1.0))
        renderer.setSize(window.innerWidth,window.innerHeight)

        let boxGeometry=new THREE.BoxGeometry(20,20,20)
        let meshMaterial=new THREE.ShaderMaterial({
            uniforms:{},
            vertexShader:`
\tvarying vec3 vPosition;\t\t\t\t\t//用于传递给片元着色器的顶点位置
    void main()
    {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
\tvPosition=position.xyz;\t\t\t\t//将顶点的原始位置传递给片元着色器
    }
            `,
            fragmentShader:`
\tprecision mediump float;\t\t\t\t\t//设置默认浮点精度
\tvarying vec3 vPosition;\t\t\t\t\t//接收从顶点着色器传过来的顶点位置
\tvoid main(){
\t\tvec4 bColor=vec4(0.678,0.231,0.129,1.0);\t//砖块的颜色
\t\tvec4 mColor=vec4(0.763,0.657,0.614,1.0);\t//间隔的颜色
\t\tfloat y=vPosition.y;\t\t\t\t\t\t//提取顶点的y坐标值
\t\ty=mod((y+100.0)*4.0,4.0);\t\t\t\t//折算出区间值
\t\tif(y>1.8){\t\t\t\t\t\t\t\t//当区间值大于指定值时
\t\t\tgl_FragColor = bColor;\t\t\t\t//给此片元颜色值
\t\t}else{\t\t\t\t\t\t\t\t//当区间值不大于指定值时
\t\t\tgl_FragColor = mColor;\t\t\t\t//给此片元颜色值
\t}}
            `,
            transparent:true
        })
        let box=new THREE.Mesh(boxGeometry,meshMaterial)
        scene.add(box)
        camera.position.x=30
        camera.position.y=30
        camera.position.z=30

        camera.lookAt(new THREE.Vector3(0,0,0))



        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        let step=0
        function renderScene() {
            box.rotation.y=step+=0.01
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
