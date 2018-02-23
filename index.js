'use strict';


const Provider = require('./lib/provider');

module.exports = {
	name: 'midge',
	async register(server options) {

		const provider = new Provider(options.defaults);

		server.decorate('server', 'services', provider);

		server.handler('inject', function(route, factory) {
			return function(req, h) {
				return provider.invoke(factory, {
					$payload: req.payload,
					$params: req.params,
					$query: req.query,
					$req: req
				});
			};
		});

	}
}
