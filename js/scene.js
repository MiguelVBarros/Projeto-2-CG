'use strict';

// TODO mudar leftWall para ser negativoahahahahahhhahahahahahhahh
/*global THREE*/
var camera, camera1, camera2, cameraBall,camera_orto, camera_persp, scene, renderer;

var bBox, sceneWidth, sceneHeight;
const size = 20;
const aspect = 2;
const numberOfBalls = 10;

const radius = (size*Math.sqrt((1/(aspect**2)) + 1))/20
var wall;
var ballArray, vXArray, vZArray;

let time_stamp;

const topWall = size/(2*aspect);
const leftWall = size/2;

const ballNumber = 9;
/*executa quando fazemos resize da janela*/
function onResize() {
	'use strict';
	/*atualiza o renderer para o tamanho novo da janela*/
	renderer.setSize(window.innerWidth, window.innerHeight);

	let ratio = Math.min(window.innerWidth/ sceneWidth, window.innerHeight / sceneHeight);

	// ortogonal
	camera1.top = window.innerHeight / (ratio);
	camera1.right = window.innerWidth / (ratio);
	camera1.bottom = -camera.top;
	camera1.left = -camera.right;
	camera1.updateProjectionMatrix();

	// prespectiva
	camera2.aspect = window.innerWidth / window.innerHeight;
	camera2.updateProjectionMatrix();

	// cameraBall
	cameraBall.aspect = window.innerWidth / window.innerHeight;
	cameraBall.updateProjectionMatrix();
}


function Wall(x, y, z) {
	this.object = new THREE.Object3D();

	this.material = new THREE.MeshBasicMaterial( {color:0xd3d3d3, wireframe: false});
	this.object.position.set(x, y, z);
	this.horizontalSize = size;
	this.verticalSize = size/aspect;
	this.height = 0.1 * Math.sqrt((size**2) + ((size/aspect)**2))

	this.addHorizontalWall = function(x, y, z) {
		let geometry = new THREE.BoxGeometry(this.horizontalSize, this.height, 1);
		let mesh = new THREE.Mesh(geometry, this.material);
		mesh.position.set(x, y, z);
		this.object.add(mesh);
	};

		this.addVerticalWall = function(x, y, z) {
		let geometry = new THREE.BoxGeometry(1, this.height, this.verticalSize + 2);
		let mesh = new THREE.Mesh(geometry, this.material);
		mesh.position.set(x, y, z);
		this.object.add(mesh);
	};

	this.addBase = function(x, y, z) {
		let geometry = new THREE.BoxGeometry(this.horizontalSize, 1, this.verticalSize);
		let material = new THREE.MeshBasicMaterial({color:0xA0522D, wireframe: false});
		let mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(x, y, z);
		this.object.add(mesh);
	}

	this.addHorizontalWall(0, 0, (-1) * (this.verticalSize / 2) - 0.5	);
	this.addHorizontalWall(0, 0, (this.verticalSize / 2) + 0.5);
	this.addVerticalWall((this.horizontalSize / 2) + 0.5, 0, 0);
	this.addVerticalWall((-1) * (this.horizontalSize / 2) - 0.5, 0, 0);
	this.addBase(0, (-0.5) - (this.height / 2), 0)

	scene.add(this.object);

}


function incrementVelocity() {
	console.log("hello");
	let i;
	for (i = 0; i < 10; i++) {
		ballArray[i].v.x += 0.001;
		ballArray[i].v.z += 0.001;
	}
	window.setTimeout(incrementVelocity, 30000);
}

function Ball (x, y, z) {
	this.outerObj = new THREE.Object3D();

	this.object = new THREE.Object3D();
	this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true});
	this.outerObj.position.set(x, y, z);
	this.axis = new THREE.AxesHelper(2);

	this.v = {x:0, z:0}

	this.createBall = function (ball) {
		const geometry = new THREE.SphereGeometry(radius, 20, 20);
		const mesh = new THREE.Mesh(geometry, ball.material);
		mesh.position.set(0, 0, 0);
		ball.object.add(mesh);
		ball.object.add(ball.axis);
	}

	this.axisHandler = function () {
		if (this.axis.visible)
			this.axis.visible = false;
		else
			this.axis.visible = true;
	}


	this.rotateBall = function (x, z, angle) {
		const axis = new THREE.Vector3();
		axis.set( x, 0, z ).normalize();
		axis.cross( new THREE.Vector3(0,1,0) );
		this.object.rotateOnWorldAxis( axis, angle );
	}

	this.setBallPosition = function (x, y, z) {
		this.outerObj.position.x = x;
		this.outerObj.position.y = y;
		this.outerObj.position.z = z;
	}

	this.createBall(this, 0, 0, 0);
	//this.object.add(this.axis);
	this.outerObj.add(this.object)
	scene.add(this.outerObj);
}


function generateBallCenter(xmin, xmax, ymin, ymax) {
	xmin =xmin + radius;
	xmax = xmax - radius,
	ymin = ymin + radius;
	ymax = ymax - radius;
	let x = Math.random()*(xmax-xmin) + xmin;
	let y = Math.random()*(ymax-ymin) + ymin;
	return [x,y];
}

function generateBalls() {
	const left = - size / 2;
	const bot = - size / (2*aspect);
	const horizontal_quadrant = size / 5;
	const vertical_quadrant = size / (2 * aspect);

	let i, j;
	for (i = 0; i < numberOfBalls/2; i ++)
		for(j = 0; j < 2; j ++) {

			const xmin = left + i * horizontal_quadrant;
			const xmax = left + ((i + 1) * horizontal_quadrant);

			const ymin = bot + j * vertical_quadrant;
			const ymax = bot + ((j+1) * vertical_quadrant);

			const c = generateBallCenter(xmin, xmax, ymin, ymax);

			ballArray.push(new Ball(c[0], 0, c[1]));
		}
}


function onKeyDown(e) {
	'use strict';
	switch(e.keyCode) {
		case 49:
			camera = camera1;
			camera.lookAt(scene.position);
			onResize();
			break;

		case 50://2
			camera = camera2;
			camera2.lookAt(scene.position);
			onResize();
			break;

		case 51://3
			camera = cameraBall;
			camera.lookAt(ballArray[ballNumber].outerObj.position);
			onResize();
			break;

		case 69: //E
			let i = 0;
			do {
				ballArray[i].axisHandler()
			} while(numberOfBalls != ++i );
			break;
	}
}


function createCamera() {
	//camera inicia com vista de topo
	bBox = new THREE.Box3().setFromObject(scene);/*bounding box da cena*/

	//tamanho da cena
	sceneWidth = (bBox.max.x - bBox.min.x);
	sceneHeight = (bBox.max.z - bBox.min.z);

	//para manter a cena na camera sempre
	let ratio = Math.min(window.innerWidth/ sceneWidth, window.innerHeight / sceneHeight);

	//inicializa camera com near de 0.1 e far de 2000
	camera1 = new THREE.OrthographicCamera( 2000);

	//garante o ratio da janela e o mesmo da cena
	camera1.top = window.innerHeight / (ratio);
	camera1.right = window.innerWidth / (ratio);
	camera1.bottom = -camera1.top;
	camera1.left = -camera1.right;

	/*definir posicao da camera*/
	camera1.position.x = 0;
	camera1.position.y = 50;
	camera1.position.z = 0;

	/*apontar camera*/
	camera1.lookAt(scene.position);
	camera1.updateProjectionMatrix();

	camera2 = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera2.position.x = size / 2 + 2;
	camera2.position.z = size / (2* aspect) + 2;
	camera2.position.y = 0.1 * Math.sqrt((size**2) + ((size/aspect)**2)) + 3;

	camera2.lookAt(scene.position);
	camera2.updateProjectionMatrix();

	cameraBall = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
	cameraBall.position.set(-1.5*radius, 2.25*radius, -1.5*radius);
	ballArray[ballNumber].outerObj.add(cameraBall);
	camera = camera1;

}

function createScene() {
	scene = new THREE.Scene();
}

function generateVelocities() {
	let i;
	for (i = 0; i < numberOfBalls; i++) {

		let v_x = Math.random() * (0.005) - 0.005;
		let v_z = Math.random() * (0.005) - 0.0005;
		ballArray[i].v.x = v_x;
		ballArray[i].v.z = v_z;
	}
	window.setTimeout(incrementVelocity, 10000);
}

/* Vector Functions */
function calcnewV(v1, v2, c1, c2) {
	let c1_c2 = sub(c1,c2);
	let v1_v2 = sub(v1,v2);
	let factor = dot(v1_v2, c1_c2) / len(c1_c2);
	return sub(v1, mul(factor,c1_c2));}

function dot(vec1, vec2) {
	return vec1.x * vec2.x + vec1.z * vec2.z;}

function sub(vec1, vec2) {
	return {x: vec1.x - vec2.x, z: vec1.z - vec2.z};}

function len(vec1) {
	return vec1.x**2 + vec1.z**2;}

function mul(factor, v1) {
	return {x: factor * v1.x, z: factor*v1.z};}

function distance (v1, v2) {
	return ((v1.x - v2.x)**2) + ((v1.z - v2.z)**2)}
/* End of Vector Functions*/

function moveBalls(delta_t) {
	let i, j;
	let newPos = [];
	var myOldPos, myNewPos, otherPos, deltax, desiredDeltax, desiredTime, desiredDelta_z, realDelta_z, t, a;

	for (i = 0; i < numberOfBalls; i ++) {
		let vec = {x:0, z:0}
		vec.x = ballArray[i].outerObj.position.x + ballArray[i].v.x * delta_t;
		vec.z = ballArray[i].outerObj.position.z + ballArray[i].v.z * delta_t;
		newPos.push(vec);

		for (j = 0; j < i; j++) {
			if((distance(newPos[i], newPos[j]) < (2* radius)**2)) {
				//colidiu i e j: mudar posicao do i e velocidade dos 2
				myOldPos = {x: ballArray[i].outerObj.position.x, z:ballArray[i].outerObj.position.z};
				myNewPos = newPos[i];
				otherPos = newPos[j];

				deltax = Math.sqrt(distance(myNewPos, myOldPos));
				desiredDeltax =  Math.sqrt(distance(myOldPos, otherPos)) - (2 * radius);
				desiredTime = (desiredDeltax * delta_t) / deltax;

				newPos[i].x = myOldPos.x + ballArray[i].v.x * desiredTime;
				newPos[i].z = myOldPos.z + ballArray[i].v.z * desiredTime;

				a = calcnewV(ballArray[i].v, ballArray[j].v,newPos[i],otherPos);
				ballArray[j].v = calcnewV(ballArray[j].v, ballArray[i].v ,otherPos	,newPos[i]);
				ballArray[i].v = a;
			}
		}

		for(j = i+1;j < numberOfBalls; j++) {
			myNewPos = newPos[i];
			myOldPos = {x: ballArray[i].outerObj.position.x, z:ballArray[i].outerObj.position.z};
			otherPos = {x : ballArray[j].outerObj.position.x, z: ballArray[j].outerObj.position.z};

			if((distance(myNewPos, otherPos) < (2*radius)**2)) {
				//colidiu i e j: mudar posicao do i e velocidade dos 2
				deltax = Math.sqrt(distance(myNewPos, myOldPos));
				desiredDeltax =  Math.sqrt(distance(myOldPos, otherPos)) - (2 * radius)  ;
				desiredTime = (desiredDeltax * delta_t) / deltax;

				newPos[i].x = myOldPos.x + ballArray[i].v.x * desiredTime;
				newPos[i].z = myOldPos.z + ballArray[i].v.z * desiredTime;

				a = calcnewV(ballArray[i].v, ballArray[j].v,newPos[i],otherPos);
				ballArray[j].v = calcnewV(ballArray[j].v, ballArray[i].v ,otherPos	,newPos[i]);
				ballArray[i].v = a;
			}
		}
	}

	for (i = 0; i < numberOfBalls; i++) {
		myOldPos = {x: ballArray[i].outerObj.position.x, z:ballArray[i].outerObj.position.z};
		if ((topWall -  Math.abs(newPos[i].z)) < radius){
			ballArray[i].v.z = ballArray[i].v.z * (-1);

			if (newPos[i].z < 0) {
				desiredDelta_z = ballArray[i].outerObj.position.z + topWall - radius;
				realDelta_z = ballArray[i].outerObj.position.z - newPos[i].z - 2*radius;
				t = (delta_t * desiredDelta_z) / realDelta_z

				newPos[i].z = ballArray[i].outerObj.position.z + ballArray[i].v.z*t;
				newPos[i].x = ballArray[i].outerObj.position.x + ballArray[i].v.x*t;
			}

			else if (newPos[i].z > 0) {
				desiredDelta_z = topWall - ballArray[i].outerObj.position.z  - radius;
				realDelta_z = newPos[i].z - ballArray[i].outerObj.position.z  - 2*radius;
				t = (delta_t * desiredDelta_z) / realDelta_z

				newPos[i].z = ballArray[i].outerObj.position.z + ballArray[i].v.z*t;
				newPos[i].x = ballArray[i].outerObj.position.x + ballArray[i].v.x*t;
			}
		}

	 	if (( leftWall - Math.abs(newPos[i].x)) < radius) {
			ballArray[i].v.x = ballArray[i].v.x * (-1);

			if(newPos[i].x < 0) {
				desiredDelta_x =  ballArray[i].outerObj.position.x + leftWall - radius;
				realDelta_x = ballArray[i].outerObj.position.x - newPos[i].x  - 2*radius;
				t = (delta_t * desiredDelta_x) / realDelta_x;

				newPos[i].z = ballArray[i].outerObj.position.z + ballArray[i].v.z*t;
				newPos[i].x = ballArray[i].outerObj.position.x + ballArray[i].v.x*t;
			}

			else if (newPos[i].x > 0) {
				desiredDelta_x =  leftWall - ballArray[i].outerObj.position.x  - radius;
				realDelta_x = newPos[i].x - ballArray[i].outerObj.position.x - 2*radius;
				t = (delta_t * desiredDelta_x) / realDelta_x;

				newPos[i].z = ballArray[i].outerObj.position.z + ballArray[i].v.z*t;
				newPos[i].x = ballArray[i].outerObj.position.x + ballArray[i].v.x*t;
			}
	 	}
	}

	for(i = 0; i < numberOfBalls; i++) {
		delta_x = newPos[i].x - ballArray[i].outerObj.position.x;
		delta_z = newPos[i].z - ballArray[i].outerObj.position.z;

		ballArray[i].rotateBall(delta_x, delta_z, (Math.sqrt(delta_x*delta_x + delta_z*delta_z)/(-Math.PI)));
		ballArray[i].setBallPosition(newPos[i].x, 0, newPos[i].z);
	}
}

function init() {
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
	createScene();

	wall = new Wall(0,0,0);
	ballArray = [];
	time_stamp = Date.now();

	generateBalls();
	generateVelocities();

	createCamera();
	window.addEventListener("resize", onResize);
	window.addEventListener("keydown", onKeyDown);

	window.setTimeout(incrementVelocity, 10000);

}

function render() {
	renderer.render(scene, camera);
}

function animate() {
	let time = Date.now()
	let delta_t = time - time_stamp;
	time_stamp = time;
	moveBalls(delta_t);
	render();
	requestAnimationFrame(animate);
}
