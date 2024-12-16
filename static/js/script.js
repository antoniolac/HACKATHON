async function load() {
    const mobilenet = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1', { fromTFHub: true });
    return mobilenet;
}

async function getClassificationResult(tensor, labels) {
    // Estrai i dati del tensor (array delle probabilità)
    const scores = await tensor.data(); // O usa tensor.dataSync() per l'accesso sincrono

    // Trova l'indice del punteggio più alto
    const topIndex = scores.indexOf(Math.max(...scores));

    // Ottieni l'etichetta per l'indice più alto
    const topLabel = labels[topIndex];

    // Mostra il risultato della predizione
    document.getElementById("result").textContent = `Predizione: ${topLabel} (Confidenza: ${scores[topIndex].toFixed(4)})`;
}

async function start() {
    const model = await load(); // Attendi che il modello sia caricato
    console.log(model); // Mostra il modello nella console

    const response = await fetch('https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt');
    const labels = (await response.text()).split('\n');

    const img = document.querySelector("#imagePreview");
    const processedImg = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat().expandDims();

    const predictions = await model.predict(processedImg);
    await getClassificationResult(predictions, labels);
}

document.getElementById("imageInput").addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) {
        const imgElement = document.getElementById("imagePreview");
        imgElement.style.display = 'block'; // Mostra l'immagine
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.onload = function() {
                // Quando l'immagine è caricata, avvia l'analisi
                start(); 
            };
        };
        
        reader.readAsDataURL(file); // Leggi il file come URL
    }
});
