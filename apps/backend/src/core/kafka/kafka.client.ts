import {Kafka, logLevel} from 'kafkajs'

export const kafka = new Kafka({
    clientId: 'kernel-baas-engine',
    brokers : [process.env.KAFKA_BROKER || 'localhost:9092'],
    logLevel: logLevel.WARN,
    retry:{
        initialRetryTime: 300,
        retries: 8,
    }
});