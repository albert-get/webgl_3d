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
            //设置光源位置

            lightManager.setLightLocation(0,0,60);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uLightLocation;\t//光源位置
uniform vec3 uCamera;\t//摄像机位置
in vec3 aPosition;  //顶点位置
in vec3 aNormal;    //顶点法向量
in vec2 aTexCoor;    //顶点纹理坐标
//用于传递给片元着色器的变量
out vec4 finalLight;
out vec4 ambient;
out vec4 diffuse;
out vec4 specular;
out vec2 vTextureCoord;
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
  \t\t  vec3 normalTarget=aPosition+normal;\t//计算变换后的法向量
  \t\t  vec3 newNormal=(uMMatrix*vec4(normalTarget,1)).xyz-(uMMatrix*vec4(aPosition,1)).xyz;
  \t\t  newNormal=normalize(newNormal); \t//对法向量规格化
  \t\t  //计算从表面点到摄像机的向量
  \t\t  vec3 eye= normalize(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);
  \t\t  //计算从表面点到光源位置的向量vp
  \t\t  vec3 vp= normalize(lightLocation-(uMMatrix*vec4(aPosition,1)).xyz);
  \t\t  vp=normalize(vp);//格式化vp
  \t\t  vec3 halfVector=normalize(vp+eye);\t//求视线与光线的半向量
  \t\t  float shininess=5.0;\t\t\t\t//粗糙度，越小越光滑
  \t\t  float nDotViewPosition=max(0.0,dot(newNormal,vp)); \t//求法向量与vp的点积与0的最大值
  \t\t  diffuse=lightDiffuse*nDotViewPosition;\t\t\t\t//计算散射光的最终强度
  \t\t  float nDotViewHalfVector=dot(newNormal,halfVector);\t//法线与半向量的点积
  \t\t  float powerFactor=max(0.0,pow(nDotViewHalfVector,shininess)); \t//镜面反射光强度因子
  \t\t  specular=lightSpecular*powerFactor;    \t\t\t//计算镜面光的最终强度
}


void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置

   \t\t   vec4 ambientTemp, diffuseTemp, specularTemp;   //存放环境光、散射光、镜面反射光的临时变量
   \t\t   pointLight(normalize(aNormal),ambientTemp,diffuseTemp,specularTemp,uLightLocation,vec4(0.15,0.15,0.15,1.0),vec4(0.9,0.9,0.9,1.0),vec4(0.4,0.4,0.4,1.0));

   \t\t   ambient=ambientTemp;
   \t\t   diffuse=diffuseTemp;
   \t\t   specular=specularTemp;
   \t\t   vTextureCoord = aTexCoor;//将接收的纹理坐标传递给片元着色器
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
uniform sampler2D sTexture;//纹理内容数据
//接收从顶点着色器过来的参数
in vec4 ambient;
in vec4 diffuse;
in vec4 specular;
in vec2 vTextureCoord;
out vec4 fragColor;//输出到的片元颜色
void main()
{
 //将计算出的颜色给此片元
    vec4 finalColor=texture(sTexture, vTextureCoord);
    //给此片元颜色值
    fragColor = finalColor*ambient+finalColor*specular+finalColor*diffuse;

}`
            }];
            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
            //着色器加载完了加载绘制者
            loadObjFile("/obj/ch1.obj");
            //加载茶壶纹理图
            loadImageTexture(gl, "/texture/ghxp.png","ghxp");

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
            ms.scale(0.2,0.2,0.2);
            //绘制地球
            ooTri.drawSelf(ms,texMap["ghxp"]);
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
                <Script type="text/javascript" src="/js/FrameGlobalVar5.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil8.js"></Script>


                <Script type="text/javascript" src="/js/LoadObjUtil2.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject3.js"></Script>
                <Script type="text/javascript" src="/js/mouseListener.js"></Script>

                <Script type="text/javascript" src="/js/GlobalVar.js"></Script>
                <Script type="text/javascript" src="/js/loadBall3.js"></Script>
            </>
            <div>
            </div>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
