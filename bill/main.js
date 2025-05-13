const { kafka, getVideoOutboxTopic } = require('../lib/kafka')
const { billPool } = require('../lib/mysql')
const { createPrice } = require('../lib/helper')

const ns1 = kafka.consumer({ groupId: 'ns' });
const ns2 = kafka.consumer({ groupId: 'ns' });
const ns3 = kafka.consumer({ groupId: 'ns' });

const createBill = async (aggregate_id, topic, partition, offset, payload) => {
  const price = createPrice(payload.file_size)
  console.log(`aggregate_id, topic, partition, offset, payload, price`, aggregate_id, topic, partition, offset, payload, price)
  const con = await billPool.getConnection();
  await con.query(`insert into bill.bill
(user_id, aggregate_type, aggregate_id, event_type, price, kafka_topic, kafka_partition, kafka_offset)
values
(?, ?, ?, ?, ?, ?, ?, ?)
on duplicate key update 
created_at = CURRENT_TIMESTAMP`, 
  [Number(payload.user_id), payload.aggregate_type, aggregate_id, payload.event_type, price, topic, partition, offset])
  con.release()
  return 'ok'
}


/**
 * @param { Consumer } consumer 
 */
const subscribe = async(consumer) => {
  await consumer.connect()
  await consumer.subscribe({ topic: getVideoOutboxTopic(), fromBeginning: true})
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = JSON.parse(message.value)
      if (value?.payload?.after?.payload) {
        const payload = JSON.parse(value.payload.after.payload);
        
        createBill(value.payload.after.id, topic, partition, Number(message.offset), payload)
        .then((result) => {
          console.log(`ok`)
        })
        .catch((e) => {
          console.error(e);
        })
      }
    },
  })
}

subscribe(ns1).then(console.log).catch(console.error)
subscribe(ns2).then(console.log).catch(console.error)
subscribe(ns3).then(console.log).catch(console.error)
