export default `
<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<style name="{&appTheme}" parent="{~parentTheme}">
	<<AA>>
		<item name="{&name}">{&value}</item>
	<<AA>>
	</style>
<<A>>
	<style name="{&appTheme}.NoActionBar">
		<item name="windowActionBar">false</item>
		<item name="windowNoTitle">true</item>
	</style>
	<style name="{&appTheme}.AppBarOverlay" parent="{~appBarOverlay}" />
	<style name="{&appTheme}.PopupOverlay" parent="{~popupOverlay}" />
</resources>`;