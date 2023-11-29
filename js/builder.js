import 'ol/ol.css'
import 'ol-ext/control/Swipe.css'
import '../css/site.css'
import '../css/ol-layerswitcher.css'


//import {Map, View} from 'ol';
import Tile from 'ol/layer/Tile';
// import Vector from 'ol/layer/Vector';
import Group from 'ol/layer/Group';
//unused import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import {defaults, ScaleLine} from 'ol/control';

import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import Attribution from 'ol/control/Attribution';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
//unused import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import LayerSwitcher from 'ol-layerswitcher';

//unused import Swipe from 'ol-ext/control/Swipe';
//FIXME     var progress = new Progress(document.getElementById('progress'));
console.log("registering Builder...")

export function Builder(mapDef) {

var resetZoom;
var parser = new WMTSCapabilities();
var map;
var attribution = new Attribution({
  collapsible: false
});

var overlays = {}
var ol;

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
  
  function mediaQueryChanged() {
    console.log("media query change")
  }
    
  const mQuery = window.matchMedia('(max-width: 600px) and (orientation: portrait)')
  mQuery.addListener(mediaQueryChanged)
  
  // eslint-disable-next-line no-unused-vars
  function isMobile() { return mQuery.matches }

  function makeSource(layerName) {
    console.log("making source for " + layerName);
    
   var options = optionsFromCapabilities(caps, {
     layer: layerName,
     matrixSet: 'EPSG:3857'
  });
  if(!options) {
    console.log("construction failed.");
    return null;
  }
    var source = new WMTS(/** @type {!olx.source.WMTSOptions} */ (options));
/*FXME
         source.on('tileloadstart', function() { progress.addLoading(); });
         source.on('tileloadend', function() { progress.addLoaded(); });
         source.on('tileloaderror', function() { progress.addLoaded(); });
*/
    return source;
  }
  
  var activeLayer;
//  var layerListLeft = "";
//  var layerListRight = "";

  var layersByName = {}

  var mobileSwitcher = document.createElement("div")
  mobileSwitcher.setAttribute("id", "mobileswitcher")
  var layerSelectList = document.createElement("select")
  mobileSwitcher.appendChild(layerSelectList)
  
  /* eslint-disable no-undef */
  $("#head").append(mobileSwitcher)
  $(layerSelectList).on('change', function() {
    const selected = $(layerSelectList).val()
    console.log("-> "+selected)
    for(var k in layersByName) {
      layersByName[k].setVisible( k == selected )
    }
  })
  /* eslint-enable no-undef */
  
  var layerGroups = []
  var firstGroup = true
  for(var og in overlays) {
    var group = new Group({title: og, layers:[]})
    
    var optgroup = document.createElement("optgroup")
    optgroup.setAttribute("label", og)
    layerSelectList.appendChild(optgroup)
    
    for(var k in overlays[og]) {
      var ogl = overlays[og][k];
      var source = makeSource(ogl["layername"]);
      
      if(!source) {
        continue;
      }
      
      source.setAttributions(
        'glacier maps © <a href="http://www.stepman.is/">stepman</a>. '+
        '<a href="https://github.com/stephanmantler/glacier-maps/">Source on GitHub</a>.'
      )
      var layer = new Tile({
        opacity: 1,
        source: source,
        type: 'overlay',
        title: ogl["title"],
        visible:false,
        extent: ogl["extent"]
      })
      layer.on('change:visible', updateHomeExtents)
      // lazy way to remember the very last layer we've added
      if(firstGroup) {
       activeLayer = layer;
      }
      group.getLayers().push(layer);
      layersByName[ogl['layername']] = layer
      
      var oge = document.createElement("option")
      oge.setAttribute("value", ogl["layername"])
      oge.innerHTML = ogl["title"]
      oge.setAttribute("label", ogl["title"])
      optgroup.appendChild(oge)
      // eslint-disable-next-line no-undef
      $(layerSelectList).val(ogl["layername"])
    }
    layerGroups.push(group)
    firstGroup = false
  }
  
  
  var lmiSource = makeSource("LMI_Kort");
  lmiSource.setAttributions('Base map © <a href="http://www.lmi.is/">Landmælingar Íslands / National Land Survey of Iceland</a>')

  var scale = new ScaleLine({
//    units: 'metric',
    bar: true,
//    steps: 4,
//    text: true,
    minWidth: 80
  });
  
  resetZoom = new ZoomToExtent({
    extent: layer.getExtent(),
    label: '⤢'
  })
  
  function updateHomeExtents() {
    for(var k in layersByName) {
      if(!layersByName[k].getVisible()) {
        continue
      }
      console.log(" home extents updated for " + k)
      resetZoom.extent = layersByName[k].getExtent()
    }
  }

  map = new ol.Map({
    layers: [
      new Tile({
        source: lmiSource,
        type: 'overlay' /* 'basebase' */,
        title:'Base Map',
        visible: true
      }),
      /* extents_2017_18 */
    ],
    target: 'map',
    
    pixelRatio: 4*window.devicePixelRatio,
    controls: defaults({attribution: false}).extend([attribution, scale, resetZoom]),
    view: new ol.View({
      center: [-1807300,9377900],
      zoom: 16
    })
  });
  map.getLayers().extend(layerGroups);
  // not always using this for now ...
  // eslint-disable-next-line no-unused-vars
  function addCaveExtentsLayer(jsonfile) {
  var VectorLayer;
  var VectorSource;

    /* == annotation overlay == */
    var style = new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)'
      }),
      stroke: new Stroke({
        color: 'rgba(255,0,0, 0.6',
        width: 2
      })
    });
    var style_conf2 = new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(255,0,0, 0.6',
        lineDash: [5,5],
        width: 2
      })
    });
    
    function styleFunction(feature /*, resolution */) {
      var status = feature.get('status');
      if (status == '2') {
        return style_conf2;
      }
      return style;
    }
    
    import('ol/layer/Vector').then( module => {
      VectorLayer = module.default
      return import('ol/source/Vector')
    }).then( module => {
      VectorSource = module.default;
      var jsonFormat = new GeoJSON()
      var extentsSource = new VectorSource({
        url: jsonfile,
        format: jsonFormat
      })
  
      var extents_2017_18 = new VectorLayer({
        source: extentsSource,
        style: styleFunction,
        title: "Ice Cave Extents (2017-18)"
      });
      map.addLayer(extents_2017_18);
      LayerSwitcher.renderPanel(map, document.getElementById('switcher'), {});
    })
  }
  
  /*
  if(!isMobile()) {
    addCaveExtentsLayer('/data/IceCaveExtents.geojson')
  }
  */

  function checkSize() {
    var small = map.getSize()[0] < 600;
    attribution.setCollapsible(small);
    attribution.setCollapsed(small);
  }
  
  window.addEventListener('resize', checkSize);
  checkSize();

  // eslint-disable-next-line no-unused-vars
  const layerSwitcher = new LayerSwitcher({ tipLabel: 'Layers', activationMode: 'click', startActive: true, target: document.getElementById('switcher') });

  
//  map.addControl(layerSwitcher);
  activeLayer.setVisible(true);

  LayerSwitcher.renderPanel(map, document.getElementById('switcher'), {});
  //  layerSwitcher.renderPanel(map, $('#switcher'), { reverse: true });
  
  var extent = activeLayer.getExtent();
  console.log("extent: " + extent)
  map.getView().fit(extent);
  
});

}
