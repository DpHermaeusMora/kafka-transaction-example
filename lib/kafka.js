const { Kafka } = require('kafkajs');
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
  })
const KAFKA_MYSQL_VIDEO_OUTBOX_TOPIC_01 = 'mysql-outbox-01.video.outbox' // 전체 엣지 

const getVideoOutboxTopic = () => {
  return KAFKA_MYSQL_VIDEO_OUTBOX_TOPIC_01
}

module.exports = {
    kafka,
    getVideoOutboxTopic,
}
