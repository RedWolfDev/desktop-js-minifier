export { getMinifiedFileFromApi };

const { writeFile } = require("fs");

async function getMinifiedFileFromApi(fileProperties) {
    const { rawFileContent, fileName } = fileProperties;
    const fileNameNoExtension = fileName.split(".")[0];

    try {
        const response = await fetch('https://www.toptal.com/developers/javascript-minifier/api/raw', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": rawFileContent.length,
            },
            body: new URLSearchParams({
                "input": rawFileContent
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const minifiedBody = await response.text();
        const minifiedFilesPath = document.getElementById("minifiedFilesPath");
        let minifiedFolderPath = localStorage.getItem("minifiedFilesPath");

        if(!minifiedFolderPath) {
            minifiedFolderPath = minifiedFilesPath.value
        }

        const folderPathRegex = /^[a-zA-Z]:\\(((?![<>:"/\\|?*]).)+((?<![ .])\\)?)*[^\\]$/;
        if(!folderPathRegex.test(minifiedFolderPath)) {
            throw new Error();
        }

        writeFile(`${ minifiedFolderPath }\\${ fileNameNoExtension }.min.js`, minifiedBody, () => {
            console.log("File saved!")
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}