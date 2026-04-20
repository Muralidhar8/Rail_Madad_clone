import { MongoMemoryServer } from 'mongodb-memory-server';

async function run() {
    try {
        console.log('Creating memory server...');
        const mongoServer = await MongoMemoryServer.create();
        console.log('URI:', mongoServer.getUri());
        await mongoServer.stop();
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
