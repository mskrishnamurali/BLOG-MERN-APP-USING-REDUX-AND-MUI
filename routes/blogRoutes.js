// blogRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllBlogsController,
    createBlogController,
    updateBlogController, // Import updateBlogController
    getBlogbyIdController,
    deleteBlogController,
    userBlogControlller, addComment, addLike, removeLike
} = require('../controller/blogController');

router.get('/all-blog', getAllBlogsController);
router.post('/create-blog', createBlogController);
router.put('/update-blog/:id', updateBlogController); // Make sure updateBlogController is used here
router.get('/get-blog/:id', getBlogbyIdController);
router.delete('/delete-blog/:id', deleteBlogController);
router.get('/user-blog/:id', userBlogControlller)
router.put('/comment/post/:id', addComment);
router.put('/addlike/post/:id', addLike);
router.put('/removelike/post/:id', removeLike);

module.exports = router;
