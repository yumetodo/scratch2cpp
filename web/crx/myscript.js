// create <input type='file'> (hidden)
var inputElem = document.createElement("input");
inputElem.type = 'file';
inputElem.id = 'file-upload-scratch-project';
inputElem.style.display = 'none';
document.body.appendChild(inputElem);

//fetch language setting
var lang = 'en';
if (document.body.innerText.indexOf('言語') >= 0) lang = 'ja';

// create a button to navigate to Scratch online editor
var div = document.getElementsByClassName("col-sm-3 editor-buttons")[0];
if (typeof div !== 'undefined' && div !== null){
    var buttonText = {'ja':'Scratch オンラインエディタ', 'en':'Scratch online editor'}[lang];
    div.insertAdjacentHTML('beforeend', `<p><button type="button" class="btn btn-default btn-sm " style="background-color: orange; color: white" onclick="window.open('https://scratch.mit.edu/projects/editor/');">` + buttonText + `</button></p>`);
}

// create and place the button for upload
div = document.getElementsByClassName("col-sm-3 editor-buttons")[0];
if (typeof div !== 'undefined' && div !== null){
    var buttonText = {'ja':'Scratch プロジェクトをロード', 'en':'Load Scratch project'}[lang];
    div.insertAdjacentHTML('beforeend', `<p><button id="btn-upload-scratch-project" type="button" class="btn btn-default btn-sm " style="background-color: orange; color: white">` + buttonText + `</button></p>`);
}

//create and plave the link to blocks information (https://github.com/yos1up/scratch2cpp/blob/master/blocks.md)
div = document.getElementsByClassName("col-sm-3 editor-buttons")[0];
if (typeof div !== 'undefined' && div !== null){
    var text = {'ja':'※つかえるブロックは？', 'en':'Which blocks are supported?'}[lang];
    div.insertAdjacentHTML('beforeend', `<a href="https://github.com/yos1up/scratch2cpp/blob/master/blocks.md" target="_blank">` + text + `</a>`);
}



// button for upload => trigger <input type='file'>
document.getElementById("btn-upload-scratch-project").onclick = function(){
    document.getElementById("file-upload-scratch-project").click();
};

// when file is selected
document.getElementById("file-upload-scratch-project").addEventListener("change",function(e){
    var files = e.target.files;
    if (typeof files[0] !== 'undefined'){
        var zip = new JSZip();
        if (typeof zip === 'undefined'){
            alert('JSZip load failed...');
        }else{
            zip.loadAsync(files[0]).then(
                function(zip) {
                    if (typeof zip.files['project.json'] !== 'undefined'){
                        zip.files['project.json'].async('string').then(
                            function (fileData) {
                                // convert project.json -> cpp
                                var rslt = projectJsonToCpp(fileData);
                                var cppSource = rslt[0];
                                var errorMessage = rslt[1];
                                if (errorMessage != ''){
                                    alert(errorMessage);
                                }

                                // paste to plain editor
                                document.getElementsByClassName("form-control plain-textarea")[0].value = cppSource;

                                { // paste to rich editor
                                    // execute this command in web browser
                                    // $('.editor').data('editor').doc.setValue(fileData);
                                    var elem = document.getElementById("converted_source");
                                    if (!elem){
                                        elem = document.createElement("textarea");                              
                                        elem.id = 'converted_source';
                                        elem.style.display = 'none';
                                        document.body.appendChild(elem);
                                    }
                                    elem.value = cppSource;


                                    // paste to rich editor
                                    var script = document.createElement("script");
                                    script.textContent = '$(".editor").data("editor").doc.setValue(document.getElementById("converted_source").value);';
                                    document.body.appendChild(script);

                                }

                                // select C++ language 
                                // TODO

                            }
                        );
                    }else{
                        alert("Not a valid .sb2 file (project.json not found)");
                    }
                }, function() {alert("Not a valid .sb2 file (unzip failed)");});
        }
    }     
});
