function Triangle(								//�����������������������
	gl,						 					//GL������
	programIn									//��ɫ������id
){
    //��ʼ��������������
	this.vertexData= [3.0,0.0,0.0,
					  -3.0,0.0,0.0,
					  0.0,3.0,0.0];  
	this.vcount=this.vertexData.length/3;					//�õ���������
	this.vertexBuffer=gl.createBuffer();					//���������������ݻ���
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer); 		//�󶨶����������ݻ���
	//�����������������뻺��
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertexData),gl.STATIC_DRAW);
    //��ʼ��������������
	this.colorsData=[0,1,
					 1,1,
					 0.5,0];
	this.colorBuffer=gl.createBuffer();						//���������������껺��
	gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer); 		//�󶨶����������껺��
	//�����������������뻺��
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.colorsData),gl.STATIC_DRAW);
	this.program=programIn;									//��ʼ����ɫ������id
	
	this.drawSelf=function(ms,texture)						//��������ķ���
	{
        //ָ��ʹ��ĳ����ɫ������
		gl.useProgram(this.program);
		//ִ��ƽ��
		ms.translate(0,0,0);
	    //ִ����Y����ת
		ms.rotate(currentYAngle,0,1,0);
		//ִ����X����ת
		ms.rotate(currentXAngle,1,0,0);
		//��ȡ�ܱ任��������id
		var uMVPMatrixHandle=gl.getUniformLocation(this.program, "uMVPMatrix");
		//���ܱ任����������Ⱦ����
		gl.uniformMatrix4fv(uMVPMatrixHandle,false,new Float32Array(ms.getFinalMatrix()));
		
		gl.enableVertexAttribArray(gl.getAttribLocation(this.program, "aPosition"));//���ö���������������
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);	//�󶨶����������ݻ���
		//������ָ��������������
		gl.vertexAttribPointer(gl.getAttribLocation(this.program,"aPosition"),3,gl.FLOAT,false,0, 0);
		
		//���ö�������������������
		gl.enableVertexAttribArray(gl.getAttribLocation(this.program, "aTexCoor")); 
		//�󶨶��������������ݻ���
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		//������ָ������������������
		gl.vertexAttribPointer(gl.getAttribLocation(this.program, "aTexCoor"), 2, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);//����ʹ�õ�������-0
		gl.bindTexture(gl.TEXTURE_2D, texture);//������
		//��������
		gl.uniform1i(gl.getUniformLocation(this.program, "sTexture"), 0);//������������Ⱦ����  	
		gl.drawArrays(gl.TRIANGLES, 0, this.vcount);		//�ö��㷨��������
	}
}
