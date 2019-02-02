/**
 * glTF的二进制包(.bin文件)测试解析代码
 * 测试代码
 */

var fs = require('fs');
var toArrayBuffer = require('to-array-buffer')

/**
 * 写入到文件的函数
 * @param {*} string 要输出的字符串
 * @param {*} filepath 路径
 */
function writeOutputlog(string,filepath){
    fs.exists(filepath, function(exists) {
        if(exists){
            fs.unlink(filepath,function(success){
                if(success){
                    fs.writeFile(filepath, string,  function(err) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("文件写入成功");
                     });
                }else{
                    console.log('文件已存在，删除失败')
                }
            });
        }else{
            fs.writeFile(filepath, string,  function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log("文件写入成功");
             });
        }
    });
}


/**
 * 输出流
 * @param {*} string 
 */
function outputlog(string){
    output = output + string + '\n';
}

/**
 * 5122，short型二进制解析
 * @param {*} buf 二进制流
 * @param {*} bufOffset 起始位置
 * @param {*} bufLength 偏移量
 */
function read5122(buf,bufOffset,bufLength){
    let idx = new DataView(buf, bufOffset, bufLength);
    for (var i = 0; i < bufLength; i += 2) {
        outputlog(i+' '+idx.getUint16(i, true));
    }
}

/**
 * 5123，unsigned short型二进制解析
 * @param {*} buf 二进制流
 * @param {*} bufOffset 起始位置
 * @param {*} bufLength 偏移量
 */
function read5123(buf,bufOffset,bufLength){
    let idx = new DataView(buf, bufOffset, bufLength);
    for (var i = 0; i < bufLength/2; i += 1) {
        outputlog(i+': '+idx.getUint16(i*2, true));
    }
}

/**
 * 5126，float型二进制解析
 * @param {*} buf 二进制流
 * @param {*} bufOffset 起始位置
 * @param {*} bufLength 偏移量
 */
function read5126(buf,bufOffset,bufLength){
    let vtx = new DataView(buf, bufOffset, bufLength);

    // 逐行输出的，不区分XYZ；
    // for (var v = 0; v < bufLength; v += 4) {
    //     console.log(vtx.getFloat32(v, true));
    // }

    // 区分XYZ的
    for (var v = 0; v < bufLength/12; v += 1) {

        outputlog('点'+v+'的X: '+vtx.getFloat32(v*12, true));
        outputlog('点'+v+'的Y: '+vtx.getFloat32(v*12+4, true));
        outputlog('点'+v+'的Z: '+vtx.getFloat32(v*12+8, true));
        outputlog('');
    }
}


/**
 * 建立访问器对应字符流索引
 * @param {*} gltfFile GLTF对象
 */
function initAccessorsIndex(gltfFile){
    var indexList = [];

    var gltfAccessors = gltfFile.accessors
    for(var l = 0; l < gltfAccessors.length; l++){
        var bufferViewId = gltfAccessors[l].bufferView;

        //计算起始位置
        if(bufferViewId == 0){
            var accessorBufferViewByteOffset = 0;
        }else{
            var accessorBufferViewByteOffset = gltfFile.bufferViews[bufferViewId].byteOffset;
        }
   
        // 对于同一bufferView拥有多个访问器的情况，重新设定起始位置。
        if(gltfAccessors[l].byteOffset){        
            var accessorByteOffset = accessorBufferViewByteOffset + gltfAccessors[l].byteOffset;
        }else{
            var accessorByteOffset = accessorBufferViewByteOffset; 
        }

        //计算长度
        var accessorBufferViewLength =  gltfFile.bufferViews[bufferViewId].byteLength;

        //对于同一bufferView拥有多个访问器的情况，重新设定长度，即bufferview的长度，减去该访问器的下一个访问器的起始位置。
        if(l<gltfAccessors.length-1){ //防越界
            if(gltfAccessors[l+1].byteOffset){
                var accessorLength = accessorBufferViewLength - gltfAccessors[l+1].byteOffset;
            }else{
                var accessorLength = accessorBufferViewLength;
            }
        }else{
            var accessorLength = accessorBufferViewLength;
        }
        if(gltfAccessors[l].byteOffset){
            accessorLength = accessorLength - gltfAccessors[l].byteOffset
        }

        
        //貌似暂时就需要建立这些索引，不够再加

        indexList.push({
            "accessor":l,
            "bufferView": bufferViewId,
            "buffer": gltfFile.bufferViews[bufferViewId].buffer,
            "bufferOffset":accessorByteOffset,
            "bufferLength":accessorLength,
            "componentType": gltfAccessors[l].componentType,
            "count": gltfAccessors[l].count,
            "type": gltfAccessors[l].type
          })
    }

    return indexList;
}




/**
 * 测试程序主函数
 */
var baseUrl = './public/model/qiangTest/'
var gltfFile = 'qiangTest.gltf'

//.gltf索引，实际为json文件
var jsonIndex = JSON.parse(fs.readFileSync(baseUrl+gltfFile,'utf-8'));
// 由于只有一个buffer 未作map处理
var binaryBuffer  = fs.readFileSync(baseUrl+jsonIndex.buffers[0].uri)
var buf = toArrayBuffer(binaryBuffer);

//建立完整索引
var indexList = initAccessorsIndex(jsonIndex);

//初始化输出流
var output = '';


var meshes = jsonIndex.meshes;
for(let i=0;i<meshes.length;i++){
    outputlog('网格: '+i+' ;');
    outputlog('(使用材质编号: ' + meshes[i].primitives[0].material + ' , 网格位置 对应访问器编号: '+meshes[i].primitives[0].attributes.POSITION+', 网格法向量 对应访问器编号: ' + meshes[i].primitives[0].attributes.NORMAL + ', indices编号: ' + meshes[i].primitives[0].indices + ' )');
    outputlog('----------');
    
    if(meshes[i].primitives[0].attributes.POSITION){
        outputlog(i+'网格位置 对应访问器编号: ' + meshes[i].primitives[0].attributes.POSITION + ', ')
        outputlog(i+`网格位置 访问器对应bufferview: ${indexList[meshes[i].primitives[0].attributes.POSITION].bufferView}，访问器对应buffer: ${indexList[meshes[i].primitives[0].attributes.POSITION].buffer}，共计${indexList[meshes[i].primitives[0].attributes.POSITION].count}个元素，属于 ${indexList[meshes[i].primitives[0].attributes.POSITION].type}`)
        switch(indexList[meshes[i].primitives[0].attributes.POSITION].componentType){
            case 5123:{
                read5123(buf,indexList[meshes[i].primitives[0].attributes.POSITION].bufferOffset,indexList[meshes[i].primitives[0].attributes.POSITION].bufferLength);
                break;
            };
            case 5126:{
                read5126(buf,indexList[meshes[i].primitives[0].attributes.POSITION].bufferOffset,indexList[meshes[i].primitives[0].attributes.POSITION].bufferLength);
                break;
            };
            default:break;
        }
    }

    if(meshes[i].primitives[0].attributes.NORMAL){
        outputlog('----------');
        outputlog(i+'网格法向量 对应访问器编号: ' + meshes[i].primitives[0].attributes.POSITION + ', ')
        outputlog(i+`网格法向量 访问器对应bufferview: ${indexList[meshes[i].primitives[0].attributes.NORMAL].bufferView}，访问器对应buffer: ${indexList[meshes[i].primitives[0].attributes.NORMAL].buffer}，共计${indexList[meshes[i].primitives[0].attributes.NORMAL].count}个元素，属于 ${indexList[meshes[i].primitives[0].attributes.NORMAL].type}`)
        switch(indexList[meshes[i].primitives[0].attributes.NORMAL].componentType){
            case 5123:{
                read5123(buf,indexList[meshes[i].primitives[0].attributes.NORMAL].bufferOffset,indexList[meshes[i].primitives[0].attributes.NORMAL].bufferLength);
                break;
            };
            case 5126:{
                read5126(buf,indexList[meshes[i].primitives[0].attributes.NORMAL].bufferOffset,indexList[meshes[i].primitives[0].attributes.NORMAL].bufferLength);
                break;
            };
            default:break;
        }
    }

    if(meshes[i].primitives[0].indices){
        outputlog('----------');
        outputlog(i+'网格indices 对应访问器编号: ' + meshes[i].primitives[0].indices + ', ')
        outputlog(i+`网格indices 访问器对应bufferview: ${indexList[meshes[i].primitives[0].indices].bufferView}，访问器对应buffer: ${indexList[meshes[i].primitives[0].indices].buffer}，共计${indexList[meshes[i].primitives[0].indices].count}个元素，属于 ${indexList[meshes[i].primitives[0].indices].type}`)
        switch(indexList[meshes[i].primitives[0].indices].componentType){
            case 5123:{
                read5123(buf,indexList[meshes[i].primitives[0].indices].bufferOffset,indexList[meshes[i].primitives[0].indices].bufferLength);
                break;
            };
            case 5126:{
                read5126(buf,indexList[meshes[i].primitives[0].indices].bufferOffset,indexList[meshes[i].primitives[0].indices].bufferLength);
                break;
            };
            default:break;
        }
    }
    
    outputlog('')
    outputlog('---------------------------------------------------------------------------------------------------')
    outputlog('')
}


//命令行打印
// console.log(output)
//写入到文件
writeOutputlog(output,'./test/output.txt')


/**
 * 测试区
 */

//  console.log(indexList)

//  writeOutputlog(JSON.stringify(indexList),'./test/output.txt')

