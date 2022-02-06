		    //��ʼ��WebGL Canvas
				function initWebGLCanvas(canvasName)
				{
				    var canvas = document.getElementById(canvasName);
				    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
					var context = null;
				    for (var ii = 0; ii < names.length; ++ii) 
				    {
					    try 
					    {
					      context = canvas.getContext(names[ii], null);				      
					    } 
					    catch(e) {}
					    if (context) 
					    {
					      break;
					    }
				    }			    
				    return context;
				}
	
				//���ص�����ɫ���ķ���			
				function loadSingleShader(ctx, shaderScript)
				{
				    if (shaderScript.type == "vertex")
				        var shaderType = ctx.VERTEX_SHADER;
				    else if (shaderScript.type == "fragment")
				        var shaderType = ctx.FRAGMENT_SHADER;
				    else {
				        log("*** Error: shader script of undefined type '"+shaderScript.type+"'");
				        return null;
				    }
				
				    // Create the shader object
				    var shader = ctx.createShader(shaderType);
				
				    // Load the shader source
				    ctx.shaderSource(shader, shaderScript.text);
				
				    // Compile the shader
				    ctx.compileShader(shader);
				
				    // Check the compile status
				    var compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
				    if (!compiled && !ctx.isContextLost()) {
				        // Something went wrong during compilation; get the error
				        var error = ctx.getShaderInfoLog(shader);
				        log("*** Error compiling shader '"+shaderId+"':"+error);
				        ctx.deleteShader(shader);
				        return null;
				    }			
				    return shader;
				}	
				
				//���ض�����ɫ����ƬԪ��ɫ�����׼�
				function loadShaderSerial(gl, vshader, fshader)
				{
						//���ض�����ɫ��
				    var vertexShader = loadSingleShader(gl, vshader);
				    //����ƬԪ��ɫ��
				    var fragmentShader = loadSingleShader(gl, fshader);
				
				    //������ɫ������
				    var program = gl.createProgram();
				
				    //��������ɫ����ƬԪ��ɫ���ҽӵ���ɫ������
				    gl.attachShader (program, vertexShader);
				    gl.attachShader (program, fragmentShader);
				
				
				    //������ɫ������
				    gl.linkProgram(program);
				
				    //��������Ƿ�ɹ�
				    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
				    if (!linked && !gl.isContextLost()) 
				    {
				        //��ȡ���ڿ���̨��ӡ������Ϣ
				        var error = gl.getProgramInfoLog (program);
				        log("Error in program linking:"+error);
				
				        gl.deleteProgram(program);
				        gl.deleteProgram(fragmentShader);
				        gl.deleteProgram(vertexShader);
				
				        return null;
				    }
				
				    gl.useProgram(program);				
				    gl.enable(gl.DEPTH_TEST);	
				    return program;
				}
				
				//��������ͼ�ķ���
				function loadImageTexture(gl,url,texName,isMipmap)
				{
				    var texture = gl.createTexture();
				    var image = new Image();
				    image.onload = function() { doLoadImageTexture(gl, image, texture,isMipmap) }					
				    image.src = url;
				    //texMap.set(texName,texture);
					texMap[texName]=texture;
				}
				
				function doLoadImageTexture(gl, image, texture,isMipmap)
				{
				    gl.bindTexture(gl.TEXTURE_2D, texture);
				    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
					if(isMipmap){
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
					}else{
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					}

				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
					if(isMipmap){
						gl.generateMipmap(gl.TEXTURE_2D);
					}
				    gl.bindTexture(gl.TEXTURE_2D, null);
				}
