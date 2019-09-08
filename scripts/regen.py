#!/usr/bin/python3

import glob
from os import path
from osgeo import ogr

basedir = '/var/www/is.icecaves.map/mapdata'
tiledirs = glob.glob(basedir + '/*/')
tiledirs.sort()

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
        print("## unexpected authority code: " + authority)
        print("## skipping " + tiledir)
        continue

    print("")
    print("## from " + tiledir + " (via regen.py)")
    print("LAYER")
    print("  NAME '"+path.basename(path.normpath(tiledir))+"'")
    print("  TYPE RASTER")
    print("  STATUS ON")
    print("  EXTENT {0:.3f} {2:.3f} {1:.3f} {3:.3f}".format(extent[0],extent[1],extent[2],extent[3]))
    print("  TILEINDEX " + shapefile)
    print("  TILEITEM 'LOCATION'")
    print("  PROCESSING 'RESAMPLE=AVERAGE'")
    print("  PROJECTION")
    print("    'init=epsg:3857'")
    print("  END")
    print("END")

    
