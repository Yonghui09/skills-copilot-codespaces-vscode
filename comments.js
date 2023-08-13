// Create web server

// Import modules
const express = require('express');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const { sanitizeQuery } = require('express-validator');
const { check } = require('express-validator');
const { query } = require('express-validator');

// Import own modules
const comments = require('../models/comments');
const users = require('../models/users');
const { checkAuthenticated } = require('./users');
const { checkNotAuthenticated } = require('./users');
const { checkAdmin } = require('./users');

// Create router
const router = express.Router();

// GET request for comments
router.get('/', checkAuthenticated, async (req, res) => {
    // Get comments
    const allComments = await comments.getAllComments();
    // Get user
    const user = await users.getUser(req.user.username);
    // Render comments page
    res.render('comments', { user: user, comments: allComments });
});

// POST request for comments
router.post('/', checkAuthenticated, [
    // Validate comment
    body('comment', 'Comment is required').notEmpty().escape().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
    // Sanitize comment
    sanitizeBody('comment').escape().trim(),
], async (req, res) => {
    // Get errors
    const errors = validationResult(req);
    // If errors
    if (!errors.isEmpty()) {
        // Get user
        const user = await users.getUser(req.user.username);
        // Get comments
        const allComments = await comments.getAllComments();
        // Render comments page
        res.render('comments', { user: user, comments: allComments, errors: errors.array() });
    }
    // If no errors
    else {
        // Get user
        const user = await users.getUser(req.user.username);
        // Create comment
        await comments.createComment(user, req.body.comment);
        // Redirect to comments page
        res.redirect('/comments');
    }
});

// GET request for deleting comment
router.get('/delete/:id', checkAdmin, async (req, res) => {
    // Delete comment
    await comments.deleteComment(req.params.id);
    // Redirect to comments page
    res.redirect('/comments');
});

// Export router
module.exports = router;




