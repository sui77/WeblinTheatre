module.exports =  {

    registry: {},

    add: function(name, obj) {
        this.registry[name] = obj;
    },

    has: function(name) {
        return typeof this.registry[name] != 'undefined';
    },

    get: function(name) {
        return this.registry[name];
    }
}
