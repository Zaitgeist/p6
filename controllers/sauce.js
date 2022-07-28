const fs = require("fs");
const Sauce = require("../models/Sauce");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Post saved successfully!" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      return res.status(404).json({
        error: new Error("Pas de sauce"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      return res.status(400).json({
        error: new Error("Vous n'êtes pas autorisée !"),
      });
    }
    const filename = sauce.imageUrl.split("/images")[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Sauce supprimé" }))
        .catch((error) => res.status(400).json({ error }));
    });
  });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.usersLiked.includes(req.body.userId)) {
        sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
      }
      if (sauce.usersDisliked.includes(req.body.userId)) {
        sauce.usersDisliked.splice(
          sauce.usersDisliked.indexOf(req.body.userId),
          1
        );
      }
      switch (req.body.like) {
        case 1:
          sauce.usersLiked.push(req.body.userId);
          break;
        case -1:
          sauce.usersDisliked.push(req.body.userId);
          break;
      }
      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;
      sauce
        .save()
        .then(() => {
          res.status(201).json({ message: "updated" });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => res.status(500).json({ error }));
};
