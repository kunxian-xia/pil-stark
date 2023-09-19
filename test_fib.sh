#!/bin/bash -e

# 1. compile pil, get constant pols and store to file
npm run fibonacci_buildconst
# 2. read constant pols from file and get their pc (i.e. Merkle Tree Root)
npm run fibonacci_buildconsttree
# 3. compile pil, get advice pols and store to file
npm run fibonacci_exec
# 4. gen stark info
npm run fibonacci_genstarkinfo
# 5. read constant pols, advice pols, then run stark prover
npm run fibonacci_prove

