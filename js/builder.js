import 'ol/ol.css'
import 'ol-ext/control/Swipe.css'
import '../css/site.css'
import '../css/ol-layerswitcher.css'


//import {Map, View} from 'ol';
import Tile from 'ol/layer/Tile';
// import Vector from 'ol/layer/Vector';
import Group from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import {defaults, ScaleLine} from 'ol/control';

import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import Attribution from 'ol/control/Attribution';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import LayerSwitcher from 'ol-layerswitcher';

import Swipe from 'ol-ext/control/Swipe';
//FIXME     var progress = new Progress(document.getElementById('progress'));
console.log("registering Builder...")

export function Builder(mapDef) {

var parser = new WMTSCapabilities();
var map;
var attribution = new Attribution({
  collapsible: false
});

var overlays = {}
var ol;
var Vector;

var compareChangeMap = function(map, item) {
  console.log("compareChangeMap: ",map,item);
}

import('ol').then(_ => {
  ol = _;
  return(fetch(mapDef)) /* '/maps-treasure.json')) */
}).then(function(data) {
  return(data.json());
}).then(function(jsondata) {
  overlays = jsondata.layers;
  return fetch('/cache/wmts/1.0.0/WMTSCapabilities.xml')
}).then(function(response) {
  return response.text();
}).then(function(text) {
  var caps = parser.read(text);

  function makeSource(layerName) {
    var options = optionsFromCapabilities(caps, {
      layer: layerName,
      matrixSet: 'EPSG:3857'
    });
    var source = new WMTS(/** @type {!olx.source.WMTSOptions} */ (options));
/*FXME
         source.on('tileloadstart', function() { progress.addLoading(); });
         source.on('tileloadend', function() { progress.addLoaded(); });
         source.on('tileloaderror', function() { progress.addLoaded(); });
*/
    return source;
  }
  
  var activeLayer;
  var layerListLeft = "";
  var layerListRight = "";

  var layerGroups = []
  for(var og in overlays) {
    var group = new Group({title: og, layers:[]})
    for(var k in overlays[og]) {
      var ogl = overlays[og][k];
      var source = makeSource(ogl["layername"]);
      source.setAttributions('glacier maps © <a href="http://www.hafjall.is/">Háfjall ehf.</a>. <a href="https://github.com/stephanmantler/glacier-maps/">Source on GitHub</a>.');
      var layer = new Tile({ opacity: 1, source: source, type: 'base', title: ogl["title"], visible:false, extent: ogl["extent"]});
      // lazy way to remember the very last layer we've added
      activeLayer = layer;
      group.getLayers().push(layer);
    }
    layerGroups.push(group);
  }

  var lmiSource = makeSource("LMI_Kort");
  lmiSource.setAttributions('Landscape map layer © <a href="http://www.lmi.is/">Landmælingar Íslands / National Land Survey of Iceland</a>')

  var style = new Style({
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.3)' }),
    stroke: new Stroke({ color: 'rgba(255,0,0, 0.6', width: 2 })
  });
  var style_conf2 = new Style({
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
     stroke: new Stroke({ color: 'rgba(255,0,0, 0.6', lineDash: [5,5], width: 2 })
  });

  function styleFunction(feature, resolution) {
    var status = feature.get('status');
    if (status == '2') {
      return style_conf2;
    }
    return style;
  }
  
  var gae = function(e) {
    ga('send', {
      hitType: 'event',
      eventCategory:'Layers',
      eventAction:this.getVisible() ? 'show':'hide',
      eventLabel:this.get('title')
    })
  }
  
  var scale = new ScaleLine({
//    units: 'metric',
    bar: true,
//    steps: 4,
//    text: true,
    minWidth: 140
  });

  map = new ol.Map({
    layers: [
      new Tile({ source: lmiSource, type: 'overlay' /* 'basebase' */, title:'Base Map', visible: false }),
      /* extents_2017_18 */
    ],
    target: 'map',
    controls: defaults({attribution: false}).extend([attribution, scale]),
    view: new ol.View({
      center: [-1807300,9377900],
      zoom: 16
    })
  });
  map.getLayers().extend(layerGroups);
  
  var VectorLayer;
  var VectorSource;
  
  /* == annotation overlay == */
  import('ol/layer/Vector').then( module => {
    VectorLayer = module.default
    return import('ol/source/Vector')
  }).then( module => {
    VectorSource = module.default;
    var jsonFormat = new GeoJSON()
    var extentsSource = new VectorSource({
      url: '/data/IceCaveExtents.geojson',
      format: jsonFormat
    })

    var extents_2017_18 = new VectorLayer({
      source: extentsSource,
      style: styleFunction,
      title: "Ice Cave Extents (2017-18)"
    });
    map.addLayer(extents_2017_18);
  })

  function checkSize() {
    var small = map.getSize()[0] < 600;
    attribution.setCollapsible(small);
    attribution.setCollapsed(small);
    fixContentHeight();
  }
  
  function fixContentHeight(){
    /*
    var viewHeight = $(window).height();
    var header = $("div#head");
    var footer = $("div#foot");
    var content = $("div#map");
    var contentHeight = viewHeight - header.outerHeight() - footer.outerHeight() - 40;
    content.height(contentHeight);
    map.updateSize();
    */
  }
  window.addEventListener('resize', checkSize);
  checkSize();

  var layerSwitcher = new LayerSwitcher({ tipLabel: 'Layers', activationMode: 'click', startActive: true, target: document.getElementById('switcher') });

  /*
  function cookiesEnabled() {
    var r = Cookies.set('check', 'valid', { expires: 1 }) && Cookies.get('check') == 'valid';
    Cookies.remove('check');
    return r;
  }

  if(cookiesEnabled()) {
    var tag = "seen_2018005";
    if(Cookies.get('welcome') != tag) {
      Cookies.set("welcome", tag, {expires: 30});
      $("#welcome").modal({fadeDuration: 100});
    }
  }
  */

/*
  import('./js/compare.js').then(function(Compare) { 
    let other = layerGroups[1].getLayersArray()[3];
    other.setVisible(true);
    
    var comparator = new Compare.default(map, overlays);
    comparator.setLayer(activeLayer, false);
    comparator.setLayer(other, true);

  })
*/

/*
  var defaultLocation = activeLayer["layername"];
  if(window.location.hash != "") {
    var loc = window.location.hash.substr(1)
    console.log("anchor: " + loc);
    if(layers[loc] != null) {
      defaultLocation = loc;
      console.log("focusing on layer");
    } else {
      console.log("unknown layer :(");
    }
  }
  */
  
//  map.addControl(layerSwitcher);
  activeLayer.setVisible(true);

  LayerSwitcher.renderPanel(map, document.getElementById('switcher'), {});
  //  layerSwitcher.renderPanel(map, $('#switcher'), { reverse: true });
  
  var extent = activeLayer.getExtent();
  console.log("extent: " + extent)
  map.getView().fit(extent);
  
});

}
