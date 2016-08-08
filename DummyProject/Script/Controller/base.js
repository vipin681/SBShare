
//Server Site Path
var VirtualDirectoryPath = 'http://localhost:51996/';



function createBookmark() {

    var title = 'Dummy Project';
    var url = VirtualDirectoryPath;

    if (window.sidebar) {
        /* Mozilla Firefox Bookmark */
        window.sidebar.addPanel(title, url, "");
    } else if (window.external) {
        /* IE Favorite */
        window.external.AddFavorite(url, title);
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (0);
}
