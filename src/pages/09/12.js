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
   finalLight=ambientTemp+diffuseTemp+specularTemp;
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec4 finalLight;\t\t\t\t\t\t\t//从顶点着色器传递过来的环境光最终强度
out vec4 fragColor;//输出到的片元颜色
void main()
{
\tvec4 objectColor=vec4(0.95,0.95,0.95,1.0);//物体颜色
 \tfragColor=vec4(finalLight.xyz*objectColor.xyz,1.0);
}`
            }];
            let arrayEdge =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uuMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec3 aNormal;    //顶点法向量
void main(){
    vec3 tempPosition=aPosition;
    tempPosition.xyz+=aNormal*0.6;
    gl_Position = uuMVPMatrix*vec4(tempPosition.xyz,1); //根据总变换矩阵计算此次绘制此顶点位置
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;\t//设置浮点默认精度
out vec4 fragColor;//输出到的片元颜色
void main()
{
\tfragColor=vec4(0,1.0,0,0.0);//物体颜色

}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1],0);
            shaderProgArray[1] = loadShaderSerial(gl,arrayEdge[0], arrayEdge[1],1);

            loadObjFile("/obj/ch.obj",0,0);
            loadObjFile("/obj/qt.obj",1,0);
            loadObjFile("/obj/ch.obj",2,1);
            loadObjFile("/obj/qt.obj",3,1);


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
            if((!masss)||(!masss1)||(!masss2)||(!masss3))
            {return;}
            //设置视口
            gl.viewport(0, 0, canvas.current.width, canvas.current.height);
            //设置屏幕背景色RGBA
            gl.clearColor(0.0,0.0,0.0,1.0);
            //初始化变换矩阵
            ms.setInitStack();
            //设置摄像机
            ms.setCamera(0,50,50,0,0,0,0,1,0);
            //设置投影
            ms.setProjectFrustum(-1.5,1.5,-1,1,2,200);
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            ms.pushMatrix();
            ms.pushMatrix();
            ms.translate(15,0,-25);
            gl.enable(gl.CULL_FACE);								//开启剪裁
            gl.cullFace(gl.BACK);									//剪裁背面
            gl.frontFace(gl.CW);									//绘制顺序为顺时针
            masss2.drawSelf(ms);//绘制描边物体
            gl.frontFace(gl.CCW);									//绘制顺序为逆时针
            masss.drawSelf(ms);//绘制原物体
            ms.popMatrix();
            ms.pushMatrix();
            ms.translate(15,0,5);
            gl.enable(gl.CULL_FACE);								//开启剪裁
            gl.cullFace(gl.BACK);									//剪裁背面
            gl.frontFace(gl.CW);									//绘制顺序为顺时针
            masss2.drawSelf(ms);//绘制描边物体
            gl.frontFace(gl.CCW);									//绘制顺序为逆时针
            masss.drawSelf(ms);//绘制原物体
            ms.popMatrix();
            ms.pushMatrix();
            gl.enable(gl.DEPTH_TEST);//开启深度检
            //保护现场
            ms.translate(-15,0,8);
            masss3.drawSelf(ms);//绘制描边物体
            gl.disable(gl.DEPTH_TEST);//开启深度检
            masss1.drawSelf(ms);//绘制原物体
            ms.popMatrix();
            ms.pushMatrix();
            gl.enable(gl.DEPTH_TEST);//开启深度检
            //保护现场
            ms.translate(-15,3,-2);
            masss3.drawSelf(ms);//绘制描边物体
            gl.disable(gl.DEPTH_TEST);//开启深度检
            masss1.drawSelf(ms);//绘制原物体
            ms.popMatrix();
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
                <Script type="text/javascript" src="/js/GLUtil10.js"></Script>
                <Script type="text/javascript" src="/js/LoadObjUtil5.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject6.js"></Script>
                <Script type="text/javascript" src="/js/LightManager.js"></Script>
                <Script type="text/javascript" src="/js/loadObject1.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar9.js"></Script>
                <Script type="text/javascript" src="/js/mouseListener.js"></Script>
                <Script type="text/javascript" src="/js/GlobalVar.js"></Script>
            </>
            <canvas height={canvasHeight} width={canvasWidth} ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>

        </div>
    )
}
