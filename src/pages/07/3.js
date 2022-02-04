import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const webgl=()=>{
        mouseListener();

        function start()
        {
            gl = canvas.current.getContext('webgl2', { antialias: true });
            if (!gl)
            {
                alert("创建GLES上下文失败，不支持webGL2.0!");
                return;
            }

            gl.viewport(0, 0, canvas.current.width, canvas.current.height);
            gl.clearColor(0.0,0.0,0.0,1.0);
            ms.setInitStack();
            ms.setCamera(0,0,50,0,0,-1,0,1,0);
            ms.setProjectFrustum(-1.5,1.5,-1,1,3,200);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uLightLocation;\t//光源位置
uniform vec3 uCamera;\t//摄像机位置
in vec3 aPosition;  //顶点位置
in vec3 aNormal;    //顶点法向量
out vec4 finalLight;//最终光
//定位光光照计算的方法
void pointLight(\t\t\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t\t//法向量
  inout vec4 ambient,\t\t\t//环境光最终强度
  inout vec4 diffuse,\t\t\t\t//散射光最终强度
  inout vec4 specular,\t\t\t//镜面光最终强度
  in vec3 lightLocation,\t\t\t//光源位置
  in vec4 lightAmbient,\t\t\t//环境光强度
  in vec4 lightDiffuse,\t\t\t//散射光强度
  in vec4 lightSpecular\t\t\t//镜面光强度
){
  ambient=lightAmbient;\t\t\t//直接得出环境光的最终强度
  vec3 normalTarget=aPosition+normal;\t//计算变换后的法向量
  vec3 newNormal=(uMMatrix*vec4(normalTarget,1)).xyz-(uMMatrix*vec4(aPosition,1)).xyz;
  newNormal=normalize(newNormal); \t//对法向量规格化
  //计算从表面点到摄像机的向量
  vec3 eye= normalize(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);
  //计算从表面点到光源位置的向量vp
  vec3 vp= normalize(lightLocation-(uMMatrix*vec4(aPosition,1)).xyz);
  vp=normalize(vp);//格式化vp
  vec3 halfVector=normalize(vp+eye);\t//求视线与光线的半向量
  float shininess=5.0;\t\t\t\t//粗糙度，越小越光滑
  float nDotViewPosition=max(0.0,dot(newNormal,vp)); \t//求法向量与vp的点积与0的最大值
  diffuse=lightDiffuse*nDotViewPosition;\t\t\t\t//计算散射光的最终强度
  float nDotViewHalfVector=dot(newNormal,halfVector);\t//法线与半向量的点积
  float powerFactor=max(0.0,pow(nDotViewHalfVector,shininess)); \t//镜面反射光强度因子
  specular=lightSpecular*powerFactor;    \t\t\t//计算镜面光的最终强度
}


void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vec4 tempColor=vec4(0.9,0.9,0.9,1.0);
   vec4 ambientTemp, diffuseTemp, specularTemp;   //存放环境光、散射光、镜面反射光的临时变量
   pointLight(normalize(aNormal),ambientTemp,diffuseTemp,specularTemp,uLightLocation,vec4(0.2,0.2,0.2,1.0),vec4(0.7,0.7,0.7,1.0),vec4(0.3,0.3,0.3,1.0));
   finalLight=(ambientTemp+diffuseTemp+specularTemp);
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec4 finalLight;//最终光
out vec4 fragColor;//输出到的片元颜色
void main()
{
   //将计算出的颜色给此片元
      vec3 Color=vec3(0.9,0.9,0.9);
      fragColor = vec4(finalLight.xyz*Color,1.0);//给此片元颜色值

}`
            }];
            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
            //着色器加载完了加载绘制者
            loadObjFile("/obj/ch.obj");

            setTimeout(()=>{
                render()
            },100)
        }
        function render(){
            drawFrame()
            requestAnimationFrame(render)
        }
        function drawFrame()
        {
            //若还没有加载完则不绘制
            if(!ooTri) {return;}
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            //执行绕Y轴旋转
            ms.rotate(currentYAngle,0,1,0);
            //执行绕X轴旋转
            ms.rotate(currentXAngle,1,0,0);
            //绘制茶壶
            ooTri.drawSelf(ms);
            //恢复现场
            ms.popMatrix();
        }

        start();

    }
    useEffect(()=>{
        setTimeout(()=>{
            webgl()
        },1000)
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState3.js"></Script>
                <Script type="text/javascript" src="/js/LightManager.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar4.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil7.js"></Script>


                <Script type="text/javascript" src="/js/LoadObjUtil.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject2.js"></Script>
                <Script type="text/javascript" src="/js/mouseListener.js"></Script>

                <Script type="text/javascript" src="/js/GlobalVar.js"></Script>
                <Script type="text/javascript" src="/js/loadBall2.js"></Script>
            </>
            <div>
            </div>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
