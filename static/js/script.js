// script.js

let model;

// Carica il modello pre-addestrato YOLO da TensorFlow.js
async function loadModel() {
    model = await tf.loadGraphModel('https://storage.googleapis.com/tfjs-models/tfjs/coco-ssd/model.json');
    console.log("Modello YOLO caricato");
}

// Funzione per l'analisi dell'immagine
async function uploadImage() {
    const input = document.getElementById('imageInput');
    const file = input.files[0];

    if (!file) {
        alert('Seleziona un file immagine');
        return;
    }

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
        alert('Devi caricare un\'immagine!');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const imageElement = new Image();
        imageElement.src = event.target.result;
        imageElement.onload = async function() {
            const tensor = tf.browser.fromPixels(imageElement);

            // Preprocessa l'immagine per il modello (ridimensionamento e normalizzazione)
            const resizedImage = tf.image.resizeBilinear(tensor, [416, 416]);
            const normalizedImage = resizedImage.div(tf.scalar(255.0));
            const inputTensor = normalizedImage.expandDims(0);

            // Esegui il rilevamento
            const predictions = await model.executeAsync(inputTensor);

            // Mostra i risultati
            document.getElementById('result').textContent = JSON.stringify(predictions, null, 2);
        };
    };
    reader.readAsDataURL(file);
}

// Carica il modello YOLO al caricamento della pagina
window.onload = loadModel;
