let poseNet, img, imgSrc;

function retornarPosesConsole(imagemBase64) {

    imgSrc = imagemBase64;

    if (!poseNet) {
        carregarPoseNet();
    } else {
        carregarImagem();
    }

}

function carregarPoseNet() {

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


        minConfidence: 0.2,
        maxPoseDetections: 100,
        scoreThreshold: 0.4,

        // Non-maximum suppression part distance. It needs to be strictly positive. Two parts suppress each other if they are less than nmsRadius pixels away. Defaults to 20.
        nmsRadius: 40,

        // The type of detection. 'single' or 'multiple'
        detectionType: 'multiple',

    }

    poseNet = ml5.poseNet(carregarImagem, options);

    poseNet.on('pose', poses => {

        console.log({ poses });

        delete imgSrc;
        delete img;

    });

}

function carregarImagem() {

    img = new Image();
    img.onload = imagemCarregada;
    img.src = imgSrc;

}

function imagemCarregada() {

    img.onload = null;

    poseNet.multiPose(img);

}