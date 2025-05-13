const express = require('express')
const { videoPool } = require('../lib/mysql')
const { createFile } = require('../lib/helper')

const app = express()
const port = 3000

const createVideo = async (fileName, userId) => {
  const file = createFile(fileName)
  console.log(`fileName, userId, file`, fileName, userId, file)

  const payload = {
    aggregate_type: 'video',
    event_type: 'created',
    user_id: userId,
    file_size: file.fileSize,
    file_path: file.filePath
  }

  const con = await videoPool.getConnection();
  try {
    await con.beginTransaction();
    await con.query(`insert into video.video
(user_id, file_size, file_path)
values
(?, ?, ?)`, 
    [userId, file.fileSize, file.filePath])
    await con.query(`insert into video.outbox
(user_id, aggregate_type, event_type, payload)
values
(?, ?, ?, ?)`, 
    [userId, 'video', 'created', JSON.stringify(payload)]),
    await con.commit();
    return 'ok'
  } catch(e) {
    await con.rollback();
    throw e;
  } finally {
    con.release();
  }
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.post('/video', (req, res) => {
  console.log(`req.body: `, req.body)
  
  if (!req.body.fileName) {
    return res.status(400).json('no file name')
  }

  if (!req.body.userId || typeof req.body.userId !== 'number') {
    return res.status(400).json('invalid user id')
  }
  createVideo(req.body.fileName, req.body.userId)
  .then((result) => {
    res.status(200).send(result);
  })
  .catch((e) => {
    console.error(e);
    res.status(500).send('internal server error')
  })
})
app.listen(port, () => {
  console.log(`Producer listening on port ${port}`)
})

