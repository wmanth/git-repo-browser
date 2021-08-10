import chai from 'chai';
import chaiHttp from 'chai-http';
import Server from '../src/server';
import Config from '../src/classes/Config';
import { RepoInventory, RepoType } from '../../common/dist/types';
import api from '../src/apis/api';

chai.use(chaiHttp);
let should = chai.should();

let inventory = {
	localRepo: {
		name: "Local Repo",
		type: RepoType.local
	},
	githubRepo: {
		name: "GitHub Repo",
		type: RepoType.github
	},
};

class TestConfig implements Config {
	getRepoInventory(): Promise<RepoInventory> {
		return Promise.resolve(inventory);
	}
	getRepoAPI(_repoId: string): Promise<api> {
		throw new Error(`Method for not implemented.`);
	}
}

const server = new Server(new TestConfig());

describe('Repos', () => {
	describe('GET /api/repos', () => {
		it('should return an inventory object containing all repos', () => {
			chai.request(server.app)
			.get('/api/repos')
			.end((_err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('Object');
				Object.keys(res.body).length.should.be.eql(2);
				res.body.localRepo.name.should.be.eql('Local Repo');
				res.body.localRepo.type.should.be.eql('local');
				res.body.githubRepo.name.should.be.eql('GitHub Repo');
				res.body.githubRepo.type.should.be.eql('github');
			});
		});
	});
});
