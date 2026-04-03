const express = require("express");
const authService = require("../services/AuthService");
const {
  createBoardMember,
  deleteBoardMember,
  getBoardMembers,
  getOneBoardMember,
  getPublicBoardMembers,
  getBoardMemberBySlug,
  updateBoardMember,
  resizeBoardMemberImages,
  uploadBoardMemberImage,
} = require("../services/boardMemberService");

const boardMemberRouter = express.Router();

// Public
boardMemberRouter.get("/public", getPublicBoardMembers);
boardMemberRouter.get("/public/slug/:slug", getBoardMemberBySlug);

// Admin / general
boardMemberRouter
  .route("/")
  .get(getBoardMembers)
  .post(
    authService.protect,
    uploadBoardMemberImage,
    resizeBoardMemberImages,
    createBoardMember,
  );

boardMemberRouter
  .route("/:id")
  .get(getOneBoardMember)
  .put(
    authService.protect,
    uploadBoardMemberImage,
    resizeBoardMemberImages,
    updateBoardMember,
  )
  .delete(authService.protect, deleteBoardMember);

module.exports = boardMemberRouter;
