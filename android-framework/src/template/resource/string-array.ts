const template = [
'<?xml version="1.0" encoding="utf-8"?>',
'<resources>',
'!1',
'	<string-array name="{&name}">',
    '!items',
'		<item>{&value}</item>',
    '!items',
'	</string-array>',
'!1',
'</resources>',
'<!-- filename: res/values/string_arrays.xml -->'
];

export default template.join('\n');