const fs = require("fs");
const version = require("../package").version;
const JSONbig = require('json-bigint')({ useNativeBigInt: true, alwaysParseAsBig: true });


const F1Field = require("./f3g");
const { useConstantPolsArray, compile } = require("pilcom");
const MerkleHashGL = require("./merklehash_p.js");
const MerkleHashBN128 = require("./merklehash.bn128.js");
const buildPoseidonGL = require("./poseidon");
const buildPoseidonBN128 = require("circomlibjs").buildPoseidon;
const {interpolate} = require("./fft_p");


const argv = require("yargs")
    .version(version)
    .usage("node main_buildconsttree.js -c const.bin -p <pil.json> -s <starkstruct.json> -t <consttree.bin>  -v <verification_key.json>")
    .alias("c", "const")
    .alias("p", "pil")
    .alias("s", "starkstruct")
    .alias("t", "consttree")
    .alias("v", "verkey")
    .argv;

async function run() {
    const F = new F1Field();

    const pilFile = typeof(argv.pil) === "string" ?  argv.pil.trim() : "mycircuit.pil";
    const constFile = typeof(argv.const) === "string" ?  argv.const.trim() : "mycircuit.const";
    const starkStructFile = typeof(argv.starkstruct) === "string" ?  argv.starkstruct.trim() : "mycircuit.stark_struct.json";
    const constTreeFile = typeof(argv.consttree) === "string" ?  argv.consttree.trim() : "mycircuit.consttree";
    const verKeyFile = typeof(argv.verkey) === "string" ?  argv.verkey.trim() : "mycircuit.verkey.json";

    const starkStruct = JSON.parse(await fs.promises.readFile(starkStructFile, "utf8"));
    const pil = await compile(F, pilFile);

    const nBits = starkStruct.nBits;
    const nBitsExt = starkStruct.nBitsExt;
    const n = 1 << nBits;
    const nExt = 1 << nBitsExt;

    const constBuffBuff = new SharedArrayBuffer(pil.nConstants*8*n);
    const constBuff = new BigUint64Array(constBuffBuff)

    const constPols =  useConstantPolsArray(pil, constBuff, 0);
    await constPols.loadFromFile(constFile);

    const nPols = pil.nConstants;

    const constPolsEBuff = new SharedArrayBuffer(nPols*nExt*8);
    const constPolsE = new BigUint64Array(constPolsEBuff);

    await interpolate(constPols.$$buffer, 0, nPols, nBits, constPolsE, 0, nBitsExt);

    let MH;
    if (starkStruct.verificationHashType == "GL") {
        const poseidonGL = await buildPoseidonGL();
        MH = new MerkleHashGL(poseidonGL);
    } else if (starkStruct.verificationHashType == "BN128") {
        const poseidonBN128 = await buildPoseidonBN128();
        MH = new MerkleHashBN128(poseidonBN128);
    } else {
        throw new Error("Invalid Hash Type: "+ starkStruct.verificationHashType);
    }

    const constTree = await MH.merkelize(constPolsE, 0, nPols, nExt);

    const constRoot = MH.root(constTree);

    const verKey = {
        constRoot: constRoot
    };

    await fs.promises.writeFile(verKeyFile, JSONbig.stringify(verKey, null, 1), "utf8");

    await MH.writeToFile(constTree, constTreeFile);

    console.log("files Generated Correctly");
}

run().then(()=> {
    process.exit(0);
}, (err) => {
    console.log(err.message);
    console.log(err.stack);
    process.exit(1);
});

