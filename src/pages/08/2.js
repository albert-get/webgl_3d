import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const webgl=()=>{
        window.gl=null
        window.moon=null
        window.ball=null
        window.cloud=null
        window.ms=new MatrixState()
        window.shaderProgArray=new Array()
        window.earthTex=null
        window.earthTex1=null//黑夜纹理图
        //月球纹理图
        window.moonTex=null
        window.cloudTex=null
        window.currentAngle=0;//地球自转角度
        window.mPreviousY=0
        window.mPreviousX=0
        window.down=false

        window.TOUCH_SCALE_FACTOR=180.0/320;//旋转比例

        window.yAngle=0;//光源绕y轴旋转的角度
        window.xAngle=0;//摄像机绕X轴旋转的角度
        window.sunx=100;//光源的x坐标
        window.sunz=0;//光源的z坐标
        window.angle=3;

        document.onmousedown = function(event)
        {
            mPreviousX=event.pageX;//获取触控点x坐标
            mPreviousY=event.pageY;//获取触控点y坐标
            down=true;//按下鼠标
        }
        document.onmousemove = function(event)//鼠标移动
        {
            if(down)//已经按下鼠标
            {
                var moveX=event.pageX;//获取移动点x坐标
                var moveY=event.pageY;//获取移动点x坐标

                var dx = moveX- mPreviousX;//计算触控笔x位移
                yAngle += dx * TOUCH_SCALE_FACTOR;//设置光源绕y轴旋转的角度
                //触控横向位移，光源绕y轴旋转
                sunx=(Math.cos(0.017453*yAngle)*100);//计算光源的x坐标
                sunz=-(Math.sin(0.017453*yAngle)*100); //计算光源的z坐标


                var dy = moveY- mPreviousY;//计算触控笔y位移
                xAngle += dy * TOUCH_SCALE_FACTOR;	//设置摄像机绕x轴旋转的角度
                if(xAngle>90)
                {
                    xAngle=90;	//设置旋转的角度为90
                }
                else if(xAngle<-90)
                {
                    xAngle=-90;	//设置旋转的角度为-90
                }
                //触控纵向位移，摄像机绕x轴旋转 -90～+90
                var cy=(50*Math.sin(0.017453*xAngle));//计算摄像机的y坐标
                var cz=(50*Math.cos(0.017453*xAngle));//计算摄像机的z坐标
                var upy= Math.cos(0.017453*xAngle);
                var upz=- Math.sin(0.017453*xAngle);
                ms.setCamera(0, cy, cz, 0, 0, 0, 0, upy, upz); 	//设置摄像机位置
            }
            mPreviousX=event.pageX;	//记录此次触控点的x坐标
            mPreviousY=event.pageY;	//记录此次触控点的y坐标
        }
        document.onmouseup = function(event)
        {
            mPreviousX=event.pageX;//获取抬起点x坐标
            mPreviousY=event.pageY;//获取抬起点y坐标
            down=false;//抬起鼠标
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
            gl.clearColor(0.0,0.0,0.0,1.0);
            ms.setInitStack();
            //设置摄像机
            ms.setCamera(0,0,50,0,0,-1,0,1,0);
            ms.setProjectFrustum(-1.5,1.5,-1,1,3,200);
            gl.enable(gl.DEPTH_TEST);
            let array_earth =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uCamera;\t//摄像机位置
uniform vec3 uLightLocationSun;\t//太阳光源位置
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
in vec3 aNormal;    //法向量
out vec2 vTextureCoord;  //用于传递给片元着色器的变量
out vec4 vAmbient;
out vec4 vDiffuse;
out vec4 vSpecular;

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
  float shininess=10.0;\t\t\t\t//粗糙度，越小越光滑
  float nDotViewPosition=max(0.0,dot(newNormal,vp)); \t//求法向量与vp的点积与0的最大值
  diffuse=lightDiffuse*nDotViewPosition;\t\t\t\t//计算散射光的最终强度
  float nDotViewHalfVector=dot(newNormal,halfVector);\t//法线与半向量的点积
  float powerFactor=max(0.0,pow(nDotViewHalfVector,shininess)); \t//镜面反射光强度因子
  specular=lightSpecular*powerFactor;    \t\t\t//计算镜面光的最终强度
}

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置

   vec4 ambientTemp, diffuseTemp, specularTemp;   //存放环境光、散射光、镜面反射光的临时变量

   pointLight(normalize(aNormal),ambientTemp,diffuseTemp,specularTemp,uLightLocationSun,vec4(0.05,0.05,0.05,1.0),vec4(1.0,1.0,1.0,1.0),vec4(0.3,0.3,0.3,1.0));

   vAmbient=ambientTemp;
   vDiffuse=diffuseTemp;
   vSpecular=specularTemp;

   //将顶点的纹理坐标传给片元着色器
   vTextureCoord=aTexCoor;
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;\t//给出浮点默认精度
in vec2 vTextureCoord;//接收从顶点着色器过来的参数
in vec4 vAmbient;\t\t\t//接收从顶点着色器过来环境光最终强度
in vec4 vDiffuse;\t\t\t//接收从顶点着色器过来散射光最终强度
in vec4 vSpecular;\t\t\t//接收从顶点着色器过来镜面反射光最终强度

out vec4 fragColor;\t\t\t//传递到渲染管线的片元颜色
uniform sampler2D sTextureDay;\t//白天纹理的内容数据
uniform sampler2D sTextureNight;//黑夜纹理的内容数据

void main()
{  //地球着色器的main方法
\tvec4 finalColorDay;  \t\t//从白天纹理中采样出颜色值
\tvec4 finalColorNight;   \t//从夜晚纹理中采样出颜色值


  finalColorDay= texture(sTextureDay, vTextureCoord);//采样出白天纹理的颜色值
  finalColorDay = finalColorDay*vAmbient+finalColorDay*vSpecular+finalColorDay*vDiffuse;
  finalColorNight = texture(sTextureNight, vTextureCoord);  //采样出夜晚纹理的颜色值
  finalColorNight = finalColorNight*vec4(0.5,0.5,0.5,1.0);//计算出的该片元夜晚颜色值

  if(vDiffuse.x>0.21)
  {//当散射光分量大于0.21时
    fragColor=finalColorDay;   //采用白天纹理
  }
  else if(vDiffuse.x<0.05)
  {     //当散射光分量小于0.05时
     fragColor=finalColorNight;//采用夜间纹理
  }
  else
  {\t//当环境光分量大于0.05小于0.21时，为白天夜间纹理的过渡阶段
     float t=(vDiffuse.x-0.05)/0.16;//计算白天纹理应占纹理过渡阶段的百分比
     fragColor=t*finalColorDay+(1.0-t)*finalColorNight;//计算白天黑夜过渡阶段的颜色值
  }
}`
            }];
            let array_moon =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uCamera;\t//摄像机位置
uniform vec3 uLightLocationSun;\t//太阳光源位置
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
in vec3 aNormal;    //法向量
out vec2 vTextureCoord;  //用于传递给片元着色器的变量
out vec4 finalLight;        //用于传递给片元着色器的最终光照强度

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

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   finalLight = pointLight(normalize(aNormal),uLightLocationSun,
   vec4(0.05,0.05,0.025,1.0),vec4(1.0,1.0,0.5,1.0),vec4(0.3,0.3,0.15,1.0));

   //将顶点的纹理坐标传给片元着色器
   vTextureCoord=aTexCoor;
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec2 vTextureCoord;//接收从顶点着色器过来的参数
in vec4 finalLight;//接受顶点着色器传过来的最终光照强度
uniform sampler2D sTexture;//纹理内容数据
out vec4 fragColor;//输出到的片元颜色
void main()
{
  //给此片元从纹理中采样出颜色值
  vec4 finalColor = texture(sTexture, vTextureCoord);
  //给此片元颜色值
  fragColor = finalColor*finalLight;
}`
            }];
            let array_cloud =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
uniform vec3 uCamera;\t//摄像机位置
uniform vec3 uLightLocationSun;\t//太阳光源位置
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
in vec3 aNormal;    //法向量
out vec2 vTextureCoord;  //用于传递给片元着色器的变量
out vec4 finalLight;        //用于传递给片元着色器的最终光照强度

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

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   finalLight = pointLight(normalize(aNormal),uLightLocationSun,
   vec4(0.05,0.05,0.05,1.0),vec4(1.0,1.0,1.0,1.0),vec4(0.3,0.3,0.3,1.0));

   //将顶点的纹理坐标传给片元着色器
   vTextureCoord=aTexCoor;
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec2 vTextureCoord;//接收从顶点着色器过来的参数
in vec4 finalLight;//接受顶点着色器传过来的最终光照强度
uniform sampler2D sTexture;//纹理内容数据
out vec4 fragColor;//输出到的片元颜色
void main()
{
  //给此片元从纹理中采样出颜色值
  vec4 finalColor = texture(sTexture, vTextureCoord);
  //根据颜色值计算透明度
  finalColor.a=(finalColor.r+finalColor.g+finalColor.b)/3.0;
  //计算光照因素
  finalColor=finalColor*finalLight;
  //给此片元颜色值
  fragColor = finalColor;
}`
            }];
            shaderProgArray[0] = loadShaderSerial(gl,array_earth[0], array_earth[1]);
            shaderProgArray[1] = loadShaderSerial(gl,array_moon[0], array_moon[1]);
            shaderProgArray[2] = loadShaderSerial(gl,array_cloud[0], array_cloud[1]);

            //初始化旋转角度
            currentAngle = 0;
            //加载地球纹理图
            earthTex=loadImageTexture(gl, "/pic/earth1.png");
            earthTex1=loadImageTexture(gl, "/pic/earthn.png");
            cloudTex=loadImageTexture(gl, "/pic/cloud.jpg");
            //加载月球纹理图
            moonTex=loadImageTexture(gl, "/pic/moon.png");

            ball=new Ball(gl,shaderProgArray[0],7);//创建三角形绘制对象
            moon=new Ball(gl,shaderProgArray[1],4);//创建三角形绘制对象
            cloud=new Ball(gl,shaderProgArray[2],7.005);
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
            if((!ball)||(!moon)||(!cloud)||(!shaderProgArray[2]))
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            ms.rotate(angle,0,1,0);
            //保护现场
            ms.pushMatrix();
            //绕Y轴旋转
            ms.rotate(currentAngle,0,1,0);
            //绘制地球
            ms.rotate(90,1,0,0);
            ball.drawSelf(ms,earthTex,earthTex1);
            //开启混合
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);//设置混合因子
            cloud.drawSelfcloud(ms,cloudTex);//绘制云层
            gl.disable(gl.BLEND);//关闭混合
            ms.popMatrix();
            ms.pushMatrix();
            //沿X轴推远
            ms.translate(15,0,0);
            //绕Y轴旋转
            ms.rotate(currentAngle,0,1,0);
            ms.rotate(90,1,0,0);
            moon.drawSelfMoon(ms,moonTex);
            //恢复现场
            ms.popMatrix();
            //修改旋转角度
            currentAngle=(currentAngle+2)%360;
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
                <Script type="text/javascript" src="/js/Ball7.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
