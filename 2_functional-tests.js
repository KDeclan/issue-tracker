const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    // Test creating an issue with every field
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test text for the issue.',
          created_by: 'Tester',
          assigned_to: 'Test Assignee',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Title');
          assert.equal(res.body.issue_text, 'Test text for the issue.');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, 'Test Assignee');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open, true);
          assert.exists(res.body._id); 
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          done();
        });
    });
  
    // Test creating an issue with only required fields
    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test text for the issue.',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Title');
          assert.equal(res.body.issue_text, 'Test text for the issue.');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, ''); 
          assert.equal(res.body.status_text, ''); 
          assert.equal(res.body.open, true); 
          assert.exists(res.body._id);
          assert.exists(res.body.created_on);
          assert.exists(res.body.updated_on);
          done();
        });
    });
  
    // Test creating an issue with missing required fields
    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Title'
        })
        .end(function(err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  
  });
  