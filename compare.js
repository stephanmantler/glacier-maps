import Swipe from 'ol-ext/control/Swipe';

var Comparator = function(map, overlays) {
  this.ctrl = new Swipe({ position: 0.5 });
  var that = this;
  
  var layerListLeft = "";
  var layerListRight = "";
  
  var leftLayer = null
  var rightLayer = null
  
  map.addControl(this.ctrl);

  var leftContainer = '<div id="compare-left-dropdown" class="compare compare-dropdown" onmouseover="$(\'#compare-left-content\').show()" onmouseout="$(\'#compare-left-content\').hide()"><div class="compare button">...</div><div id="compare-left-content" class="compare compare-content" style="display:block;"><ul id="compare-left-ul">' + layerListLeft + '</ul></div></div>';
  var rightContainer = '<div id="compare-right-dropdown" class="compare compare-dropdown" onmouseover="$(\'#compare-right-content\').show()" onmouseout="$(\'#compare-right-content\').hide()"><div class="compare button">...</div><div id="compare-right-content" class="compare compare-content" style="display:block;"><ul id="compare-right-ul">' + layerListRight + '</ul></div></div>';

  $('.ol-swipe').prepend(leftContainer+rightContainer);
  for(var og in overlays) {
    for(var k in overlays[og]) {
      var ogl = overlays[og][k];
      
      $("<li class='compare'>"+ogl["title"]+"</li>").prependTo("#compare-left-ul").mousedown([that, 0, og, k, ogl["title"]], that.compareChangeMap);
      $("<li class='compare'>"+ogl["title"]+"</li>").prependTo("#compare-right-ul").mousedown([that, 1, og, k, ogl["title"]], that.compareChangeMap);
    }
    $("<li class='compare compare-header'>"+og+"</li>").prependTo("#compare-left-ul")
    $("<li class='compare compare-header'>"+og+"</li>").prependTo("#compare-right-ul")
  }
  

  $('#compare-left-content').hide()
  $('#compare-right-content').hide()
}

// override Swipe move() function to avoid spurious changes while clicking the selector
var oldMove = Swipe.prototype.move
var newMove = function(e)
{
  if( $(e.target).hasClass('compare') )
    return;
  Swipe.prototype.move = oldMove
  this.move(e)
  Swipe.prototype.move = newMove
}

Swipe.prototype.move = newMove

// helper function to wrap layer toggle functionality around the Swipe control
Comparator.prototype.setLayer = function(layer, side) {
  
  if (!side) {
    if (this.leftLayer) {
      this.ctrl.removeLayer(this.leftLayer)
      this.leftLayer.setVisible(false)
    }
    this.leftLayer = layer
    $("#compare-left-dropdown .button").html(layer.get('title'))
  } else {
    if (this.rightLayer) {
      this.ctrl.removeLayer(this.rightLayer)    
      this.rightLayer.setVisible(false)
    }
    this.rightLayer = layer
    $("#compare-right-dropdown .button").html(layer.get('title'))
  }
  this.ctrl.addLayer(layer, side)
  layer.setVisible(true)
}

Comparator.prototype.compareChangeMap = function(event) {
  var that = event.data[0]
  var side = event.data[1]
  var group = event.data[2]
  var layerIndex = event.data[3]
  var layername = event.data[4]
  var map = that.ctrl.getMap()
  var layers = map.getLayerGroup().getLayersArray()
  for(var i in layers) {
    var layer = layers[i]
    if (layer.get('title') == layername) {
      console.log("match!")
      that.setLayer(layer, side)
    }
  }
}

Comparator.prototype.constructor = Comparator
export default Comparator