let poseNetHorizontal, poseNetVertical, img;

async function retornarEsqueletosAsync(imagemBase64, escalaImagem, podeDesenhar, scoreMinimoDesenhar) {

    if (img) {
        delete img;
    }

    img = await carregarImagem(imagemBase64);


    let poseNet;

    if (img.width >= img.height) {
        poseNetHorizontal = await retornarPoseNetOrientacao(poseNetHorizontal, escalaImagem);
        poseNet = poseNetHorizontal;
    } else {
        poseNetVertical = await retornarPoseNetOrientacao(poseNetVertical, escalaImagem);
        poseNet = poseNetVertical;
    }

    // const tempo1 = new Date();

    var poses = await poseNet.estimateMultiplePoses(img, {
        flipHorizontal: false,
        maxDetections: 100,
        scoreThreshold: 0.1,
        nmsRadius: 40
    });

    // const tempo2 = new Date();
    // const diferenca = tempo2 - tempo1;

    // console.log("Tempo para detectar poses: " + diferenca);

    if (podeDesenhar) {
        desenhar(img, poses, scoreMinimoDesenhar)
    }

    console.log({ poses });

    return poses;

}

async function retornarPoseNetOrientacao(poseNetOrientacao, escalaImagem) {

    if (!poseNetOrientacao) {

        // const tempo1 = new Date();

        poseNetOrientacao = await posenet.load({
            architecture: 'ResNet50',
            outputStride: 16,
            quantBytes: 4,
            inputResolution: { width: img.width * escalaImagem, height: img.height * escalaImagem },
        });

        // const tempo2 = new Date();
        // const diferenca = tempo2 - tempo1;

        // console.log("Tempo para carregar o modelo: " + diferenca);

    }

    return poseNetOrientacao;

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

function desenhar(img, poses, scoreMinimo) {

    var canvas = document.getElementById('canvas');
    var canvasContext = canvas.getContext("2d");

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = img.width;
    canvas.height = img.height;

    canvasContext.drawImage(img, 0, 0);

    for (const pose of poses) {
        for (const keypoint of pose.keypoints) {
            pose[keypoint.part] = { score: keypoint.score, part: keypoint.part, x: keypoint.position.x, y: keypoint.position.y };
        }
    }

    desenharPoses(poses, canvasContext, scoreMinimo);

    desenharPontos(poses, canvasContext, scoreMinimo);

}

function desenharPoses(poses, canvasContext, scoreMinimo) {

    for (const pose of poses) {

        if (pose.score >= scoreMinimo) {

            const escalaDesenho = retornarEscalaDesenho(pose);
            const espessuraLinhaBase = 22;
            const espessuraLinha = espessuraLinhaBase * escalaDesenho;

            desenharPartePose(canvasContext, espessuraLinha, pose.leftElbow, pose.leftShoulder, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.leftElbow, pose.leftWrist, scoreMinimo);

            desenharPartePose(canvasContext, espessuraLinha, pose.rightElbow, pose.rightShoulder, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.rightElbow, pose.rightWrist, scoreMinimo);


            desenharPartePose(canvasContext, espessuraLinha, pose.leftHip, pose.leftShoulder, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.rightHip, pose.rightShoulder, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.leftHip, pose.rightHip, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.leftShoulder, pose.rightShoulder, scoreMinimo);

            desenharPartePose(canvasContext, espessuraLinha, pose.rightHip, pose.rightKnee, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.rightKnee, pose.rightAnkle, scoreMinimo);

            desenharPartePose(canvasContext, espessuraLinha, pose.leftHip, pose.leftKnee, scoreMinimo);
            desenharPartePose(canvasContext, espessuraLinha, pose.leftKnee, pose.leftAnkle, scoreMinimo);

        }

    }

}

function desenharPartePose(canvasContext, espessuraLinha, keypointA, keypointB) {

    canvasContext.beginPath();
    canvasContext.strokeStyle = retornarCorLinhaEsqueleto(keypointA.part, keypointB.part);
    canvasContext.lineWidth = espessuraLinha;

    canvasContext.moveTo(keypointA.x, keypointA.y);
    canvasContext.lineTo(keypointB.x, keypointB.y);

    canvasContext.stroke();

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

function desenharPontos(poses, canvasContext, scoreMinimo) {

    for (const pose of poses) {

        if (pose.score >= scoreMinimo) {

            const escalaDesenho = retornarEscalaDesenho(pose);
            const raioBase = 16;
            const linhaBase = 6;
            const raio = raioBase * escalaDesenho;
            const linha = linhaBase * escalaDesenho;

            for (const keypoint of pose.keypoints) {
                canvasContext.beginPath();
                canvasContext.arc(keypoint.position.x, keypoint.position.y, raio, 0, 2 * Math.PI, false);
                canvasContext.fillStyle = '#000000';
                canvasContext.fill();
                canvasContext.lineWidth = linha;
                canvasContext.strokeStyle = '#FFFFFF';
                canvasContext.stroke();
            }

        }

    }

}

function retornarEscalaDesenho(pose) {

    const alturaTronco = ((pose.leftHip.y - pose.leftShoulder.y) + (pose.rightHip.y - pose.rightShoulder.y)) / 2;
    const troncoBase = 800;

    const escala = alturaTronco / troncoBase;

    return escala;

}
