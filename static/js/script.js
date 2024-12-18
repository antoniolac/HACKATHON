async function start() {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const resultContainer = document.getElementById('result');

    // Verifica che un file sia stato selezionato
    if (imageInput.files && imageInput.files[0]) {
        // Leggi il file selezionato
        const fileReader = new FileReader();
        fileReader.onload = async function (event) {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';

            // Carica il modello MobileNet
            const model = await mobilenet.load();

            // Classifica l'immagine
            model.classify(imagePreview).then(async predictions => {
                console.log('Predictions:', predictions);

                // Ordina le predizioni in base alla probabilità decrescente
                const topPrediction = predictions.reduce((prev, current) => 
                    (prev.probability > current.probability) ? prev : current
                );

                // Ottieni il nome della classe dalla predizione
                const className = topPrediction.className;

                // Carica e analizza il file CSV già presente
                fetch('rifiuti.csv')
                    .then(response => response.text())
                    .then(csvData => {
                        // Usa PapaParse per analizzare il CSV
                        Papa.parse(csvData, {
                            header: true,
                            dynamicTyping: true,
                            complete: function(results) {
                                // Trova la voce corrispondente alla classe predetta
                                const match = results.data.find(row => row.Name.toLowerCase() === className.toLowerCase());

                                if (match) {
                                    // Stampa il risultato nel tag <pre>
                                    resultContainer.textContent = `Nome: ${match.Name}\nMateriale: ${match.Materiale}\nModalità di raccolta: ${match["Modalità Rifiuto"]}`;
                                } else {
                                    resultContainer.textContent = `Nessuna corrispondenza trovata per: ${className}`;
                                }
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Errore nel caricamento del CSV:', error);
                        resultContainer.textContent = 'Errore nel caricamento del file CSV.';
                    });
            }).catch(error => {
                console.error('Errore nella classificazione:', error);
                resultContainer.textContent = 'Errore durante l\'analisi dell\'immagine.';
            });
        };

        // Leggi il file immagine come URL di dati
        fileReader.readAsDataURL(imageInput.files[0]);
    } else {
        alert('Seleziona un\'immagine per analizzarla.');
    }
}
