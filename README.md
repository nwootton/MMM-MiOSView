# MMM-MiOSView #
Additional Module for MagicMirror²  https://github.com/MichMich/MagicMirror

Alpha Concept - Unsupported - this is for example only.
* Status of any device category **except** 3 is not mapped
* Device categories are based on_my_ Veralite, so not complete list

# Module: MiOS View #
This module displays information from a local MiCasa Verde Vera HA controller.

![](./images/Current_version.png)

## Using the module ##

Git clone from this repository into the modules sub-directory of the Magic Mirror installation, change directory into the newly cloned code and then run npm install.

```bash
git clone https://github.com/nwootton/MMM-MiOSView.git
cd MMM-MiOSView
npm install
```
To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
    {
		module: 		'MMM-MiOSView',
		position: 		'bottom_left',
		header:			'Vera Status',		//Optional - delete this line to turn OFF the header completely
		config: {
			veraURL:	'192.168.1.159', 		// IP address of local Vera box
			veraCategories: [3]					// Array of device categories to display
		}
	},
]
```
There are 2 MANDATORY fields - `veraURL` and `veraCategories`.

|Option|Required Settings Description|
|---|---|
|`veraURL`| IP Address of your local Vera box. <br/><br/>**REQUIRED:** 192.168.1.100 |
|`veraCategories`| Array. Array of device categories to display. <br/><br/>**REQUIRED:** [2,3,11|

|Option|Optional Settings Description|
|---|---|
|`updateInterval`| Time between updates in ms. <br/><br/>**Default:** 300000 (5 minutes)|

## Categories ##
The following device categories are available:
|ID|Type|
|---|---|
| 2  |Dimmable Light|
| 3  |Switch|
| 4  |Sensor|
| 11 |Generic I/O|
| 15 |A/V|
| 16 |Humidity Sensor|
| 17 |Temperature Sensor|
| 18 |Light Sensor|
| 21 |Power Meter|

There may be others, but this is what _my_ Vera returns.


## MiOS API ##

This module assumes that the Vera device is on the same network as the Mirror. It does not support access via MCV forwarding servers.

## Translations ##

This module includes translations. I've included English and German, but the German is purely a Google Translate of the English, so I apologise to any German speakers! Feel free to add additional languages and to change or ping me with corrections.

## Troubleshooting ##

Unsupported concept - I only have access to a Vera Lite running UI5, so any issues resulting from using other Vera boxes or UI versions I am unable to support.
