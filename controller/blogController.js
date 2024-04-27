const blogModel = require('../models/blogModel')
const userModel = require('../models/userModel')
const mongoose = require('mongoose')
const main = require('../server');

exports.getAllBlogsController = async (req, res) => {
    try {
        const blogs = await blogModel.find({}).populate("user")
        if (!blogs) {
            return res.status(200).send({
                success: false,
                message: 'no Blogs Found'
            })
        }
        return res.status(200).send({
            success: true,
            BlogCount: blogs.length,
            message: 'All Blogs Lists',
            blogs,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error While Getting The Blog',
            error
        })
    }
}

exports.createBlogController = async (req, res) => {
    try {
        const { title, description, image, user } = req.body; // Object destructuring instead of array destructuring
        if (!title || !description || !image || !user) {
            return res.status(400).send({
                success: false,
                message: "Please Provide All Fields"
            });
        }
        const existingUser = await userModel.findById(user)
        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'unable to find user'
            })
        }
        const newBlog = new blogModel({ title, description, image, user });
        const session = await mongoose.startSession()
        session.startTransaction()
        await newBlog.save({ session })
        existingUser.blogs.push(newBlog)
        await existingUser.save({ session })
        await session.commitTransaction()
        await newBlog.save();
        return res.status(201).send({
            success: true,
            message: "Blog Created",
            newBlog,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error While Creating The Blog',
            error
        });
    }
}

exports.updateBlogController = async (req, res) => {

    try {
        const { id } = req.params
        const { title, description, image } = req.body
        const blog = await blogModel.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        )
        return res.status(200).send({
            success: true,
            message: "Blog Updated",
            blog,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error While Creating The Blog',
            error
        })
    }
}

exports.getBlogbyIdController = async (req, res) => {
    try {
        const { id } = req.params
        const blog = await blogModel.findById(id)
        if (!blog) {
            return res.status(404).send({
                success: false,
                message: 'blog not found with this is'
            })
        }
        return res.status(200).send({
            success: true,
            message: "fetch single blog",
            blog,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error While Creating The Blog',
            error
        })
    }
}
exports.deleteBlogController = async (req, res) => {
    try {
        const blog = await blogModel.findById(req.params.id);

        if (!blog) {
            return res.status(404).send({
                success: false,
                message: "Blog not found",
            });
        }

        const user = await userModel.findById(blog.user);

        if (!user || !user.blogs) {
            throw new Error("User or user's blogs not found");
        }

        await blogModel.findByIdAndDelete(req.params.id);
        await user.blogs.pull(req.params.id);
        await user.save();

        return res.status(200).send({
            success: true,
            message: "Blog Deleted!",
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: "Error While Deleting Blog",
            error,
        });
    }
};
exports.userBlogControlller = async (req, res) => {
    try {
        const userBlog = await userModel.findById(req.params.id).populate("blogs");

        if (!userBlog) {
            return res.status(404).send({
                success: false,
                message: "blogs not found with this id",
            });
        }
        return res.status(200).send({
            success: true,
            message: "user blogs",
            userBlog,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: "error in user blog",
            error,
        });
    }
};
//add comment
exports.addComment = async (req, res, next) => {
    const { comment } = req.body;
    try {
        const postComment = await blogModel.findByIdAndUpdate(req.params.id, {
            $push: { comments: { text: comment, postedBy: req.user._id } }
        },
            { new: true }
        );
        const post = await Post.findById(postComment._id).populate('comments.postedBy', 'name email');
        res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        next(error);
    }

}


//add like
exports.addLike = async (req, res, next) => {

    try {
        const post = await blogModel.findByIdAndUpdate(req.params.id, {
            $addToSet: { likes: req.user._id }
        },
            { new: true }
        );
        const posts = await blogModel.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        main.io.emit('add-like', posts);

        res.status(200).json({
            success: true,
            post,
            posts
        })

    } catch (error) {
        next(error);
    }

}


//remove like
exports.removeLike = async (req, res, next) => {

    try {
        const post = await blogModel.findByIdAndUpdate(req.params.id, {
            $pull: { likes: req.user._id }
        },
            { new: true }
        );

        const posts = await blogModel.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        main.io.emit('remove-like', posts);

        res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        next(error);
    }

}