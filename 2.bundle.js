(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{115:function(e,t,o){"use strict";o.r(t);var r=o(92),a=function(e,t){this.ctrl=new r.a({position:.5});e.addControl(this.ctrl);for(var o in $(".ol-swipe").prepend('<div id="compare-left-dropdown" class="compare compare-dropdown" onmouseover="$(\'#compare-left-content\').show()" onmouseout="$(\'#compare-left-content\').hide()"><div class="compare button">...</div><div id="compare-left-content" class="compare compare-content" style="display:block;"><ul id="compare-left-ul"></ul></div></div><div id="compare-right-dropdown" class="compare compare-dropdown" onmouseover="$(\'#compare-right-content\').show()" onmouseout="$(\'#compare-right-content\').hide()"><div class="compare button">...</div><div id="compare-right-content" class="compare compare-content" style="display:block;"><ul id="compare-right-ul"></ul></div></div>'),t){for(var a in t[o]){var i=t[o][a];$("<li class='compare'>"+i.title+"</li>").prependTo("#compare-left-ul").mousedown([this,0,o,a,i.title],this.compareChangeMap),$("<li class='compare'>"+i.title+"</li>").prependTo("#compare-right-ul").mousedown([this,1,o,a,i.title],this.compareChangeMap)}$("<li class='compare compare-header'>"+o+"</li>").prependTo("#compare-left-ul"),$("<li class='compare compare-header'>"+o+"</li>").prependTo("#compare-right-ul")}$("#compare-left-content").hide(),$("#compare-right-content").hide()},i=r.a.prototype.move,p=function(e){$(e.target).hasClass("compare")||(r.a.prototype.move=i,this.move(e),r.a.prototype.move=p)};r.a.prototype.move=p,a.prototype.setLayer=function(e,t){t?(this.rightLayer&&(this.ctrl.removeLayer(this.rightLayer),this.rightLayer.setVisible(!1)),this.rightLayer=e,$("#compare-right-dropdown .button").html(e.get("title"))):(this.leftLayer&&(this.ctrl.removeLayer(this.leftLayer),this.leftLayer.setVisible(!1)),this.leftLayer=e,$("#compare-left-dropdown .button").html(e.get("title"))),this.ctrl.addLayer(e,t),e.setVisible(!0)},a.prototype.compareChangeMap=function(e){var t=e.data[0],o=e.data[1],r=(e.data[2],e.data[3],e.data[4]),a=t.ctrl.getMap().getLayerGroup().getLayersArray();for(var i in a){var p=a[i];p.get("title")==r&&(console.log("match!"),t.setLayer(p,o))}$("#compare-left-content").hide(),$("#compare-right-content").hide()},a.prototype.constructor=a,t.default=a}}]);