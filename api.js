'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = function (app) {
  const issues = {};

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;
      const filters = req.query;

      if (!issues[project]) {
        return res.json([]);
      }

      let projectIssues = issues[project];
      
      for (let key in filters) {
        projectIssues = projectIssues.filter(issue => issue[key] === filters[key]);
      }

      res.json(projectIssues);
    })
    
    .post(function (req, res) {
      const project = req.params.project;
      
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = '',
        status_text = ''
      } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.status(400).json({ error: 'required field(s) missing' });
      }
      
      const newIssue = {
        _id: uuidv4(),  // Generate a unique ID
        issue_title,
        issue_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by,
        assigned_to,
        open: true,  // Default to true
        status_text
      };
      
      if (!issues[project]) {
        issues[project] = [];
      }
      
      issues[project].push(newIssue);
      
      res.json(newIssue);
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      let issueId = req.body._id;
    
      if (!issueId) {
        return res.status(400).json({ error: 'missing _id' });
      }
    
      if (!issues[project]) {
        return res.status(404).json({ error: 'project not found' });
      }
    
      let projectIssues = issues[project];
      let issue = projectIssues.find(issue => issue._id === issueId);
    
      if (!issue) {
        return res.status(404).json({ error: 'issue not found', id: issueId });
      }
    
      const updates = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: req.body.open
      };
    
      let noFieldsToUpdate = true;

      for (let key in updates) {
        if (updates[key] !== undefined) {
          issue[key] = updates[key];
          noFieldsToUpdate = false;
        }
      }

      if (noFieldsToUpdate) {
        return res.status(400).json({ error: 'no update field(s) sent', _id: issueId });
      }
    
      issue.updated_on = new Date().toISOString();
    
      res.json({ result: 'successfully updated', issue });
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      let issueId = req.body._id;
    
      if (!issueId) {
        return res.status(400).json({ error: 'missing _id' });
      }
    
      if (!issues[project]) {
        return res.status(404).json({ error: 'project not found' });
      }
    
      let projectIssues = issues[project];
      const issueIndex = projectIssues.findIndex(issue => issue._id === issueId);
    
      if (issueIndex !== -1) {
        projectIssues.splice(issueIndex, 1);
        return res.json({ result: 'successfully deleted', id: issueId });
      } else {
        return res.status(404).json({ error: 'issue not found', id: issueId });
      }
    });
};
