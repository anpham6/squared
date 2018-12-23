const template = [
'<?xml version="1.0" encoding="utf-8"?>',
'<resources>',
'!1',
'	<style name="{&name}" parent="{~parent}">',
    '!items',
'		<item name="{&name}">{&value}</item>',
    '!items',
'	</style>',
'!1',
'</resources>',
'<!-- filename: res/values/styles.xml -->'
];

export default template.join('\n');