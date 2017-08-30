'use strict';


const Provider = require('./lib/provider');



const plugin = module.exports = function(server, options, next) {

	const provider = new Provider(options.defaults);

	server.decorate('server', 'services', provider);

	server.handler('inject', function(route, factory) {
		return function(req, reply) {
			reply(provider.invoke(factory, {
				$payload: req.payload,
				$params: req.params,
				$query: req.query,
				$req: req
			}));
		};
	});

	next();
};



plugin.attributes = {
	name: 'midge'
};
