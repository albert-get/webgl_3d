import {useEffect, useRef} from "react";

export default function Index () {
    const canvas = useRef(null)
    useEffect(()=>{
        const theCanvas=canvas.current
        const context =theCanvas.getContext("2d");

        //背景
        context.fillStyle="#ffffaa";
        context.fillRect(0,0,500,300);
        //文字
        context.fillStyle="#000000";
        context.font="20px Sans-Serif";
        context.textBaseline="top";
        context.fillText("Hello World!",195,80);
        //图像
        var helloWorldImage=new Image();
        helloWorldImage.onload=function(){
            context.drawImage(helloWorldImage,155,110);
        }
        helloWorldImage.src="/pic/H51.jpg";
        //边框
        context.strokeStyle="#000000";
        context.strokeRect(5,5,490,290);
    })
    return (
        <div>
            <canvas ref={canvas} id="canvasOne" width="500" height="300">若看到这个文字，说明浏览器不支持WebGL!</canvas>
        </div>
    )
}