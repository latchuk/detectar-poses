let poseNet, img;

async function retornarEsqueletosAsync(imagemBase64, desenhar) {

    if (!poseNetHorizontal) {
        poseNetHorizontal = await carregarPoseNet();
    }

    if (img) {
        delete img;
    }

    img = await carregarImagem(imagemBase64);

    var poses = await retornarPoses(poseNetHorizontal, img);

    if (desenhar) {
        desenhar(img, poses)
    }

    return poses;

}

function carregarPoseNet() {

    return new Promise((resolve, reject) => {

        try {

            let options = {

                // A number between 0.2 and 1. Defaults to 0.50. What to scale the image by before feeding it through the network. 
                // Set this number lower to scale down the image and increase the speed when feeding through the network at the cost of accuracy.
                imageScaleFactor: 1,

                // Must be 32, 16, or 8. Defaults to 16. Internally, this parameter affects the height and width of the layers in the neural network. 
                // At a high level, it affects the accuracy and speed of the pose estimation. 
                // The lower the value of the output stride the higher the accuracy but slower the speed, the higher the value the faster the speed but lower the accuracy.
                outputStride: 16,

                // Defaults to false. If the poses should be flipped/mirrored horizontally.
                flipHorizontal: false,


                // maxPoseDetections: 100,
                // minConfidence: 0.2,
                // scoreThreshold: 0.4,
                minConfidence: 0.1,
                scoreThreshold: 0.1,

                // Non-maximum suppression part distance. It needs to be strictly positive. Two parts suppress each other if they are less than nmsRadius pixels away. Defaults to 20.
                // nmsRadius: 40,
                nmsRadius: 20,

                // The type of detection. 'single' or 'multiple'
                detectionType: 'multiple',

            }

            const poseNet = ml5.poseNet(() => {

                resolve(poseNet);

            }, options);

        } catch (error) {
            reject(error);
        }

    });

}

function carregarImagem(imagemBase64) {

    return new Promise((resolve, reject) => {

        try {

            img = new Image();
            img.src = imagemBase64;

            img.onload = () => {
                resolve(img);
            };

        } catch (error) {
            reject(error);
        }

    });

}

function retornarPoses(poseNet, img) {

    return new Promise((resolve, reject) => {

        try {

            poseNet.on('pose', results => {
                resolve(results);
            });

            poseNet.multiPose(img);

        } catch (error) {
            reject(error);
        }

    });

}

function desenhar(img, poses) {

    var canvas = document.getElementById('canvas');
    var canvasContext = canvas.getContext("2d");

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = img.width;
    canvas.height = img.height;

    canvasContext.drawImage(img, 0, 0);

    desenharPoses(poses, canvasContext);

    desenharPontos(poses, canvasContext);

}

function desenharPoses(poses, canvasContext) {

    for (let i = 0; i < poses.length; i++) {

        let esqueleto = poses[i].skeleton;

        for (let j = 0; j < esqueleto.length; j++) {

            let parteA = esqueleto[j][0];
            let parteB = esqueleto[j][1];

            canvasContext.beginPath();
            canvasContext.strokeStyle = retornarCorLinhaEsqueleto(parteA.part, parteB.part);
            canvasContext.lineWidth = 22;

            canvasContext.moveTo(parteA.position.x, parteA.position.y);
            canvasContext.lineTo(parteB.position.x, parteB.position.y);

            canvasContext.stroke();

        }
    }

}

function retornarCorLinhaEsqueleto(parteA, parteB) {

    // Braço esquerdo 
    if (parteA === 'leftElbow' && parteB === 'leftShoulder') {
        return '#FF0000';
    }

    // Antebraço esquerdo 
    if (parteA === 'leftElbow' && parteB === 'leftWrist') {
        return '#FF0000';
    }


    // Braço direito 
    if (parteA === 'rightElbow' && parteB === 'rightShoulder') {
        return '#007FFF';
    }

    // Antebraço direito 
    if (parteA === 'rightElbow' && parteB === 'rightWrist') {
        return '#007FFF';
    }


    // Liga o ombro esquerdo com o quadril esquerdo
    if (parteA === 'leftHip' && parteB === 'leftShoulder') {
        return '#FF7F00';
    }

    // Liga o ombro direito com o quadril direito
    if (parteA === 'rightHip' && parteB === 'rightShoulder') {
        return '#FF7F00';
    }

    // Quadril
    if (parteA === 'leftHip' && parteB === 'rightHip') {
        return '#FF7F00';
    }

    // Clavicula
    if (parteA === 'leftShoulder' && parteB === 'rightShoulder') {
        return '#FF7F00';
    }


    // Coxa direita 
    if (parteA === 'rightHip' && parteB === 'rightKnee') {
        return '#00FF00';
    }

    // Perna direita 
    if (parteA === 'rightKnee' && parteB === 'rightAnkle') {
        return '#00FF00';
    }


    // Coxa esquerda 
    if (parteA === 'leftHip' && parteB === 'leftKnee') {
        return '#FF00FF';
    }

    // Perna esquerda 
    if (parteA === 'leftKnee' && parteB === 'leftAnkle') {
        return '#FF00FF';
    }

    return '#000000';

}

function desenharPontos(poses, canvasContext) {

    for (let i = 0; i < poses.length; i++) {

        let pose = poses[i].pose;

        for (let j = 0; j < pose.keypoints.length; j++) {

            let keypoint = pose.keypoints[j];


            canvasContext.beginPath();
            canvasContext.arc(keypoint.position.x, keypoint.position.y, 16, 0, 2 * Math.PI, false);
            canvasContext.fillStyle = '#000000';
            canvasContext.fill();
            canvasContext.lineWidth = 6;
            canvasContext.strokeStyle = '#FFFFFF';
            canvasContext.stroke();

        }
    }

}
