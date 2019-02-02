/**
 * glTF的二进制包(.bin文件)测试解析代码
 * 测试代码
 */

var fs = require('fs');
var toArrayBuffer = require('to-array-buffer')

var baseUrl = './public/model/qiangTest/'
var gltfFile = 'qiangTest.gltf'

//.gltf索引，实际为json文件
var jsonIndex = JSON.parse(fs.readFileSync(baseUrl+gltfFile,'utf-8'));

/**
 * 由于只有一个buffer 未作map处理
 */

var binaryBuffer  = fs.readFileSync(baseUrl+jsonIndex.buffers[0].uri)

var binaryArrayBuffer = toArrayBuffer(binaryBuffer);

var buf = binaryArrayBuffer;

// let idx = new DataView(buf, 0, 16);
// for (var i = 0; i < 16; i += 2) {
//     console.log(idx.getUint16(i, true));
// }

// console.log('\n\n\n');

//672
let vtx = new DataView(buf, 160, 336);
for (var v = 0; v < 336; v += 4) {
    console.log(vtx.getFloat32(v, true));
}


/**
 * 5122型对应short，占2Byte
 */

// let idx = new DataView(buf, 832, 72);
// for (var i = 0; i < 72; i += 2) {
//     console.log(idx.getiUnt16(i, true));
// }
// 
// console.log('\n\n\n');

/**
 * 5126型对应float，占4Byte
 */
// let vtx = new DataView(buf, 904, 576);
// for (var v = 0; v < 576; v += 4) {
//     console.log(vtx.getFloat32(v, true));
// }
