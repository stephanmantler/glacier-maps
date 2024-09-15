import '../css/site.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-panel-layers/dist/leaflet-panel-layers.min.css'

console.log("registering Builder...")

import 'leaflet';
import PanelLayers from 'leaflet-panel-layers';
import 'leaflet-gpx';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/node_modules/leaflet/dist/images/marker-icon-2x.png',
  iconUrl: '/node_modules/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/node_modules/leaflet/dist/images/marker-shadow.png',
});


export function Builder(mapDef) {

var resetZoom;
var map;

var layers = {}
var overlays = {}

//import('ol').then(_ => {
//  ol = _;
//  return(fetch(mapDef)) /* '/maps-treasure.json')) */
fetch(mapDef).then(function(data) {
  return(data.json());
}).then(function(jsondata) {
  layers = jsondata.layers;
  overlays = jsondata.overlays;
//  return fetch('/cache/wmts/1.0.0/WMTSCapabilities.xml')
//}).then(function(response) {
//  return response.text();
//}).then(function(text) {
//  var caps = parser.read(text);

  function mediaQueryChanged() {
    console.log("media query change")
  }

  async function load_shapefile(url) {
//      let url = 'https://raw.githubusercontent.com/shawnbot/topogram/master/data/us-states.geojson';
      let shape_obj = await (await fetch(url)).json();
      return shape_obj
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
  for(var og in layers) {
    continue;
    var group = new Group({title: og, layers:[]})

    var optgroup = document.createElement("optgroup")
    optgroup.setAttribute("label", og)
    layerSelectList.appendChild(optgroup)

    for(var k in layers[og]) {
      var ogl = layers[og][k];
//      var source = makeSource(ogl["layername"]);

//      if(!source) {
//        continue;
//      }

//      source.setAttributions(
//        'glacier maps © <a href="http://www.stepman.is/">stepman</a>. '+
//        '<a href="https://github.com/stephanmantler/glacier-maps/">Source on GitHub</a>.'
//      )
      // https://maps.stepman.is/cache/wmts/LMI_Kort/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png

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


  map = L.map('map', { maxZoom: 21 });
  map.setView([65.5, -14], 7);

  var baseLMI = new L.TileLayer('https://maps.stepman.is/cache/tms/1.0.0/LMI_Kort/webmercator/{z}/{x}/{y}.png', { tms: true, zoomOffset: -1, maxZoom: 21 }).addTo(map);
  var baseOTM = new L.TileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png').addTo(map);
  var baseOSM = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  var switcher = new PanelLayers([
    { active: true,
      name: "LMÍ",
      layer: baseLMI 
    },
    { name: "OpenTopoMap",
      layer: baseOTM
    },
    { name: "OpenStreetMap",
      layer: baseOSM 
    }
  ], [], { collapsibleGroups:true }).addTo(map);

  for(var og in layers) {
//      var group = new Group({title: og, layers:[]})
      
//      var optgroup = document.createElement("optgroup")
//      optgroup.setAttribute("label", og)
//      layerSelectList.appendChild(optgroup)
      
      for(var k in layers[og]) {
        var ogl = layers[og][k];
        var layer = new L.TileLayer(`https://maps.stepman.is/cache/tms/1.0.0/${ogl.layername}/webmercator/{z}/{x}/{y}.png`, { tms: true, zoomOffset: -1, maxZoom: 21 });
        switcher.addOverlay({name: ogl.title, layer: layer}, null, og);
    }
  }


  L.control.scale().addTo(map);
  /*, {

    layer: "LMI_Kort",
    tilematrixset: "webmercator_LMI",
    format: "png",
    tms: true,
    attribution: 'Base map © <a href="http://www.lmi.is/">Landmælingar Íslands / National Land Survey of Iceland</a>'
  });
  */

//  var lmiSource = makeSource("LMI_Kort");
//  lmiSource.setAttributions('Base map © <a href="http://www.lmi.is/">Landmælingar Íslands / National Land Survey of Iceland</a>')

/*
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
  */
//  var baseLayer = L.tileLayer(lmiSource);
/*
  map = new ol.Map({
    layers: [
      new Tile({
        source: lmiSource,
        type: 'overlay', // 'basebase',
        title:'Base Map',
        visible: true
      }),
      // extents_2017_18
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
  function addCaveExtentsLayer(title, jsonfile) {
  var VectorLayer;
  var VectorSource;

    // == annotation overlay ==
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
    var style_conf5 = new Style({
      fill: new FillPattern(
      {
          pattern: "hatch",
          ratio: 1,
          color: 'rgba(255,0,0,0.6)',
          offset: 0,
          scale: 2,
          fill: new Fill({ color: "rgba(0, 0, 0, 0)" }),
          size: 4,
          spacing: 10,
          angle: 45
      }),
      stroke: new Stroke({
        color: 'rgba(255,0,0, 0.7',
        width: 4
      })
    });
    */
    function styleFunction(feature /*, resolution */) {
      var status = feature.get('status');
      if (status == '2') {
        return style_conf2;
      }
      if (status == '5') {
        return style_conf5;
      }
      return style;
    }
    /*
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
        title: title,
      });
      map.addLayer(extents_2017_18);
      LayerSwitcher.renderPanel(map, document.getElementById('switcher'), {});
    })
  }
  */

  if(!isMobile() && overlays) {

    for(var entry of overlays) {
      console.log("requesting overhang data...");
      if(entry.source.endsWith(".geojson")) {
        var title = entry.title;
        var options = entry.options;
        load_shapefile(entry.source).then(function(geojsonFeature) {
          console.log("adding geoJSON layer");
          var defaults = {
            color: "#ff7800",
            weight: 5,
            opacity: 0.65
          }
          var jsonReference = L.geoJSON(geojsonFeature, { ...defaults, ...options }).addTo(map);

          switcher.addOverlay({name: title, layer: jsonReference}, null, "Vector Overlays");         
        })
        continue;
      }
      if (entry.source.endsWith(".gpx")) {
        console.log("adding GPX layer")
        
        var defaults = {
          async: true,
          polyline_options: { color: 'black' },
        };
        
        var gpx = new L.GPX(entry.source, { ...defaults, ...entry.options }).on('loaded', (e) => {
          map.fitBounds(e.target.getBounds());
        }).addTo(map);
        switcher.addOverlay({name: entry.title, layer: gpx}, null, "Vector Overlays");         
        
        continue;
      }

      console.warn("Cannot identify overlay layer type for "+entry.source)
    }
  }

  function checkSize() {
    var small = map.getSize()[0] < 600;
//    attribution.setCollapsible(small);
//    attribution.setCollapsed(small);
  }

  window.addEventListener('resize', checkSize);
  checkSize();

/*
  // eslint-disable-next-line no-unused-vars
  const layerSwitcher = new LayerSwitcher({ tipLabel: 'Layers', activationMode: 'click', startActive: true, target: document.getElementById('switcher') });


//  map.addControl(layerSwitcher);
  activeLayer.setVisible(true);

  LayerSwitcher.renderPanel(map, document.getElementById('switcher'), {});
  //  layerSwitcher.renderPanel(map, $('#switcher'), { reverse: true });

  var extent = activeLayer.getExtent();
  console.log("extent: " + extent)
  map.getView().fit(extent);
  */
});

}
