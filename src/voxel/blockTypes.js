import auth from '../auth';
import coding from './coding';
import consts from '../constants';

var types = {};

export default {
  loadMany(ids, force) {
    var pendingIds = force ? ids : ids.filter(id => !types[id]);

    if(!pendingIds.length) {
      return Promise.resolve([]);
    }

    return fetch(consts.SERVER_ADDRESS() + '/inventory/blockTypes?ids=' + pendingIds, {
      method: 'GET',
      headers: auth.getAuthHeaders()
    }).then(response => response.json()).then(response => {

      response.forEach(type => {
        types[type.id] = type;
      });

      var newItems = response.filter(type => type.code && pendingIds.includes(type.id));
      var registerPromises = newItems.map(coding.registerBlockType);
      return Promise.all(registerPromises);
    });
  },
  load(id, force) {
    return this.loadMany([id], force);
  },
  getById(id) {
    return types[id];
  },
  add(type) {
    types[type.id] = type;
  }
};
