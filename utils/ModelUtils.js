const Keyword = require("../models/keyword");

module.exports.getKeywordData = function(req, res, attributes = []) {
  return new Promise(async (resolve, reject) => {
    let id = null;
    let { user } = req.session;
    let media = null;
    // to find selected searched response
    if (req.params.id && req.params.media){ 
      id = req.params.id
      media = req.params.media
    }
    // to find keyword as per id
    else if (req.session.keyword.id) id = req.session.keyword.id
     

    let keywordData;

    if (!id) {
      keywordData = await Keyword.findOne({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
        attributes
      });

      if (keywordData) {
        req.session.keyword = { id: keywordData.id, name: keywordData.keyword ,media:keywordData.media};
        res.locals.keyword = { id: keywordData.id, name: keywordData.keyword ,media:keywordData.media};
      }
    } else {
      keywordData = await Keyword.findByPk(id, {
        attributes
      });
      // setting session keyword info based on search history
      if (req.params.id) {
        req.session.keyword = {
          id: keywordData.id,
          name: keywordData.keyword,
          media: keywordData.media
        };
        res.locals.keyword = req.session.keyword;
      }
    }

    resolve(keywordData);
    if (false) reject("fake rejection handling");
  });
};
