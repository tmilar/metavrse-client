import events from '../../events';
import consts from '../../constants';
import world from '../../map';
import Block from '../block';
import ScriptExecutor from 'script-executor';
import coding from '../../coding';

var classes = {};
var scriptExecutor = new ScriptExecutor();

scriptExecutor.wireEvents(events, [
  consts.events.HOVER,
  consts.events.LEAVE,
  consts.events.INTERACT,
  consts.events.PLACE_ADJACENT,
  consts.events.REMOVE_ADJACENT
]);

function getId(pos) {
  return pos.join('|');
}

function getClassId(codeObj) {
  return `${codeObj.id}-${codeObj.revision.id}`;
}

async function loadClass(blockType) {
  let codeObj = await coding.get(blockType.code.id, blockType.code.revision);
  let name = blockType.name;

  let classId = getClassId(codeObj);
  let code = codeObj.code;

  console.log(`Loading code of block ${name} with ID ${classId}`);
  await scriptExecutor.loadClass(classId, code);

  classes[blockType.id] = {blockType, code: codeObj};
  console.log(`Code of block ${name} loaded`);
}

function createInstance(position, blockTypeId) {
  removeInstance(position);

  let $class = classes[blockTypeId];

  if(!$class) {
    throw new Error('Script does not exist');
  }

  let classId = getClassId($class.code);
  let blockType = $class.blockType;
  let block = new Block(position, blockType);
  let instanceId = getId(position);

  scriptExecutor.createInstance(instanceId, classId, {metadata: block, api: world});
}

function removeInstance(position) {
  let id = getId(position);

  let instance = scriptExecutor.getInstance(id);
  if(instance && instance.onDestroy) {
    instance.onDestroy();
  }

  scriptExecutor.removeInstance(id);
}

function getCode(id) {
  return classes[id].code;
}

export default {
  createInstance,
  removeInstance,
  getCode,
  loadClass
};
