import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const webgl=()=>{
        window.gl=null
        window.tex=null
        window.masss=null
        window.masss1=null
        window.masss2=null
        window.masss3=null
        window.masss4=null
        window.rex=0
        window.TOUCH_SCALE_FACTOR = 180.0/2000;//角度缩放比例
        window.ms=new MatrixState()
        window.shaderProgArray=new Array()

        window.mPreviousY=0
        window.mPreviousX=0
        window.down=false
        function dianji()
        {
            document.onmousedown = function(event)
            {	down=true;//按下鼠标
                mPreviousX=event.pageX;//获取触控点x坐标
                mPreviousY=event.pageY;//获取触控点y坐标
            }
            document.onmousemove = function(event)//鼠标移动
            {
                if(down)
                {
                    var dx = event.pageX- mPreviousX;//计算触控笔X位移
                    rex += dx * TOUCH_SCALE_FACTOR;//设置沿x轴旋转角度
                    //将cx限制在一定范围内
                    rex = Math.max(rex, -200);
                    rex = Math.min(rex, 200);
                }
            }
            document.onmouseup = function(event)
            {
                down=false;//抬起鼠标
            }
        }


        function start()
        {
            gl = canvas.current.getContext('webgl2', { antialias: true });
            if (!gl)
            {
                alert("创建GLES上下文失败，不支持webGL2.0!");
                return;
            }

            gl.viewport(0, 0, canvas.current.width, canvas.current.height);
            gl.clearColor(0.3,0.3,0.3,1.00);
            ms.setInitStack();
            //设置摄像机
            ms.setProjectFrustum(-1.5,1.5,-1,1,2,1000);
            gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; \t\t\t\t\t\t\t\t//总变换矩阵
uniform mat4 uMMatrix; \t\t\t\t\t\t\t\t\t//变换矩阵
uniform vec3 uLightLocation;\t\t\t\t\t\t\t\t//光源位置
uniform vec3 uCamera;\t\t\t\t\t\t\t\t\t//摄像机位置
in vec3 aPosition;  \t\t\t\t\t\t\t\t//顶点位置
in vec3 aNormal;    \t\t\t\t\t\t\t\t//顶点法向量
out vec4 finalLight;        //用于传递给片元着色器的最终光照强度
out float vFogFactor; \t\t\t\t\t//用于传递给片元着色器的雾化因子

vec4 pointLight(\t\t\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t\t//法向量
  in vec3 lightLocation,\t\t\t//光源位置
  in vec4 lightAmbient,\t\t\t//环境光强度
  in vec4 lightDiffuse,\t\t\t//散射光强度
  in vec4 lightSpecular\t\t\t//镜面光强度
){
  vec4 ambient;                 //环境光强度
  vec4 diffuse;                 //散射光强度
  vec4 specular;                //镜面光强度
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
  specular=lightSpecular*powerFactor;//计算镜面光的最终强度
  return ambient+diffuse+specular;
}

//计算雾因子的方法
float computeFogFactor(){
   float tmpFactor;
   float fogDistance = length(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);//顶点到摄像机的距离
   const float end = 490.0;//雾结束位置
   const float start = 350.0;//雾开始位置
   tmpFactor = 1.0-smoothstep(start,end,fogDistance);//计算雾因子
   return tmpFactor;
}
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   finalLight = pointLight(normalize(aNormal),uLightLocation,
   vec4(0.4,0.4,0.4,1.0),vec4(0.7,0.7,0.7,1.0),vec4(0.3,0.3,0.3,1.0));
   //计算雾因子
   vFogFactor = computeFogFactor();
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec4 finalLight;//接受顶点着色器传过来的最终光照强度
in float vFogFactor;\t\t\t\t\t\t\t//从顶点着色器传递过来的雾化因子
out vec4 fragColor;//输出到的片元颜色
void main()
{
\tvec4 objectColor=vec4(0.95,0.95,0.95,1.0);//物体颜色
\tvec4 fogColor = vec4(0.97,0.76,0.03,1.0);//雾的颜色
 \tif(vFogFactor != 0.0){//如果雾因子为0，不必计算光照
\t\tobjectColor = objectColor*finalLight;//计算光照之后物体颜色
\t\tfragColor = objectColor*vFogFactor + fogColor*(1.0-vFogFactor);//物体颜色和雾颜色插值计算最终颜色
\t}else{
 \t    fragColor=fogColor;
 \t}
}`
            }];


            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            loadObjFile("/obj/ch3.obj",0,0);
            loadObjFile("/obj/pm.obj",1,0);
            loadObjFile("/obj/qt.obj",2,0);
            loadObjFile("/obj/cft.obj",3,0);
            loadObjFile("/obj/yh.obj",4,0);
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
            //设置摄像机
            ms.setCamera(rex,150,400,0,0,0,0,1,0);
            dianji();
            if((!masss)||(!masss1)||(!masss2)||(!masss3)||(!masss4))
            {
                return;
            }
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            ms.pushMatrix();
            //若加载的物体部位空则绘制物体
            ms.pushMatrix();
            ms.scale(5.0, 5.0, 5.0);
            masss1.drawSelf(ms);//平面
            ms.popMatrix();
            //缩放物体
            ms.pushMatrix();
            ms.scale(5.0, 5.0, 5.0);
            //绘制物体
            //绘制长方体
            ms.pushMatrix();
            ms.translate(-12, 0, 0);
            masss3.drawSelf(ms);
            ms.popMatrix();
            //绘制球体
            ms.pushMatrix();
            ms.translate(12, 0, 0);
            masss2.drawSelf(ms);
            ms.popMatrix();
            //绘制圆环
            ms.pushMatrix();
            ms.translate(0, 0, -12);
            masss4.drawSelf(ms);
            ms.popMatrix();
            //绘制茶壶
            ms.pushMatrix();
            ms.translate(0, 0, 12);
            masss.drawSelf(ms);
            ms.popMatrix();
            ms.popMatrix();

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
                <Script type="text/javascript" src="/js/GLUtil9.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject4.js"></Script>
                <Script type="text/javascript" src="/js/loadObject.js"></Script>
                <Script type="text/javascript" src="/js/LoadObjUtil3.js"></Script>
                <Script type="text/javascript" src="/js/TextureRect4.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
