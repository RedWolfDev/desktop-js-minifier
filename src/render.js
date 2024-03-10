import { getMinifiedFileFromApi } from './minify.js'

const { shell } = require('electron')

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_NUMBER = 5;

const dropZone = document.getElementById("dropZone");
const btnMinifyFiles = document.getElementById("btnMinifyFiles");
const btnClearAllFiles = document.getElementById("btnClearAllFiles");
const settingsToggle = document.getElementById("settingsIcon");
const minifiedFilesPath = document.getElementById("minifiedFilesPath");
const minifiedFolderPath = localStorage.getItem("minifiedFilesPath");
const documentationLink = document.getElementById("documentationLink");

let uploadedFiles = [];

dropZone.ondrop = dropHandler;
dropZone.ondragover = dragOverHandler;
btnMinifyFiles.onclick = minifyUploadedFiles;
btnClearAllFiles.onclick = clearAllFiles;
settingsToggle.onclick = toggleSettings;
minifiedFilesPath.onblur = saveFolderInLocalStorage;
documentationLink.onclick = openDocumentation;

if(minifiedFolderPath) {
    minifiedFilesPath.value = minifiedFolderPath
}

function dragOverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    console.log("Files dropped");

    event.preventDefault();

    if (event.dataTransfer.items) {
        [...event.dataTransfer.items].forEach((item, i) => {
            if (item.kind !== "file") {
                throw new Error("Not a file!");

            } else if(uploadedFiles.length >= MAX_FILE_NUMBER) {
                throw new Error("Max number of uploadable files reached!");

            } else {
                const file = item.getAsFile();
                const extension = getFileExtension(file.name);

                if(extension !== "js") throw new Error("Not a valid JS file!");
                if(file.size >= MAX_FILE_SIZE) throw new Error("File too big!");
                
                console.log(`Stored file: ${file.name}`);

                const container = document.getElementById("containerUploadedItems");

                container.innerHTML += `<div class="box uploaded-item">
                                            <div class="columns is-gapless is-mobile">
                                                <div class="column is-11" data-file-name="${ file.name }">
                                                    ${ file.name }
                                                </div>
                                                <div class="column is-1">
                                                    <i class="fa-solid fa-x"></i>
                                                </div>
                                            </div>
                                        </div>`

                uploadedFiles.push(file);
            }
        });

        document.querySelectorAll(".uploaded-item").forEach(element => {
            if(element.onclick === null) {
                element.onclick = deleteUploadedFile
            }
        })
    }
}

function minifyUploadedFiles() {
    
    uploadedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const rawFileContent = event.target.result;
            const fileProperties = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                rawFileContent: rawFileContent
            }

            getMinifiedFileFromApi(fileProperties);
        }

        reader.readAsText(file);
    })

    clearAllFiles();
    
}

function deleteUploadedFile(event) {
    const fileName = event.target
        .closest(".uploaded-item")
        .querySelector("[data-file-name]")
        .getAttribute("data-file-name");

    event.target.closest(".uploaded-item").remove();

    const fileIndex = uploadedFiles.findIndex(file => file.name === fileName);

    if(fileIndex >= 0) uploadedFiles.splice(fileIndex, 1);
}

function clearAllFiles() {
    const container = document.getElementById("containerUploadedItems");
    
    container.innerHTML = "";
    uploadedFiles = [];
}

function getFileExtension(filename) {
    return (filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename).toLowerCase();
}

function toggleSettings() {
    document.getElementById("settingsBox").classList.toggle("is-hidden");
}

function saveFolderInLocalStorage(event) {
    const folderPathRegex = /^[a-zA-Z]:\\(((?![<>:"/\\|?*]).)+((?<![ .])\\)?)*[^\\]$/;
    const folderPath = event.target.value;

    if(folderPathRegex.test(folderPath)) {
        localStorage.setItem("minifiedFilesPath", folderPath);
    } else {
        localStorage.removeItem("minifiedFilesPath");
        event.target.value = "";
        throw new Error("Invalid path!");
    }
}

function openDocumentation() {
    shell.openExternal("https://github.com/RedWolfDev/desktop-js-minifier/blob/main/README.md");
}