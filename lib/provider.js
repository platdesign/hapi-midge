'use strict';


class InjectorError extends Error {}



class Injector {

	constructor(locals, parentProxy) {

		locals.$injector = this;

		this._proxy = new Proxy(locals, {
			get(locals, key) {

				if(!locals.hasOwnProperty(key)) {
					if(parentProxy) {
						return parentProxy[key];
					} else {
						throw new InjectorError(`Unknown service '${key}'`);
					}
				} else {
					return locals[key];
				}

			}
		});
	}


	get(name) {
		return this._proxy[name];
	}


	invoke(fn, locals) {

		if(!locals) {
			return fn(this._proxy);
		} else {
			let injector = new Injector(locals, this._proxy);
			return injector.invoke(fn);
		}

	}

}



class ProviderError extends Error {};

module.exports = class Provider {

	constructor() {
		this._cache = {};
		this.$injector = new Injector(this._cache);
	}

	async register(name, factroy) {
		if(this._cache.hasOwnProperty(name)) {
			throw new ProviderError(`Service '${name}' already exists`);
		}

		return this._cache[name] = await this.invoke(factroy);
	}

	value(name, value) {
		if(this._cache.hasOwnProperty(name)) {
			throw new ProviderError(`Service '${name}' already exists`);
		}
		return this._cache[name] = value;
	}

	get(name) {
		return this.$injector.get(name);
	}

	invoke(fn, locals) {
		return this.$injector.invoke(fn, locals);
	}

}

