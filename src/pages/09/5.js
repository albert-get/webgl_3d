import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const canvas1 = useRef(null)

    const webgl=()=>{
        var mon;							//绘制对象
        var xOffset=0;						//x方向移动步长值
        var yOffset=0;						//y方向移动步长值
        var incAngle=0.5;					//旋转角度步长值
        var currentYAngle=0; 				//绕y轴旋转角度
        var currentXAngle=0;  				//绕x轴旋转角度
        var lastClickX=0,lastClickY=0;		//上次触控点X,Y坐标
        var ismoved=false;					//是否移动标志位
        var down=false;						//是否点击标志位
        window.sunx=3000;						//光源x坐标
        window.sunz=0;							//光源y坐标
        window.sunRadius=2500;					//光源旋转半径
        window.sunAngle=Math.PI/2;
        document.onmousedown = function(event) {
            event.preventDefault();// 阻止浏览器默认事件，重要
            //如果鼠标在<canvas>内开始移动
            if(event.target.tagName=="CANVAS")
            {
                lastClickX=event.clientX;
                lastClickY=event.clientY;
                ismoved=true;
                down=true;
            }
        }
        document.onmousemove = function(event) {//鼠标移动
            event.preventDefault();// 阻止浏览器默认事件，重要
            var x=event.clientX,y=event.clientY;
            if(ismoved)
            {
                down=false;
                currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
                if(currentXAngle>90) {	currentXAngle=90; }		//设置旋转的角度为90
                else if(currentXAngle<-0) {currentXAngle=-0;}	//设置旋转的角度为-90
            }
            lastClickX=x;
            lastClickY=y;
        }
        document.onmouseup = function(event){
            ismoved=false;//抬起鼠标
            if(down) {
                if(lastClickX<400) { xOffset+=4;}
                else if(lastClickX>400&&lastClickX<800&&lastClickY<400) { yOffset+=4; }
                else if(lastClickX>400&&lastClickX<800&&lastClickY>400) { yOffset-=4;}
                else if(lastClickX>800) { xOffset-=4;}
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
            gl.clearColor(1.0,1.0,1.0,1.0);
            ms.setInitStack();
            ms.setCamera(0,150,220,0,90,0,0,1,0);
            ms.setProjectFrustum(-1.5,1.5,-1,1,1,1000);
            gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; \t\t//总变换矩阵
uniform mat4 uMMatrix;          //变换矩阵
uniform vec3 uCamera;\t        //摄像机位置
uniform vec3 uLightLocationSun;\t//太阳光源位置
in vec3 aPosition;  \t\t    //顶点位置
in vec2 aTexCoor;    \t\t    //顶点纹理坐标
in vec3 aNormal;                //法向量
out vec2 vTextureCoord;  \t\t//用于传递给片元着色器的纹理坐标
out vec4 finalLight;            //用于传递给片元着色器的最终光照强度
vec4 pointLight(\t\t\t\t//定位光光照计算的方法
  in vec3 normal,\t\t\t\t//法向量
   in vec3 lightLocation,\t\t//光源位置
  in vec4 lightAmbient,\t\t\t//环境光强度
  in vec4 lightDiffuse,\t\t\t//散射光强度
  in vec4 lightSpecular\t\t\t//镜面光强度
){
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    ambient=lightAmbient;\t\t\t        //直接得出环境光的最终强度
    vec3 normalTarget=aPosition+normal;\t    //计算变换后的法向量
    vec3 newNormal=(uMMatrix*vec4(normalTarget,1)).xyz-(uMMatrix*vec4(aPosition,1)).xyz;
    newNormal=normalize(newNormal); \t    //对法向量规格化
    //计算从表面点到摄像机的向量
    vec3 eye= normalize(uCamera-(uMMatrix*vec4(aPosition,1)).xyz);
    //计算从表面点到光源位置的向量vp
    vec3 vp= normalize(lightLocation-(uMMatrix*vec4(aPosition,1)).xyz);
    vp=normalize(vp);                   //格式化vp
    vec3 halfVector=normalize(vp+eye);\t//求视线与光线的半向量
    float shininess=5.0;\t\t\t\t//粗糙度，越小越光滑
    float nDotViewPosition=max(0.0,dot(newNormal,vp)); \t            //求法向量与vp的点积与0的最大值
    diffuse=lightDiffuse*nDotViewPosition;\t\t\t\t            //计算散射光的最终强度
    float nDotViewHalfVector=dot(newNormal,halfVector);\t            //法线与半向量的点积
    float powerFactor=max(0.0,pow(nDotViewHalfVector,shininess)); \t//镜面反射光强度因子
    specular=lightSpecular*powerFactor;                             //计算镜面光的最终强度
    return ambient+diffuse+specular;
}
void main(){
   gl_Position = uMVPMatrix * vec4(aPosition,1); \t//根据总变换矩阵计算此次绘制此顶点的位置
   //执行定位光照计算
   finalLight=pointLight(normalize(aNormal),uLightLocationSun,
      vec4(0.15,0.15,0.15,1.0),vec4(0.7,0.7,0.7,1.0),vec4(0.3,0.3,0.3,1.0));
   vTextureCoord = aTexCoor;\t\t\t\t\t//将接收的纹理坐标传递给片元着色器
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision highp float;\t\t\t\t    //给出默认的浮点精度
uniform sampler2D texC;\t\t\t\t\t//纹理采样器（基础颜色纹理）
uniform sampler2D texD;\t\t\t\t\t//纹理内容数据（过程纹理）
uniform sampler2D texD1;                //纹理采样器(细节纹理1)
uniform sampler2D texD2;                //纹理采样器(细节纹理2)
uniform sampler2D texD3;                //纹理采样器(细节纹理3)
uniform sampler2D texD4;                //纹理采样器(细节纹理4)
in vec2 vTextureCoord; \t\t\t\t\t//接收从顶点着色器过来的纹理坐标
out vec4 outColor;                      //输出到的片元颜色
in vec4 finalLight;                     //接收顶点着色器传过来的最终光照强度
void main(){
  float dtScale1=27.36;                 //细节纹理1 的缩放系数
  float dtScale2=20.00;                 //细节纹理2 的缩放系数
  float dtScale3=32.34;                 //细节纹理3 的缩放系数
  float dtScale4=22.39;                 //细节纹理4 的缩放系数
  float ctSize=257.00;                  //地形灰度图的尺寸（以像素为单位）
  float factor1=ctSize/dtScale1;        //细节纹理1 的纹理坐标缩放系数
  float factor2=ctSize/dtScale2;        //细节纹理2 的纹理坐标缩放系数
  float factor3=ctSize/dtScale3;        //细节纹理3 的纹理坐标缩放系数
  float factor4=ctSize/dtScale4;        //细节纹理4 的纹理坐标缩放系数
  vec4 cT = texture(texC,vTextureCoord);            //从基础颜色纹理中采样
  vec4 dT = texture(texD,vTextureCoord);            //从过程纹理中采样
  vec4 dT1 = texture(texD1,vTextureCoord*factor1);  //从细节纹理1 中采样
  vec4 dT2 = texture(texD2,vTextureCoord*factor2);  //从细节纹理2 中采样
  vec4 dT3 = texture(texD3,vTextureCoord*factor3);  //从细节纹理3 中采样
  vec4 dT4 = texture(texD4,vTextureCoord*factor4);  //从细节纹理4 中采样
  outColor = dT1*dT.r+dT2*dT.g+dT3*dT.b+dT4*dT.a;   //叠加细节纹理的颜色值
  outColor = outColor + cT;                         //叠加基础颜色值
  outColor = outColor - 0.5;                        //调整整体颜色
  outColor=finalLight*outColor;
}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            mon=new Momnet(gl,shaderProgArray[0])
            //加载基础颜色纹理
            loadImageTexture(gl, "/pic/default_c.png",0);
            //加载过程纹理
            loadImageTexture(gl, "/pic/default_d.png",1);
            //加载灰色岩石纹理
            loadImageTexture(gl, "/pic/grayRock.png",2);
            //加载硬泥土纹理
            loadImageTexture(gl, "/pic/hardDirt.png",3);
            //加载大岩石表面纹理
            loadImageTexture(gl, "/pic/bigRockFace.png",4);
            //加载绿草皮纹理
            loadImageTexture(gl, "/pic/shortGrass.png",5);
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
            if(!mon){
                console.log("加载未完成！");//提示信息
                return;}
            //改变光源位置
            sunz=sunRadius*Math.sin(sunAngle);
            sunx=sunRadius*Math.cos(sunAngle);
            sunAngle+=0.005;
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            ms.translate(xOffset,0,yOffset)
            ms.rotate(currentXAngle,1,0,0);
            ms.rotate(currentYAngle,0,1,0);
            //绘制物体
            mon.drawSelf(ms,texMap);
            //恢复现场
            ms.popMatrix();
        }

        let canvas2d=()=>{
            var LAND_HIGHEST=198
            var LAND_HIGH_ADJUST=5
            window.result = new Array();
            var result1 = new Array();
            var j=0;
            var k=0;
            var ctx1 = canvas1.current.getContext('2d');
            var image = new Image();
            image.src = "/pic/default.png"
            window.colsPlusOne=null;
            window.rowsPlusOne=null;
            image.onload=function(){
                colsPlusOne=image.width;
                rowsPlusOne=image.height;
                ctx1.drawImage(image,0,0,colsPlusOne,rowsPlusOne);
                getgray();
                for(var i=0;i<rowsPlusOne;i++) {
                    result[i] = new Array();
                    for(var j=0;j<colsPlusOne;j++) {
                        result[i][j]=result1[k++];
                    }
                }
                normals=caleNormalVector(result);
                start();
                ctx1.clearRect(0,0,colsPlusOne,rowsPlusOne);
                return result;
            }
            function getgray(){
                var imageData = ctx1.getImageData(0,0,colsPlusOne,rowsPlusOne);
                for(var i=0;i<imageData.data.length;i+=4){
                    var r=imageData.data[i];
                    var g=imageData.data[i+1];
                    var b=imageData.data[i+2];
                    imageData.data[i+3]=255;
                    var h=(r+g+b)/3;
                    result1[j]=(h/255)*LAND_HIGHEST+LAND_HIGH_ADJUST;
                    j++;
                }
            }
        }
        canvas2d()
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
                <Script type="text/javascript" src="/js/GLUtil12.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar7.js"></Script>
                <Script type="text/javascript" src="/js/Momnet2.js"></Script>
                <Script type="text/javascript" src="/js/NorMal.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
            <canvas ref={canvas1} width="600" height="600">
                您的浏览器不支持canvas标签
            </canvas>
        </div>
    )
}
