import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)

    useEffect(()=>{
        window.onload=()=>{
            let gl;
            let ms=new MatrixState();
            let ball;
            let shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            let currentYAngle=0;
            let currentXAngle=0;
            let incAngle=0.5;
            let lastClickX,lastClickY;
            let ismoved=false;
            document.onmousedown=event=>{
                let x=event.clientX;
                let y=event.clientY;
                if(event.target.tagName=="CANVAS")
                {
                    ismoved=true;
                    lastClickX=x;
                    lastClickY=y;
                }
            };
            document.onmouseup=event=>{ismoved=false;};
            document.onmousemove = event=>{
                let x=event.clientX,y=event.clientY;
                if(ismoved)
                {
                    currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                    currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
                }
                lastClickX=x;
                lastClickY=y;
            };
            function start()
            {
                gl = canvas.current.getContext('webgl2', { antialias: true });
                window.gl= gl
                if (!gl)
                {
                    alert("创建GLES上下文失败，不支持webGL2.0!");
                    return;
                }
                canvas.current.addEventListener('touchstart', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    ismoved=true;
                });
                canvas.current.addEventListener('touchmove', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    if(ismoved)
                    {
                        var touch = event.touches[0]; //获取第一个触点
                        var X = Number(touch.pageX);//页面触点X坐标
                        var Y = Number(touch.pageY);//页面触点X坐标
                        currentYAngle=currentYAngle+(X-lastClickX)*incAngle;
                        currentXAngle=currentXAngle+(Y-lastClickY)*incAngle;
                    }
                    lastClickX=X;
                    lastClickY=Y;
                });
                canvas.current.addEventListener('touchend', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    ismoved=false;
                });
                gl.viewport(0, 0, canvas.current.width, canvas.current.height);
                gl.clearColor(0.0,0.0,0.0,1.0);
                ms.setInitStack();
                ms.setCamera(0,0,-2,0,0,0,0,1,0);
                ms.setProjectOrtho(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);
                lightManager.setLightLocation(0,0,-2);
                let array =[{
                    type:'vertex',
                    text:`#version 300 es
uniform mat4 uMVPMatrix; \t//总变换矩阵
uniform mat4 uMMatrix; \t\t//变换矩阵
uniform vec3 uLightLocation;\t//光源位置
uniform vec3 uCamera;\t\t//摄像机位置
in vec3 aPosition;  \t//顶点位置
in vec3 aNormal;   \t//法向量
out vec3 vPosition;\t\t//用于传递给片元着色器的顶点位置
out vec4 vSpecular;\t\t//用于传递给片元着色器的镜面光最终强度
vec4 pointLight(\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t//法向量
  in vec3 lightLocation,\t//光源位置
  in vec4 lightSpecular\t\t//镜面光强度
){
  vec4 finalSpecular;
  vec3 normalTarget=aPosition+normal; \t//计算变换后的法向量
  vec3 newNormal=(uMMatrix*vec4(normalTarget,1)).xyz-(uMMatrix*vec4(aPosition,1)).xyz;
  newNormal=normalize(newNormal);  \t//对法向量规格化
  //计算从表面点到摄像机的向量
  vec3 eye= normalize(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);
  //计算从表面点到光源位置的向量vp
  vec3 vp= normalize(lightLocation-(uMMatrix*vec4(aPosition,1)).xyz);
  vp=normalize(vp);//格式化vp
  vec3 halfVector=normalize(vp+eye);\t//求视线与光线的半向量
  float shininess=25.0;\t\t\t\t//粗糙度，越小越光滑
  float nDotViewHalfVector=dot(newNormal,halfVector);\t\t\t//法线与半向量的点积
  float powerFactor=max(0.0,pow(nDotViewHalfVector,shininess)); \t//镜面反射光强度因子
  finalSpecular = lightSpecular*powerFactor;
  return finalSpecular;//最终的镜面光强度
}
void main()  {
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点的位置
   vSpecular = pointLight(normalize(aNormal),uLightLocation, vec4(0.9,0.9,0.9,1.0));//计算定位光
   vPosition = aPosition; \t\t//将顶点的位置传给片元着色器
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
uniform float uR;
in vec3 vPosition;//接收从顶点着色器过来的顶点位置
in vec4 vSpecular;//接收从顶点着色器过来的镜面反射光最终强度
out vec4 fragColor;
void main()
{
   vec3 color;
   float n = 8.0;//一个坐标分量分的总份数
   float span = 2.0*uR/n;//每一份的长度
   //每一维在立方体内的行列数
   int i = int((vPosition.x + uR)/span);
   int j = int((vPosition.y + uR)/span);
   int k = int((vPosition.z + uR)/span);
   //计算当点应位于白色块还是黑色块中
   int whichColor = int(mod(float(i+j+k),2.0));
   if(whichColor == 1) {//奇数时为红色
   \t\tcolor = vec3(0.678,0.231,0.129);//红色
   }
   else {//偶数时为白色
   \t\tcolor = vec3(1.0,1.0,1.0);//白色
   }
   //最终颜色
   vec4 finalColor=vec4(color,1.0)*vSpecular;
   //根据散射光最终强度计算片元的最终颜色值
   fragColor=vec4(finalColor.xyz,1.0);
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                ball=new Ball(gl,shaderProgArray[0],0.5)
                setInterval(drawFrame,20);
            }
            function drawFrame()
            {
                if(!ball)
                {
                    console.log("加载未完成！");
                    return;
                }
                let lightOffset = 20;//获得当前拖拉条的值
                lightManager.setLightLocation(-lightOffset,0,-4);

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                ms.pushMatrix();
                ms.pushMatrix();
                ms.translate(-0.6,0,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                ball.drawSelf(ms);
                ms.popMatrix();
                ms.pushMatrix();
                ms.translate(0.6,0,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                ball.drawSelf(ms);
                ms.popMatrix();
                ms.popMatrix();
            }

            start();

        }
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState2.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil.js"></Script>
                <Script type="text/javascript" src="/js/Ball3.js"></Script>
                <Script type="text/javascript" src="/js/LightManager.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar.js"></Script>
            </>

            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}