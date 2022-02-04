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
        window.rey=0
        window.step=1
        window.earthTex=null
        // window.canvas
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
                console.log(mPreviousY);
                console.log(mPreviousX);
            }
            document.onmousemove = function(event)//鼠标移动
            {
            }
            document.onmouseup = function(event)
            {
                down=false;//抬起鼠标
            }
            if(down)
            {
                if(mPreviousX<canvas.width/3)
                {rex-=step;}
                else if(mPreviousX>canvas.width*2/3)
                {rex+=step;}
                else if(mPreviousY>canvas.height/2)
                {rey-=step;}
                else if(mPreviousY<canvas.height/2)
                {rey+=step;}
            }
        }
        function dianji1(){
            canvas.current.ontouchstart=function(e){
                down=true;
                e.preventDefault();
                var touch = e.touches[0];
                //获取当前触控点的坐标，等同于MouseEvent事件的clientX/clientY
                mPreviousX=touch.clientX;//获取触控点x坐标
                mPreviousY=touch.clientY;//获取触控点y坐标
            };
            canvas.current.ontouchmove = function(e){
                e.preventDefault();
            };
            canvas.current.ontouchend = function(e){
                down=false;
            };
            if(down)
            {
                if(mPreviousX<canvas.width/3)
                {rex-=step/100;}
                else if(mPreviousX>canvas.width*2/3)
                {rex+=step/100;}
                else if(mPreviousY>canvas.height/2)
                {rey-=step/100;}
                else if(mPreviousY<canvas.height/2)
                {rey+=step/100;}
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
            gl.clearColor(0.3,0.3,0.3,1.0);
            ms.setInitStack();
            ms.setProjectFrustum(-1.5,1.5,-1,1,2,100);
            gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uLightLocation;\t//光源位置
uniform vec3 uCamera;\t//摄像机位置
in vec3 aPosition;  //顶点位置
in vec3 aNormal;    //顶点法向量
out vec4 finalLight;//用于传递给片元着色器的最终光照强度

//定位光光照计算的方法
vec4 pointLight(\t\t\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t\t//法向量
  in vec3 lightLocation,\t\t\t//光源位置
  in vec4 lightAmbient,\t\t\t//环境光强度
  in vec4 lightDiffuse,\t\t\t//散射光强度
  in vec4 lightSpecular\t\t\t//镜面光强度
){
  vec4 ambient;\t\t\t//环境光最终强度
  vec4 diffuse;\t\t\t\t//散射光最终强度
  vec4 specular;\t\t\t//镜面光最终强度
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
  return ambient+diffuse+specular;
}

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   finalLight=pointLight(normalize(aNormal),uLightLocation,vec4(0.4,0.4,0.4,1.0),
   vec4(0.7,0.7,0.7,1.0),vec4(0.3,0.3,0.3,1.0));
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec4 finalLight;//接受从顶点着色器传来的最终光强度
out vec4 fragColor;//输出到的片元颜色
void main()
{//绘制球本身，纹理从球纹理采样
\tvec4 finalColor=vec4(1.0,1.0,1.0,1.0);//物体颜色
\tfragColor= finalColor*finalLight;//给此片元颜色值
}`
            }];
            let array_tex =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
out vec2 vTextureCoord;  //用于传递给片元着色器的变量
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vTextureCoord = aTexCoor;//将接收的纹理坐标传递给片元着色器
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec2 vTextureCoord;//接收从顶点着色器过来的参数
uniform sampler2D sTexture;//纹理内容数据
out vec4 fragColor;//输出到的片元颜色
void main()
{
   //给此片元从纹理中采样出颜色值
   fragColor= texture(sTexture, vTextureCoord);
}`
            }];
            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
            shaderProgArray[1] = loadShaderSerial(gl,array_tex[0], array_tex[1]);

            earthTex=loadImageTexture(gl, "/pic/lgq.png");
            loadObjFile("/obj/ch3.obj",0,0);
            loadObjFile("/obj/pm.obj",1,0);
            loadObjFile("/obj/qt.obj",2,0);
            loadObjFile("/obj/cft.obj",3,0);
            loadObjFile("/obj/yh.obj",4,0);

            tex=new TextureRect(gl,shaderProgArray[1]);
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
            dianji();
            dianji1();
            if((!masss)||(!masss1)||(!masss2)||(!masss3)||(!masss4)||(!tex))
            {return;}
            //设置摄像机
            ms.setCamera(0,0,50,0,0,0,0,1,0);
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            ms.pushMatrix();
            ms.pushMatrix();
            ms.rotate(25, 1, 0, 0);
            masss1.drawSelf(ms);//平面
            //缩放物体
            ms.pushMatrix();
            ms.scale(1.5, 1.5, 1.5);
            //绘制长方体
            ms.pushMatrix();
            ms.translate(-10, 0, 0);
            masss2.drawSelf(ms);
            ms.popMatrix();
            //绘制球体
            ms.pushMatrix();
            ms.translate(10, 0, 0);
            ms.rotate(30,0,1,0);
            masss3.drawSelf(ms);
            ms.popMatrix();
            //绘制圆环
            ms.pushMatrix();
            ms.translate(0, 0, -10);
            masss4.drawSelf(ms);
            ms.popMatrix();
            //绘制茶壶
            ms.pushMatrix();
            ms.translate(0, 0, 10);
            masss.drawSelf(ms);
            ms.popMatrix();
            ms.popMatrix();
            ms.popMatrix();
            ms.popMatrix();
            gl.enable(gl.BLEND);//开启混合
            gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);//设置混合因子
            ms.pushMatrix();//保护现场
            ms.translate(rex, rey, 25);//移动滤光镜
            ms.scale(3.0, 3.0, 3.0);//进行缩放
            tex.drawSelf(ms,earthTex);//绘制滤光镜
            ms.popMatrix();//恢复现场
            gl.disable(gl.BLEND);//关闭混合
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
