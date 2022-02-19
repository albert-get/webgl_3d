import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/ShaderPass'
import '../../utils/CopyShader'
import '../../utils/EffectComposer'
import '../../utils/MaskPass'
import '../../utils/RenderPass'
import '../../utils/BloomPass'
import '../../utils/DotScreenShader'
import '../../utils/DotScreenPass'
import '../../utils/custom-shader'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)



    const webglRender=()=>{
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer
        let webGLRenderer=new THREE.WebGLRenderer()
        webGLRenderer.setClearColor(new THREE.Color(0x000000,1.0))
        webGLRenderer.setSize(window.innerWidth,window.innerHeight)
        webGLRenderer.shadowMap.enabled=true
        renderer=webGLRenderer
        let earth
        let step=0
        let clock=new THREE.Clock()
        let composer
        let plane
        function createPlane(){
            let boxGeometry=new THREE.BoxGeometry(20,20,20)
            let boxTexture=THREE.ImageUtils.loadTexture('/texture/pm.png')
            let boxMaterial=new THREE.MeshPhongMaterial()
            boxMaterial.map=boxTexture
            let box=new THREE.Mesh(boxGeometry,boxMaterial)
            box.rotation.y=0.5
            scene.add(box)
        }
        createPlane()
        camera.position.x=0
        camera.position.y=20
        camera.position.z=50
        camera.lookAt(new THREE.Vector3(0,0,0))
        let ambientLight=new THREE.AmbientLight(0xffffff)
        scene.add(ambientLight)
        let light=new THREE.SpotLight()
        light.position.set(0,0,30)
        light.intensity=0.8
        scene.add(light)
        function addShaderPass(){
            let renderPass=new THREE.RenderPass(scene,camera)
            let shaderPass=new THREE.ShaderPass(THREE.CustomShader)
            let effectCopy=new THREE.ShaderPass(THREE.CopyShader)
            effectCopy.renderToScreen=true
            composer=new THREE.EffectComposer(webGLRenderer)
            composer.addPass(renderPass)
            composer.addPass(shaderPass)
            composer.addPass(effectCopy)
        }
        addShaderPass()
        webglOutput.current.appendChild(renderer.domElement)
        render()
        function render(){
            requestAnimationFrame(render)
            let delta=clock.getDelta()
            composer.render(delta)
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
