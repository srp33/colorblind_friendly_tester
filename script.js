let myImage;

//FIX: THIS IS BEING CALLED EVERY TIME I ADD A NEW IMAGE. Adds an extra second or two
async function startPyodide(){
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "micropip","Pillow"]);
    const micropip = pyodide.pyimport("micropip");
    await micropip.install('daltonlens');
    return pyodide;
}


function displayImage(event){
    display(event);
    convert_deut();
}

//Display images on website or uploaded by user 
function display(event) {
    let input_image = document.getElementById("input_image");
    myImage = new Image();
    let url=URL.createObjectURL(event.target.files[0]);
    myImage.src = url;
    input_image.src = url;
    document.getElementById("input_image_container").style.display = "block";
}

async function convert_deut(){
    let pyodideReadyPromise = startPyodide();
    let pyodide = await pyodideReadyPromise;
    
    self.input_image_url = myImage.src;
    //console.log(input_image_url);
    pyodide.runPython(`
        import numpy as np
        from daltonlens import convert, simulate
        from PIL import Image
        from js import input_image_url
        import io
        from base64 import b64decode, b64encode

        image= np.asarray(Image.open(input_image_url).convert('RGB'))
        simulator = simulate.Simulator_Brettel1997()
        img = simulator.simulate_cvd(image, deficiency=simulate.Deficiency.DEUTAN, severity=0.8)
        simulatedImage= Image.fromarray(img, 'RGB')
        simulatedImage.save("converted_image.png")
    `);
    console.log("Worked!");
}

//Predict image and display output
async function predict_image() {
    let input = document.getElementById("input_image");
    //Preprocessing steps 
    /*
    (1)Resize to 224*224
    (2)Convert to float
    */
    let tfImg;

    if (myImage){
        tfImg = tf.browser.fromPixels(myImage)
        .resizeNearestNeighbor([224, 224]) // change image size
        .expandDims() // expand tensor rank
        .toFloat();
    } else{
        tfImg = tf.browser.fromPixels(input)
            .resizeNearestNeighbor([224, 224]) // change image size
            .expandDims() // expand tensor rank
            .toFloat();
    }

    const model = await tf.loadGraphModel('savedModel/model.json');

    pred = model.predict(tfImg);
    //In dataset, 0 = Friendly, 1 = Unfriendly
    //At which index in tensor we get the largest value ?
    let result = "";

    pred.data().then((data) => {
        //output = document.getElementById("output_chart");
        //output.innerHTML = "";
        document.getElementsByClassName("output_screen")[0].style.display = "flex";

        if (data > 0.5) {
            
            result = "Unfriendly";
            document.getElementById("output_text").innerHTML = "<p>Our model predicts that this image is: </p><p>" + result + " with a " + (data * 100).toFixed(2) + "% probability</p>";

        }
        else {
            result = "Friendly";
            document.getElementById("output_text").innerHTML = "<p>Our model predicts that this image is: </p><p>" + result + " with a " + (100-data * 100).toFixed(2) + "% probability</p>";

        }

        //style_text = "width: 100px; height: 25px; position:relative; margin-top: 3vh; background-color: green; ";
        //output.innerHTML += "<div style = '" + style_text + "'></div>";

        //document.getElementById("output_text").innerHTML = "";
    });
}