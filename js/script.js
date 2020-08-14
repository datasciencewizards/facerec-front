$(window).ready(function() {
    $('#loading').hide();
});

var video, image, start_camera, controls, take_photo_btn, delete_photo_btn, download_photo_btn, error_message;

document.addEventListener('DOMContentLoaded', function () {

    // References to all the element we will need.
    video = document.querySelector('#camera-stream'),
    image = document.querySelector('#snap'),
    start_camera = document.querySelector('#start-camera'),
    controls = document.querySelector('.controls'),
    take_photo_btn = document.querySelector('#take-photo'),
    delete_photo_btn = document.querySelector('#delete-photo'),
    download_photo_btn = document.querySelector('#download-photo'),
    error_message = document.querySelector('#error-message');

    /*Promise.all([
        faceapi.loadFaceLandmarkModel('/weights'),
        faceapi.loadFaceRecognitionModel('/weights'),
        faceapi.loadTinyFaceDetectorModel('/weights'),
      ])
        .then(startVideo)
        .catch(err => console.error(err));*/


    // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
    navigator.getMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.mediaDevices.getUserMedia());

    /*function startVideo() {
        console.log("access");
        navigator.getUserMedia(
          {
            video: {}
          },
          stream => video.srcObject = stream,
          err => console.error(err)
        )
      }*/


    if(!navigator.getMedia){
        displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
    }
    else{

        // Request the camera.
        navigator.getMedia(
            {
                video: true
            },
            // Success Callback
            function(stream){

                // Create an object URL for the video stream and
                // set it as src of our HTLM video element.
                video.srcObject = stream;

                // Play the video element to start the stream.
                video.play();
                video.onplay = function() {
                    showVideo();
                    setTimeout(function(){
                        take_photo_btn.click();
                      },5000);
                };

            },
            // Error Callback
            function(err){
                displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
            }
        );

    }

    video.addEventListener('play', () => {
            faceapi.loadFaceLandmarkModel('../facerec/weights')
            //faceapi.loadFaceRecognitionModel('../../weights')
            faceapi.loadTinyFaceDetectorModel('../facerec/weights')
          setInterval(async () => {
            //await faceapi.nets.tinyfacedetector.loadFromUri('../../weights')
            //const useTinyModel = true
            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()) //Face Detectors
              .withFaceLandmarks()
            const canvas = $('#overlay').get(0)
            //console.log(canvas);
            //const canvas = faceapi.createCanvasFromMedia(video);
            const dims = faceapi.matchDimensions(canvas, video,true);
            //console.log(canvas);
            const resizedDetections = faceapi.resizeResults(detections, dims);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            //faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            //console.log(detections);
          },10)
        })



    // Mobile browsers cannot play video without user input,
    // so here we're using a button to start it manually.
    start_camera.addEventListener("click", function(e){

        e.preventDefault();

        // Start video playback manually.
        video.play();
        showVideo();

    });


    take_photo_btn.addEventListener("click",function(e){

        //e.preventDefault();

        var snap = takeSnapshot();

        async function run() {

            // try to access users webcam and stream the images
            // to the video element
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
            video.srcObject = stream
            video.play();
                video.onplay = function() {
                    showVideo();
                };
          }

        run()

        // Show image.
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Enable delete and save buttons
        delete_photo_btn.classList.remove("disabled");
        download_photo_btn.classList.remove("disabled");

        // Set the href attribute of the download button to the snap url.
        download_photo_btn.href = snap;

        // Pause video playback of stream.
        //video.pause();

        //download_photo_btn.addEventListener("click", function(e){
          //  e.preventDefault();

            //get base64 of the image
            var b64 = download_photo_btn.href;

            //call recognize API
            recognize(b64)

        //});

    });

    download_photo_btn.addEventListener("click", function(e){
        e.preventDefault();

        //get base64 of the image
        var b64 = download_photo_btn.href;

        //call recognize API
        recognize(b64)

    });

    delete_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();

    });

    function showVideo(){
        // Display the video stream and the controls.

        hideUI();
        //document.querySelector('#logodsw').display="none";
        image.classList.remove("visible");
        video.classList.add("visible");
        controls.classList.add("visible");
    }


    // function takeSnapshot(){
    //     // Here we're using a trick that involves a hidden canvas element.

    //     var hidden_canvas = document.querySelector('canvas'),
    //         context = hidden_canvas.getContext('2d');

    //     var width = video.videoWidth,
    //         height = video.videoHeight;

    //     if (width && height) {

    //         // Setup a canvas with the same dimensions as the video.
    //         hidden_canvas.width = width;
    //         hidden_canvas.height = height;

    //         // Make a copy of the current frame in the video on the canvas.
    //         context.drawImage(video, 0, 0, width, height);

    //         // Turn the canvas image into a dataURL that can be used as a src for our photo.
    //         return hidden_canvas.toDataURL('image/png');
    //     }
    // }


    function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            m = Math.max(height, width);
            r = m/256;

            new_h = height/r;
            new_w = width/r;

            console.log(new_w, new_h);

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = new_w;
            hidden_canvas.height = new_h;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, new_w, new_h);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }


    function displayErrorMessage(error_msg, error){
        error = error || "";
        if(error){
            console.error(error);
        }

        error_message.innerText = error_msg;

        hideUI();
        error_message.classList.add("visible");
    }

    function hideUI(){
        // Helper function for clearing the app UI.

        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        snap.classList.remove("visible");
        error_message.classList.remove("visible");
    }
});
