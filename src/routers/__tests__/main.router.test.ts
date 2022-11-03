import request from 'supertest';
import app from '../../app';

describe('main route tests', function () {
    test('responds health API with OK status', function (done) {
        request(app)
            .get('/health')
            .expect(200)
            .end((err, res) => {
                expect(res).toHaveProperty('text', 'OK');
                done();
            });
    });

    test('responds home page API with welcome message', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end((err, res) => {
                expect(res).toHaveProperty('text', 'welcome everyone');
                done();
            });
    });
});
