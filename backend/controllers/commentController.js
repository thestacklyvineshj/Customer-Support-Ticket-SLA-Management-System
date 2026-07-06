const commentService = require('../services/commentService');

async function addComment(req, res) {
  try {
    const comment = await commentService.addComment(req.params.id, req.user, req.body.comment);
    res.status(201).json({ success: true, message: 'Comment added', data: comment });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

async function getComments(req, res) {
  try {
    const comments = await commentService.getComments(req.params.id, req.user);
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  }
}

module.exports = { addComment, getComments };
