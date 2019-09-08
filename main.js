import {Map, View} from 'ol';
import Tile from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import Group from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import {defaults} from 'ol/control';

import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import Attribution from 'ol/control/Attribution';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';

import LayerSwitcher from 'ol-layerswitcher';

//FIXME     var progress = new Progress(document.getElementById('progress'));


     var parser = new WMTSCapabilities();
     var map;
     var attribution = new Attribution({
     collapsible: false
     });

     fetch('/cache/wmts/1.0.0/WMTSCapabilities.xml').then(function(response) {
     return response.text();
     }).then(function(text) {
     var caps = parser.read(text);

         function makeSource(layerName) {
             var options = optionsFromCapabilities(caps, {
         layer: layerName,
         matrixSet: 'EPSG:3857'
         });
         var source = new WMTS(/** @type {!olx.source.WMTSOptions} */ (options));
/*FXME         source.on('tileloadstart', function() { progress.addLoading(); });
         source.on('tileloadend', function() { progress.addLoaded(); });
         source.on('tileloaderror', function() { progress.addLoaded(); });
*/
         return source;
     }

     var lmiSource = makeSource("LMI_Kort"); 
     lmiSource.setAttributions('Landscape map layer © <a href="http://www.lmi.is/">Landmælingar Íslands / National Land Survey of Iceland</a>')

     var flaa20181114Source = makeSource("flaajokull_20181114");

     var treasure201712Source = makeSource("treasure_20171211");
     var treasure20180228dsmSource = makeSource("treasure_20180228_dsm");
     var treasure20180228Source = makeSource("treasure_20180228");
     var treasure20180604Source = makeSource("treasure_20180604");
     var treasure20180713Source = makeSource("treasure_20180713");
     var treasure20180802Source = makeSource("treasure_20180802");
     var treasure20181101Source = makeSource("treasure_20181101");
     var treasure20181122Source = makeSource("treasure_20181122");
     var treasure20181221Source = makeSource("treasure_20181221");
     var treasure20190124Source = makeSource("treasure_20190124");
     var treasure20190224Source = makeSource("treasure_20190224");
     var treasure20190321Source = makeSource("treasure_20190321");
     var treasure20190601Source = makeSource("treasure_20190601");
     var treasure20190601RSource = makeSource("treasure_20190601_relief");
     var treasure20190707Source = makeSource("treasure_20190707");
     var treasure20190707RSource = makeSource("treasure_20190707_relief");
     var treasure20190906Source = makeSource("treasure_20190906");
     var treasure20190906RSource = makeSource("treasure_20190906_relief");
     var heinaberg20180531Source = makeSource("heinaberg_20180531");
     var heinaberg20180719Source = makeSource("heinaberg_20180719");
     var treasureSource = makeSource("treasure_20180401");

     treasureSource.setAttributions('ice cave situation maps © <a href="http://www.hafjall.is/">Háfjall ehf.</a>')

     var anakonda20180317Source = makeSource("anakonda");
     var anakonda20180317dsmSource = makeSource("anakonda_dsm");


     var layers = {
         "flaajokull_20181114": new Tile({ opacity: 1, source: flaa20181114Source,
             type: 'base',
             title:"Orthophoto", visible:false,
             extent: [-1738999.790294,9433457.272662, -1737593.748747,9434980.388312] }),

         "heinaberg_20180531": new Tile({ opacity: 1, source: heinaberg20180531Source,
             type: 'base',
             title:"Orthophoto", visible:false,
             extent: [-1749372.106, 9423958.437, -1742823.105, 9427937.081] }),
         "heinaberg_20180719": new Tile({ opacity: 1, source: heinaberg20180719Source,
             type: 'base',
             title:"Ortho, 2018-09-19", visible:false,
             extent: [-1751036.133, 9424069.48, -1744365.938, 9427546.391] }),
         "treasure_20180713": new Tile({ opacity: 1, source: treasure20180713Source,
             type: 'base',
             title:"Ortho, 2018-07-13", visible:false,
             extent: [-1809304.555, 9377281.594, -1806845.776, 9378852.344] }),
         "treasure_20180802": new Tile({ opacity: 1, source: treasure20180802Source,
             type: 'base',
             title:"Ortho, 2018-08-02", visible:false,
             extent: [-1809421.478, 9377079.907, -1806666.316, 9378798.001 ] }),
         "treasure_20181101": new Tile({ opacity: 1, source: treasure20181101Source,
             type: 'base',
             title:"Ortho, 2018-11-01", visible:false,
             extent: [-1809421.478, 9377079.907, -1806666.316, 9378798.001 ] }),
         "treasure_20181122": new Tile({ opacity: 1, source: treasure20181122Source,
             type: 'base',
             title:"Ortho, 2018-11-22", visible:false,
             extent: [-1809119.928, 9377223.438, -1805971.983, 9378762.046 ] }),
         "treasure_20181221": new Tile({ opacity: 1, source: treasure20181221Source,
             type: 'base',
             title:"Ortho, 2018-12-21", visible:false,
             extent: [-1809024.808, 9377170.800, -1806497.515, 9378733.064 ] }),
         "treasure_20190124": new Tile({ opacity: 1, source: treasure20190124Source,
             type: 'base',
             title:"Ortho, 2019-01-24", visible:false,
             extent: [-1809024.808, 9377170.800, -1806497.515, 9378733.064 ] }),
         "treasure_20190224": new Tile({ opacity: 1, source: treasure20190224Source,
             type: 'base',
             title:"Ortho, 2019-02-24", visible:false,
             extent: [-1809080.226, 9377163.681, -1806477.144, 9378915.457 ] }),
         "treasure_20190321": new Tile({ opacity: 1, source: treasure20190321Source,
             type: 'base',
             title:"Ortho, 2019-03-21", visible:false,
             extent: [-1809315, 9377150, -1806550, 9378940 ] }),
         "treasure_20190601": new Tile({ opacity: 1, source: treasure20190601Source,
             type: 'base',
             title:"Ortho, 2019-06-01", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
         "treasure_20190601_relief": new Tile({ opacity: 1, source: treasure20190601RSource,
             type: 'base',
             title:"Relief, 2019-06-01", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
         "treasure_20190707": new Tile({ opacity: 1, source: treasure20190707Source,
             type: 'base',
             title:"Ortho, 2019-07-07", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
         "treasure_20190707_relief": new Tile({ opacity: 1, source: treasure20190707RSource,
             type: 'base',
             title:"Relief, 2019-07-07", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
         "treasure_20190906": new Tile({ opacity: 1, source: treasure20190906Source,
             type: 'base',
             title:"Ortho, 2019-09-06", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
         "treasure_20190906_relief": new Tile({ opacity: 1, source: treasure20190906RSource,
             type: 'base',
             title:"Relief, 2019-09-06", visible:false,
             extent: [-1809895, 9376929, -1806450, 9378960 ] }),
     };

     var treasure_20171211 = new Tile({ opacity: 1, source: treasure201712Source, type: 'base', title:"Ortho, 2017-12-11", visible:false })
     var treasure_20180604 = new Tile({ opacity: 1, source: treasure20180604Source, type: 'base', title:"Ortho, 2018-06-04", visible:false })
     var treasure_20180401 = new Tile({ opacity: 1, source: treasureSource, type: 'base', title:"Ortho, 2018-04-01", visible:false })
     var treasure_20180228 = new Tile({ opacity: 1, source: treasure20180228Source, type: 'base', title:"Ortho, 2018-02-28", visible:false })
     var treasure_20180228dsm = new Tile({ opacity: 0.6, source: treasure20180228dsmSource, title:"DSM, 2018-02-28", visible:false })

     var anakonda_20180317 = new Tile({ opacity: 1, source: anakonda20180317Source, title:"Orthophoto", visible:false })
     var anakonda_20180317dsm = new Tile({ opacity: 0.6, source: anakonda20180317dsmSource, title:"Terrain ('hillshade')", visible:false })

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

     function styleFunction(feature, resolution) {
         var status = feature.get('status');
         if (status == '2') {
         return style_conf2;
         }
         return style;
     }

     var extents_2017_18 = new Vector({
         source: new Vector({
         url: 'http://map.icecaves.is/data/IceCaveExtents.geojson',
         format: new GeoJSON()
         }),
         style: styleFunction,
         title: "Ice Cave Extents (2017-18)"
     });

     var gae = function(e) {
         ga('send', {
         hitType: 'event',
         eventCategory:'Layers',
         eventAction:this.getVisible() ? 'show':'hide',
         eventLabel:this.get('title')
         })
     }
/*
     treasure_20171211.on('change:visible', gae, treasure_20171211);
     treasure_20180713.on('change:visible', gae, treasure_20180713);
     treasure_20180802.on('change:visible', gae, treasure_20180802);
     treasure_20181101.on('change:visible', gae, treasure_20181101);
     treasure_20181122.on('change:visible', gae, treasure_20181122);
     treasure_20181221.on('change:visible', gae, treasure_20181221);
     treasure_20180604.on('change:visible', gae, treasure_20180604);
     treasure_20180401.on('change:visible', gae, treasure_20180228);
     treasure_20180228.on('change:visible', gae, treasure_20180228);
     treasure_20180228dsm.on('change:visible', gae, treasure_20180228dsm);
*/
     map = new Map({
         layers: [
         new Tile({ source: lmiSource, type: 'overlay' /* 'basebase' */, title:'Base Map', visible: false }),
         /*
         new ol.layer.Group({
             title: "Anakonda, 2018-03-17",
             layers: [
             anakonda_20180317,
             anakonda_20180317dsm,
             ]
         }),
         */
         /*
         new ol.layer.Group({
             title: "Heinabergslón, 2018-05-31",
             layers: [
             layers["heinaberg_20180531"],
             ]
         }),
     */
     /*
         new ol.layer.Group({
             title: "Heinabergslón",
             layers: [
             layers["heinaberg_20180719"],
             ]
         }),
         new ol.layer.Group({
             title: "Fláajökull",
             layers: [
             layers["flaajokull_20181114"],
             ]
     }),
     */
         new Group({
             title: "Treasure Island",
             layers: [
             treasure_20171211,
             treasure_20180228,
             treasure_20180401,
             treasure_20180604,
             layers["treasure_20180713"],
             layers["treasure_20180802"],
             layers["treasure_20181101"],
             layers["treasure_20181122"],
             layers["treasure_20181221"],
             layers["treasure_20190124"],
             layers["treasure_20190224"],
             layers["treasure_20190321"],
             layers["treasure_20190601"],
             layers["treasure_20190601_relief"],
             layers["treasure_20190707"],
             layers["treasure_20190707_relief"],
             layers["treasure_20190906"],
             layers["treasure_20190906_relief"],
             ]
         }),
         /*
         new ol.layer.Group({
             title: "Treasure Island, 2018-02-28",
             layers: [
             treasure_20180228dsm,
             ]
         }),
         */
         /* extents_2017_18 */
         ],
         target: 'map',
         controls: defaults({attribution: false}).extend([attribution]),
         logo: {src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAHwmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0wMi0yMlQxMjoyMDoxMFoiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTAzLTEzVDA5OjM4OjA1WiIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMy0xM1QwOTozODowNVoiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZDY0YzA2MmMtNDYxNy00ZmQ0LWE3NjUtMmYyNjlhMmI1YWJiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YTQ0ZDFiNmQtODQyYi1lMTQ2LWFhYmQtOTg5M2Y1YmI4NDNjIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6M2NhMDY3ZGMtNjQ2OC00OGIyLTk4ZTEtZjE1NTEwNTdhNmQ5IiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSIzMDAwMDAwLzEwMDAwIiB0aWZmOllSZXNvbHV0aW9uPSIzMDAwMDAwLzEwMDAwIiB0aWZmOlJlc29sdXRpb25Vbml0PSIyIiBleGlmOkNvbG9yU3BhY2U9IjY1NTM1IiBleGlmOlBpeGVsWERpbWVuc2lvbj0iMTAwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMTAwIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozY2EwNjdkYy02NDY4LTQ4YjItOThlMS1mMTU1MTA1N2E2ZDkiIHN0RXZ0OndoZW49IjIwMTctMDItMjJUMTI6MjA6MTBaIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NDhhZjM3YjItNzlmZS00Njc4LThkODItNDU3NTVlYzFiYTRiIiBzdEV2dDp3aGVuPSIyMDE3LTAyLTIyVDEyOjM0OjUzWiIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5j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", href:"http://www.hafjall.is/"},
         view: new View({
         center: [-1807300,9377900],
         zoom: 16
         })
     });
     function checkSize() {
         var small = map.getSize()[0] < 600;
         attribution.setCollapsible(small);
         attribution.setCollapsed(small);
         fixContentHeight();
     }
     function fixContentHeight(){
         var viewHeight = $(window).height();
         var header = $("div#head");
         var footer = $("div#foot");
         var content = $("div#map");
         var contentHeight = viewHeight - header.outerHeight() - footer.outerHeight() - 40;
         content.height(contentHeight);
         map.updateSize();
     }
     window.addEventListener('resize', checkSize);
     checkSize();

     var layerSwitcher = new LayerSwitcher({ tipLabel: 'Layers' });
  		map.addControl(layerSwitcher);
			layerSwitcher.showPanel();

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

     var defaultLocation = "treasure_20190906";
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
    layers[defaultLocation].setVisible(true);
    var extent = layers[defaultLocation].getExtent();
    console.log("extent: " + extent)
    map.getView().fit(extent);

     });

     
