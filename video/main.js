const express = require('express')
const app = express()

const { videoPool } = require('../lib/mysql')
const port = 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const createFile = (fileName) => {
  const fileSize = (Math.floor(Math.random() * 10) + 1) * 1024 ** 2;
  const filePath = `/home/tester/videos/${fileName}.mp4`
  return {
    fileSize,
    filePath
  }
}

app.get('/ping', (req, res) => {
  res.send('Producer ok')
})

app.post('/video', (req, res) => {
  console.log(`req.body: `, req.body)
  
  if (!req.body.fileName) {
    return res.status(400).json('no file name')
  }

  if (!req.body.userId || typeof req.body.userId !== 'number') {
    return res.status(400).json('invalid user id')
  }

  const createVideo = async () => {
    const file = createFile(req.body.fileName)
    const userId = req.body.userId;
    console.log(`file: `, file)

    const con = await videoPool.getConnection();
    try {
      await con.query(`insert into video.video
  (user_id, file_size, file_path)
  value
  ('${userId}', ${file.fileSize}, '${file.filePath}')`)

      await con.query(`insert into video.outbox
  (user_id, aggregate_type, event_type, payload)
  value
  ('${userId}', 'video', 'created', JSON_OBJECT('aggregate_type', 'video', 'event_type', 'created', 'user_id', '${userId}', 'file_size', ${file.fileSize}, 'file_path', '${file.filePath}'))`)
      await con.commit();
      return 'ok'
    } catch(e) {
      await con.rollback();
      throw e;
    } finally {
      con.release();
    }
  }
  
  createVideo()
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

