const template = [
'<?xml version="1.0" encoding="utf-8"?>',
'<resources>',
'	<style name="{&appTheme}" parent="{~parentTheme}">',
    '!items',
'		<item name="{&name}">{&value}</item>',
    '!items',
'	</style>',
'</resources>'
];

export default template.join('\n');