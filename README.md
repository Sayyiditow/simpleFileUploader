# simpleFileUploader
A super simple file upload helper for adding multiple files with drag and drop. Allows deletion of added files from the input, adding files based on size, type and limits file uploads based on maximum size provided. 

This simple helper does not handle posting of files to the server, you may do that using form or fetch. 

DISLAIMER: Uses the DataTransfer object and will not work on ios Safari.

Dead simple initialization;-

Improt the css styles (available in dist directory):
`<link href="/static/css/simpleFileUploader.min.css" rel="stylesheet">`

Set up  the HTML file input
```<div>
    <label for='file' class="file-label" style="text-align: center;cursor: pointer;">
        Click/Drag and Drop to Upload Image(s) - <span
            style="font-size: smaller;">Up to 4, < 500KB each *</span>
    </label>
    <input type="file" name="file" multiple accept="image/*" id="file" required
           class="simple-file-uploader">
    <div id="filePreviewer" class="display-none">
        <ul id="previewList"></ul>
    </div>
    <p class="text-center dark-red-text text-smaller display-none" id="fileUploadErrors"></p>
</div>
```
  
Import simpleFileUploader.min.js and initialize:
<!--Must be imported before initialization-->
```
<script src="/static/js/simpleFileUploader.min.js"></script>
<script>
    simpleFileUploader('file', {
        maxFileSize: 500,
        fileType: "image",
        maxFileCount: 4
    });
</script>
```

There are 4 variables required:
1. The id of the input in this case - 'file'.
2. The max file size for each uploaded file in KB.
3. The file type, either "image" or "file". Image types will only allow images to be uploaded with a preview, file type will allow any file with a generic file preview.
4. The max file count allowed to upload.

There are a few mothods which are useful when using simpleFileUploader:
1. resetFileUploadState(); - Useful when loading page async and you want to reset the state.
2. restoreFilesToInput(fileSrcArr); - When editing an already saved form, restore files to the input using their server saved urls. You will need to pass an array of urls which represent the files.
