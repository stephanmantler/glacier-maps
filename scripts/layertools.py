import glob
from os import path
from osgeo import ogr
import subprocess

def readLayerDefs(tiledirs):
  print("🚀 enumerating tiledir...")
  layers = []
  for tiledir in tiledirs:
    shapes = glob.glob(tiledir + '*shp')
    if len(shapes) != 1:
      print("## skipping " + tiledir)
      continue
    shapefile = shapes[0]

    driver = ogr.GetDriverByName("ESRI Shapefile")
    dataSource = driver.Open(shapefile, 0)
    layer = dataSource.GetLayer()
    spatialRef = layer.GetSpatialRef()
    extent = layer.GetExtent()
    authority = spatialRef.GetAuthorityCode(None)

    if authority != '3857':
      print("💥 unexpected authority code: " + authority + ", skipping " + tiledir)
      continue

    layers.append([ tiledir, extent, shapefile ])
  return layers

def writeCombinedMap(layers):
  print("🌐 writing combined.map ...")

  mapfile = open("/var/www/is.icecaves.map/mapfiles/combined.map", "w")

  mapfile.write("""MAP
  NAME "maps.stepman.is"
  STATUS ON
  SIZE 1000 1000
  #EXTENT 439300 7109000 440100 7110200

  IMAGETYPE png
  UNITS DD

  PROJECTION
    "init=epsg:3857"
  END #PROJECTION

  WEB
    IMAGEPATH "/var/www/is.icecaves.map/map_tmp"
    IMAGEURL "/map_tmp/"
    METADATA
    'wms_enable_request' '*'
    'wms_srs' 'EPSG:32628'
    #'wms_srs' 'EPSG:32628 EPSG:4326 EPSG:3857'
    END #METADATA
  END #WEB
  """)

  for layer in layers:
    tiledir = layer[0]
    extent = layer[1]
    shapefile = layer[2]

    mapfile.write("\n")
    mapfile.write("  ## from " + tiledir + " (via regen.py)\n")
    mapfile.write("  LAYER\n")
    mapfile.write("    NAME '"+path.basename(path.normpath(tiledir))+"'\n")
    mapfile.write("    TYPE RASTER\n")
    mapfile.write("    STATUS ON\n")
    mapfile.write("    EXTENT {0:.3f} {2:.3f} {1:.3f} {3:.3f}\n".format(extent[0],extent[1],extent[2],extent[3]))
    mapfile.write("    TILEINDEX " + shapefile+"\n")
    mapfile.write("    TILEITEM 'LOCATION'\n")
    mapfile.write("    PROCESSING 'RESAMPLE=AVERAGE'\n")
    mapfile.write("    PROJECTION\n")
    mapfile.write("      'init=epsg:3857'\n")
    mapfile.write("    END\n")
    mapfile.write("  END #LAYER\n")

  mapfile.write("END #MAP\n")
  mapfile.close()

def writeSeedConfig(layers):
  print("🌱 writing seed config ...")
  seedfile = open("/var/www/is.icecaves.map/mapcache/seed.yaml", "w")

  layerlist = []

  for layer in layers:
    tiledir = layer[0]
    extent = layer[1]
    shapefile = layer[2]
    layername = path.basename(path.normpath(tiledir))
    layerlist.append(layername+"_cache")

  seedfile.write("""
seeds:
  ALL:
    caches: %s
    levels:
      to: 15
    coverages: [iceland]
cleanups:
  ALL:
    caches: %s
    remove_before:
      days: 16
    levels:
      from: 16

coverages:
  iceland:
      bbox: [-2785976.8069, 9167551.4244, -1462698.9733, 10119039.5525]
      srs: 'EPSG:3857'

""" % (layerlist, layerlist))
  seedfile.close()

def writeCacheConfig(layers):
  print("🚛 writing cache config ...")

  cachefile = open("/var/www/is.icecaves.map/mapcache/mapcache.yaml", "w")

  cachefile.write("""services:
  demo:
  tms:
    use_grid_names: true
    # origin for /tiles service
    origin: 'nw'
  kml:
    use_grid_names: true
  wmts:
  wms:
    md:
      title: Hafjall ehf. MapProxy
      abstract: WMS/WMTS cache owned and operated by Hafjall ehf.

layers:
""")
  for layer in layers:
    tiledir = layer[0]
    extent = layer[1]
    shapefile = layer[2]
    layername = path.basename(path.normpath(tiledir))

    cachefile.write("  - name: "+layername+"\n")
    cachefile.write("    title: "+layername+"\n")
    cachefile.write("    sources: ["+layername+"_cache]\n")

  cachefile.write("""  - name: LMI_Kort
    title: Base map, Landmaelingar Islands
    sources: [lmi_cache]
""")
  cachefile.write("""  - name: LMI_DEM
    title: IslandsDEM, Landmaelingar Islands
    sources: [lmi_dem_cache]
""")
  cachefile.write("caches:\n")

  for layer in layers:
    tiledir = layer[0]
    extent = layer[1]
    shapefile = layer[2]
    layername = path.basename(path.normpath(tiledir))

    cachefile.write("  "+layername+"_cache:\n")
    cachefile.write("    grids: [webmercator]\n")
    cachefile.write("    sources: ["+layername+"_wms]\n")
#    cachefile.write("    coverage:\n")
#    cachefile.write("       bbox: [-2056587.0588, 9101168.695, -1146597.0, 9844459.7153]\n")
#    cachefile.write("       bbox_srs: EPSG:3857\n")

  cachefile.write("""  lmi_cache:
    grids: [webmercator]
    sources: [lmi_wms]
""")

  cachefile.write("""  lmi_dem_cache:
    format: image/jpeg
    grids: [webmercator]
    sources: [lmi_dem_wms]
""")

  cachefile.write("sources:\n")

  for layer in layers:
    tiledir = layer[0]
    extent = layer[1]
    shapefile = layer[2]
    layername = path.basename(path.normpath(tiledir))

    cachefile.write("  "+layername+"_wms:\n")
    cachefile.write("    type: mapserver\n")
    cachefile.write("    req:\n")
    cachefile.write("      map: /var/www/is.icecaves.map/mapfiles/combined.map\n")
    cachefile.write("      layers: "+layername+"\n")
    cachefile.write("      transparent: true\n")
    cachefile.write("    mapserver:\n")
    cachefile.write("      binary: /usr/bin/mapserv\n")
    cachefile.write("      working_dir: /var/www/is.icecaves.map/mapfiles\n")
    cachefile.write("    coverage:\n")
    cachefile.write("      bbox: [%s,%s,%s, %s]\n" % (extent[0], extent[2], extent[1], extent[3]))
    cachefile.write("      srs: 'EPSG:3857'\n")

  cachefile.write("""
  lmi_wms:
    type: wms
    req:
      url: https://gis.lmi.is/geoserver/ows?SERVICE=WMS&
      layers: LMI_Kort
    wms_opts:
      version: 1.3.0
    http:
      ssl_no_cert_checks: true

  lmi_dem_wms:
    type: wms
    supported_srs: [EPSG:3057]
    req:
        url: https://gis.lmi.is/mapcache/wms?SERVICE=wms&
        layers: IslandsDEMDaylight
    wms_opts:
      version: 1.3.0
    http:
      ssl_no_cert_checks: true

grids:
  webmercator:
    base: GLOBAL_WEBMERCATOR
    num_levels: 22
    origin: ul
  webmercator_AN:
    base: GLOBAL_WEBMERCATOR
    bbox: [-1814636.9, 9372199.8, -1813440.3, 9373544.1]
  webmercator_TI:
    base: GLOBAL_WEBMERCATOR
  #        bbox: [-1850000.000, 9365000.000, -1750000.000, 9385000.000]
    origin: sw
  #        bbox_srs: EPSG:3857
  webmercator_LMI:
    base: GLOBAL_WEBMERCATOR
    bbox: [-2056587.0588, 9101168.695, -1146597.0, 9844459.7153]
    bbox_srs: EPSG:3857

globals:
""")
  cachefile.close()
