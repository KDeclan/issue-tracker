const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let validIssueId;

  // Before running tests, create an issue and store the ID
  before(function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Title',
        issue_text: 'Test text for the issue.',
        created_by: 'Tester'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        validIssueId = res.body._id;  // Store the valid issue ID
        done();
      });
  });
  
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

  // Test viewing issues on a project
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test viewing issues on a project with one filter
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({ open: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length > 0) {
          assert.propertyVal(res.body[0], 'open', true);
        }
        done();
      });
  });

  // Test viewing issues on a project with multiple filters
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({ open: true, assigned_to: 'Test Assignee' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length > 0) {
          assert.propertyVal(res.body[0], 'open', true);
          assert.propertyVal(res.body[0], 'assigned_to', 'Test Assignee');
        }
        done();
      });
  });

  // Test updating one field on an issue
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: validIssueId,
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body.issue.issue_title, 'Updated Title');
        done();
      });
  });

  // Test updating multiple fields on an issue
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: validIssueId,
        issue_title: 'Updated Title',
        issue_text: 'Updated text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body.issue.issue_title, 'Updated Title');
        assert.equal(res.body.issue.issue_text, 'Updated text');
        done();
      });
  });

  // Test updating an issue with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test updating an issue with no fields to update
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: validIssueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // Test updating an issue with an invalid _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid-id',
        issue_title: 'Updated Title'
      })
      .end(function(err, res) {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'issue not found');
        done();
      });
  });

  // Test deleting an issue
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: validIssueId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  // Test deleting an issue with an invalid _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: 'invalid-id'
      })
      .end(function(err, res) {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'issue not found');
        done();
      });
  });

  // Test deleting an issue with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
