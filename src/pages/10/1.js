import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const [canvasHeight,setCanvasHeight]=useState(0)
    const [canvasWidth,setCanvasWidth]=useState(0)

    const webgl=()=>{
        //GLES上下文
        window.gl=null;
        //变换矩阵管理类对象
        window.ms=new MatrixState();
        //要绘制的3D物体
        window.ooTri=null;
        //着色器程序列表，集中管理
        window.shaderProgArray=new Array();
        //光源位置管理器
        window.lightManager=new LightManager(40, 10, 20);
        //纹理管理器
        window.texMap= new Array();
        //绕y轴旋转角度
        var currentYAngle=0;
        //绕x轴旋转角度
        var currentXAngle=0;
        //旋转角度步长值
        var incAngle=0.5;
        //上次触控点X,Y坐标
        var lastClickX,lastClickY;
        var ismoved=false;//是否移动标志位

        //鼠标按下的监听
        document.onmousedown=function(event)
        {
            var x=event.clientX;
            var y=event.clientY;
            //如果鼠标在<canvas>内开始移动
            var rect= (event.target||event.srcElement).getBoundingClientRect();
            if(rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom)
            {
                ismoved=true;
                lastClickX=x;
                lastClickY=y;
            }
        };
        //鼠标抬起的监听
        document.onmouseup=function(event){ismoved=false;};
        //鼠标移动时的监听
        document.onmousemove = function(event)
        {
            var x=event.clientX,y=event.clientY;
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
            if (!gl)
            {
                alert("创建GLES上下文失败，不支持webGL2.0!");
                return;
            }

            //设置视口
            gl.viewport(0, 0, canvas.current.width, canvas.current.height);
            //设置屏幕背景色RGBA
            gl.clearColor(0.0,0.0,0.0,1.0);
            //初始化变换矩阵
            ms.setInitStack();
            //设置摄像机
            ms.setCamera(0,0,0,0,0,-1,0,1,0);
            //设置光源位置
            lightManager.setLightLocation(40, 10, 20);
            //设置投影参数
            ms.setProjectOrtho(-1.5,1.5,-1,1,1,300);//setProjectOrtho
            //gl.enable(gl.DEPTH_TEST);//开启深度检测
            //打开深度检测
            gl.enable(gl.DEPTH_TEST);
            //打开背面剪裁
            gl.enable(gl.CULL_FACE);


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
out vec2 vTextureCoord;
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

   finalLight=pointLight(normalize(aNormal),uLightLocation,vec4(0.15,0.15,0.15,1.0),vec4(0.9,0.9,0.9,1.0),vec4(0.4,0.4,0.4,1.0));

   vTextureCoord = aTexCoor;//将接收的纹理坐标传递给片元着色器
} `
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
uniform sampler2D sTexture;//纹理内容数据
//接收从顶点着色器过来的参数
in vec4 finalLight;
in vec2 vTextureCoord;
out vec4 fragColor;//输出到的片元颜色
void main()
{
 //将计算出的颜色给此片元
    vec4 finalColor=texture(sTexture, vTextureCoord);
    //给此片元颜色值
    fragColor = finalColor*finalLight;

}`
            }];


            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1],0);

            //着色器加载完了加载绘制者
            loadchObjFile("/obj/ch_t.obj");
            //加载茶壶纹理图
            loadImageTexture(gl, "/pic/ghxp.png","ghxp");


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
            if(!ooTri)
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            //设置屏幕背景色RGBA
            gl.clearColor(0.0,0.0,0.0,1.0);
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //设置投影参数
            ms.setProjectOrtho(-1.5,1.5,-1,1,1,300);
            //设置摄像机
            ms.setCamera(0,0,0,0,0,-1,0,1,0);
            //保护现场
            ms.pushMatrix();
            //执行平移
            ms.translate(0,-0.4,-25);
            ms.scale(0.025,0.025,0.025);
            //执行绕Y轴旋转
            ms.rotate(currentYAngle,0,1,0);
            //执行绕X轴旋转
            ms.rotate(currentXAngle,1,0,0);
            //绘制物体
            ooTri.drawSelf(ms,texMap["ghxp"]);

            //绘制副视角场景=============================================begin=========================
            //启用剪裁测试
            gl.enable(gl.SCISSOR_TEST);
            //设置剪裁区域
            gl.scissor(0,1080-300,350,300);
            //设置屏幕背景色RGBA
            gl.clearColor(0.7,0.7,0.7,1.0);
            //清除颜色缓存于深度缓存
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //调用此方法计算产生透视投影矩阵setProjectOrtho
            ms.setProjectOrtho(-0.17*1.5, 1.83*1.5, -1.7, 0.30, 2, 100);//-0.62f*ratio, 1.38f*ratio, -1.55f, 0.45f,
            //调用此方法产生摄像机9参数位置矩阵
            ms.setCamera(0, 60, -25,0, -0.4, -25,0,0.0,-1.0);
            ms.scale(0.25,0.25,0.25);
            //绘制物体
            ooTri.drawSelf(ms,texMap["ghxp"]);
            //禁用剪裁测试
            gl.disable(gl.SCISSOR_TEST);
            //绘制副视角场景=============================================end=========================

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
                <Script type="text/javascript" src="/js/GLUtil10.js"></Script>
                <Script type="text/javascript" src="/js/LoadObjUtil4.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject3.js"></Script>
                <Script type="text/javascript" src="/js/LightManager.js"></Script>
                <Script type="text/javascript" src="/js/loadch.js"></Script>
            </>
            <canvas height="1080" width="1920" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>

        </div>
    )
}
