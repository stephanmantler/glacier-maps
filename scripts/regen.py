#!/usr/bin/python3

import glob
import json
from os import path
from layertools import *

def loadMapset(name):
  filename = path.join("maps", name+".json")
  if not path.exists(filename):
    return {"title":"Untitled", "description":"", layers":{ "Orthophotos" : [], "Relief Maps": []}}
  with open(filename, mode="r", encoding="utf-8") as fd:
    meta = json.load(fd)
  return meta

  
def saveMapset(name, mapset):
  filename = path.join("maps", name+".json")
  with open(filename, mode="w", encoding="utf-8") as fd:
    json.dump(mapset, fd)


def categoryForLayer(tiledir):
  if tiledir.endswith("_ortho"):
    return "Orthophotos"
  if tiledir.endswith("_dsm"):
    return None
  if tiledir.endswith("_hillshade"):
    return "Relief Maps"
  raise ValueError(f"Cannot identify layer category for file name: {tiledir}")


def addLayerToMapset(layer, mapsetname, title):
  tiledir = path.basename(path.normpath(layer[0]))
  extent = layer[1]
    
  mapset = loadMapset(mapsetname)
  
  category = categoryForLayer(tiledir)
  if category is None:
    print("     🫥 skipping unkown category for %s" % tiledir)
    return

  # check if mapset already contains that layer
  for layerdef in mapset["layers"][category]:
    if layerdef["layername"] == tiledir:
      print("     ✅  already exists in %s" % mapsetname)
      return
  
  # need to add and save mapset
  print("     🔰  adding to %s" % mapsetname)
  mapset["layers"][category].append({
    "layername": tiledir,
    "title": title,
    "extent": [ extent[0],extent[2],extent[1],extent[3] ]
  })
  saveMapset(mapsetname, mapset)


def mergeMapDefinitions(metafiles, layers):
  print("💾 loading metadata")
  for metafile in metafiles:
    with open(metafile, mode="r", encoding="utf-8") as fd:
      meta = json.load(fd)
    print("  %s: %s" % (meta["name"], meta["title"]))
    # check with layers apply
    for layer in layers:
      tiledir = path.basename(path.normpath(layer[0]))
      if tiledir.startswith(meta["name"]):
        print("   -> %s" % (tiledir))
        for set in meta["mapsets"]:
          addLayerToMapset(layer, set, meta["title"])


def runWebPack():
  print("🚛 running webpack ...")
  subprocess.call(['npx','webpack'])


basedir = '/var/www/is.icecaves.map/mapdata'
tiledirs = glob.glob(basedir + '/*/')
tiledirs.sort()

metafiles = glob.glob(basedir + '/*_meta.json')
metafiles.sort()

layers = readLayerDefs(tiledirs)
writeCombinedMap(layers)
mergeMapDefinitions(metafiles, layers)
runWebPack()
print("🦊 all done!")
