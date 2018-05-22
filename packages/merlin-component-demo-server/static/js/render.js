
const socket = io('/renderer');

let elError = null;

socket.on('connect', onConnect);
socket.on('render', onRender);
socket.on('renderStyles', onRenderStyles);
socket.on('renderError', onRenderError);

function clearErrorMessage(){
    if(elError !== null){
        if(elError.parentNode) elError.parentNode.removeChild(elError);
        elError = null;
    }
}

function displayErrorMessage(message){
    clearErrorMessage();

    elError = document.createElement('div');
    elError.style = `
        background-color:red;
        color:white;
        position:fixed;
        top:0;
        left:0;
        max-width:500px;
        width:100%;
        padding:10px;
    `;
    elError.innerHTML = message;

    document.body.appendChild(elError);
}

function onConnect(){
    socket.emit('id', SESSION_ID);
}

function onRender(html){
    clearErrorMessage();

    document.open();
    document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title></title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                ${html}
            </body>
        </html>
    `);
    document.close();
}

function onRenderStyles(cssText){
    clearErrorMessage();

    const elStyles = document.getElementById('elStyles');
    const styleParent = elStyles.parentNode;

    // Add news ones
    const newStyles = document.createElement('style');
    newStyles.type = 'text/css';
    newStyles.appendChild(document.createTextNode(cssText));
    newStyles.id = 'elStyles';

    styleParent.replaceChild(newStyles, elStyles);
}

function onRenderError(e){
    const err = JSON.parse(e);
    displayErrorMessage(err.message);
}
