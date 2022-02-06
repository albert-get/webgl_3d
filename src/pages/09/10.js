import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const [canvasHeight,setCanvasHeight]=useState(0)
    const [canvasWidth,setCanvasWidth]=useState(0)

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
            //设置摄像机
            ms.setCamera(0,0,50,0,0,-1,0,1,0);
            //设置光源位置
            ms.setProjectFrustum(-1.5,1.5,-1,1,3,200);
            // gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; \t\t//总变换矩阵
uniform mat4 uMMatrix; \t\t\t//变换矩阵
uniform vec3 uLightLocation;\t//光源位置
uniform vec3 uCamera;\t\t\t//摄像机位置
in vec3 aPosition;  \t\t\t//顶点位置
in vec3 aNormal;    \t\t\t//顶点法向量
out float vEdge;\t\t\t\t//描边系数
out vec2 vTextureCoord;\t\t\t//根据光照强度折算的纹理坐标

void pointLight(\t\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t\t//法向量
  out float diffuse,\t\t\t//散射光最终强度
  out float specular,\t\t\t//镜面光最终强度
  out float edge,\t\t\t\t//描边系数
  in vec3 lightLocation,\t\t//光源位置
  in float lightDiffuse,\t\t//散射光强度
  in float lightSpecular\t\t//镜面光强度
){
  vec3 normalTarget=aPosition+normal;\t//计算变换后的法向量
  vec3 newNormal=(uMMatrix*vec4(normalTarget,1)).xyz-(uMMatrix*vec4(aPosition,1)).xyz;
  newNormal=normalize(newNormal); \t//对法向量规格化
  //计算从表面点到摄像机的向量
  vec3 eye= normalize(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);
  //计算描边系数
  edge = max(0.0,dot(newNormal,eye));
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

void main(){
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   float diffuse;//散射光的最终强度
   float specular;//镜面光的最终强度
   //进行光照计算
   pointLight(normalize(aNormal),diffuse,specular,vEdge,uLightLocation,0.8,0.9);
   //将散射光的最终强度与镜面光的最终强度相加--光照强度
   float s=diffuse+specular;
   //相加后的值作为S纹理坐标
   vTextureCoord=vec2(s,0.5);
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;//给出默认的浮点精度
uniform sampler2D sTexture;//纹理内容数据
in float vEdge;//描边系数
in vec2 vTextureCoord;//纹理坐标
out vec4 fragColor;//输出到的片元颜色

void main()
{
   //从纹理中采样出颜色值
   vec4 finalColor=texture(sTexture, vTextureCoord);
   //描边的颜色
   const vec4 edgeColor=vec4(0.0);
   //计算此片元是否进行描边的因子
   float mbFactor=step(0.2,vEdge);//vEdge>0.2--return0
   //如果不为边缘像素用纹理采样颜色，如果为边缘像素用描边颜色
   fragColor=(1.0-mbFactor)*edgeColor+mbFactor*finalColor;
}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            loadObjFile("/obj/ball.obj");
            pic=loadImageTexture(gl,"/pic/red8level.png");


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
            ms.scale(0.1,0.1,0.1);
            //执行绕Y轴旋转
            ms.rotate(currentYAngle,0,1,0);
            //执行绕X轴旋转
            ms.rotate(currentXAngle,1,0,0);
            //绘制地球
            ooTri.drawSelf(ms,pic);
            //恢复现场
            ms.popMatrix();
        }

        start()
    }
    useEffect(()=>{
        if(window){
            setCanvasHeight(window.innerHeight)
            setCanvasWidth(window.outerWidth)
        }
        setTimeout(()=>{
            webgl()
        },1000)
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState3.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil14.js"></Script>
                <Script type="text/javascript" src="/js/LoadObjUtil5.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject5.js"></Script>
                <Script type="text/javascript" src="/js/LightManager.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar8.js"></Script>
                <Script type="text/javascript" src="/js/mouseListener.js"></Script>
                <Script type="text/javascript" src="/js/GlobalVar.js"></Script>
                <Script type="text/javascript" src="/js/loadBall2.js"></Script>
            </>
            <canvas height={canvasHeight} width={canvasWidth} ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>

        </div>
    )
}
