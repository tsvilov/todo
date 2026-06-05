const express = require('express')
const router = express.Router()
const { createTodo, listTodos, getTodo, updateTodo, deleteTodo } = require('../controllers/todoController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.post('/', createTodo)
router.get('/', listTodos)
router.get('/:id', getTodo)
router.put('/:id', updateTodo)
router.delete('/:id', deleteTodo)

module.exports = router
