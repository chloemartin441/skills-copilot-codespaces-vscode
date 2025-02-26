// Create web server 
const express = require('express'); 
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Comment = require('./models/comment');
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/comments', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
// Create a new comment
app.post('/comments', (req, res) => {
    const comment = new Comment(req.body);
    comment.save()
        .then(() => res.status(201).json(comment))
        .catch(err => res.status(400).json(err));
});
// Get all comments
app.get('/comments', (req, res) => {
    Comment.find()
        .then(comments => res.json(comments))
        .catch(err => res.status(400).json(err));
});
// Get a comment by id
app.get('/comments/:id', (req, res) => {
    Comment.findById(req.params.id)
        .then(comment => res.json(comment))
        .catch(err => res.status(400).json(err));
});
// Update a comment by id
app.put('/comments/:id', (req, res) => {
    Comment.findByIdAndUpdate(req.params
        .id
        , req
        .body
        , { new: true })
        .then(comment => res.json(comment))
        .catch(err => res.status(400).json(err));
    });
// Delete a comment by id
app.delete('/comments/:id', (req, res) => {
    Comment.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).send())
        .catch(err => res.status(400).json(err));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// models/comment.js
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
});
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
// client/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
function App() {
    const [comments, setComments] = useState([]);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editComment, setEditComment] = useState('');
    useEffect(() => {
        fetchComments();
    }, []);
    const fetchComments = async () => {
        const res = await axios.get('http://localhost:3000/comments');
        setComments(res.data);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            await axios.put(`http://localhost:3000/comments/${editId}`, { name: editName, comment: editComment });
            setEditId(null);
            setEditName('');
            setEditComment('');
        } else {
            await axios.post('http://localhost:3000/comments', { name, comment });
            setName('');
            setComment('');
        }
        fetchComments();
    };
    const handleEdit = (comment) => {
        setEditId(comment._id);
        setEditName(comment.name);
        setEditComment(comment.comment);
    };
    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/comments/${id}`);
        fetchComments();
    };
    return (
        <div className="App">
            <h1>Comments</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" value={editId ? editName : name} onChange={(e) => editId ? setEditName(e.target.value) : setName(e.target.value)} placeholder="Name" required />
                <input type="text" value={editId ? editComment : comment} onChange={(e) => editId ? setEditComment(e.target.value) : setComment(e.target.value)} placeholder="Comment" required />
                <button type="submit">{editId ? 'Update' : 'Submit'}</button>
            </form>
            <ul>
                {comments.map(comment => (
                    <li key={comment._id}>
                        <strong>{comment.name}</strong>: {comment.comment}
                        <button onClick={() => handleEdit(comment)}>Edit</button>
                        <button onClick={() =>
                            handleDelete(comment._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default App;
// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
// client/src/reportWebVitals.js
const reportWebVitals = onPerfEntry => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getLCP(onPerfEntry);
            getFCP(onPerfEntry);
            getTTFB(onPerfEntry);
        });
    }
};
export { reportWebVitals };
// client/src/setupTests.js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more:
//
//
//
//
//
//
//
//
//
//