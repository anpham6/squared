var squared = {};
var android = null;

function stringify(template) {
    var output = '';
    for (var name in template) {
        for (var i = 0; i < template[name].length; i += 3) {
            output += template[name][i];
            if (template[name][i + 1]) {
                output += (name === 'drawableImage' ? '\n' : '') +
                          `<!-- filename: ${template[name][i + 1]}/${template[name][i + 2]} -->\n\n`;
            }
            else {
                output += '\n';
            }
        }
    }
    return output;
}

function copy(id) {
    var element = document.getElementById(id);
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    setTimeout(function() { window.getSelection().removeAllRanges(); }, 1);
}