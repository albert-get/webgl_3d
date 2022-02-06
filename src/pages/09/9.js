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
        var ms=new MatrixState();
        //要绘制的3D物体
        // var rectdb,ball,mirrorball;
        window.rectdb=null;
        window.ball=null;
        window.mirrorball=null;
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
        var timeLive=0,TIME_SPAN=0.05,G=3;//周期存活时间与单位时间间隔、重力加速度
        var startY=30.0,vy=0,currentY=0;//球开始的Y坐标，初始速度，当前Y坐标
        //上次触控点X,Y坐标
        var lastClickX,lastClickY;
        var ismoved=false;//是否移动标志位

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
        document.onmouseup=function(event){
            ismoved=false;
        };
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

            gl.viewport(0, 0, canvas.current.width, canvas.current.height);
            gl.clearColor(0.0,0.0,0.0,1.0);
            ms.setInitStack();
            //设置摄像机
            ms.setCamera(0,10,12,0,0,0,0,1,0);
            //设置光源位置
            lightManager.setLightLocation(50, 100, 20);//40 10 20
            ms.setProjectFrustum(-1.5,1.5,-1,1,1,100);
            gl.enable(gl.DEPTH_TEST);
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
   \t\t   pointLight(normalize(aNormal),ambientTemp,diffuseTemp,specularTemp,uLightLocation,vec4(0.1,0.1,0.1,1.0),vec4(0.9,0.9,0.9,1.0),vec4(0.3,0.3,0.3,1.0));

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

            loadballObjFile("/obj/ballT.obj");
            loaddbObjFile("/obj/db.obj");

            //加载纹理图
            loadImageTexture(gl, "/pic/basketball.png","ball");
            loadImageTexture(gl, "/pic/basketball.png","mirrorball");
            loadImageTexture(gl, "/pic/mdb1.png","db");
            loadImageTexture(gl, "/pic/mdbtm1.png","tm");

            setTimeout(()=>{
                render()
            },100)

        }
        function render(){
            drawFrame()
            run()
            requestAnimationFrame(render)
        }
        function drawFrame()
        {
            if(!rectdb||!ball)
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //清除模板缓存
            gl.clear(gl.STENCIL_BUFFER_BIT);
            //关闭深度检测
            gl.disable(gl.DEPTH_TEST);

            ms.pushMatrix();
            ms.scale(0.3,0.3,0.3);
            //绘制反射面地板
            rectdb.drawSelf(ms,texMap["db"]);
            ms.popMatrix();

            //绘制镜像体
            drawmirror();
            //禁用模板测试
            gl.disable(gl.STENCIL_TEST);
            //开启混合
            gl.enable(gl.BLEND);
            //设置混合因子
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            ms.pushMatrix();
            ms.scale(0.3,0.3,0.3);
            //绘制半透明反射面地板
            rectdb.drawSelf(ms,texMap["tm"]);
            ms.popMatrix();
            //开启深度检测
            gl.enable(gl.DEPTH_TEST);
            //关闭混合
            gl.disable(gl.BLEND);

            //绘制实际物体
            drawball();
        }

        function run()
        {
            //此轮运动时间增加
            timeLive+=TIME_SPAN;
            //根据此轮起始Y坐标、此轮运动时间、此轮起始速度计算当前位置
            var tempCurrY=startY-0.5*G*timeLive*timeLive+vy*timeLive;
            if(tempCurrY<=0.0)
            {//若当前位置低于地面则碰到地面反弹
                //反弹后起始位置为0
                startY=0;
                //反弹后起始速度
                vy=-(vy-G*timeLive)*0.995;
                //反弹后此轮运动时间清0
                timeLive=0;
                //若速度小于阈值则停止运动
                if(vy<0.35)
                {
                    currentY=0;
                    //break;
                }
            }
            else
            {//若没有碰到地面则正常运动
                currentY=tempCurrY;
            }
        }
        function drawball()//绘制物体
        {
            ms.pushMatrix();
            ms.scale(0.3,0.3,0.3);
            ms.translate(0,0.8+currentY,0);
            ball.drawSelf(ms,texMap["ball"]);
            ms.popMatrix();
        }
        function drawmirror()//绘制镜像体
        {
            ms.pushMatrix();
            ms.scale(0.3,0.3,0.3);
            ms.translate(0,-0.8-currentY,0);
            ball.drawSelf(ms,texMap["ball"]);
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
                <Script type="text/javascript" src="/js/loadobj.js"></Script>
                <Script type="text/javascript" src="/js/TextureRect5.js"></Script>
                <Script type="text/javascript" src="/js/BallTextureByVertex.js"></Script>
            </>
            <canvas height={canvasHeight} width={canvasWidth} ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>

        </div>
    )
}
