export default `
<?xml version="1.0" encoding="utf-8"?>
<resources>
!1
	<style name="{&appTheme}" parent="{~parentTheme}">
!items
		<item name="{&name}">{&value}</item>
!items
	</style>
!1
	<style name="{&appTheme}.NoActionBar">
		<item name="windowActionBar">false</item>
		<item name="windowNoTitle">true</item>
	</style>
	<style name="{&appTheme}.AppBarOverlay" parent="{~appBarOverlay}" />
	<style name="{&appTheme}.PopupOverlay" parent="{~popupOverlay}" />
</resources>`;