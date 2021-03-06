/*
 * Copyright (C) 2008-2013 VMware, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

dojo.provide("wm.studio.app.packageLoader");

wm.packageImages = {};
wm.packageNames = {};
_import = function(inTab, inName, inClass, inModule, inImage, inDescription, inProps, isBeta, inIndex) {
	var
		n=inName,
		c=inClass,
		m=inModule||c,
		i=inImage||"images/wm/widget.png";
    if (i.indexOf(".") == -1) // only add classes, not paths
    if (inTab != "Theme Widgets") {
        wm.packageImages[inClass] = i;
        wm.packageNames[inClass] = inName;
    }
	try{
	    /* Removing to improve studio loading performance in cloud */
	    // trips up build system to have a dojo.require here
	    //dojo["require"](m);
	}catch(e){
		return 'Could not import module "' + m + '".';
	}
	var ctor = dojo.getObject(c);
    /* Removing to improve studio loading performance in cloud
	if (!ctor) {
		return 'Module "' + m + '" is loaded, but function "' + c + '" was not found.';
	}
        if (!dojo.locale.match(/^en/))
            ctor.prototype.localizedDeclaredClass = n; // save the localized class name in case we need to refer to it later

	var d = inDescription || ctor.description || inClass;
	    */
    var d = inDescription || inClass;
	/*var s = inTab.split(".");
	var p = "";
	if (s.length > 1) {
		inTab = s.pop();
		p = s;
	}
	p = "palette" + p;*/
    if (inTab == bundlePackage.Non_Visual_Components || inTab == bundlePackage.Services) {
	studio.addComponentMenuItem(inTab, n, d, i, c, m, inProps);
    } else {
	studio["palette"].addItem(inTab, n, d, i, c, m, inProps, isBeta,inIndex);
    }
}

installPackages = function(m) {
	for (var i=0, e; i<m.length; i++) {
		if(e=_import.apply(this, m[i]))
			console.warn(e);
	}
}

_loadPackages = function( d) {
	var m = eval("[" + d + "]");
	installPackages(m);
}

loadPackages = function() {
    dojo.requireLocalization("language", "package");
    window.bundlePackage = dojo.i18n.getLocalization("language", "package");

    dojo.require("wm.studio.app.templates.widgetTemplates");

    //studio.palette.beginUpdate();
		loadData(dojo.moduleUrl("wm.studio.app") + "packages.js", _loadPackages);
		loadData(dojo.moduleUrl("common.packages") + "packages.js", _loadPackages);
	//console.dir(__packageRegistry);
	installPackages(__packageRegistry);
	//studio.palette.endUpdate();
	studio.palette.setLayerIndex(0);
	// redefine registration
	wm.registerPackage = registerPackage = function(p) {
        if (dojo.indexOf(__packageRegistry, p) == -1) __packageRegistry.push(p);
		//console.log("[late] registerPackage:", p);
		wm.onidle(function(){
				installPackages([p]);
			});
	}
}

// palette helper
__packageRegistry = [];
wm.registerPackage = registerPackage = function(p) {
		//console.log("[early] registerPackage:", p);
	__packageRegistry.push(p);
}
