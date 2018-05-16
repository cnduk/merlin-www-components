'use strict';

(function(){

    const cboPartial = document.getElementById('cboPartial');
    const cboThemes = document.getElementById('cboThemes');
    const cboData = document.getElementById('cboData');
    const chkJavascript = document.getElementById('chkJavascript');
    let ifrRender = document.getElementById('ifrRender');
    const txtPreviewWidth = document.getElementById('txtPreviewWidth');
    const txtPreviewHeight = document.getElementById('txtPreviewHeight');
    const btnResizeSmall = document.getElementById('btnResizeSmall');
    const btnResizeMedium = document.getElementById('btnResizeMedium');
    const btnResizeLarge = document.getElementById('btnResizeLarge');
    const colBackground = document.getElementById('colBackground');

    const SANDBOX_VALUE = [
        'allow-forms',
        'allow-modals',
        'allow-orientation-lock',
        'allow-pointer-lock',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-presentation',
        'allow-same-origin',
        'allow-top-navigation',
        'allow-top-navigation-by-user-activation'
    ].join(' ');

    const settings = {
        PARTIAL: cboPartial.value,
        THEME: cboThemes.value,
        DATA: cboData.value,
        JS: true
    };
    const RESIZE_PRESETS = {
        SMALL: [460, 400],
        MEDIUM: [800, 800],
        LARGE: [1100, 800]
    };
    let SESSION_ID = null;

    const socket = io('/editor');
    initSettings();
    renderComponent();

    /**
     * Render the component
     */
    function renderComponent(){
        socket.emit('render', settings);
    }

    function onPreviewResize(e){
        const win = getIframeWindow(ifrRender);
        txtPreviewWidth.value = win.innerWidth;
        txtPreviewHeight.value = win.innerHeight;
    }

    function setPreviewSize(){
        ifrRender.style.width = `${txtPreviewWidth.value}px`;
        ifrRender.style.height = `${txtPreviewHeight.value}px`;
    }

    function setResizePreset(size){
        const preset = RESIZE_PRESETS[size];
        ifrRender.style.width = `${preset[0]}px`;
        ifrRender.style.height = `${preset[1]}px`;
    }

    function getIframeWindow(i){
        let win = null;

        if (i.contentWindow) {
            win = i.contentWindow;
        } else {
            if (i.contentDocument && i.contentDocument.document) {
                win = i.contentDocument.document;
            } else {
                win = i.contentDocument;
            }
        }

        return win;
    }

    /**
     * Remove and add a new iframe with the correct sandbox permissions. You
     * need to create a new one when you toggle sandbox permissions.
     */
    function rebuildIframe(){

        // Remove resize listener
        let win = getIframeWindow(ifrRender);
        win.removeEventListener('resize', onPreviewResize);

        // Remove original
        const parent = ifrRender.parentNode;
        parent.removeChild(ifrRender);

        // Create new
        ifrRender = document.createElement('iframe');
        ifrRender.className = 'component-iframe';
        ifrRender.id = 'ifrRender';
        ifrRender.src = `/render?id=${SESSION_ID}`;
        ifrRender.setAttribute('marginheight', 0);
        ifrRender.setAttribute('marginwidth', 0);
        ifrRender.setAttribute('frameborder', 0);
        if(!settings.JS){
            ifrRender.setAttribute('sandbox', SANDBOX_VALUE);
        }

        // Add back into the page
        parent.appendChild(ifrRender);
    }

    function onId(id){
        SESSION_ID = id;
        ifrRender.setAttribute('src', `/render?id=${id}`);
    }

    /**
     * Handler for combobox changes
     * @param  {String} settingKey key in settings
     */
    function onSettingChange(settingKey){
        return function _onSettingChange(e){

            if(settingKey === 'JS'){
                settings[settingKey] = e.target.checked;
            } else {
                settings[settingKey] = e.target.value;
            }

            renderComponent();
        };
    }

    function setBackgroundColor(e){
        document.querySelector('.component-preview').style.backgroundColor = e.target.value;
    }

    function initSettings(){
        cboPartial.addEventListener('change', onSettingChange('PARTIAL'));
        cboThemes.addEventListener('change', onSettingChange('THEME'));
        cboData.addEventListener('change', onSettingChange('DATA'));
        chkJavascript.addEventListener('change', onSettingChange('JS'));
        getIframeWindow(ifrRender).addEventListener('resize', onPreviewResize);
        txtPreviewWidth.addEventListener('input', setPreviewSize);
        txtPreviewHeight.addEventListener('input', setPreviewSize);
        btnResizeSmall.addEventListener('click', () => setResizePreset('SMALL'));
        btnResizeMedium.addEventListener('click', () => setResizePreset('MEDIUM'));
        btnResizeLarge.addEventListener('click', () => setResizePreset('LARGE'));
        colBackground.addEventListener('input', setBackgroundColor);
        socket.on('id', onId);
    }

})();
