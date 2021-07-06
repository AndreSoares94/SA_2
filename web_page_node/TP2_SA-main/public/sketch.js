
// açoes quando se clica no botao
const button = document.getElementById('myButton');
button.addEventListener('click', async function(e) {
    try{
        const api_url = `incidents`;
        // executa o get /incidents do backend.js :
        const response = await fetch(api_url);
        // resposta em json que recebemos:
        const json = await response.json();

        console.log(json);

        // comprimento do array incidents do json (AKA qts incidentes existem)
        incidents = json.incidents;
        console.log(incidents.length);
        document.getElementById('numberIncidents').textContent = incidents.length;
    } catch(error){
        console.log(error);
    }

    // mandar colocar na bd
    const data = {incidents};
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const db_response = await fetch('/api', options);
        const db_json = await db_response.json();
        console.log(db_json);
});
