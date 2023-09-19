#!/bin/bash -e

# 1. install dep
npm install
# 2. compile pil, get constant pols and store to file
npm run fibonacci_buildconst
# 3. read constant pols from file and get their pc (i.e. Merkle Tree Root)
npm run fibonacci_buildconsttree
# 4. compile pil, get advice pols and store to file
npm run fibonacci_exec
# 5. read constant pols, advice pols, then run stark prover
npm run fibonacci_prove

