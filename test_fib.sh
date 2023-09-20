#!/bin/bash -e

# 0. install deps
#   a. npm install
#   b. install circom (after that circom binary is located at ~/.cargo/bin).
#       1. git clone https://github.com/iden3/circom.git
#       2. cd circom/circom
#       3. cargo install --path .
#

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

# 6. gen circom verifer for pil stark
npm run fibonacci_genverifier
npm run fibonacci_compileverifier
# 7. translate circom verifier to compressor (c12a) pil
#    which is a variant of vanilla PLONK with 12 vars
npm run fibonacci_c12setup

