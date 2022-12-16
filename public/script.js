//Display images on website or uploaded by user 
let myImage = document.getElementById("uploadedFile");
let uploadForm = document.getElementById("uploadForm");


myImage.onchange = function() {
    if(this.files[0].size > 2097152){
       alert("Your uploaded file is too big. Please choose a file under 5MBs");
       this.value = "";
    };
};


function getBase64(file) {
    return new Promise(function(resolve) {
        var reader = new FileReader();
        reader.onloadend = function() {
        resolve(reader.result)
        }
        reader.readAsDataURL(file);
    })
}

function simulateImage(imageID="colorblind_friendly_tester/public/converted_image.png"){
    document.getElementById("loader").style.display = "none";

    let output_image = document.getElementById("output_image");

    output_image.src = "/colorblind_friendly_tester/uploads/"+imageID+".png";
    output_image.style.display = "inline";
}

async function display() {
    let input_image = document.getElementById("input_image");
    if(myImage.files[0]){
        let image = myImage.files[0];
        let url=URL.createObjectURL(image);
        input_image.src = url;
        document.getElementById("input_image_container").style.display = "block";
    }
}

let imageID;
uploadForm.onsubmit = async function(e) {
    e.preventDefault();
    let base64data;
    if (myImage.files[0]){
        base64data= await getBase64(myImage.files[0]);
    }
    document.getElementById("loader").style.display = "inline";
    document.getElementById("output_image").style.display = "none";
    document.getElementById("simulated_image_text").style.visibility = "hidden";
    jQuery.ajax({
        method: 'POST',
        url: '/colorblind_friendly_tester/upload',
        data: {
            file: base64data
        }
    })
    .then(function (res) {
        if (res.id){
            imageID = res.id;
            simulateImage(imageID);
            document.getElementById("simulated_image_text").style.visibility = "visible";
            return;
        } 
        throw new Error('Something went wrong');
    })
    .catch((error)=>{
        alert("No image was uploaded. Please try again.");
    })
}

async function predict_image() {
    let input = document.getElementById("output_image");

    let tfImg;
    
    tfImg = tf.browser.fromPixels(input)
        .resizeNearestNeighbor([224, 224]) // change image size
        .expandDims() // expand tensor rank
        .toFloat();

    const model = await tf.loadGraphModel('colorblind_friendly_tester/public/savedModel/model.json');

    pred = model.predict(tfImg);
    //In dataset, 0 = Friendly, 1 = Unfriendly
    let result = "";

    pred.data().then((data) => {
        document.getElementsByClassName("output_screen")[0].style.display = "flex";

        if (data > 0.5) {
            
            result = "Unfriendly";
            document.getElementById("output_text").innerHTML = "<p>Our model predicts that this image is: </p><p>" + result + " with a " + (data * 100).toFixed(2) + "% probability</p>";

        }
        else {
            result = "Friendly";
            document.getElementById("output_text").innerHTML = "<p>Our model predicts that this image is: </p><p>" + result + " with a " + (100-data * 100).toFixed(2) + "% probability</p>";

        }
        
    });
}
