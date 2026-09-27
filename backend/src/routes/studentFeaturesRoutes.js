const express = require('express');
const router = express.Router();
const notesCtrl = require('../controllers/notesController');
const bookmarksCtrl = require('../controllers/bookmarksController');
const discussionCtrl = require('../controllers/discussionController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

// Notes
router.get('/sessions/:sessionId/notes', notesCtrl.getNotes);
router.post('/sessions/:sessionId/notes', notesCtrl.createNote);
router.delete('/notes/:id', notesCtrl.deleteNote);

// Bookmarks
router.get('/sessions/:sessionId/bookmarks', bookmarksCtrl.getBookmarks);
router.post('/sessions/:sessionId/bookmarks', bookmarksCtrl.createBookmark);
router.delete('/bookmarks/:id', bookmarksCtrl.deleteBookmark);

// Discussion
router.get('/sessions/:sessionId/discussions', discussionCtrl.getDiscussions);
router.post('/sessions/:sessionId/discussions', discussionCtrl.createDiscussion);

module.exports = router;
