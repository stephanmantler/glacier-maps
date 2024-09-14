#!/usr/bin/python3

import glob
from layertools import *

def runWebPack():
  print("🚛 running webpack ...")
  subprocess.call(['npx','webpack'])

basedir = '/var/www/is.icecaves.map/mapdata'
tiledirs = glob.glob(basedir + '/*/')
tiledirs.sort()

layers = readLayerDefs(tiledirs)
writeCombinedMap(layers)
runWebPack()
print("🦊 all done!")
