const { kafka, getVideoOutboxTopic } = require('../lib/kafka')
const express = require('express')
const app = express()
const port = 3001

const ns1 = kafka.consumer({ groupId: 'ns' });

app.get('/ping', (req, res) => {
  res.send('Consumer ok')
})

app.listen(port, () => {
  const subscribeTopicDeploy = async(consumer) => {
    await consumer.connect()
    await consumer.subscribe({ topic: getVideoOutboxTopic(), fromBeginning: true })
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          offset: message.offset,
          value: message.value.toString(),
        })
      },
    })
  }

  const subscribeTopicCameraRestart = async(consumer, key) => {
    await consumer.connect()
    await consumer.subscribe({ topic: KAFKA_CAMERA_RESTART_TOPIC_ID, fromBeginning: true })
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          offset: message.offset,
          value: message.value.toString(),
        })
      },
    })
  }

  // const subscribeTopicDeploy = async(consumer) => {
  //   await consumer.connect()
  //   await consumer.subscribe({ topic: KAFKA_DEPLOY_TOPIC_ID, fromBeginning: true })
  //   await consumer.run({
  //     eachMessage: async ({ topic, partition, message }) => {
  //       console.log({
  //         topic,
  //         partition,
  //         offset: message.offset,
  //         value: message.value.toString(),
  //       })
  //     },
  //   })
  // }
  
  run().catch(console.error)
  console.log(`Consumer listening on port ${port}`)
})

// const { Kafka } = require('kafkajs')

// const kafka = new Kafka({
//   clientId: 'my-app',
//   brokers: ['kafka1:9092', 'kafka2:9092']
// })

// const producer = kafka.producer()
// const consumer = kafka.consumer({ groupId: 'test-group' })

// const run = async () => {
//   // Producing
//   await producer.connect()
//   await producer.send({
//     topic: 'test-topic',
//     messages: [
//       { value: 'Hello KafkaJS user!' },
//     ],
//   })

//   // Consuming
//   await consumer.connect()
//   await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log({
//         partition,
//         offset: message.offset,
//         value: message.value.toString(),
//       })
//     },
//   })
// }

// run().catch(console.error)