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
import '../../utils/ConvolutionShader'
import '../../utils/DotScreenPass'
import '../../utils/DotScreenShader'


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
        function createEarth(){
            let Sphere=new THREE.SphereGeometry(10,40,40)
            let planetTexture=THREE.ImageUtils.loadTexture('/texture/Earth.png')
            let specularTexture=THREE.ImageUtils.loadTexture('/texture/EarthSpec.png')
            let normalTexture=THREE.ImageUtils.loadTexture('/texture/EarthNormal.png')
            let planetMaterial=new THREE.MeshPhongMaterial()
            planetMaterial.specularMap=specularTexture
            planetMaterial.specular=new THREE.Color(0xffffff)
            planetMaterial.shininess=40
            planetMaterial.normalMap=normalTexture
            planetMaterial.map=planetTexture
            let sphere=new THREE.Mesh(Sphere,planetMaterial)
            scene.add(sphere)
            earth=sphere
        }
        createEarth()
        camera.position.x=30
        camera.position.y=0
        camera.position.z=30
        camera.lookAt(new THREE.Vector3(0,0,0))
        let ambientLight=new THREE.AmbientLight(0xffffff)
        scene.add(ambientLight)
        let light=new THREE.SpotLight()
        light.position.set(0,0,30)
        light.intensity=0.8
        scene.add(light)
        function addDotScreenPass(){
            let renderPass=new THREE.RenderPass(scene,camera)
            let dotScreenPass=new THREE.DotScreenPass()
            let effectCopy=new THREE.ShaderPass(THREE.CopyShader)
            effectCopy.renderToScreen=true
            composer=new THREE.EffectComposer(webGLRenderer)
            composer.addPass(renderPass)
            composer.addPass(dotScreenPass)
            composer.addPass(effectCopy)
        }
        addDotScreenPass()
        webglOutput.current.appendChild(renderer.domElement)
        render()
        function render(){
            step+=0.01
            earth.rotation.y=step
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
