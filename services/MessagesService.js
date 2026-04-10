const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const messagesModel = require("../models/MessagesModel");
const sendEmail = require("../utils/sendEmail");

exports.getMessages = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "-createdAt",
    isReplied,
    status,
  } = req.query;

  const currentPage = parseInt(page, 10) || 1;
  const perPage = parseInt(limit, 10) || 10;
  const skip = (currentPage - 1) * perPage;

  const query = {};

  if (isReplied !== undefined) {
    query.isReplied = isReplied === "true";
  }

  if (status) {
    query.status = status;
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { name: { $regex: safeKeyword, $options: "i" } },
      { email: { $regex: safeKeyword, $options: "i" } },
      { phone: { $regex: safeKeyword, $options: "i" } },
      { subject: { $regex: safeKeyword, $options: "i" } },
      { requestType: { $regex: safeKeyword, $options: "i" } },
      { message: { $regex: safeKeyword, $options: "i" } },
      { reply: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const [messages, total] = await Promise.all([
    messagesModel.find(query).sort(sort).skip(skip).limit(perPage),
    messagesModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      messages.length > 0
        ? "Messages fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
      currentPage,
      itemsPerPage: perPage,
    },
    data: messages,
  });
});

exports.createMessage = asyncHandler(async (req, res) => {
  const createdMessage = await messagesModel.create(req.body);

  await sendEmail({
    to: "contact@jadwainvest.com",
    replyTo: createdMessage.email,
    subject: "New Contact Form Message",
    html: `
      <h3>New Message Received</h3>
      <p><strong>Name:</strong> ${createdMessage.name}</p>
      <p><strong>Email:</strong> ${createdMessage.email}</p>
      <p><strong>Phone:</strong> ${createdMessage.phone || "N/A"}</p>
      <p><strong>Request Type:</strong> ${createdMessage.requestType}</p>
      <p><strong>Subject:</strong> ${createdMessage.subject || "N/A"}</p>
      <p><strong>Message:</strong><br/>${createdMessage.message}</p>
    `,
  });

  res.status(201).json({
    status: true,
    message: "Message sent successfully",
    data: createdMessage,
  });
});

exports.getOneMessage = asyncHandler(async (req, res, next) => {
  const message = await messagesModel.findById(req.params.id);

  if (!message) {
    return next(new ApiError(`No message found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: message,
  });
});

exports.replyToMessage = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply || reply.trim() === "") {
    return next(new ApiError("Reply is required", 400));
  }

  const message = await messagesModel.findById(req.params.id);

  if (!message) {
    return next(new ApiError("Message not found", 404));
  }

  message.reply = reply.trim();
  message.isReplied = true;
  message.repliedAt = new Date();
  message.status = "replied";

  await message.save();

  await sendEmail({
    to: message.email,
    subject: "Reply to your message",
    html: `
      <p>Hello ${message.name || ""},</p>
      <p>${reply}</p>
    `,
  });

  res.status(200).json({
    status: true,
    message: "Reply sent successfully",
    data: message,
  });
});

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await messagesModel.findByIdAndDelete(req.params.id);

  if (!message) {
    return next(new ApiError(`No message found for this id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: true,
    message: "Message deleted successfully",
  });
});
