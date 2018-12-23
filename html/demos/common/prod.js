function stringify(template) {
    var output = '';
    for (var i in template) {
        output += template[i] + '\n\n';
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