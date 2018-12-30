function stringify(template) {
    var output = '';
    for (var name in template) {
        for (var xml of template[name]) {
            output += xml + '\n\n';
        }
    }
    return output;
}

function copy(id) {
    var element = document.getElementById(id);
    var range = document.createRange();
    range.selectNode(element);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    setTimeout(function() {
        window.getSelection().removeAllRanges();
    }, 100);
}