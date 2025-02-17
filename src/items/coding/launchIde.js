import coding from '../../coding';
import inventory from '../../inventory';
import ide from '../../ide';
import events from '../../events';
import consts from '../../constants';

export default {
  async create(position) {
    let code =
`export default class NewItem {
  constructor(world, metadata) {
    this.world = world;
    this.metadata = metadata;
    console.log(\`activating \${this.metadata.name}\`);
  }

  onExecute(position) {
    alert(\`executing \${this.metadata.name} on \${position}\`);
  }

  onHover(payload) {
    let position = payload.position.join('|');
    console.log(\`\${this.metadata.name} hovering \${position}...\`);
  }

  onDestroy() {
    console.log(\`deactivating \${this.metadata.name}\`);
  }
}
`;
    let data = await ide.open({code});

    let codeObj = await coding.create(data.value);

    let props = {
      name: data.name,
      adjacentActive: false,
      crosshairIcon: 'code'
    };
    try {
      let newItemType = await inventory.addItemType(props, codeObj);
      events.emit(consts.events.CODE_UPDATED, {
        newId: newItemType.id,
        type: 'item',
        toolbar: position,
        operation: consts.coding.OPERATIONS.CREATE
      });
    } catch(err) {
      alert(`Error creating item code: ${err}`);
    }
  },
  async edit(item, code, position) {
    let data = await ide.open({item, code});

    let codingOperation = data.name ? coding.fork : coding.update;
    let newCode = data.value;

    let codeObj = await codingOperation(code.id, newCode);

    let inventoryOperationResult;
    let operation;

    if(data.name) {
      operation = consts.coding.OPERATIONS.FORK;
      let props = {
        name: data.name,
        adjacentActive: item.adjacentActive,
        crosshairIcon: item.crosshairIcon
      };
      inventoryOperationResult = inventory.addItemType(props, codeObj);
    } else {
      operation = consts.coding.OPERATIONS.UPDATE;
      inventoryOperationResult = inventory.updateItemCode(item.id, codeObj);
    }

    try {
      let updatedItemType = await inventoryOperationResult;
      events.emit(consts.events.CODE_UPDATED, {
        oldId: item.id,
        newId: updatedItemType.id,
        type: 'item',
        toolbar: position,
        operation
      });
    } catch(err) {
      alert(`Error updating code: ${err}`);
    }
  }
};
