import Block from "../models/Block.model.js";

export const getBlockedUserIdsForViewer = async (viewerId) => {
  const blocks = await Block.find({
    $or: [{ blocker: viewerId }, { blocked: viewerId }]
  }).select("blocker blocked");

  return blocks.map((block) =>
    block.blocker.toString() === viewerId.toString()
      ? block.blocked
      : block.blocker
  );
};

export const hasBlockRelation = async (userA, userB) => {
  if (!userA || !userB) {
    return false;
  }

  const block = await Block.findOne({
    $or: [
      {
        blocker: userA,
        blocked: userB
      },
      {
        blocker: userB,
        blocked: userA
      }
    ]
  });

  return Boolean(block);
};