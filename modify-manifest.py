#!/usr/bin/env python3

import json

manifest = json.loads(open("manifest.json").read())

del manifest["applications"]

open("manifest.json", "w").write(json.dumps(manifest, indent=4))
