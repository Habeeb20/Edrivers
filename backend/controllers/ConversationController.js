// controllers/conversationController.js
import Conversation from "../models/Conversation.js";
import Hire from "../models/Hire.js";
import User from "../models/User.js";

// 1. Send a message in a conversation
export const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user._id;

  try {
    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Verify sender is a participant
    if (!conversation.participants.includes(senderId.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied - not a participant' });
    }

    // Create message
    const message = {
      sender: senderId,
      content: content.trim(),
      read: false,
      createdAt: new Date()
    };

    // Add to messages and update lastMessage
    conversation.messages.push(message);
    conversation.lastMessage = {
      content: message.content,
      sender: senderId,
      createdAt: message.createdAt
    };

    await conversation.save();

    // Populate sender info for the new message
    await conversation.populate({
      path: 'messages.sender',
      select: 'firstName lastName avatar'
    });

    // Return only the newly sent message (or full conversation if preferred)
    res.json({
      success: true,
      message: conversation.messages[conversation.messages.length - 1]
    });
  } catch (err) {
    console.error('[sendMessage] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get all conversations for the current user
export const getMyConversations = async (req, res) => {
  const userId = req.user._id;

  try {
    const conversations = await Conversation.find({
      participants: userId.toString()
    })
      .populate('client', 'firstName lastName avatar phone')
      .populate('driver', 'firstName lastName avatar phone')
      .populate({
        path: 'hireId',
        select: 'status paymentStatus amountOffered durationHours category'
      })
      .sort({ 'lastMessage.createdAt': -1 });

    // Enhance each conversation with basic hire info
    const enriched = conversations.map(conv => ({
      _id: conv._id,
      participants: conv.participants,
      client: conv.client,
      driver: conv.driver,
      lastMessage: conv.lastMessage,
      unreadCount: conv.messages.filter(m => 
        m.sender.toString() !== userId.toString() && !m.read
      ).length,
      hire: conv.hireId ? {
        status: conv.hireId.status,
        paymentStatus: conv.hireId.paymentStatus,
        amountOffered: conv.hireId.amountOffered,
        durationHours: conv.hireId.durationHours,
        category: conv.hireId.category
      } : null,
      createdAt: conv.createdAt
    }));

    res.json({
      success: true,
      count: enriched.length,
      conversations: enriched
    });
  } catch (err) {
    console.error('[getMyConversations] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Get messages in a specific conversation
export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId)
      .populate('messages.sender', 'firstName lastName avatar');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Mark messages as read (only those not sent by current user)
    let hasNewReads = false;
    conversation.messages.forEach(msg => {
      if (msg.sender && msg.sender.toString() !== userId.toString() && !msg.read) {
        msg.read = true;
        hasNewReads = true;
      }
    });

    if (hasNewReads) {
      await conversation.save();
    }

    res.json({
      success: true,
      conversationId: conversation._id,
      participants: conversation.participants,
      messages: conversation.messages,
      lastMessage: conversation.lastMessage
    });
  } catch (err) {
    console.error('[getMessages] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Mark all messages in a conversation as read
export const markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let hasChanges = false;
    conversation.messages.forEach(msg => {
      if (msg.sender && msg.sender.toString() !== userId.toString() && !msg.read) {
        msg.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await conversation.save();
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    console.error('[markMessagesAsRead] Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};