function loadingwheel(bool) {

    var html = "";
    if (bool) {
        html += "<div id='mask'></div>";
        html += "<div class='loadingwheel'>";
        html += "<i class=\"fa fa-spinner fa-pulse\" style=\"font-size:50px;color:#eee;\"></i>";
        html += "</div>";

        $("#loadingwheel").html(html);
    }
    else {
        $("#loadingwheel").html("");
    }
}


function getFormattedDate(dateValue) {
    var date = new Date(dateValue);
    //alert(date);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    //return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}

function readImageURL(input) {

    var fup = document.getElementById('file');
    var fileName = input.value;
    var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
    if (ext.toString() == "gif" || ext.toString() == "GIF" || ext.toString() == "JPEG" || ext.toString() == "jpeg" || ext.toString() == "jpg" ||
ext.toString() == "JPG" || ext.toString() == "png" || ext.toString() == "PNG") {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var dataUrl = e.target.result;
                var dataString = dataUrl.split(",")[1];
                $('#filethumbnail').attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    else {
        document.getElementById('file').value = "";
    }

}
