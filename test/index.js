'use strict';



const Code = require('code');
const expect = Code.expect;
const Hapi = require('hapi');
const Plugin = require('../');
const Provider = require('../lib/provider');


describe('Midge-Plugin:', () => {

	let server;
	beforeEach(() => {

		server = new Hapi.Server();
		server.register(Plugin);

	});


	it('should decorate server with \'services\'-reference to instance of Provider', () => {

		expect(server.services)
			.instanceof(Provider);

	});



	it('should register route-handler: inject', async () => {

		server.route({
			method: 'GET',
			path: '/test',
			handler: {
				inject({ $query, $payload, $params, $injector }) {

					expect($payload)
						.to.be.null();

					expect($query)
						.to.equal({ asd:'123' })

					expect($params)
						.to.be.an.object();

					expect($injector.get)
						.to.be.a.function();

					expect($injector.invoke)
						.to.be.a.function();

					return $query.asd;
				}
			}
		});

		let { result } = await server.inject({
			method: 'GET',
			url: '/test?asd=123'
		});

		expect(result)
			.to.equal('123');

	});







	describe('Registering a factory', () => {


		it('should throw error if service already exists', async () => {

			await server.services.register('a', () => 123);

			try {
				await server.services.register('a', () => 312);
				throw new Error();
			} catch(e) {
				expect(e).to.be.an.error(`Service 'a' already exists`);
			}

		});


		it('should make it available through get(serviceName)', async () => {

			await server.services.register('testA', () => Promise.resolve(123));

			expect(server.services.get('testA'))
				.to.equal(123);

		});





		it('should register with dependencies', async () => {

			await server.services.register('testA', () => Promise.resolve(1231));
			await server.services.register('testB', ({ testA }) => Promise.resolve(testA));

			expect(server.services.get('testB'))
				.to.equal(1231);

		});




	});



	describe('Registering a value', () => {


		it('should throw error if value already exists', () => {

			server.services.value('a', 123);

			try {
				server.services.value('a', 123);
				throw new Error();
			} catch(e) {
				expect(e).to.be.an.error(`Service 'a' already exists`);
			}

		});


		it('should make it available through get(serviceName)', () => {

			server.services.value('test', { test:123 });

			let service = server.services.get('test');

			expect(service)
				.to.equal({ test:123 });

		});


	});



	describe('Invoking a function', () => {

		it('should return expected value', () => {

			let handler = () => 123;

			expect(server.services.invoke(handler))
				.to.equal(123);

		});

		it('should throw error on unknown dependency', () => {

			let handler = ({ a }) => 123;

			expect(() => server.services.invoke(handler))
				.to.throw(`Unknown service 'a'`);

		});


		it('should inject dependencies', async () => {

			server.services.value('a', 123);
			await server.services.register('b', () => Promise.resolve(123));

			let handler = ({ a, b }) => a;

			expect(server.services.invoke(handler))
				.to.equal(123);

		});


	});


	describe('Invoking a function inside an invoked function with locals using $injector.invoke', () => {

		it('should have use parentProxy', () => {

			server.services.value('a', 123);

			const handler = ({ $injector }) => {

				return $injector.invoke(({ b, a }) => b+a);

			};

			let res = server.services.invoke(handler, { b: 'asd' });

			expect(res)
				.to.equal('asd123');

		});

	});


});

