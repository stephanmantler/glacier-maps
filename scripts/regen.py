#!/usr/bin/python3

import glob
from os import path
from osgeo import ogr

basedir = '/var/www/is.icecaves.map/mapdata'
tiledirs = glob.glob(basedir + '/*/')
tiledirs.sort()

layers = []

print("🚀 enumerating tiledir...")
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

#for tiledir in tiledirs:
#    shapes = glob.glob(tiledir + '*shp')
#    if len(shapes) != 1:
#        print("## skipping " + tiledir)
#        continue
#    shapefile = shapes[0]
#
#    driver = ogr.GetDriverByName("ESRI Shapefile")
#    dataSource = driver.Open(shapefile, 0)
#    layer = dataSource.GetLayer()
#    spatialRef = layer.GetSpatialRef()
#    extent = layer.GetExtent()
#    authority = spatialRef.GetAuthorityCode(None)
#
#    if authority != '3857':
#        print("## unexpected authority code: " + authority)
#        print("## skipping " + tiledir)
#        continue

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

print("🚛 writing cache config ...")

print("🦊 all done!")
