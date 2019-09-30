import Swipe from 'ol-ext/control/Swipe';

var Comparator = function(map, overlays) {
  this.ctrl = new Swipe();
  
  var layerListLeft = "";
  var layerListRight = "";
  
  for(var og in overlays) {
    for(var k in overlays[og]) {
      var ogl = overlays[og][k];
      

      layerListLeft = layerListLeft + "<li onmousedown=\"compareChangeMap(0, '"+ogl["layername"]+"')\">"+ogl["title"]+"</li>";
      layerListRight = layerListRight + "<li onmousedown=\"compareChangeMap(1, '"+ogl["layername"]+"')\">"+ogl["title"]+"</li>";
    }
  }

  var leftContainer = '<div id="compare-left-dropdown" class="compare-dropdown" onmouseover="$(\'#compare-left-content\').show()" onmouseout="$(\'#compare-left-content\').hide()"><div class="button">1995</div><div id="compare-left-content" class="compare-content" style="display:block;"><ul>' + layerListLeft + '</ul></div></div>';
  var rightContainer = '<div id="compare-right-dropdown" class="compare-dropdown" onmouseover="$(\'#compare-right-content\').show()" onmouseout="$(\'#compare-right-content\').hide()"><div class="button">1996</div><div id="compare-right-content" class="compare-content" style="display:block;"><ul>' + layerListRight + '</ul></div></div>';


  map.addControl(this.ctrl);

  $('.ol-swipe').prepend(leftContainer+rightContainer);
}
Comparator.prototype.constructor = Comparator
export default Comparator