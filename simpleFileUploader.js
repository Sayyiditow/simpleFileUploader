/*File upload
* The fileUploadState object contains the filesArr which holds the latest files that we need to upload.
* A DataTransfer object is used to set the files of the input so they can be submitted synchronously.
* */
let fileUploadState = {filesArr: [], fileInputHolder: new DataTransfer()};
let simpleFileUploaderHolder = {id: "simpleFileUploader", options: {fileType: "file", maxFileSize: 0, maxFileCount: 0}}

/*Revert back the uploadState and fileInputHolder objects*/
function resetFileUploadState() {
    fileUploadState = {filesArr: [], fileInputHolder: new DataTransfer()};
}

function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
}

/*Adds files to the upload state after doing few checks:
* 1. Same file names are ignored.
* 2. Files added more than the maximum number accepted are rejected.
* 3. Checks if only images are allowed.
* 4. Checks file size for each file before adding.
* After adding, the same file is added to the data transfer object so it can be used in the form input file when submitting.
* */
function addFilesToState(files, fileElement) {
    let fileUploadErrors = document.querySelector('[id=fileUploadErrors]');
    let loopIndex = 0;

    while (loopIndex < files.length) {
        let file = files[loopIndex++];
        if (!fileUploadState.filesArr.some(e => e.name === file.name)) {
            let maxFileCount = simpleFileUploaderHolder.options.maxFileCount;
            if (fileUploadState.filesArr.length !== Number(maxFileCount)) {
                if (file.size < (simpleFileUploaderHolder.options.maxFileSize * 1000)) {
                    if (simpleFileUploaderHolder.options.fileType === "image") {
                        if (isFileImage(file)) {
                            fileUploadState.filesArr.push(file);
                            fileUploadState.fileInputHolder.items.add(file);
                        } else {
                            fileUploadErrors.style.display = "block";
                            fileUploadErrors.textContent = "Only images allowed.";
                        }
                    } else {
                        fileUploadState.filesArr.push(file);
                        fileUploadState.fileInputHolder.items.add(file);
                    }
                } else {
                    fileUploadErrors.style.display = "block";
                    fileUploadErrors.textContent = "File size exceeds limit.";
                }
            } else {
                fileUploadErrors.style.display = "block";
                fileUploadErrors.textContent = "Only " + maxFileCount + " files allowed.";
            }
        }
        new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
            fileUploadErrors.style.display = "none";
        });
    }

    fileElement.files = fileUploadState.fileInputHolder.files;
}

function getFileSizeAndSuffix(size) {
    let suffix = "bytes";
    if (size >= 1024 && size < 1024000) {
        suffix = "KB";
        size = Math.round(size / 1024 * 100) / 100;
    } else if (size >= 1024000) {
        suffix = "MB";
        size = Math.round(size / 1024000 * 100) / 100;
    }
    return size + suffix;
}

/*Shows file previews based on types. Images have previews of the image itself in a 300 by 150 px size.
* Other files are displayed using a generic file image as the preview.
* File information such as name and size are included.
* Files added to preview can be removed using the delete button.
*/
function renderFileUploadList(filePreviewer, previewList, fileElement) {
    let fileMap = fileUploadState.filesArr.map((file, index) => {
        let imageUrlPreview = isFileImage(file) ? URL.createObjectURL(file) : "file.png";

        return '<li class="text-center" id="' + index + '"> ' +
            '<img src="' + imageUrlPreview + '" class="preview-image" alt="preview">' +
            '<img src="delete.png" class="deleteImage cursor-pointer" alt="delete" title="delete">' +
            '<h6 class="file-name text-center text-medium">' + file.name.replace(/(.{30})..+/, "$1…") + '' +
            '<span class="file-size text-x-small display-inline-block">' + getFileSizeAndSuffix(file.size) + '</span>' +
            '</h6>' +
            '</li>';
    });

    let deleteImageIcon = document.getElementsByClassName('deleteImage');
    let stringPreviewHtml = "";
    let stringPreviewHtmlIndex = 0;

    while (stringPreviewHtmlIndex < fileMap.length) {
        stringPreviewHtml += fileMap[stringPreviewHtmlIndex++].toString();
    }

    filePreviewer.style.display = "block";
    previewList.innerHTML = stringPreviewHtml;

    let deleteImageIconIndex = 0;
    if (fileUploadState.filesArr.length !== 0) {
        while (deleteImageIconIndex < deleteImageIcon.length) {
            deleteImageIcon[deleteImageIconIndex++].addEventListener('click', function () {
                let key = this.parentNode.getAttribute("id");
                fileUploadState.filesArr.splice(key, 1);
                fileUploadState.fileInputHolder.items.remove(key);
                renderFileUploadList(filePreviewer, previewList, fileElement);
            });
        }
    } else {
        fileElement.value = "";
        filePreviewer.style.display = "none";
    }
}

/*Helps to render files from the server back to the form during editing.
* Adds files to the upload state first, then to the data transfer object which then adds files to the input.
* */
function restoreFilesToInput(fileSrcArr) {
    let fileElement = document.querySelector('[id=' + simpleFileUploaderHolder.id + ']');
    if (fileSrcArr.length) {
        let fileSrc = fileSrcArr[0];
        let fileNameSplit = fileSrc.split('/');
        fetch(fileSrc)
            .then(res => res.blob())
            .then(blob => {
                let currentFile = new File([blob], fileNameSplit[fileNameSplit.length - 1],
                    {type: (fileElement.getAttribute('data-file-type') === 'image') ? "image/png" : "text/plain"});
                fileUploadState.filesArr.push(currentFile);
                fileUploadState.fileInputHolder.items.add(currentFile);
                if (fileSrcArr.pop) {
                    renderFileUploadList(document.querySelector('[id=filePreviewer]'), document.querySelector('[id=previewList]'),
                        fileElement);
                    /*Restore files to input*/
                    fileElement.files = fileUploadState.fileInputHolder.files;
                }
                fileSrcArr.shift();
                restoreFilesToInput(fileSrcArr, fileElement);
            });
    }
}

/*Initialize the uploader*/
function simpleFileUploader(elementId, options) {
    simpleFileUploaderHolder = {
        id: elementId, options: options
    };

    document.addEventListener('change', function (e) {
        let currentElement = e.target;

        if (currentElement.matches('#' + simpleFileUploaderHolder.id + '')) {
            let fileElement = document.querySelector('[id=' + simpleFileUploaderHolder.id + ']');
            addFilesToState(fileElement.files, fileElement);
            renderFileUploadList(document.querySelector('[id=filePreviewer]'), document.querySelector('[id=previewList]'), fileElement);
        }
    });

    document.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    document.addEventListener('dragenter', function (e) {
        e.preventDefault();
    });

    document.addEventListener('drop', function (e) {
        e.preventDefault();
        let currentElement = e.target;

        if (currentElement.matches('.file-label')) {
            let dT = new DataTransfer();
            let loopIndex = 0;

            while (loopIndex < e.dataTransfer.files.length) {
                dT.items.add(e.dataTransfer.files[loopIndex++]);
            }

            let fileElement = document.querySelector('[id=' + simpleFileUploaderHolder.id + ']');
            addFilesToState(dT.files, fileElement);
            renderFileUploadList(document.querySelector('[id=filePreviewer]'), document.querySelector('[id=previewList]'), fileElement);
        }
    });
}
