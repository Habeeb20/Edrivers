// backend/scripts/clean-conversation-index.js
import mongoose from 'mongoose';

async function cleanupOldConversationIndex() {
  try {
    console.log('=== Starting one-time conversation index cleanup ===');

    const collection = mongoose.connection.collection('conversations');

    // List all current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:');
    indexes.forEach(idx => {
      console.log(` - ${idx.name}:`, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
    });

    // Look for indexes related to hireRequestId
    const oldIndexes = indexes.filter(idx => 
      idx.name?.includes('hireRequestId') ||
      (idx.key && idx.key.hireRequestId === 1)
    );

    if (oldIndexes.length === 0) {
      console.log('No old hireRequestId indexes found. Nothing to clean.');
      return;
    }

    // Drop each problematic index
    for (const idx of oldIndexes) {
      const name = idx.name;
      console.log(`Dropping index: ${name}`);
      try {
        await collection.dropIndex(name);
        console.log(`Successfully dropped: ${name}`);
      } catch (err) {
        if (err.codeName === 'IndexNotFound') {
          console.log(`Index ${name} already removed or didn't exist`);
        } else {
          console.error(`Failed to drop ${name}:`, err.message);
        }
      }
    }

    console.log('=== Conversation index cleanup finished ===');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }
}

// Export so we can call it from app.js
export { cleanupOldConversationIndex };